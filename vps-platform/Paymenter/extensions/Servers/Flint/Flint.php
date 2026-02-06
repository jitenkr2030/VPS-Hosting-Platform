<?php

namespace Paymenter\Extensions\Servers\Flint;

use App\Classes\Extension\Server;
use App\Models\Service;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Flint VPS Server Extension for Paymenter
 * 
 * Integrates Flint KVM management with Paymenter billing system
 * to create a complete VPS hosting platform.
 */
class Flint extends Server
{
    /**
     * Flint API configuration
     */
    private function getApiUrl()
    {
        return rtrim($this->config('host'), '/') . '/api';
    }

    private function getApiHeaders()
    {
        return [
            'Authorization' => 'Bearer ' . $this->config('api_key'),
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ];
    }

    /**
     * Server configuration fields
     */
    public function getConfig($values = []): array
    {
        return [
            [
                'name' => 'host',
                'label' => 'Flint API URL',
                'type' => 'text',
                'description' => 'Flint server URL (e.g., http://flint.example.com:5550)',
                'required' => true,
                'validation' => 'url',
                'placeholder' => 'http://localhost:5550',
            ],
            [
                'name' => 'api_key',
                'label' => 'Flint API Key',
                'type' => 'text',
                'description' => 'API key from Flint (run "flint api-key" to get it)',
                'required' => true,
                'encrypted' => true,
                'placeholder' => 'flint_xxxxxxxxxxxx',
            ],
            [
                'name' => 'default_image',
                'label' => 'Default OS Image',
                'type' => 'select',
                'description' => 'Default OS image for new VPS instances',
                'required' => true,
                'options' => [
                    'ubuntu-24.04' => 'Ubuntu 24.04 LTS',
                    'ubuntu-22.04' => 'Ubuntu 22.04 LTS',
                    'debian-12' => 'Debian 12',
                    'centos-stream-9' => 'CentOS Stream 9',
                    'fedora-39' => 'Fedora 39',
                    'alpine-3.19' => 'Alpine Linux 3.19',
                ],
                'default' => 'ubuntu-24.04',
            ],
            [
                'name' => 'default_network',
                'label' => 'Default Network',
                'type' => 'text',
                'description' => 'Default network name for VPS instances',
                'required' => true,
                'default' => 'default',
                'placeholder' => 'default',
            ],
            [
                'name' => 'storage_pool',
                'label' => 'Storage Pool',
                'type' => 'text',
                'description' => 'Storage pool for VPS disks',
                'required' => true,
                'default' => 'default',
                'placeholder' => 'default',
            ],
        ];
    }

    /**
     * Test connection to Flint API
     */
    public function testConfig(): bool|string
    {
        try {
            $response = Http::withHeaders($this->getApiHeaders())
                ->get($this->getApiUrl() . '/host/status');

            if (!$response->successful()) {
                return 'Failed to connect to Flint API: ' . $response->status();
            }

            $data = $response->json();
            if (!isset($data['hostname'])) {
                return 'Invalid response from Flint API';
            }

            return true;
        } catch (Exception $e) {
            return 'Connection error: ' . $e->getMessage();
        }
    }

    /**
     * Product configuration fields for VPS plans
     */
    public function getProductConfig($values = []): array
    {
        return [
            [
                'name' => 'cpu_cores',
                'label' => 'CPU Cores',
                'type' => 'number',
                'description' => 'Number of virtual CPU cores',
                'required' => true,
                'min_value' => 1,
                'max_value' => 32,
                'default' => 1,
                'suffix' => 'cores',
            ],
            [
                'name' => 'memory_mb',
                'label' => 'RAM Memory',
                'type' => 'number',
                'description' => 'Memory allocation in MB',
                'required' => true,
                'min_value' => 512,
                'max_value' => 131072,
                'default' => 2048,
                'suffix' => 'MB',
            ],
            [
                'name' => 'disk_gb',
                'label' => 'Disk Space',
                'type' => 'number',
                'description' => 'Disk space in GB',
                'required' => true,
                'min_value' => 10,
                'max_value' => 10000,
                'default' => 40,
                'suffix' => 'GB',
            ],
            [
                'name' => 'os_image',
                'label' => 'OS Image',
                'type' => 'select',
                'description' => 'Operating system image to install',
                'required' => true,
                'options' => [
                    'ubuntu-24.04' => 'Ubuntu 24.04 LTS',
                    'ubuntu-22.04' => 'Ubuntu 22.04 LTS',
                    'debian-12' => 'Debian 12',
                    'centos-stream-9' => 'CentOS Stream 9',
                    'fedora-39' => 'Fedora 39',
                    'alpine-3.19' => 'Alpine Linux 3.19',
                ],
                'default' => 'ubuntu-24.04',
            ],
            [
                'name' => 'auto_start',
                'label' => 'Auto Start VM',
                'type' => 'checkbox',
                'description' => 'Automatically start the VM after creation',
                'default' => true,
            ],
            [
                'name' => 'enable_ssh_keys',
                'label' => 'Enable SSH Key Authentication',
                'type' => 'checkbox',
                'description' => 'Allow users to set SSH keys via cloud-init',
                'default' => true,
            ],
            [
                'name' => 'backup_enabled',
                'label' => 'Enable Backups',
                'type' => 'checkbox',
                'description' => 'Enable automatic backup snapshots',
                'default' => false,
            ],
            [
                'name' => 'backup_frequency',
                'label' => 'Backup Frequency',
                'type' => 'select',
                'description' => 'How often to create backup snapshots',
                'options' => [
                    'daily' => 'Daily',
                    'weekly' => 'Weekly',
                    'monthly' => 'Monthly',
                ],
                'default' => 'weekly',
                'required' => false,
                'visible' => $values['backup_enabled'] ?? false,
            ],
        ];
    }

    /**
     * Create a new VPS server
     */
    public function createServer(Service $service, $settings, $properties)
    {
        // Check if server already exists
        if ($this->getServer($service->id, failIfNotFound: false)) {
            throw new Exception('VPS server already exists for this service');
        }

        // Merge settings with properties
        $config = array_merge($settings, $properties);

        // Prepare VM creation request
        $vmData = [
            'name' => $this->generateVmName($service),
            'memoryMB' => (int) $config['memory_mb'],
            'vcpus' => (int) $config['cpu_cores'],
            'diskSizeGB' => (int) $config['disk_gb'],
            'imageName' => $config['os_image'] ?? $this->config('default_image'),
            'startOnCreate' => $config['auto_start'] ?? true,
            'cloudInit' => $this->prepareCloudInit($service, $config),
        ];

        // Send request to Flint API
        try {
            $response = Http::withHeaders($this->getApiHeaders())
                ->post($this->getApiUrl() . '/vms', $vmData);

            if (!$response->successful()) {
                $error = $response->json('error', 'Unknown error');
                Log::error('Flint VM creation failed', [
                    'service_id' => $service->id,
                    'error' => $error,
                    'response' => $response->body(),
                ]);
                throw new Exception('Failed to create VPS: ' . $error);
            }

            $vm = $response->json();

            // Store VM details for future reference
            $this->storeVmDetails($service, $vm, $config);

            Log::info('VPS server created successfully', [
                'service_id' => $service->id,
                'vm_uuid' => $vm['uuid'] ?? null,
                'vm_name' => $vm['name'] ?? null,
            ]);

            return [
                'vm_uuid' => $vm['uuid'] ?? null,
                'vm_name' => $vm['name'] ?? null,
                'vm_status' => $vm['status'] ?? 'unknown',
                'ip_addresses' => $vm['ipAddresses'] ?? [],
                'console_url' => $this->config('host') . '/vms/' . ($vm['uuid'] ?? ''),
            ];

        } catch (Exception $e) {
            Log::error('Flint API error during VM creation', [
                'service_id' => $service->id,
                'error' => $e->getMessage(),
            ]);
            throw new Exception('VPS creation failed: ' . $e->getMessage());
        }
    }

    /**
     * Get server details
     */
    public function getServer($serviceId, $failIfNotFound = true)
    {
        try {
            $response = Http::withHeaders($this->getApiHeaders())
                ->get($this->getApiUrl() . '/vms');

            if (!$response->successful()) {
                if ($failIfNotFound) {
                    throw new Exception('Failed to retrieve VM list from Flint');
                }
                return null;
            }

            $vms = $response->json();
            
            // Find VM by name (we use service ID in naming)
            $vmName = $this->generateVmName(['id' => $serviceId]);
            foreach ($vms as $vm) {
                if ($vm['name'] === $vmName) {
                    return $vm;
                }
            }

            if ($failIfNotFound) {
                throw new Exception('VPS server not found');
            }
            return null;

        } catch (Exception $e) {
            if ($failIfNotFound) {
                throw new Exception('Failed to get VPS details: ' . $e->getMessage());
            }
            return null;
        }
    }

    /**
     * Suspend VPS server
     */
    public function suspendServer(Service $service)
    {
        $vm = $this->getServer($service->id);
        if (!$vm) {
            throw new Exception('VPS server not found');
        }

        $response = Http::withHeaders($this->getApiHeaders())
            ->post($this->getApiUrl() . '/vms/' . $vm['uuid'] . '/action', [
                'action' => 'stop'
            ]);

        if (!$response->successful()) {
            throw new Exception('Failed to suspend VPS: ' . $response->json('error', 'Unknown error'));
        }

        Log::info('VPS server suspended', ['service_id' => $service->id]);
        return true;
    }

    /**
     * Unsuspend VPS server
     */
    public function unsuspendServer(Service $service)
    {
        $vm = $this->getServer($service->id);
        if (!$vm) {
            throw new Exception('VPS server not found');
        }

        $response = Http::withHeaders($this->getApiHeaders())
            ->post($this->getApiUrl() . '/vms/' . $vm['uuid'] . '/action', [
                'action' => 'start'
            ]);

        if (!$response->successful()) {
            throw new Exception('Failed to unsuspend VPS: ' . $response->json('error', 'Unknown error'));
        }

        Log::info('VPS server unsuspended', ['service_id' => $service->id]);
        return true;
    }

    /**
     * Terminate VPS server
     */
    public function terminateServer(Service $service)
    {
        $vm = $this->getServer($service->id, false);
        if (!$vm) {
            // Server might not exist, consider it terminated
            return true;
        }

        // Create backup snapshot before termination if enabled
        $config = $service->product->settings ?? [];
        if ($config['backup_enabled'] ?? false) {
            try {
                $this->createBackupSnapshot($vm['uuid'], 'pre-termination');
            } catch (Exception $e) {
                Log::warning('Failed to create pre-termination backup', [
                    'service_id' => $service->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Delete VM with disks
        $response = Http::withHeaders($this->getApiHeaders())
            ->delete($this->getApiUrl() . '/vms/' . $vm['uuid'] . '?deleteDisks=true');

        if (!$response->successful()) {
            throw new Exception('Failed to terminate VPS: ' . $response->json('error', 'Unknown error'));
        }

        Log::info('VPS server terminated', ['service_id' => $service->id]);
        return true;
    }

    /**
     * Upgrade VPS server resources
     */
    public function upgradeServer(Service $service, $newSettings, $oldSettings)
    {
        // Flint doesn't support direct resource modification
        // We need to recreate the VM with new specs
        $vm = $this->getServer($service->id);
        if (!$vm) {
            throw new Exception('VPS server not found');
        }

        // Create backup before upgrade
        try {
            $this->createBackupSnapshot($vm['uuid'], 'pre-upgrade');
        } catch (Exception $e) {
            Log::warning('Failed to create pre-upgrade backup', [
                'service_id' => $service->id,
                'error' => $e->getMessage(),
            ]);
        }

        // For now, we'll log the upgrade request
        // In a production environment, you'd implement a more sophisticated upgrade strategy
        Log::info('VPS upgrade requested', [
            'service_id' => $service->id,
            'old_settings' => $oldSettings,
            'new_settings' => $newSettings,
        ]);

        throw new Exception('VPS upgrades require manual intervention. Please contact support.');
    }

    /**
     * Get server statistics for dashboard
     */
    public function getServerStats(Service $service)
    {
        $vm = $this->getServer($service->id, false);
        if (!$vm) {
            return null;
        }

        return [
            'status' => $vm['status'] ?? 'unknown',
            'cpu_usage' => $vm['cpuUsage'] ?? 0,
            'memory_usage' => $vm['memoryUsage'] ?? 0,
            'disk_usage' => $vm['diskUsage'] ?? 0,
            'ip_addresses' => $vm['ipAddresses'] ?? [],
            'uptime' => $vm['uptime'] ?? 0,
        ];
    }

    /**
     * Generate VM name based on service
     */
    private function generateVmName($service)
    {
        return 'vps-' . $service->id . '-' . strtolower(str_replace(' ', '-', $service->product->name ?? 'server'));
    }

    /**
     * Prepare cloud-init configuration
     */
    private function prepareCloudInit(Service $service, $config)
    {
        $user = $service->user;
        
        $cloudInit = [
            'commonFields' => [
                'hostname' => $this->generateVmName($service),
                'username' => 'root',
                'password' => $this->generateRandomPassword(),
            ],
        ];

        // Add SSH key if enabled
        if ($config['enable_ssh_keys'] ?? true) {
            // You can extend this to support multiple SSH keys from user profile
            $cloudInit['sshKeys'] = [];
        }

        return $cloudInit;
    }

    /**
     * Generate random password
     */
    private function generateRandomPassword($length = 16)
    {
        return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )),1,$length);
    }

    /**
     * Store VM details in service configuration
     */
    private function storeVmDetails(Service $service, $vm, $config)
    {
        $service->update([
            'config' => array_merge($service->config ?? [], [
                'flint_vm_uuid' => $vm['uuid'] ?? null,
                'flint_vm_name' => $vm['name'] ?? null,
                'flint_vm_created_at' => now()->toISOString(),
                'flint_vm_config' => $config,
            ])
        ]);
    }

    /**
     * Create backup snapshot
     */
    private function createBackupSnapshot($vmUuid, $prefix)
    {
        $snapshotName = $prefix . '-' . date('Y-m-d-H-i-s');
        
        $response = Http::withHeaders($this->getApiHeaders())
            ->post($this->getApiUrl() . '/vms/' . $vmUuid . '/snapshots', [
                'name' => $snapshotName,
                'description' => 'Automatic backup: ' . $prefix,
            ]);

        if (!$response->successful()) {
            throw new Exception('Failed to create backup snapshot');
        }

        return $response->json();
    }
}