package connectionpool

import (
	"fmt"
	"sync"
	"time"

	"github.com/volantvm/flint/pkg/core"
	"github.com/volantvm/flint/pkg/libvirtclient"
	"github.com/volantvm/flint/pkg/logger"
)

// ConnectionInfo holds connection metadata
type ConnectionInfo struct {
	ServerID    string
	Client      libvirtclient.ClientInterface
	LastUsed    time.Time
	IsConnected bool
	LastError   string
	Config      *core.ServerConfig
}

// Pool manages multiple libvirt connections
type Pool struct {
	connections map[string]*ConnectionInfo
	mu          sync.RWMutex
	maxIdle     time.Duration
	healthCheck time.Duration
	stopChan    chan struct{}
}

// NewPool creates a new connection pool
func NewPool(maxIdleDuration, healthCheckInterval time.Duration) *Pool {
	if maxIdleDuration == 0 {
		maxIdleDuration = 30 * time.Minute
	}
	if healthCheckInterval == 0 {
		healthCheckInterval = 5 * time.Minute
	}

	pool := &Pool{
		connections: make(map[string]*ConnectionInfo),
		maxIdle:     maxIdleDuration,
		healthCheck: healthCheckInterval,
		stopChan:    make(chan struct{}),
	}

	// Start background cleanup and health check
	go pool.maintenanceLoop()

	return pool
}

// GetConnection retrieves or creates a connection for a server
func (p *Pool) GetConnection(config *core.ServerConfig) (libvirtclient.ClientInterface, error) {
	p.mu.RLock()
	connInfo, exists := p.connections[config.ID]
	p.mu.RUnlock()

	if exists && connInfo.IsConnected {
		// Update last used time
		p.mu.Lock()
		connInfo.LastUsed = time.Now()
		p.mu.Unlock()
		return connInfo.Client, nil
	}

	// Need to create a new connection
	return p.createConnection(config)
}

// createConnection creates a new libvirt connection
func (p *Pool) createConnection(config *core.ServerConfig) (libvirtclient.ClientInterface, error) {
	p.mu.Lock()
	defer p.mu.Unlock()

	// Double-check to avoid race condition
	if connInfo, exists := p.connections[config.ID]; exists && connInfo.IsConnected {
		connInfo.LastUsed = time.Now()
		return connInfo.Client, nil
	}

	logger.Info("Creating new connection to server", map[string]interface{}{
		"server_id":   config.ID,
		"server_name": config.Name,
		"uri":         config.URI,
	})

	// Create new client
	client, err := libvirtclient.NewClient(config.URI, config.ISOPool, config.TemplatePool)
	if err != nil {
		logger.Error("Failed to create libvirt connection", map[string]interface{}{
			"server_id":   config.ID,
			"server_name": config.Name,
			"uri":         config.URI,
			"error":       err.Error(),
		})

		// Store failed connection info
		p.connections[config.ID] = &ConnectionInfo{
			ServerID:    config.ID,
			Client:      nil,
			LastUsed:    time.Now(),
			IsConnected: false,
			LastError:   err.Error(),
			Config:      config,
		}

		return nil, fmt.Errorf("failed to connect to server %s: %w", config.Name, err)
	}

	// Store connection info
	connInfo := &ConnectionInfo{
		ServerID:    config.ID,
		Client:      client,
		LastUsed:    time.Now(),
		IsConnected: true,
		LastError:   "",
		Config:      config,
	}
	p.connections[config.ID] = connInfo

	logger.Info("Successfully connected to server", map[string]interface{}{
		"server_id":   config.ID,
		"server_name": config.Name,
	})

	return client, nil
}

// CloseConnection closes a specific connection
func (p *Pool) CloseConnection(serverID string) error {
	p.mu.Lock()
	defer p.mu.Unlock()

	connInfo, exists := p.connections[serverID]
	if !exists {
		return fmt.Errorf("connection not found for server: %s", serverID)
	}

	if connInfo.Client != nil && connInfo.IsConnected {
		if err := connInfo.Client.Close(); err != nil {
			logger.Error("Error closing connection", map[string]interface{}{
				"server_id": serverID,
				"error":     err.Error(),
			})
		}
	}

	delete(p.connections, serverID)

	logger.Info("Closed connection to server", map[string]interface{}{
		"server_id": serverID,
	})

	return nil
}

// CloseAll closes all connections in the pool
func (p *Pool) CloseAll() {
	p.mu.Lock()
	defer p.mu.Unlock()

	// Signal maintenance loop to stop
	close(p.stopChan)

	logger.Info("Closing all connections in pool", map[string]interface{}{
		"connection_count": len(p.connections),
	})

	for serverID, connInfo := range p.connections {
		if connInfo.Client != nil && connInfo.IsConnected {
			if err := connInfo.Client.Close(); err != nil {
				logger.Error("Error closing connection during shutdown", map[string]interface{}{
					"server_id": serverID,
					"error":     err.Error(),
				})
			}
		}
	}

	p.connections = make(map[string]*ConnectionInfo)

	logger.Info("All connections closed")
}

// GetConnectionStatus returns the status of all connections
func (p *Pool) GetConnectionStatus() map[string]*ConnectionInfo {
	p.mu.RLock()
	defer p.mu.RUnlock()

	status := make(map[string]*ConnectionInfo, len(p.connections))
	for id, info := range p.connections {
		// Create a copy to avoid race conditions
		infoCopy := *info
		status[id] = &infoCopy
	}

	return status
}

// maintenanceLoop performs periodic cleanup and health checks
func (p *Pool) maintenanceLoop() {
	cleanupTicker := time.NewTicker(1 * time.Minute)
	healthTicker := time.NewTicker(p.healthCheck)
	defer cleanupTicker.Stop()
	defer healthTicker.Stop()

	for {
		select {
		case <-p.stopChan:
			logger.Info("Stopping connection pool maintenance loop")
			return

		case <-cleanupTicker.C:
			p.cleanupIdleConnections()

		case <-healthTicker.C:
			p.performHealthChecks()
		}
	}
}

// cleanupIdleConnections removes connections that haven't been used recently
func (p *Pool) cleanupIdleConnections() {
	p.mu.Lock()
	defer p.mu.Unlock()

	now := time.Now()
	toClose := []string{}

	for serverID, connInfo := range p.connections {
		if connInfo.IsConnected && now.Sub(connInfo.LastUsed) > p.maxIdle {
			toClose = append(toClose, serverID)
		}
	}

	for _, serverID := range toClose {
		connInfo := p.connections[serverID]
		if connInfo.Client != nil {
			if err := connInfo.Client.Close(); err != nil {
				logger.Error("Error closing idle connection", map[string]interface{}{
					"server_id": serverID,
					"error":     err.Error(),
				})
			}
		}
		delete(p.connections, serverID)

		logger.Info("Closed idle connection", map[string]interface{}{
			"server_id": serverID,
			"idle_time": now.Sub(connInfo.LastUsed).String(),
		})
	}
}

// performHealthChecks verifies that connections are still alive
func (p *Pool) performHealthChecks() {
	p.mu.RLock()
	connectionsCopy := make([]*ConnectionInfo, 0, len(p.connections))
	for _, connInfo := range p.connections {
		if connInfo.IsConnected {
			// Create a copy to check outside the lock
			infoCopy := *connInfo
			connectionsCopy = append(connectionsCopy, &infoCopy)
		}
	}
	p.mu.RUnlock()

	// Check connections outside of the lock
	for _, connInfo := range connectionsCopy {
		if connInfo.Client == nil {
			continue
		}

		// Try to get host status as a health check
		_, err := connInfo.Client.GetHostStatus()

		p.mu.Lock()
		// Re-fetch the connection info in case it changed
		currentInfo, exists := p.connections[connInfo.ServerID]
		if !exists {
			p.mu.Unlock()
			continue
		}

		if err != nil {
			logger.Warn("Health check failed for connection", map[string]interface{}{
				"server_id":   connInfo.ServerID,
				"server_name": connInfo.Config.Name,
				"error":       err.Error(),
			})
			currentInfo.IsConnected = false
			currentInfo.LastError = err.Error()

			// Close the failed connection
			if currentInfo.Client != nil {
				currentInfo.Client.Close()
			}
		} else {
			currentInfo.IsConnected = true
			currentInfo.LastError = ""
		}
		p.mu.Unlock()
	}
}

// RefreshConnection forces a reconnection for a server
func (p *Pool) RefreshConnection(serverID string, config *core.ServerConfig) error {
	// Close existing connection
	p.CloseConnection(serverID)

	// Create new connection
	_, err := p.createConnection(config)
	return err
}

// GetConnectionInfo retrieves connection info for a specific server
func (p *Pool) GetConnectionInfo(serverID string) (*ConnectionInfo, bool) {
	p.mu.RLock()
	defer p.mu.RUnlock()

	info, exists := p.connections[serverID]
	if !exists {
		return nil, false
	}

	// Return a copy
	infoCopy := *info
	return &infoCopy, true
}
