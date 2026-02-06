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
 * VPS Cleanup Job
 * 
 * Cleans up any remaining data after VPS termination:
 * - Removes old snapshots
 * - Cleans up temporary files
 * - Removes backup data after retention period
 */
class VpsCleanupJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 2;
    public $backoff = [300, 900]; // 5min, 15min

    protected $service;

    /**
     * Create a new job instance.
     */
    public function __construct(Service $service)
    {
        $this->service = $service;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Starting VPS cleanup', [
                'service_id' => $this->service->id,
                'user_id' => $this->service->user_id,
            ]);

            // Clean up snapshots if they exist
            $this->cleanupSnapshots();

            // Clean up any remaining service data
            $this->cleanupServiceData();

            // Log successful cleanup
            Log::info('VPS cleanup completed successfully', [
                'service_id' => $this->service->id,
            ]);

        } catch (\Exception $e) {
            Log::error('VPS cleanup job failed', [
                'service_id' => $this->service->id,
                'attempt' => $this->attempts(),
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Clean up old snapshots
     */
    private function cleanupSnapshots(): void
    {
        try {
            $flintExtension = $this->getFlintExtension();
            if (!$flintExtension) {
                return;
            }

            $vm = $flintExtension->getServer($this->service->id, false);
            if (!$vm) {
                return;
            }

            // Get list of snapshots for this VM
            $response = \Http::withHeaders([
                'Authorization' => 'Bearer ' . $flintExtension->config('api_key'),
                'Accept' => 'application/json',
            ])->get(rtrim($flintExtension->config('host'), '/') . '/api/vms/' . $vm['uuid'] . '/snapshots');

            if (!$response->successful()) {
                Log::warning('Failed to get snapshots for cleanup', [
                    'service_id' => $this->service->id,
                    'error' => $response->json('error', 'Unknown error'),
                ]);
                return;
            }

            $snapshots = $response->json();
            $snapshotsDeleted = 0;

            foreach ($snapshots as $snapshot) {
                // Delete snapshots older than 30 days (except final backup)
                $snapshotDate = \Carbon\Carbon::parse($snapshot['createdAt'] ?? $snapshot['created_at'] ?? 'now');
                $isFinalBackup = isset($this->service->config['final_backup_snapshot']) && 
                                $snapshot['name'] === $this->service->config['final_backup_snapshot'];

                if (!$isFinalBackup && $snapshotDate->lt(now()->subDays(30))) {
                    $deleteResponse = \Http::withHeaders([
                        'Authorization' => 'Bearer ' . $flintExtension->config('api_key'),
                        'Accept' => 'application/json',
                    ])->delete(rtrim($flintExtension->config('host'), '/') . '/api/vms/' . $vm['uuid'] . '/snapshots/' . $snapshot['name']);

                    if ($deleteResponse->successful()) {
                        $snapshotsDeleted++;
                        Log::info('Old snapshot deleted during cleanup', [
                            'service_id' => $this->service->id,
                            'snapshot_name' => $snapshot['name'],
                            'snapshot_date' => $snapshotDate->toISOString(),
                        ]);
                    } else {
                        Log::warning('Failed to delete snapshot during cleanup', [
                            'service_id' => $this->service->id,
                            'snapshot_name' => $snapshot['name'],
                            'error' => $deleteResponse->json('error', 'Unknown error'),
                        ]);
                    }
                }
            }

            if ($snapshotsDeleted > 0) {
                Log::info('Snapshots cleanup completed', [
                    'service_id' => $this->service->id,
                    'snapshots_deleted' => $snapshotsDeleted,
                ]);
            }

        } catch (\Exception $e) {
            Log::warning('Exception during snapshot cleanup', [
                'service_id' => $this->service->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Clean up service-related data
     */
    private function cleanupServiceData(): void
    {
        try {
            // Remove any temporary files or data associated with this service
            $config = $this->service->config ?? [];
            
            // Clear sensitive configuration data
            $this->service->update([
                'config' => array_filter($config, function($key) {
                    // Keep only non-sensitive data for audit purposes
                    return in_array($key, [
                        'flint_vm_created_at',
                        'flint_vm_terminated_at',
                        'flint_vm_os',
                        'final_backup_snapshot',
                        'final_backup_created_at',
                    ]);
                }, ARRAY_FILTER_USE_KEY)
            ]);

            Log::info('Service data cleaned up', [
                'service_id' => $this->service->id,
            ]);

        } catch (\Exception $e) {
            Log::warning('Exception during service data cleanup', [
                'service_id' => $this->service->id,
                'error' => $e->getMessage(),
            ]);
        }
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
     * Get the tags that should be assigned to the job
     */
    public function tags(): array
    {
        return ['vps', 'cleanup', 'service:' . $this->service->id];
    }
}