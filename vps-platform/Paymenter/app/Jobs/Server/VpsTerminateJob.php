<?php

namespace App\Jobs\Server;

use App\Models\Service;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * VPS Termination Job
 * 
 * Automatically terminates VPS instances when:
 * - Service is cancelled
 * - Payment is overdue for extended period (14 days after suspension)
 * - Account is terminated
 * - Manual termination requested
 */
class VpsTerminateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900]; // 1min, 5min, 15min

    protected $service;
    protected $reason;
    protected $createBackup;

    /**
     * Create a new job instance.
     */
    public function __construct(Service $service, string $reason = 'Service cancelled', bool $createBackup = true)
    {
        $this->service = $service;
        $this->reason = $reason;
        $this->createBackup = $createBackup;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Check if service should still be terminated
            if (!$this->shouldTerminate()) {
                Log::info('VPS termination skipped - service no longer requires termination', [
                    'service_id' => $this->service->id,
                    'status' => $this->service->status,
                ]);
                return;
            }

            // Get the Flint extension
            $flintExtension = $this->getFlintExtension();
            if (!$flintExtension) {
                Log::error('VPS termination failed - Flint extension not found', [
                    'service_id' => $this->service->id,
                ]);
                $this->fail(new \Exception('Flint extension not configured'));
                return;
            }

            // Create final backup if requested
            if ($this->createBackup) {
                $this->createFinalBackup($flintExtension);
            }

            // Perform termination
            $result = $flintExtension->terminateServer($this->service);
            
            if ($result) {
                // Update service status
                $this->service->update([
                    'status' => 'terminated',
                    'terminated_at' => now(),
                    'terminate_reason' => $this->reason,
                ]);

                // Log successful termination
                Log::info('VPS terminated successfully', [
                    'service_id' => $this->service->id,
                    'user_id' => $this->service->user_id,
                    'reason' => $this->reason,
                    'terminated_at' => now()->toISOString(),
                    'backup_created' => $this->createBackup,
                ]);

                // Send notification to user
                $this->sendTerminationNotification();

                // Schedule cleanup of any remaining data
                $this->scheduleCleanup();

            } else {
                throw new \Exception('Flint extension failed to terminate VPS');
            }

        } catch (\Exception $e) {
            Log::error('VPS termination job failed', [
                'service_id' => $this->service->id,
                'attempt' => $this->attempts(),
                'error' => $e->getMessage(),
                'reason' => $this->reason,
            ]);

            if ($this->attempts() >= $this->tries) {
                // Mark service as termination_failed after all retries
                $this->service->update([
                    'status' => 'termination_failed',
                    'termination_error' => $e->getMessage(),
                ]);
            }

            throw $e;
        }
    }

    /**
     * Determine if the service should still be terminated
     */
    private function shouldTerminate(): bool
    {
        // Refresh the service model to get latest status
        $this->service->refresh();
        
        // Don't terminate if service is already terminated
        if ($this->service->status === 'terminated') {
            return false;
        }

        // Don't terminate if service was reactivated
        if ($this->service->status === 'active' && $this->reason === 'Payment overdue') {
            return false;
        }

        return true;
    }

    /**
     * Get Flint extension instance
     */
    private function getFlintExtension()
    {
        if (!$this->service->product || $this->service->product->server_type !== 'Flint') {
            return null;
        }

        return $this->service->product->server;
    }

    /**
     * Create final backup before termination
     */
    private function createFinalBackup($flintExtension): void
    {
        try {
            $vm = $flintExtension->getServer($this->service->id, false);
            if (!$vm) {
                Log::warning('Cannot create final backup - VM not found', [
                    'service_id' => $this->service->id,
                ]);
                return;
            }

            $snapshotName = 'final-backup-' . date('Y-m-d-H-i-s');
            
            $response = \Http::withHeaders([
                'Authorization' => 'Bearer ' . $flintExtension->config('api_key'),
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post(rtrim($flintExtension->config('host'), '/') . '/api/vms/' . $vm['uuid'] . '/snapshots', [
                'name' => $snapshotName,
                'description' => "Final backup before termination: {$this->reason}",
            ]);

            if ($response->successful()) {
                Log::info('Final backup created before termination', [
                    'service_id' => $this->service->id,
                    'snapshot_name' => $snapshotName,
                ]);

                // Store backup info for potential recovery
                $this->service->update([
                    'config' => array_merge($this->service->config ?? [], [
                        'final_backup_snapshot' => $snapshotName,
                        'final_backup_created_at' => now()->toISOString(),
                    ])
                ]);
            } else {
                Log::warning('Failed to create final backup', [
                    'service_id' => $this->service->id,
                    'error' => $response->json('error', 'Unknown error'),
                ]);
            }

        } catch (\Exception $e) {
            Log::warning('Exception creating final backup', [
                'service_id' => $this->service->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send termination notification to user
     */
    private function sendTerminationNotification(): void
    {
        try {
            $user = $this->service->user;
            
            // Create notification record
            \App\Models\Notification::create([
                'user_id' => $user->id,
                'title' => 'VPS Service Terminated',
                'message' => "Your VPS '{$this->service->product->name}' has been terminated due to: {$this->reason}. " . 
                             ($this->createBackup ? 'A final backup was created for recovery purposes.' : ''),
                'type' => 'error',
                'action_url' => '/services/' . $this->service->id,
            ]);

            // Send email notification
            \Mail::to($user->email)->send(new \App\Mail\VpsTerminated($this->service, $this->reason, $this->createBackup));

        } catch (\Exception $e) {
            Log::warning('Failed to send termination notification', [
                'service_id' => $this->service->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Schedule cleanup of any remaining data
     */
    private function scheduleCleanup(): void
    {
        try {
            // Schedule cleanup job to run after 30 days
            \App\Jobs\Server\VpsCleanupJob::dispatch($this->service)
                ->delay(now()->addDays(30));

            Log::info('VPS cleanup scheduled', [
                'service_id' => $this->service->id,
                'cleanup_date' => now()->addDays(30)->toISOString(),
            ]);

        } catch (\Exception $e) {
            Log::warning('Failed to schedule VPS cleanup', [
                'service_id' => $this->service->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get the tags that should be assigned to the job
     */
    public function tags(): array
    {
        return ['vps', 'terminate', 'service:' . $this->service->id];
    }
}