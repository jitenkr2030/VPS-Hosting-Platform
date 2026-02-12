// Global state
let currentUser = null;
let authToken = null;
let selectedPlan = 'professional';
let servers = [];

// Plans configuration
const plans = {
    starter: {
        name: 'Starter',
        price: 499,
        cpu: 1,
        ram: 2,
        storage: 40,
        bandwidth: 2
    },
    professional: {
        name: 'Professional',
        price: 999,
        cpu: 2,
        ram: 4,
        storage: 80,
        bandwidth: 4
    },
    business: {
        name: 'Business',
        price: 1999,
        cpu: 4,
        ram: 8,
        storage: 160,
        bandwidth: 8
    }
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    initializeEventListeners();
    loadDashboardData();
});

// Check authentication status
function checkAuthStatus() {
    authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = '/index.html';
        return;
    }
    
    // Get user info from token or API
    const userData = localStorage.getItem('userData');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateUserInterface();
    } else {
        fetchUserData();
    }
}

// Fetch user data from API
async function fetchUserData() {
    try {
        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            localStorage.setItem('userData', JSON.stringify(currentUser));
            updateUserInterface();
        } else {
            logout();
        }
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        logout();
    }
}

// Update user interface with user data
function updateUserInterface() {
    if (currentUser) {
        document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('userEmail').textContent = currentUser.email;
        document.getElementById('userInitials').textContent = 
            currentUser.firstName[0].toUpperCase() + currentUser.lastName[0].toUpperCase();
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Add any global event listeners here
}

// Load dashboard data
async function loadDashboardData() {
    await Promise.all([
        loadServers(),
        loadStats(),
        initializeCharts()
    ]);
}

// Load servers from API
async function loadServers() {
    try {
        const response = await fetch('/api/servers', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            servers = data.servers;
            updateServersDisplay();
        } else {
            // Use mock data for demo
            servers = generateMockServers();
            updateServersDisplay();
        }
    } catch (error) {
        console.error('Failed to load servers:', error);
        servers = generateMockServers();
        updateServersDisplay();
    }
}

// Generate mock servers for demo
function generateMockServers() {
    return [
        {
            id: 'srv-001',
            name: 'web-server-01',
            status: 'running',
            plan: 'professional',
            location: 'Mumbai',
            ip: '192.168.1.100',
            os: 'Ubuntu 22.04',
            createdAt: '2024-11-01T10:00:00Z',
            cpu: 2,
            ram: 4,
            storage: 80,
            cost: 999
        },
        {
            id: 'srv-002',
            name: 'database-server',
            status: 'running',
            plan: 'business',
            location: 'Bangalore',
            ip: '192.168.1.101',
            os: 'Ubuntu 22.04',
            createdAt: '2024-11-05T14:30:00Z',
            cpu: 4,
            ram: 8,
            storage: 160,
            cost: 1999
        },
        {
            id: 'srv-003',
            name: 'test-server',
            status: 'stopped',
            plan: 'starter',
            location: 'Delhi',
            ip: '192.168.1.102',
            os: 'Debian 11',
            createdAt: '2024-11-10T09:15:00Z',
            cpu: 1,
            ram: 2,
            storage: 40,
            cost: 499
        }
    ];
}

// Update servers display
function updateServersDisplay() {
    updateDashboardStats();
    updateRecentServersTable();
    updateServersGrid();
}

// Update dashboard statistics
function updateDashboardStats() {
    const activeServers = servers.filter(s => s.status === 'running').length;
    const totalCost = servers.reduce((sum, s) => sum + s.cost, 0);
    const totalCpu = servers.reduce((sum, s) => sum + s.cpu, 0);
    const totalRam = servers.reduce((sum, s) => sum + s.ram, 0);

    document.getElementById('activeServersCount').textContent = activeServers;
    document.getElementById('monthlyCost').textContent = `₹${totalCost.toLocaleString('en-IN')}`;
    document.getElementById('totalCores').textContent = totalCpu;
    document.getElementById('totalRam').textContent = `${totalRam} GB`;
}

// Update recent servers table
function updateRecentServersTable() {
    const tbody = document.getElementById('recentServersTable');
    const recentServers = servers.slice(0, 3);
    
    tbody.innerHTML = recentServers.map(server => `
        <tr class="border-t">
            <td class="py-3">
                <div>
                    <p class="font-medium">${server.name}</p>
                    <p class="text-sm text-gray-600">${server.ip}</p>
                </div>
            </td>
            <td class="py-3">
                <span class="px-2 py-1 rounded-full text-xs ${getStatusClass(server.status)}">
                    ${server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                </span>
            </td>
            <td class="py-3">${plans[server.plan].name}</td>
            <td class="py-3">${server.location}</td>
            <td class="py-3">₹${server.cost}</td>
            <td class="py-3">
                <button onclick="manageServer('${server.id}')" class="text-indigo-600 hover:text-indigo-700 text-sm">
                    Manage
                </button>
            </td>
        </tr>
    `).join('');
}

// Update servers grid
function updateServersGrid() {
    const grid = document.getElementById('serversGrid');
    
    grid.innerHTML = servers.map(server => `
        <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900">${server.name}</h3>
                <span class="px-2 py-1 rounded-full text-xs ${getStatusClass(server.status)}">
                    ${server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                </span>
            </div>
            <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">IP Address</span>
                    <span class="font-medium">${server.ip}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Plan</span>
                    <span class="font-medium">${plans[server.plan].name}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Location</span>
                    <span class="font-medium">${server.location}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">OS</span>
                    <span class="font-medium">${server.os}</span>
                </div>
            </div>
            <div class="flex space-x-2">
                ${server.status === 'running' ? 
                    `<button onclick="stopServer('${server.id}')" class="flex-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition text-sm">
                        <i class="fas fa-stop mr-1"></i>Stop
                    </button>` :
                    `<button onclick="startServer('${server.id}')" class="flex-1 bg-green-100 text-green-700 py-2 rounded-lg hover:bg-green-200 transition text-sm">
                        <i class="fas fa-play mr-1"></i>Start
                    </button>`
                }
                <button onclick="restartServer('${server.id}')" class="flex-1 bg-yellow-100 text-yellow-700 py-2 rounded-lg hover:bg-yellow-200 transition text-sm">
                    <i class="fas fa-redo mr-1"></i>Restart
                </button>
                <button onclick="openConsole('${server.id}')" class="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition text-sm">
                    <i class="fas fa-terminal mr-1"></i>Console
                </button>
            </div>
        </div>
    `).join('');
}

// Get status CSS class
function getStatusClass(status) {
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

// Load statistics
async function loadStats() {
    // This would normally fetch from API
    // For demo, we'll use the servers data
}

// Initialize charts
function initializeCharts() {
    initializeResourceChart();
    initializeCostChart();
}

// Initialize resource usage chart
function initializeResourceChart() {
    const ctx = document.getElementById('resourceChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['CPU Used', 'CPU Available', 'RAM Used', 'RAM Available', 'Storage Used', 'Storage Available'],
            datasets: [{
                data: [45, 55, 60, 40, 35, 65],
                backgroundColor: [
                    '#3B82F6',
                    '#E5E7EB',
                    '#10B981',
                    '#E5E7EB',
                    '#F59E0B',
                    '#E5E7EB'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Initialize cost breakdown chart
function initializeCostChart() {
    const ctx = document.getElementById('costChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Starter', 'Professional', 'Business'],
            datasets: [{
                label: 'Monthly Cost (₹)',
                data: [499, 999, 1999],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B']
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
        dashboard: 'Dashboard',
        servers: 'My Servers',
        create: 'Create Server',
        billing: 'Billing & Invoices',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
    
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
}

// Server management functions
async function startServer(serverId) {
    try {
        showToast('Starting server...', 'info');
        
        // API call would go here
        // const response = await fetch(`/api/servers/${serverId}/start`, {
        //     method: 'POST',
        //     headers: { 'Authorization': `Bearer ${authToken}` }
        // });
        
        // Simulate API call
        setTimeout(() => {
            const server = servers.find(s => s.id === serverId);
            if (server) {
                server.status = 'running';
                updateServersDisplay();
                showToast('Server started successfully', 'success');
            }
        }, 2000);
    } catch (error) {
        showToast('Failed to start server', 'error');
    }
}

async function stopServer(serverId) {
    try {
        showToast('Stopping server...', 'info');
        
        // API call would go here
        setTimeout(() => {
            const server = servers.find(s => s.id === serverId);
            if (server) {
                server.status = 'stopped';
                updateServersDisplay();
                showToast('Server stopped successfully', 'success');
            }
        }, 2000);
    } catch (error) {
        showToast('Failed to stop server', 'error');
    }
}

async function restartServer(serverId) {
    try {
        showToast('Restarting server...', 'info');
        
        // API call would go here
        setTimeout(() => {
            showToast('Server restarted successfully', 'success');
        }, 2000);
    } catch (error) {
        showToast('Failed to restart server', 'error');
    }
}

function openConsole(serverId) {
    // This would open a console window/iframe
    showToast('Console feature coming soon', 'info');
}

function manageServer(serverId) {
    showSection('servers');
    // Scroll to server card or highlight it
}

// Server creation functions
function selectPlan(plan) {
    selectedPlan = plan;
    
    // Update UI
    document.querySelectorAll('.plan-card').forEach(card => {
        card.classList.remove('border-indigo-500', 'bg-indigo-50');
        card.classList.add('border-gray-200');
    });
    
    const selectedCard = document.querySelector(`.plan-card[onclick="selectPlan('${plan}')"]`);
    if (selectedCard) {
        selectedCard.classList.remove('border-gray-200');
        selectedCard.classList.add('border-indigo-500', 'bg-indigo-50');
    }
    
    // Update order summary
    updateOrderSummary();
}

function updateOrderSummary() {
    const plan = plans[selectedPlan];
    document.getElementById('summaryPlan').textContent = plan.name;
    document.getElementById('summaryCpu').textContent = `${plan.cpu} vCPU`;
    document.getElementById('summaryRam').textContent = `${plan.ram} GB`;
    document.getElementById('summaryStorage').textContent = `${plan.storage} GB SSD`;
    document.getElementById('summaryCost').textContent = `₹${plan.price}`;
    
    const locationSelect = document.querySelector('#create-section select');
    if (locationSelect) {
        document.getElementById('summaryLocation').textContent = 
            locationSelect.options[locationSelect.selectedIndex].text;
    }
}

async function createServer() {
    const serverName = document.getElementById('serverName').value;
    
    if (!serverName) {
        showToast('Please enter a server name', 'error');
        return;
    }
    
    try {
        showToast('Creating server...', 'info');
        
        // API call would go here
        // const response = await fetch('/api/servers', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${authToken}`
        //     },
        //     body: JSON.stringify({
        //         name: serverName,
        //         plan: selectedPlan,
        //         // ... other server config
        //     })
        // });
        
        // Simulate server creation
        setTimeout(() => {
            const newServer = {
                id: `srv-${Date.now()}`,
                name: serverName,
                status: 'pending',
                plan: selectedPlan,
                location: 'Mumbai',
                ip: 'Assigning...',
                os: 'Ubuntu 22.04',
                createdAt: new Date().toISOString(),
                cpu: plans[selectedPlan].cpu,
                ram: plans[selectedPlan].ram,
                storage: plans[selectedPlan].storage,
                cost: plans[selectedPlan].price
            };
            
            servers.push(newServer);
            updateServersDisplay();
            
            showToast('Server created successfully!', 'success');
            showSection('servers');
            
            // Clear form
            document.getElementById('serverName').value = '';
        }, 3000);
    } catch (error) {
        showToast('Failed to create server', 'error');
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
    showSection('settings');
    showSettingsTab('profile');
    toggleUserMenu();
}

function showSecurity() {
    showSection('settings');
    showSettingsTab('security');
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
            await fetch('/api/auth/logout', {
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
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
        // Focus search input
        const searchInput = document.querySelector('input[placeholder*="Search"]');
        if (searchInput) searchInput.focus();
    }
    
    // Escape to close modals/menus
    if (event.key === 'Escape') {
        hideToast();
        const userMenu = document.getElementById('userMenu');
        if (!userMenu.classList.contains('hidden')) {
            toggleUserMenu();
        }
    }
});