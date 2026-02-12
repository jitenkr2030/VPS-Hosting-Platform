<?php

namespace App\Observers;

use App\Models\Service;
use App\Models\Invoice;
use App\Jobs\Server\VpsSuspendJob;
use App\Jobs\Server\VpsTerminateJob;
use App\Jobs\Server\VpsUnsuspendJob;
use Illuminate\Support\Facades\Log;

/**
 * VPS Service Observer
 * 
 * Handles automated workflows for VPS services:
 * - Automatic suspension on payment failure
 * - Automatic termination after extended non-payment
 * - Unsuspension on payment
 * - Service lifecycle management
 */
class VpsServiceObserver
{
    /**
     * Handle the Service "created" event.
     */
    public function created(Service $service): void
    {
        // Only process VPS services (Flint extension)
        if (!$this->isVpsService($service)) {
            return;
        }

        Log::info('VPS service created', [
            'service_id' => $service->id,
            'user_id' => $service->user_id,
            'product_id' => $service->product_id,
        ]);
    }

    /**
     * Handle the Service "updated" event.
     */
    public function updated(Service $service): void
    {
        // Only process VPS services
        if (!$this->isVpsService($service)) {
            return;
        }

        // Check for status changes that require automation
        $changes = $service->getDirty();
        
        if (isset($changes['status'])) {
            $oldStatus = $changes['status'] ?? $service->getOriginal('status');
            $newStatus = $service->status;

            Log::info('VPS service status changed', [
                'service_id' => $service->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ]);

            switch ($newStatus) {
                case 'suspended':
                    if ($oldStatus !== 'suspended') {
                        $this->handleSuspension($service);
                    }
                    break;
                    
                case 'active':
                    if ($oldStatus === 'suspended') {
                        $this->handleUnsuspension($service);
                    }
                    break;
                    
                case 'cancelled':
                case 'terminated':
                    $this->handleTermination($service);
                    break;
            }
        }
    }

    /**
     * Handle the Service "deleted" event.
     */
    public function deleted(Service $service): void
    {
        // Only process VPS services
        if (!$this->isVpsService($service)) {
            return;
        }

        Log::info('VPS service deleted', [
            'service_id' => $service->id,
            'user_id' => $service->user_id,
        ]);
    }

    /**
     * Handle service suspension
     */
    private function handleSuspension(Service $service): void
    {
        // Determine suspension reason
        $reason = 'Manual suspension';
        
        // Check if suspension is due to payment issues
        $unpaidInvoices = $service->invoices()
            ->where('status', 'unpaid')
            ->where('due_date', '<', now())
            ->count();
            
        if ($unpaidInvoices > 0) {
            $reason = 'Payment overdue';
        }

        // Dispatch suspension job
        VpsSuspendJob::dispatch($service, $reason);

        Log::info('VPS suspension initiated', [
            'service_id' => $service->id,
            'reason' => $reason,
        ]);
    }

    /**
     * Handle service unsuspension
     */
    private function handleUnsuspension(Service $service): void
    {
        // Dispatch unsuspension job
        VpsUnsuspendJob::dispatch($service);

        Log::info('VPS unsuspension initiated', [
            'service_id' => $service->id,
        ]);
    }

    /**
     * Handle service termination
     */
    private function handleTermination(Service $service): void
    {
        $reason = $service->status === 'cancelled' ? 'Service cancelled' : 'Service terminated';
        
        // Check if termination is due to extended non-payment
        if ($service->status === 'terminated') {
            $unpaidInvoices = $service->invoices()
                ->where('status', 'unpaid')
                ->where('due_date', '<', now()->subDays(14))
                ->count();
                
            if ($unpaidInvoices > 0) {
                $reason = 'Extended payment overdue (14+ days)';
            }
        }

        // Dispatch termination job with backup
        VpsTerminateJob::dispatch($service, $reason, true);

        Log::info('VPS termination initiated', [
            'service_id' => $service->id,
            'reason' => $reason,
        ]);
    }

    /**
     * Check if service is a VPS service (uses Flint extension)
     */
    private function isVpsService(Service $service): bool
    {
        return $service->product && $service->product->server_type === 'Flint';
    }
}

/**
 * VPS Invoice Observer
 * 
 * Handles payment-related automation for VPS services
 */
class VpsInvoiceObserver
{
    /**
     * Handle the Invoice "updated" event.
     */
    public function updated(Invoice $invoice): void
    {
        // Only process paid invoices for VPS services
        if ($invoice->status !== 'paid') {
            return;
        }

        // Get services associated with this invoice
        $services = $invoice->items()->with('service.product')->get()->pluck('service');
        
        foreach ($services as $service) {
            if ($this->isVpsService($service)) {
                $this->handlePaymentReceived($service, $invoice);
            }
        }
    }

    /**
     * Handle payment received for VPS service
     */
    private function handlePaymentReceived(Service $service, Invoice $invoice): void
    {
        // If service is suspended, try to unsuspend
        if ($service->status === 'suspended') {
            // Check if there are still other unpaid invoices
            $otherUnpaidInvoices = $service->invoices()
                ->where('status', 'unpaid')
                ->where('due_date', '<', now())
                ->where('id', '!=', $invoice->id)
                ->count();

            if ($otherUnpaidInvoices === 0) {
                // All invoices paid, unsuspend the service
                $service->update(['status' => 'active']);
                
                Log::info('VPS service auto-unsuspended after payment', [
                    'service_id' => $service->id,
                    'invoice_id' => $invoice->id,
                ]);
            }
        }

        Log::info('Payment processed for VPS service', [
            'service_id' => $service->id,
            'invoice_id' => $invoice->id,
            'amount' => $invoice->total,
        ]);
    }

    /**
     * Check if service is a VPS service
     */
    private function isVpsService(Service $service): bool
    {
        return $service->product && $service->product->server_type === 'Flint';
    }
}