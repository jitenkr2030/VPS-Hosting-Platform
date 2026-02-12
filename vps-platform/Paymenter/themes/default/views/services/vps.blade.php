@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">VPS Management</h5>
                    @if($service->active)
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-success" onclick="vpsAction('start')">
                                <i class="fas fa-play"></i> Start
                            </button>
                            <button type="button" class="btn btn-warning" onclick="vpsAction('stop')">
                                <i class="fas fa-stop"></i> Stop
                            </button>
                            <button type="button" class="btn btn-info" onclick="vpsAction('restart')">
                                <i class="fas fa-redo"></i> Restart
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="openConsole()">
                                <i class="fas fa-terminal"></i> Console
                            </button>
                        </div>
                    @endif
                </div>
                <div class="card-body">
                    @if($vpsStats)
                        <div class="row mb-4">
                            <div class="col-md-3">
                                <div class="d-flex align-items-center">
                                    <div class="flex-shrink-0">
                                        <div class="bg-{{ $vpsStats['status'] == 'running' ? 'success' : 'secondary' }} rounded-circle p-3">
                                            <i class="fas fa-server text-white"></i>
                                        </div>
                                    </div>
                                    <div class="flex-grow-1 ms-3">
                                        <h6 class="mb-1">Status</h6>
                                        <span class="badge bg-{{ $vpsStats['status'] == 'running' ? 'success' : 'secondary' }}">
                                            {{ ucfirst($vpsStats['status']) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="d-flex align-items-center">
                                    <div class="flex-shrink-0">
                                        <div class="bg-primary rounded-circle p-3">
                                            <i class="fas fa-microchip text-white"></i>
                                        </div>
                                    </div>
                                    <div class="flex-grow-1 ms-3">
                                        <h6 class="mb-1">CPU Usage</h6>
                                        <div class="progress" style="height: 6px;">
                                            <div class="progress-bar" role="progressbar" 
                                                 style="width: {{ $vpsStats['cpu_usage'] }}%"
                                                 aria-valuenow="{{ $vpsStats['cpu_usage'] }}" 
                                                 aria-valuemin="0" aria-valuemax="100">
                                            </div>
                                        </div>
                                        <small>{{ $vpsStats['cpu_usage'] }}%</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="d-flex align-items-center">
                                    <div class="flex-shrink-0">
                                        <div class="bg-info rounded-circle p-3">
                                            <i class="fas fa-memory text-white"></i>
                                        </div>
                                    </div>
                                    <div class="flex-grow-1 ms-3">
                                        <h6 class="mb-1">Memory Usage</h6>
                                        <div class="progress" style="height: 6px;">
                                            <div class="progress-bar bg-info" role="progressbar" 
                                                 style="width: {{ $vpsStats['memory_usage'] }}%"
                                                 aria-valuenow="{{ $vpsStats['memory_usage'] }}" 
                                                 aria-valuemin="0" aria-valuemax="100">
                                            </div>
                                        </div>
                                        <small>{{ $vpsStats['memory_usage'] }}%</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="d-flex align-items-center">
                                    <div class="flex-shrink-0">
                                        <div class="bg-warning rounded-circle p-3">
                                            <i class="fas fa-hdd text-white"></i>
                                        </div>
                                    </div>
                                    <div class="flex-grow-1 ms-3">
                                        <h6 class="mb-1">Disk Usage</h6>
                                        <div class="progress" style="height: 6px;">
                                            <div class="progress-bar bg-warning" role="progressbar" 
                                                 style="width: {{ $vpsStats['disk_usage'] }}%"
                                                 aria-valuenow="{{ $vpsStats['disk_usage'] }}" 
                                                 aria-valuemin="0" aria-valuemax="100">
                                            </div>
                                        </div>
                                        <small>{{ $vpsStats['disk_usage'] }}%</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <h6>IP Addresses</h6>
                                @if(!empty($vpsStats['ip_addresses']))
                                    @foreach($vpsStats['ip_addresses'] as $ip)
                                        <div class="input-group mb-2">
                                            <input type="text" class="form-control" value="{{ $ip }}" readonly>
                                            <button class="btn btn-outline-secondary" type="button" onclick="copyToClipboard('{{ $ip }}')">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    @endforeach
                                @else
                                    <p class="text-muted">No IP addresses assigned</p>
                                @endif
                            </div>
                            <div class="col-md-6">
                                <h6>Quick Actions</h6>
                                <div class="d-grid gap-2">
                                    <button type="button" class="btn btn-outline-primary" onclick="reinstallOS()">
                                        <i class="fas fa-redo-alt"></i> Reinstall OS
                                    </button>
                                    <button type="button" class="btn btn-outline-info" onclick="createSnapshot()">
                                        <i class="fas fa-camera"></i> Create Snapshot
                                    </button>
                                    <button type="button" class="btn btn-outline-warning" onclick="viewBackups()">
                                        <i class="fas fa-archive"></i> Manage Backups
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary" onclick="viewLogs()">
                                        <i class="fas fa-file-alt"></i> View Logs
                                    </button>
                                </div>
                            </div>
                        </div>
                    @else
                        <div class="text-center py-5">
                            <i class="fas fa-server fa-3x text-muted mb-3"></i>
                            <h5>VPS Information Unavailable</h5>
                            <p class="text-muted">Unable to retrieve VPS statistics. The server may be starting up or there might be a connection issue.</p>
                            <button type="button" class="btn btn-primary" onclick="location.reload()">
                                <i class="fas fa-sync"></i> Refresh
                            </button>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- VPS Details Card -->
    <div class="row mt-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">VPS Specifications</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <table class="table table-borderless">
                                <tr>
                                    <td><strong>Product:</strong></td>
                                    <td>{{ $service->product->name }}</td>
                                </tr>
                                <tr>
                                    <td><strong>CPU Cores:</strong></td>
                                    <td>{{ $service->product->settings['cpu_cores'] ?? 'N/A' }} cores</td>
                                </tr>
                                <tr>
                                    <td><strong>Memory:</strong></td>
                                    <td>{{ $service->product->settings['memory_mb'] ?? 'N/A' }} MB</td>
                                </tr>
                                <tr>
                                    <td><strong>Disk Space:</strong></td>
                                    <td>{{ $service->product->settings['disk_gb'] ?? 'N/A' }} GB</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <table class="table table-borderless">
                                <tr>
                                    <td><strong>Operating System:</strong></td>
                                    <td>{{ $service->product->settings['os_image'] ?? 'N/A' }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Created:</strong></td>
                                    <td>{{ $service->created_at->format('Y-m-d H:i:s') }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Billing Cycle:</strong></td>
                                    <td>{{ $service->plan->billing_cycle ?? 'N/A' }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Next Due Date:</strong></td>
                                    <td>{{ $service->expires_at ? $service->expires_at->format('Y-m-d') : 'N/A' }}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Reinstall OS Modal -->
<div class="modal fade" id="reinstallModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Reinstall Operating System</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Warning:</strong> This will completely erase all data on your VPS and reinstall the operating system. This action cannot be undone.
                </div>
                <form id="reinstallForm">
                    <div class="mb-3">
                        <label for="osImage" class="form-label">Operating System</label>
                        <select class="form-select" id="osImage" name="os_image" required>
                            <option value="">Select OS...</option>
                            <option value="ubuntu-24.04">Ubuntu 24.04 LTS</option>
                            <option value="ubuntu-22.04">Ubuntu 22.04 LTS</option>
                            <option value="debian-12">Debian 12</option>
                            <option value="centos-stream-9">CentOS Stream 9</option>
                            <option value="fedora-39">Fedora 39</option>
                            <option value="alpine-3.19">Alpine Linux 3.19</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="confirmText" class="form-label">Type "REINSTALL" to confirm:</label>
                        <input type="text" class="form-control" id="confirmText" name="confirm_text" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-danger" onclick="confirmReinstall()">Reinstall OS</button>
            </div>
        </div>
    </div>
</div>

<!-- Create Snapshot Modal -->
<div class="modal fade" id="snapshotModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Create Snapshot</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="snapshotForm">
                    <div class="mb-3">
                        <label for="snapshotName" class="form-label">Snapshot Name</label>
                        <input type="text" class="form-control" id="snapshotName" name="name" required>
                        <div class="form-text">Use a descriptive name for easy identification</div>
                    </div>
                    <div class="mb-3">
                        <label for="snapshotDescription" class="form-label">Description</label>
                        <textarea class="form-control" id="snapshotDescription" name="description" rows="3"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="confirmSnapshot()">Create Snapshot</button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
function vpsAction(action) {
    if (!confirm('Are you sure you want to ' + action + ' your VPS?')) {
        return;
    }
    
    fetch('/services/{{ $service->id }}/vps/action', {
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
            showAlert('success', 'VPS ' + action + ' initiated successfully');
            setTimeout(() => location.reload(), 2000);
        } else {
            showAlert('danger', data.message || 'Failed to ' + action + ' VPS');
        }
    })
    .catch(error => {
        showAlert('danger', 'An error occurred: ' + error.message);
    });
}

function openConsole() {
    window.open('{{ $service->config['console_url'] ?? '#' }}', '_blank');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('success', 'IP address copied to clipboard');
    });
}

function reinstallOS() {
    new bootstrap.Modal(document.getElementById('reinstallModal')).show();
}

function confirmReinstall() {
    const form = document.getElementById('reinstallForm');
    const formData = new FormData(form);
    
    if (formData.get('confirm_text') !== 'REINSTALL') {
        showAlert('danger', 'Please type REINSTALL to confirm');
        return;
    }
    
    fetch('/services/{{ $service->id }}/vps/reinstall', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({
            os_image: formData.get('os_image')
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('success', 'OS reinstallation started');
            bootstrap.Modal.getInstance(document.getElementById('reinstallModal')).hide();
            setTimeout(() => location.reload(), 3000);
        } else {
            showAlert('danger', data.message || 'Failed to start OS reinstallation');
        }
    })
    .catch(error => {
        showAlert('danger', 'An error occurred: ' + error.message);
    });
}

function createSnapshot() {
    new bootstrap.Modal(document.getElementById('snapshotModal')).show();
}

function confirmSnapshot() {
    const form = document.getElementById('snapshotForm');
    const formData = new FormData(form);
    
    fetch('/services/{{ $service->id }}/vps/snapshot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({
            name: formData.get('name'),
            description: formData.get('description')
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('success', 'Snapshot created successfully');
            bootstrap.Modal.getInstance(document.getElementById('snapshotModal')).hide();
        } else {
            showAlert('danger', data.message || 'Failed to create snapshot');
        }
    })
    .catch(error => {
        showAlert('danger', 'An error occurred: ' + error.message);
    });
}

function viewBackups() {
    // Redirect to backups page or show backups modal
    window.location.href = '/services/{{ $service->id }}/backups';
}

function viewLogs() {
    // Redirect to logs page or show logs modal
    window.location.href = '/services/{{ $service->id }}/logs';
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

// Auto-refresh stats every 30 seconds
setInterval(() => {
    if (document.visibilityState === 'visible') {
        location.reload();
    }
}, 30000);
</script>
@endpush