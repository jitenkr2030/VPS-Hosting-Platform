<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class VpsController extends Controller
{
    /**
     * Display VPS management interface
     */
    public function show(Service $service)
    {
        // Check if user owns this service
        if ($service->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this service');
        }

        // Check if service uses Flint extension
        if ($service->product->server_type !== 'Flint') {
            abort(404, 'VPS management not available for this service');
        }

        // Get VPS statistics
        $vpsStats = null;
        try {
            $flintExtension = $service->product->server;
            if ($flintExtension) {
                $vpsStats = $flintExtension->getServerStats($service);
            }
        } catch (\Exception $e) {
            Log::warning('Failed to get VPS stats', [
                'service_id' => $service->id,
                'error' => $e->getMessage(),
            ]);
        }

        return view('services.vps', compact('service', 'vpsStats'));
    }

    /**
     * Perform VPS action (start/stop/restart)
     */
    public function action(Request $request, Service $service)
    {
        // Check if user owns this service
        if ($service->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Check if service uses Flint extension
        if ($service->product->server_type !== 'Flint') {
            return response()->json(['success' => false, 'message' => 'VPS actions not available for this service'], 400);
        }

        $request->validate([
            'action' => 'required|in:start,stop,restart'
        ]);

        try {
            $flintExtension = $service->product->server;
            if (!$flintExtension) {
                return response()->json(['success' => false, 'message' => 'Flint extension not configured'], 500);
            }

            // Get VM details
            $vm = $flintExtension->getServer($service->id);
            if (!$vm) {
                return response()->json(['success' => false, 'message' => 'VPS not found'], 404);
            }

            // Perform action via Flint API
            $response = \Http::withHeaders([
                'Authorization' => 'Bearer ' . $flintExtension->config('api_key'),
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post(rtrim($flintExtension->config('host'), '/') . '/api/vms/' . $vm['uuid'] . '/action', [
                'action' => $request->action
            ]);

            if (!$response->successful()) {
                $error = $response->json('error', 'Unknown error');
                Log::error('VPS action failed', [
                    'service_id' => $service->id,
                    'action' => $request->action,
                    'error' => $error,
                ]);
                return response()->json(['success' => false, 'message' => 'Failed to ' . $request->action . ' VPS: ' . $error], 500);
            }

            Log::info('VPS action completed', [
                'service_id' => $service->id,
                'action' => $request->action,
                'user_id' => Auth::id(),
            ]);

            return response()->json(['success' => true, 'message' => 'VPS ' . $request->action . ' initiated successfully']);

        } catch (\Exception $e) {
            Log::error('VPS action error', [
                'service_id' => $service->id,
                'action' => $request->action,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reinstall VPS operating system
     */
    public function reinstall(Request $request, Service $service)
    {
        // Check if user owns this service
        if ($service->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Check if service uses Flint extension
        if ($service->product->server_type !== 'Flint') {
            return response()->json(['success' => false, 'message' => 'OS reinstallation not available for this service'], 400);
        }

        $request->validate([
            'os_image' => 'required|string'
        ]);

        try {
            $flintExtension = $service->product->server;
            if (!$flintExtension) {
                return response()->json(['success' => false, 'message' => 'Flint extension not configured'], 500);
            }

            // Get current VM details
            $vm = $flintExtension->getServer($service->id);
            if (!$vm) {
                return response()->json(['success' => false, 'message' => 'VPS not found'], 404);
            }

            // Create backup snapshot before reinstall
            try {
                $snapshotName = 'pre-reinstall-' . date('Y-m-d-H-i-s');
                \Http::withHeaders([
                    'Authorization' => 'Bearer ' . $flintExtension->config('api_key'),
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])->post(rtrim($flintExtension->config('host'), '/') . '/api/vms/' . $vm['uuid'] . '/snapshots', [
                    'name' => $snapshotName,
                    'description' => 'Automatic backup before OS reinstallation',
                ]);
            } catch (\Exception $e) {
                Log::warning('Failed to create pre-reinstall backup', [
                    'service_id' => $service->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // For Flint, we need to delete and recreate the VM with new OS
            // This is a simplified approach - in production, you'd want a more sophisticated method
            
            // Stop the VM first
            \Http::withHeaders([
                'Authorization' => 'Bearer ' . $flintExtension->config('api_key'),
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post(rtrim($flintExtension->config('host'), '/') . '/api/vms/' . $vm['uuid'] . '/action', [
                'action' => 'stop'
            ]);

            // Wait a moment for shutdown
            sleep(3);

            // Delete the VM (keep disks for now)
            \Http::withHeaders([
                'Authorization' => 'Bearer ' . $flintExtension->config('api_key'),
                'Accept' => 'application/json',
            ])->delete(rtrim($flintExtension->config('host'), '/') . '/api/vms/' . $vm['uuid']);

            // Create new VM with same specs but different OS
            $vmData = [
                'name' => $vm['name'],
                'memoryMB' => $service->product->settings['memory_mb'],
                'vcpus' => $service->product->settings['cpu_cores'],
                'diskSizeGB' => $service->product->settings['disk_gb'],
                'imageName' => $request->os_image,
                'startOnCreate' => true,
                'cloudInit' => [
                    'commonFields' => [
                        'hostname' => $vm['name'],
                        'username' => 'root',
                        'password' => $this->generateRandomPassword(),
                    ],
                ],
            ];

            $response = \Http::withHeaders([
                'Authorization' => 'Bearer ' . $flintExtension->config('api_key'),
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post(rtrim($flintExtension->config('host'), '/') . '/api/vms', $vmData);

            if (!$response->successful()) {
                $error = $response->json('error', 'Unknown error');
                Log::error('VPS recreation failed during reinstall', [
                    'service_id' => $service->id,
                    'error' => $error,
                ]);
                return response()->json(['success' => false, 'message' => 'Failed to recreate VPS: ' . $error], 500);
            }

            // Update service configuration with new VM details
            $newVm = $response->json();
            $service->update([
                'config' => array_merge($service->config ?? [], [
                    'flint_vm_uuid' => $newVm['uuid'] ?? null,
                    'flint_vm_name' => $newVm['name'] ?? null,
                    'flint_vm_reinstalled_at' => now()->toISOString(),
                    'flint_vm_os' => $request->os_image,
                ])
            ]);

            Log::info('VPS OS reinstalled', [
                'service_id' => $service->id,
                'old_os' => $service->product->settings['os_image'] ?? 'unknown',
                'new_os' => $request->os_image,
                'user_id' => Auth::id(),
            ]);

            return response()->json(['success' => true, 'message' => 'OS reinstallation started successfully']);

        } catch (\Exception $e) {
            Log::error('VPS reinstall error', [
                'service_id' => $service->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Create VPS snapshot
     */
    public function snapshot(Request $request, Service $service)
    {
        // Check if user owns this service
        if ($service->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Check if service uses Flint extension
        if ($service->product->server_type !== 'Flint') {
            return response()->json(['success' => false, 'message' => 'Snapshot not available for this service'], 400);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500'
        ]);

        try {
            $flintExtension = $service->product->server;
            if (!$flintExtension) {
                return response()->json(['success' => false, 'message' => 'Flint extension not configured'], 500);
            }

            // Get VM details
            $vm = $flintExtension->getServer($service->id);
            if (!$vm) {
                return response()->json(['success' => false, 'message' => 'VPS not found'], 404);
            }

            // Create snapshot
            $response = \Http::withHeaders([
                'Authorization' => 'Bearer ' . $flintExtension->config('api_key'),
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post(rtrim($flintExtension->config('host'), '/') . '/api/vms/' . $vm['uuid'] . '/snapshots', [
                'name' => $request->name,
                'description' => $request->description ?? 'User-created snapshot',
            ]);

            if (!$response->successful()) {
                $error = $response->json('error', 'Unknown error');
                Log::error('VPS snapshot creation failed', [
                    'service_id' => $service->id,
                    'snapshot_name' => $request->name,
                    'error' => $error,
                ]);
                return response()->json(['success' => false, 'message' => 'Failed to create snapshot: ' . $error], 500);
            }

            Log::info('VPS snapshot created', [
                'service_id' => $service->id,
                'snapshot_name' => $request->name,
                'user_id' => Auth::id(),
            ]);

            return response()->json(['success' => true, 'message' => 'Snapshot created successfully']);

        } catch (\Exception $e) {
            Log::error('VPS snapshot error', [
                'service_id' => $service->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get VPS console URL
     */
    public function console(Service $service)
    {
        // Check if user owns this service
        if ($service->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this service');
        }

        // Check if service uses Flint extension
        if ($service->product->server_type !== 'Flint') {
            abort(404, 'Console not available for this service');
        }

        try {
            $flintExtension = $service->product->server;
            if (!$flintExtension) {
                return response()->json(['error' => 'Flint extension not configured'], 500);
            }

            $vm = $flintExtension->getServer($service->id);
            if (!$vm) {
                return response()->json(['error' => 'VPS not found'], 404);
            }

            $consoleUrl = rtrim($flintExtension->config('host'), '/') . '/vms/' . $vm['uuid'] . '/console';
            
            return response()->json(['console_url' => $consoleUrl]);

        } catch (\Exception $e) {
            Log::error('VPS console error', [
                'service_id' => $service->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Failed to get console URL'], 500);
        }
    }

    /**
     * Generate random password
     */
    private function generateRandomPassword($length = 16)
    {
        return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )),1,$length);
    }
}