@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <!-- VPS Overview Cards -->
    <div class="row mb-4">
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-primary shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                Total VPS Instances
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $stats['total_vps'] ?? 0 }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-server fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-success shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                Running VPS
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $stats['running_vps'] ?? 0 }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-play-circle fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-warning shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                Suspended VPS
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $stats['suspended_vps'] ?? 0 }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-pause-circle fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-info shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                Monthly Revenue
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">₹{{ number_format($stats['monthly_revenue'] ?? 0) }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-rupee-sign fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Resource Usage Overview -->
    <div class="row mb-4">
        <div class="col-xl-8 col-lg-7">
            <div class="card shadow mb-4">
                <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 class="m-0 font-weight-bold text-primary">Host Resource Usage</h6>
                    <div class="dropdown no-arrow">
                        <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                        </a>
                        <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in">
                            <a class="dropdown-item" href="#" onclick="refreshResources()">Refresh</a>
                            <a class="dropdown-item" href="/admin/vps/nodes">Manage Nodes</a>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    @if($hostResources)
                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <div class="small text-gray-500">CPU Usage</div>
                                    <div class="progress mb-2">
                                        <div class="progress-bar bg-info" role="progressbar" 
                                             style="width: {{ $hostResources['cpu_usage'] ?? 0 }}%"
                                             aria-valuenow="{{ $hostResources['cpu_usage'] ?? 0 }}" 
                                             aria-valuemin="0" aria-valuemax="100">
                                        </div>
                                    </div>
                                    <div class="small">{{ $hostResources['cpu_usage'] ?? 0 }}% of {{ $hostResources['cpu_cores'] ?? 0 }} cores</div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <div class="small text-gray-500">Memory Usage</div>
                                    <div class="progress mb-2">
                                        <div class="progress-bar bg-warning" role="progressbar" 
                                             style="width: {{ $hostResources['memory_usage'] ?? 0 }}%"
                                             aria-valuenow="{{ $hostResources['memory_usage'] ?? 0 }}" 
                                             aria-valuemin="0" aria-valuemax="100">
                                        </div>
                                    </div>
                                    <div class="small">{{ $hostResources['memory_used'] ?? 0 }}GB / {{ $hostResources['memory_total'] ?? 0 }}GB</div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <div class="small text-gray-500">Storage Usage</div>
                                    <div class="progress mb-2">
                                        <div class="progress-bar bg-success" role="progressbar" 
                                             style="width: {{ $hostResources['storage_usage'] ?? 0 }}%"
                                             aria-valuenow="{{ $hostResources['storage_usage'] ?? 0 }}" 
                                             aria-valuemin="0" aria-valuemax="100">
                                        </div>
                                    </div>
                                    <div class="small">{{ $hostResources['storage_used'] ?? 0 }}GB / {{ $hostResources['storage_total'] ?? 0 }}GB</div>
                                </div>
                            </div>
                        </div>
                    @else
                        <div class="text-center py-3">
                            <i class="fas fa-exclamation-triangle text-warning"></i>
                            <span class="text-muted ml-2">Unable to retrieve host resources</span>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <div class="col-xl-4 col-lg-5">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">VPS Distribution</h6>
                </div>
                <div class="card-body">
                    @if($planDistribution)
                        <div class="chart-pie pt-4 pb-2">
                            <canvas id="vpsDistributionChart"></canvas>
                        </div>
                        <div class="mt-4 text-center small">
                            @foreach($planDistribution as $plan => $count)
                                <span class="mr-2">
                                    <i class="fas fa-circle" style="color: {{ $cycle('primary', 'success', 'info', 'warning')[$loop->index] }}"></i>
                                    {{ $plan }}
                                </span>
                            @endforeach
                        </div>
                    @else
                        <div class="text-center py-3">
                            <span class="text-muted">No VPS data available</span>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Recent VPS Instances Table -->
    <div class="card shadow mb-4">
        <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
            <h6 class="m-0 font-weight-bold text-primary">Recent VPS Instances</h6>
            <div class="btn-group btn-group-sm">
                <a href="/admin/vps/create" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Create VPS
                </a>
                <a href="/admin/vps/export" class="btn btn-outline-secondary">
                    <i class="fas fa-download"></i> Export
                </a>
            </div>
        </div>
        <div class="card-body">
            @if($recentVps->count() > 0)
                <div class="table-responsive">
                    <table class="table table-bordered" id="vpsTable" width="100%" cellspacing="0">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Plan</th>
                                <th>Status</th>
                                <th>IP Address</th>
                                <th>Resources</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($recentVps as $vps)
                                <tr>
                                    <td>{{ $vps->id }}</td>
                                    <td>
                                        <a href="/admin/users/{{ $vps->user->id }}">
                                            {{ $vps->user->name }}
                                        </a>
                                        <br>
                                        <small class="text-muted">{{ $vps->user->email }}</small>
                                    </td>
                                    <td>{{ $vps->product->name }}</td>
                                    <td>
                                        <span class="badge bg-{{ $vps->status === 'active' ? 'success' : ($vps->status === 'suspended' ? 'warning' : 'secondary') }}">
                                            {{ ucfirst($vps->status) }}
                                        </span>
                                    </td>
                                    <td>
                                        @if($vps->config['ip_addresses'] ?? [])
                                            {{ $vps->config['ip_addresses'][0] ?? 'N/A' }}
                                        @else
                                            <span class="text-muted">N/A</span>
                                        @endif
                                    </td>
                                    <td>
                                        <small>
                                            {{ $vps->product->settings['cpu_cores'] ?? 0 }} cores / 
                                            {{ $vps->product->settings['memory_mb'] ?? 0 }}MB / 
                                            {{ $vps->product->settings['disk_gb'] ?? 0 }}GB
                                        </small>
                                    </td>
                                    <td>{{ $vps->created_at->format('M j, Y') }}</td>
                                    <td>
                                        <div class="btn-group btn-group-sm">
                                            <a href="/services/{{ $vps->id }}/vps" class="btn btn-outline-primary" target="_blank">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <button type="button" class="btn btn-outline-success" onclick="vpsAction({{ $vps->id }}, 'start')">
                                                <i class="fas fa-play"></i>
                                            </button>
                                            <button type="button" class="btn btn-outline-warning" onclick="vpsAction({{ $vps->id }}, 'stop')">
                                                <i class="fas fa-stop"></i>
                                            </button>
                                            <button type="button" class="btn btn-outline-info" onclick="vpsConsole({{ $vps->id }})">
                                                <i class="fas fa-terminal"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @else
                <div class="text-center py-5">
                    <i class="fas fa-server fa-3x text-gray-300 mb-3"></i>
                    <h5>No VPS Instances Found</h5>
                    <p class="text-muted">Get started by creating your first VPS instance.</p>
                    <a href="/admin/vps/create" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Create VPS
                    </a>
                </div>
            @endif
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="row">
        <div class="col-lg-4 mb-4">
            <div class="card bg-primary text-white shadow">
                <div class="card-body">
                    <h5 class="card-title">Quick Actions</h5>
                    <div class="d-grid gap-2">
                        <a href="/admin/products/create" class="btn btn-light">
                            <i class="fas fa-plus"></i> New VPS Plan
                        </a>
                        <a href="/admin/vps/bulk-actions" class="btn btn-light">
                            <i class="fas fa-tasks"></i> Bulk Actions
                        </a>
                        <a href="/admin/vps/maintenance" class="btn btn-light">
                            <i class="fas fa-tools"></i> Maintenance Mode
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-lg-4 mb-4">
            <div class="card bg-success text-white shadow">
                <div class="card-body">
                    <h5 class="card-title">System Health</h5>
                    <div class="mb-2">
                        <small>Flint API</small>
                        <div class="progress" style="height: 4px;">
                            <div class="progress-bar bg-white" style="width: 100%"></div>
                        </div>
                    </div>
                    <div class="mb-2">
                        <small>Queue Worker</small>
                        <div class="progress" style="height: 4px;">
                            <div class="progress-bar bg-white" style="width: 100%"></div>
                        </div>
                    </div>
                    <div>
                        <small>Database</small>
                        <div class="progress" style="height: 4px;">
                            <div class="progress-bar bg-white" style="width: 100%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-lg-4 mb-4">
            <div class="card bg-info text-white shadow">
                <div class="card-body">
                    <h5 class="card-title">Recent Activity</h5>
                    <div class="small">
                        @if($recentActivity)
                            @foreach($recentActivity as $activity)
                                <div class="mb-1">
                                    <i class="fas fa-circle fa-xs"></i>
                                    {{ $activity['message'] }}
                                    <br>
                                    <small>{{ $activity['time'] }}</small>
                                </div>
                            @endforeach
                        @else
                            <span class="text-white-50">No recent activity</span>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- VPS Action Modal -->
<div class="modal fade" id="vpsActionModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Confirm VPS Action</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to <span id="actionText"></span> this VPS?</p>
                <div id="actionDetails"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="confirmAction">Confirm</button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
// VPS Distribution Chart
@if($planDistribution)
const ctx = document.getElementById('vpsDistributionChart').getContext('2d');
const vpsDistributionChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: @json(array_keys($planDistribution)),
        datasets: [{
            data: @json(array_values($planDistribution)),
            backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
            hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#f4b619'],
            hoverBorderColor: "rgba(234, 236, 244, 1)",
        }],
    },
    options: {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        }
    }
});
@endif

// VPS Actions
function vpsAction(serviceId, action) {
    document.getElementById('actionText').textContent = action;
    document.getElementById('confirmAction').onclick = function() {
        performVpsAction(serviceId, action);
    };
    new bootstrap.Modal(document.getElementById('vpsActionModal')).show();
}

function performVpsAction(serviceId, action) {
    fetch(`/admin/vps/${serviceId}/action`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({ action: action })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('success', `VPS ${action} initiated successfully`);
            location.reload();
        } else {
            showAlert('danger', data.message || 'Failed to ' + action + ' VPS');
        }
        bootstrap.Modal.getInstance(document.getElementById('vpsActionModal')).hide();
    })
    .catch(error => {
        showAlert('danger', 'An error occurred: ' + error.message);
        bootstrap.Modal.getInstance(document.getElementById('vpsActionModal')).hide();
    });
}

function vpsConsole(serviceId) {
    window.open(`/services/${serviceId}/vps/console`, '_blank');
}

function refreshResources() {
    location.reload();
}

function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container-fluid').insertBefore(alertDiv, document.querySelector('.container-fluid').firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Initialize DataTable
$(document).ready(function() {
    $('#vpsTable').DataTable({
        pageLength: 25,
        order: [[6, 'desc']]
    });
});
</script>
@endpush