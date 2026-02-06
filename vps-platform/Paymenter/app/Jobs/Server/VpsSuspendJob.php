<?php

namespace App\Jobs\Server;

use App\Jobs\Server\CreateJob;
use App\Models\Service;
use App\Models\Extension as ExtensionModel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * VPS Suspension Job
 * 
 * Automatically suspends VPS instances when:
 * - Payment is overdue
 * - Service is manually suspended
 * - Account is suspended
 */
class VpsSuspendJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900]; // 1min, 5min, 15min

    protected $service;
    protected $reason;

    /**
     * Create a new job instance.
     */
    public function __construct(Service $service, string $reason = 'Payment overdue')
    {
        $this->service = $service;
        $this->reason = $reason;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Check if service is still active and should be suspended
            if (!$this->shouldSuspend()) {
                Log::info('VPS suspension skipped - service no longer requires suspension', [
                    'service_id' => $this->service->id,
                    'status' => $this->service->status,
                ]);
                return;
            }

            // Get the Flint extension
            $flintExtension = $this->getFlintExtension();
            if (!$flintExtension) {
                Log::error('VPS suspension failed - Flint extension not found', [
                    'service_id' => $this->service->id,
                ]);
                $this->fail(new \Exception('Flint extension not configured'));
                return;
            }

            // Perform suspension
            $result = $flintExtension->suspendServer($this->service);
            
            if ($result) {
                // Update service status
                $this->service->update([
                    'status' => 'suspended',
                    'suspended_at' => now(),
                    'suspend_reason' => $this->reason,
                ]);

                // Log successful suspension
                Log::info('VPS suspended successfully', [
                    'service_id' => $this->service->id,
                    'user_id' => $this->service->user_id,
                    'reason' => $this->reason,
                    'suspended_at' => now()->toISOString(),
                ]);

                // Send notification to user
                $this->sendSuspensionNotification();

            } else {
                throw new \Exception('Flint extension failed to suspend VPS');
            }

        } catch (\Exception $e) {
            Log::error('VPS suspension job failed', [
                'service_id' => $this->service->id,
                'attempt' => $this->attempts(),
                'error' => $e->getMessage(),
                'reason' => $this->reason,
            ]);

            if ($this->attempts() >= $this->tries) {
                // Mark service as suspension_failed after all retries
                $this->service->update([
                    'status' => 'suspension_failed',
                    'suspension_error' => $e->getMessage(),
                ]);
            }

            throw $e;
        }
    }

    /**
     * Determine if the service should still be suspended
     */
    private function shouldSuspend(): bool
    {
        // Refresh the service model to get latest status
        $this->service->refresh();
        
        // Don't suspend if service is already terminated
        if ($this->service->status === 'terminated') {
            return false;
        }

        // Don't suspend if service is already suspended
        if ($this->service->status === 'suspended') {
            return false;
        }

        // Don't suspend if user has paid and service is active
        if ($this->service->status === 'active' && $this->reason === 'Payment overdue') {
            // Check if there are any unpaid invoices
            $unpaidInvoices = $this->service->invoices()
                ->where('status', 'unpaid')
                ->where('due_date', '<', now()->subDays(3))
                ->count();
            
            return $unpaidInvoices > 0;
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
     * Send suspension notification to user
     */
    private function sendSuspensionNotification(): void
    {
        try {
            $user = $this->service->user;
            
            // Create notification record
            \App\Models\Notification::create([
                'user_id' => $user->id,
                'title' => 'VPS Service Suspended',
                'message' => "Your VPS '{$this->service->product->name}' has been suspended due to: {$this->reason}. Please pay any outstanding invoices to reactivate your service.",
                'type' => 'warning',
                'action_url' => '/services/' . $this->service->id,
            ]);

            // Send email notification
            \Mail::to($user->email)->send(new \App\Mail\VpsSuspended($this->service, $this->reason));

        } catch (\Exception $e) {
            Log::warning('Failed to send suspension notification', [
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
        return ['vps', 'suspend', 'service:' . $this->service->id];
    }
}