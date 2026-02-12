// Global state
let currentUser = null;
let authToken = null;
let users = [];
let servers = [];
let systemStats = {};

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    initializeEventListeners();
    loadDashboardData();
    startRealTimeUpdates();
});

// Check authentication status
function checkAuthStatus() {
    authToken = localStorage.getItem('adminAuthToken');
    if (!authToken) {
        window.location.href = '/index.html';
        return;
    }
    
    // Get admin user info
    const userData = localStorage.getItem('adminUserData');
    if (userData) {
        currentUser = JSON.parse(userData);
    } else {
        fetchAdminData();
    }
}

// Fetch admin data from API
async function fetchAdminData() {
    try {
        const response = await fetch('/api/admin/profile', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.admin;
            localStorage.setItem('adminUserData', JSON.stringify(currentUser));
        } else {
            logout();
        }
    } catch (error) {
        console.error('Failed to fetch admin data:', error);
        logout();
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Add any global event listeners here
}

// Load dashboard data
async function loadDashboardData() {
    await Promise.all([
        loadUsers(),
        loadServers(),
        loadSystemStats(),
        loadRecentActivity(),
        initializeCharts()
    ]);
}

// Start real-time updates
function startRealTimeUpdates() {
    // Update system stats every 30 seconds
    setInterval(loadSystemStats, 30000);
    
    // Update recent activity every 10 seconds
    setInterval(loadRecentActivity, 10000);
}

// Load users from API
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            users = data.users;
        } else {
            users = generateMockUsers();
        }
    } catch (error) {
        console.error('Failed to load users:', error);
        users = generateMockUsers();
    }
}

// Generate mock users for demo
function generateMockUsers() {
    return [
        {
            id: 'user-001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            status: 'active',
            role: 'user',
            serverCount: 3,
            createdAt: '2024-11-01T10:00:00Z',
            lastLogin: '2024-12-01T09:30:00Z'
        },
        {
            id: 'user-002',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            status: 'active',
            role: 'user',
            serverCount: 2,
            createdAt: '2024-11-05T14:30:00Z',
            lastLogin: '2024-12-01T08:45:00Z'
        },
        {
            id: 'user-003',
            firstName: 'Bob',
            lastName: 'Johnson',
            email: 'bob@example.com',
            status: 'suspended',
            role: 'user',
            serverCount: 1,
            createdAt: '2024-10-15T11:20:00Z',
            lastLogin: '2024-11-28T16:20:00Z'
        },
        {
            id: 'user-004',
            firstName: 'Alice',
            lastName: 'Brown',
            email: 'alice@example.com',
            status: 'pending',
            role: 'user',
            serverCount: 0,
            createdAt: '2024-12-01T07:15:00Z',
            lastLogin: null
        },
        {
            id: 'admin-001',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@cloudvps.com',
            status: 'active',
            role: 'admin',
            serverCount: 0,
            createdAt: '2024-10-01T00:00:00Z',
            lastLogin: '2024-12-01T10:00:00Z'
        }
    ];
}

// Load servers from API
async function loadServers() {
    try {
        const response = await fetch('/api/admin/servers', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            servers = data.servers;
        } else {
            servers = generateMockServers();
        }
    } catch (error) {
        console.error('Failed to load servers:', error);
        servers = generateMockServers();
    }
}

// Generate mock servers for demo
function generateMockServers() {
    return [
        {
            id: 'srv-001',
            name: 'web-server-01',
            owner: 'John Doe',
            ownerEmail: 'john@example.com',
            status: 'running',
            plan: 'professional',
            ip: '192.168.1.100',
            location: 'Mumbai',
            createdAt: '2024-11-01T10:00:00Z'
        },
        {
            id: 'srv-002',
            name: 'database-server',
            owner: 'Jane Smith',
            ownerEmail: 'jane@example.com',
            status: 'running',
            plan: 'business',
            ip: '192.168.1.101',
            location: 'Bangalore',
            createdAt: '2024-11-05T14:30:00Z'
        },
        {
            id: 'srv-003',
            name: 'test-server',
            owner: 'Bob Johnson',
            ownerEmail: 'bob@example.com',
            status: 'stopped',
            plan: 'starter',
            ip: '192.168.1.102',
            location: 'Delhi',
            createdAt: '2024-11-10T09:15:00Z'
        }
    ];
}

// Load system statistics
async function loadSystemStats() {
    try {
        const response = await fetch('/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            systemStats = data.stats;
        } else {
            systemStats = generateMockStats();
        }
    } catch (error) {
        console.error('Failed to load system stats:', error);
        systemStats = generateMockStats();
    }
    
    updateSystemStatsDisplay();
}

// Generate mock system stats
function generateMockStats() {
    return {
        totalUsers: 1234,
        activeUsers: 1156,
        suspendedUsers: 45,
        pendingUsers: 33,
        totalServers: 856,
        runningServers: 742,
        stoppedServers: 89,
        pendingServers: 25,
        monthlyRevenue: 1240000,
        pendingInvoices: 210000,
        overdueInvoices: 45000,
        systemHealth: 98.5,
        cpuUsage: 45,
        memoryUsage: 67,
        diskUsage: 72
    };
}

// Update system stats display
function updateSystemStatsDisplay() {
    // Update dashboard stats
    document.getElementById('totalUsers').textContent = systemStats.totalUsers.toLocaleString();
    document.getElementById('activeServers').textContent = systemStats.runningServers.toLocaleString();
    document.getElementById('monthlyRevenue').textContent = `₹${(systemStats.monthlyRevenue / 100000).toFixed(1)}L`;
    
    // Update user stats
    const userStats = document.querySelectorAll('#users-section .text-2xl');
    if (userStats[0]) userStats[0].textContent = systemStats.totalUsers.toLocaleString();
    if (userStats[1]) userStats[1].textContent = systemStats.activeUsers.toLocaleString();
    if (userStats[2]) userStats[2].textContent = systemStats.suspendedUsers.toLocaleString();
    if (userStats[3]) userStats[3].textContent = systemStats.pendingUsers.toLocaleString();
    
    // Update server stats
    const serverStats = document.querySelectorAll('#servers-section .text-2xl');
    if (serverStats[0]) serverStats[0].textContent = systemStats.totalServers.toLocaleString();
    if (serverStats[1]) serverStats[1].textContent = systemStats.runningServers.toLocaleString();
    if (serverStats[2]) serverStats[2].textContent = systemStats.stoppedServers.toLocaleString();
    if (serverStats[3]) serverStats[3].textContent = systemStats.pendingServers.toLocaleString();
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const response = await fetch('/api/admin/activity', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateRecentActivityDisplay(data.activities);
        } else {
            updateRecentActivityDisplay(generateMockActivity());
        }
    } catch (error) {
        console.error('Failed to load recent activity:', error);
        updateRecentActivityDisplay(generateMockActivity());
    }
}

// Generate mock activity
function generateMockActivity() {
    return [
        {
            id: 'act-001',
            type: 'user_registered',
            message: 'New user Alice Brown registered',
            timestamp: '2024-12-01T07:15:00Z',
            user: 'Alice Brown'
        },
        {
            id: 'act-002',
            type: 'server_created',
            message: 'Server web-server-02 created by John Doe',
            timestamp: '2024-12-01T06:30:00Z',
            user: 'John Doe'
        },
        {
            id: 'act-003',
            type: 'payment_received',
            message: 'Payment of ₹999 received from Jane Smith',
            timestamp: '2024-12-01T05:45:00Z',
            user: 'Jane Smith'
        },
        {
            id: 'act-004',
            type: 'server_stopped',
            message: 'Server test-server stopped by Bob Johnson',
            timestamp: '2024-12-01T04:20:00Z',
            user: 'Bob Johnson'
        },
        {
            id: 'act-005',
            type: 'user_suspended',
            message: 'User Charlie Wilson suspended due to non-payment',
            timestamp: '2024-12-01T03:15:00Z',
            user: 'Charlie Wilson'
        }
    ];
}

// Update recent activity display
function updateRecentActivityDisplay(activities) {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    container.innerHTML = activities.slice(0, 10).map(activity => `
        <div class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition">
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityIconClass(activity.type)}">
                <i class="fas ${getActivityIcon(activity.type)} text-white text-sm"></i>
            </div>
            <div class="flex-1">
                <p class="text-gray-800">${activity.message}</p>
                <p class="text-gray-500 text-sm">${formatTime(activity.timestamp)}</p>
            </div>
        </div>
    `).join('');
}

// Get activity icon
function getActivityIcon(type) {
    const icons = {
        user_registered: 'fa-user-plus',
        server_created: 'fa-server',
        payment_received: 'fa-credit-card',
        server_stopped: 'fa-stop',
        user_suspended: 'fa-ban',
        server_started: 'fa-play',
        user_login: 'fa-sign-in-alt'
    };
    return icons[type] || 'fa-info-circle';
}

// Get activity icon class
function getActivityIconClass(type) {
    const classes = {
        user_registered: 'bg-blue-500',
        server_created: 'bg-green-500',
        payment_received: 'bg-purple-500',
        server_stopped: 'bg-red-500',
        user_suspended: 'bg-orange-500',
        server_started: 'bg-green-500',
        user_login: 'bg-indigo-500'
    };
    return classes[type] || 'bg-gray-500';
}

// Initialize charts
function initializeCharts() {
    initializeRevenueChart();
    initializeUserGrowthChart();
}

// Initialize revenue chart
function initializeRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Revenue (₹L)',
                data: [8.2, 8.5, 9.1, 9.8, 10.2, 10.8, 11.2, 11.5, 11.8, 10.8, 12.4, 13.1],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize user growth chart
function initializeUserGrowthChart() {
    const ctx = document.getElementById('userGrowthChart');
    if (!ctx) return;
    
    new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'New Users',
                data: [65, 72, 78, 85, 92, 98, 105, 112, 118, 125, 132, 138],
                backgroundColor: '#10B981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Navigation functions
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    
    // Show selected section
    document.getElementById(`${section}-section`).classList.remove('hidden');
    
    // Update page title
    const titles = {
        dashboard: 'Admin Dashboard',
        users: 'User Management',
        servers: 'Server Management',
        billing: 'Billing & Revenue',
        system: 'System Health',
        logs: 'System Logs',
        settings: 'System Settings'
    };
    document.getElementById('pageTitle').textContent = titles[section] || 'Admin Dashboard';
    
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-gray-800', 'text-white');
        item.classList.add('text-gray-300');
    });
    
    const activeNav = document.querySelector(`[href="#${section}"]`);
    if (activeNav) {
        activeNav.classList.remove('text-gray-300');
        activeNav.classList.add('bg-gray-800', 'text-white');
    }
    
    // Load section-specific data
    loadSectionData(section);
}

// Load section-specific data
function loadSectionData(section) {
    switch (section) {
        case 'users':
            updateUsersTable();
            break;
        case 'servers':
            updateServersTable();
            break;
        case 'system':
            updateSystemHealth();
            break;
        case 'logs':
            loadSystemLogs();
            break;
    }
}

// Update users table
function updateUsersTable() {
    const tbody = document.getElementById('usersTable');
    if (!tbody) return;
    
    tbody.innerHTML = users.map(user => `
        <tr class="border-t hover:bg-gray-50">
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
                        <span class="text-white text-sm font-medium">
                            ${user.firstName[0]}${user.lastName[0]}
                        </span>
                    </div>
                    <div>
                        <p class="font-medium">${user.firstName} ${user.lastName}</p>
                        <p class="text-sm text-gray-600">ID: ${user.id}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">${user.email}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs ${getUserStatusClass(user.status)}">
                    ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs ${getUserRoleClass(user.role)}">
                    ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
            </td>
            <td class="px-6 py-4">${user.serverCount}</td>
            <td class="px-6 py-4">${formatDate(user.createdAt)}</td>
            <td class="px-6 py-4">
                <div class="flex space-x-2">
                    <button onclick="viewUser('${user.id}')" class="text-indigo-600 hover:text-indigo-700 text-sm">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editUser('${user.id}')" class="text-yellow-600 hover:text-yellow-700 text-sm">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="suspendUser('${user.id}')" class="text-red-600 hover:text-red-700 text-sm">
                        <i class="fas fa-ban"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update servers table
function updateServersTable() {
    const tbody = document.getElementById('serversTable');
    if (!tbody) return;
    
    tbody.innerHTML = servers.map(server => `
        <tr class="border-t hover:bg-gray-50">
            <td class="px-6 py-4">
                <div>
                    <p class="font-medium">${server.name}</p>
                    <p class="text-sm text-gray-600">ID: ${server.id}</p>
                </div>
            </td>
            <td class="px-6 py-4">
                <div>
                    <p class="font-medium">${server.owner}</p>
                    <p class="text-sm text-gray-600">${server.ownerEmail}</p>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs ${getServerStatusClass(server.status)}">
                    ${server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                </span>
            </td>
            <td class="px-6 py-4">${server.plan.charAt(0).toUpperCase() + server.plan.slice(1)}</td>
            <td class="px-6 py-4">${server.ip}</td>
            <td class="px-6 py-4">${server.location}</td>
            <td class="px-6 py-4">${formatDate(server.createdAt)}</td>
            <td class="px-6 py-4">
                <div class="flex space-x-2">
                    <button onclick="viewServer('${server.id}')" class="text-indigo-600 hover:text-indigo-700 text-sm">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="stopServer('${server.id}')" class="text-red-600 hover:text-red-700 text-sm">
                        <i class="fas fa-stop"></i>
                    </button>
                    <button onclick="deleteServer('${server.id}')" class="text-red-600 hover:text-red-700 text-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update system health display
function updateSystemHealth() {
    // This would update the system health metrics
    // For demo, we're using the mock data already loaded
}

// Load system logs
function loadSystemLogs() {
    const logViewer = document.getElementById('logViewer');
    if (!logViewer) return;
    
    const mockLogs = [
        { timestamp: '2024-12-01 10:30:15', level: 'INFO', message: 'User john@example.com logged in' },
        { timestamp: '2024-12-01 10:29:45', level: 'INFO', message: 'Server srv-001 started successfully' },
        { timestamp: '2024-12-01 10:28:30', level: 'WARNING', message: 'High memory usage on node-mumbai-01: 85%' },
        { timestamp: '2024-12-01 10:27:12', level: 'INFO', message: 'Payment received: ₹999 from jane@example.com' },
        { timestamp: '2024-12-01 10:26:03', level: 'ERROR', message: 'Failed to create server for user bob@example.com: Insufficient resources' },
        { timestamp: '2024-12-01 10:25:18', level: 'INFO', message: 'New user registration: alice@example.com' },
        { timestamp: '2024-12-01 10:24:45', level: 'INFO', message: 'System backup completed successfully' },
        { timestamp: '2024-12-01 10:23:30', level: 'WARNING', message: 'Disk space low on node-bangalore-02: 90%' }
    ];
    
    logViewer.innerHTML = mockLogs.map(log => {
        const levelClass = getLogLevelClass(log.level);
        return `<div>[${log.timestamp}] <span class="${levelClass}">${log.level}</span> ${log.message}</div>`;
    }).join('');
}

// Get log level class
function getLogLevelClass(level) {
    const classes = {
        'ERROR': 'text-red-400',
        'WARNING': 'text-yellow-400',
        'INFO': 'text-green-400',
        'DEBUG': 'text-blue-400'
    };
    return classes[level] || 'text-gray-400';
}

// Get user status class
function getUserStatusClass(status) {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'suspended':
            return 'bg-red-100 text-red-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Get user role class
function getUserRoleClass(role) {
    switch (role) {
        case 'admin':
            return 'bg-purple-100 text-purple-800';
        case 'user':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Get server status class
function getServerStatusClass(status) {
    switch (status) {
        case 'running':
            return 'bg-green-100 text-green-800';
        case 'stopped':
            return 'bg-red-100 text-red-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// User management functions
function showCreateUserModal() {
    document.getElementById('userModal').classList.remove('hidden');
}

function closeUserModal() {
    document.getElementById('userModal').classList.add('hidden');
}

async function createUser(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        role: formData.get('role'),
        password: formData.get('password')
    };
    
    try {
        showToast('Creating user...', 'info');
        
        // API call would go here
        // const response = await fetch('/api/admin/users', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${authToken}`
        //     },
        //     body: JSON.stringify(userData)
        // });
        
        // Simulate user creation
        setTimeout(() => {
            const newUser = {
                id: `user-${Date.now()}`,
                ...userData,
                status: 'pending',
                serverCount: 0,
                createdAt: new Date().toISOString(),
                lastLogin: null
            };
            
            users.push(newUser);
            updateUsersTable();
            
            showToast('User created successfully', 'success');
            closeUserModal();
            event.target.reset();
        }, 2000);
    } catch (error) {
        showToast('Failed to create user', 'error');
    }
}

function viewUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        showToast(`Viewing user: ${user.firstName} ${user.lastName}`, 'info');
    }
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        showToast(`Editing user: ${user.firstName} ${user.lastName}`, 'info');
    }
}

async function suspendUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (confirm(`Are you sure you want to suspend ${user.firstName} ${user.lastName}?`)) {
        try {
            showToast('Suspending user...', 'info');
            
            // API call would go here
            setTimeout(() => {
                user.status = 'suspended';
                updateUsersTable();
                showToast('User suspended successfully', 'success');
            }, 1500);
        } catch (error) {
            showToast('Failed to suspend user', 'error');
        }
    }
}

// Server management functions
function viewServer(serverId) {
    const server = servers.find(s => s.id === serverId);
    if (server) {
        showToast(`Viewing server: ${server.name}`, 'info');
    }
}

async function stopServer(serverId) {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;
    
    if (confirm(`Are you sure you want to stop ${server.name}?`)) {
        try {
            showToast('Stopping server...', 'info');
            
            // API call would go here
            setTimeout(() => {
                server.status = 'stopped';
                updateServersTable();
                showToast('Server stopped successfully', 'success');
            }, 2000);
        } catch (error) {
            showToast('Failed to stop server', 'error');
        }
    }
}

async function deleteServer(serverId) {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;
    
    if (confirm(`Are you sure you want to delete ${server.name}? This action cannot be undone.`)) {
        try {
            showToast('Deleting server...', 'info');
            
            // API call would go here
            setTimeout(() => {
                servers = servers.filter(s => s.id !== serverId);
                updateServersTable();
                showToast('Server deleted successfully', 'success');
            }, 2000);
        } catch (error) {
            showToast('Failed to delete server', 'error');
        }
    }
}

// Settings functions
function showSettingsTab(tab) {
    // Hide all settings content
    document.querySelectorAll('.settings-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show selected tab
    document.getElementById(`${tab}-settings`).classList.remove('hidden');
    
    // Update tab active state
    document.querySelectorAll('.settings-tab').forEach(tabBtn => {
        tabBtn.classList.remove('bg-gray-100', 'text-gray-900');
        tabBtn.classList.add('text-gray-700');
    });
    
    const activeTab = document.querySelector(`[onclick="showSettingsTab('${tab}')"]`);
    if (activeTab) {
        activeTab.classList.remove('text-gray-700');
        activeTab.classList.add('bg-gray-100', 'text-gray-900');
    }
}

// User menu functions
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.classList.toggle('hidden');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('-translate-x-full');
}

function showProfile() {
    showToast('Profile management coming soon', 'info');
    toggleUserMenu();
}

// Toast notification functions
function showToast(message, type = 'info', description = '') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastDescription = document.getElementById('toastDescription');
    const toastIcon = document.getElementById('toastIcon');
    
    // Set message
    toastMessage.textContent = message;
    toastDescription.textContent = description;
    
    // Set icon based on type
    const icons = {
        success: '<i class="fas fa-check-circle text-green-500 text-xl"></i>',
        error: '<i class="fas fa-exclamation-circle text-red-500 text-xl"></i>',
        info: '<i class="fas fa-info-circle text-blue-500 text-xl"></i>',
        warning: '<i class="fas fa-exclamation-triangle text-yellow-500 text-xl"></i>'
    };
    
    toastIcon.innerHTML = icons[type] || icons.info;
    
    // Show toast
    toast.classList.remove('hidden');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideToast();
    }, 5000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('hidden');
}

// Logout function
async function logout() {
    try {
        if (authToken) {
            await fetch('/api/admin/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    // Clear local storage
    localStorage.removeItem('adminAuthToken');
    localStorage.removeItem('adminUserData');
    
    // Redirect to login
    window.location.href = '/index.html';
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return formatDate(dateString);
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.section) {
        showSection(event.state.section);
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + K for quick search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]');
        if (searchInput) searchInput.focus();
    }
    
    // Escape to close modals/menus
    if (event.key === 'Escape') {
        hideToast();
        closeUserModal();
        const userMenu = document.getElementById('userMenu');
        if (!userMenu.classList.contains('hidden')) {
            toggleUserMenu();
        }
    }
});