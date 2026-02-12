package server

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/volantvm/flint/pkg/core"
	"github.com/volantvm/flint/pkg/logger"
)

// handleListServers returns all registered servers with their status
func (s *Server) handleListServers() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		servers := s.serverRegistry.ListServers()

		// Build response with status information
		serversWithStatus := make([]core.ServerWithStatus, 0, len(servers))

		for _, server := range servers {
			status := s.getServerStatus(server.ID)
			serversWithStatus = append(serversWithStatus, core.ServerWithStatus{
				ServerConfig: *server,
				Status:       status,
			})
		}

		response := core.ServerListResponse{
			Servers: serversWithStatus,
			Total:   len(serversWithStatus),
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}}

// handleGetServer returns a specific server by ID
func (s *Server) handleGetServer() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		serverID := chi.URLParam(r, "serverID")

		server, err := s.serverRegistry.GetServer(serverID)
		if err != nil {
			http.Error(w, `{"error": "Server not found"}`, http.StatusNotFound)
			return
		}

		status := s.getServerStatus(serverID)

		response := core.ServerWithStatus{
			ServerConfig: *server,
			Status:       status,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

// handleCreateServer adds a new server to the registry
func (s *Server) handleCreateServer() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req core.CreateServerRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}

		// Validate required fields
		if req.Name == "" {
			http.Error(w, `{"error": "Server name is required"}`, http.StatusBadRequest)
			return
		}
		if req.URI == "" {
			http.Error(w, `{"error": "Server URI is required"}`, http.StatusBadRequest)
			return
		}

		// Add server to registry
		server, err := s.serverRegistry.AddServer(req)
		if err != nil {
			logger.Error("Failed to add server", map[string]interface{}{
				"error": err.Error(),
			})
			http.Error(w, `{"error": "Failed to add server"}`, http.StatusInternalServerError)
			return
		}

		// Try to establish connection
		_, connErr := s.connectionPool.GetConnection(server)
		if connErr != nil {
			logger.Warn("Failed to connect to new server", map[string]interface{}{
				"server_id": server.ID,
				"error":     connErr.Error(),
			})
			// Update status in registry
			s.serverRegistry.UpdateServerStatus(server.ID, false, connErr.Error())
		} else {
			s.serverRegistry.UpdateServerStatus(server.ID, true, "")
		}

		// Get updated server with status
		status := s.getServerStatus(server.ID)
		response := core.ServerWithStatus{
			ServerConfig: *server,
			Status:       status,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)

		logger.Info("Server added", map[string]interface{}{
			"server_id":   server.ID,
			"server_name": server.Name,
		})
	}
}

// handleUpdateServer updates an existing server configuration
func (s *Server) handleUpdateServer() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		serverID := chi.URLParam(r, "serverID")

		var req core.UpdateServerRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}

		// Update server in registry
		server, err := s.serverRegistry.UpdateServer(serverID, req)
		if err != nil {
			logger.Error("Failed to update server", map[string]interface{}{
				"server_id": serverID,
				"error":     err.Error(),
			})
			http.Error(w, `{"error": "Failed to update server"}`, http.StatusInternalServerError)
			return
		}

		// If URI changed, refresh connection
		if req.URI != nil {
			if err := s.connectionPool.RefreshConnection(serverID, server); err != nil {
				logger.Warn("Failed to refresh connection after update", map[string]interface{}{
					"server_id": serverID,
					"error":     err.Error(),
				})
			}
		}

		// Get updated status
		status := s.getServerStatus(serverID)
		response := core.ServerWithStatus{
			ServerConfig: *server,
			Status:       status,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)

		logger.Info("Server updated", map[string]interface{}{
			"server_id":   serverID,
			"server_name": server.Name,
		})
	}
}

// handleDeleteServer removes a server from the registry
func (s *Server) handleDeleteServer() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		serverID := chi.URLParam(r, "serverID")

		// Close connection if exists
		s.connectionPool.CloseConnection(serverID)

		// Delete from registry
		if err := s.serverRegistry.DeleteServer(serverID); err != nil {
			logger.Error("Failed to delete server", map[string]interface{}{
				"server_id": serverID,
				"error":     err.Error(),
			})
			http.Error(w, `{"error": "Failed to delete server"}`, http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNoContent)

		logger.Info("Server deleted", map[string]interface{}{
			"server_id": serverID,
		})
	}
}

// handleSetDefaultServer sets a server as the default
func (s *Server) handleSetDefaultServer() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		serverID := chi.URLParam(r, "serverID")

		if err := s.serverRegistry.SetDefault(serverID); err != nil {
			logger.Error("Failed to set default server", map[string]interface{}{
				"server_id": serverID,
				"error":     err.Error(),
			})
			http.Error(w, `{"error": "Failed to set default server"}`, http.StatusInternalServerError)
			return
		}

		server, _ := s.serverRegistry.GetServer(serverID)
		status := s.getServerStatus(serverID)

		response := core.ServerWithStatus{
			ServerConfig: *server,
			Status:       status,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)

		logger.Info("Default server set", map[string]interface{}{
			"server_id": serverID,
		})
	}
}

// handleValidateServer validates a server connection without saving
func (s *Server) handleValidateServer() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req core.ValidateServerRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}

		if req.URI == "" {
			http.Error(w, `{"error": "Server URI is required"}`, http.StatusBadRequest)
			return
		}

		// Set default timeout if not provided
		if req.Timeout == 0 {
			req.Timeout = 30
		}

		// Create temporary server config
		tempConfig := &core.ServerConfig{
			ID:         "temp-validation",
			Name:       "Validation Test",
			URI:        req.URI,
			SSHKeyPath: req.SSHKeyPath,
			SSHUser:    req.SSHUser,
			Timeout:    req.Timeout,
		}

		// Try to connect
		client, err := s.connectionPool.GetConnection(tempConfig)

		response := core.ValidateServerResponse{
			IsValid: err == nil,
		}

		if err != nil {
			response.Message = fmt.Sprintf("Connection failed: %s", err.Error())
		} else {
			response.Message = "Connection successful"

			// Get host information
			if hostStatus, err := client.GetHostStatus(); err == nil {
				response.Hostname = hostStatus.Hostname
				response.HypervisorVersion = hostStatus.HypervisorVersion
			}

			// Close temporary connection
			s.connectionPool.CloseConnection("temp-validation")
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

// handleRefreshServerConnection forces a reconnection to a server
func (s *Server) handleRefreshServerConnection() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		serverID := chi.URLParam(r, "serverID")

		server, err := s.serverRegistry.GetServer(serverID)
		if err != nil {
			http.Error(w, `{"error": "Server not found"}`, http.StatusNotFound)
			return
		}

		// Refresh connection
		if err := s.connectionPool.RefreshConnection(serverID, server); err != nil {
			logger.Error("Failed to refresh connection", map[string]interface{}{
				"server_id": serverID,
				"error":     err.Error(),
			})
			s.serverRegistry.UpdateServerStatus(serverID, false, err.Error())

			http.Error(w, fmt.Sprintf(`{"error": "Failed to refresh connection: %s"}`, err.Error()), http.StatusServiceUnavailable)
			return
		}

		s.serverRegistry.UpdateServerStatus(serverID, true, "")

		status := s.getServerStatus(serverID)
		response := core.ServerWithStatus{
			ServerConfig: *server,
			Status:       status,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)

		logger.Info("Server connection refreshed", map[string]interface{}{
			"server_id": serverID,
		})
	}
}

// getServerStatus retrieves the current status of a server
func (s *Server) getServerStatus(serverID string) core.ServerStatus {
	server, err := s.serverRegistry.GetServer(serverID)
	if err != nil {
		return core.ServerStatus{
			ServerID:    serverID,
			IsConnected: false,
			LastError:   "Server not found in registry",
		}
	}

	status := core.ServerStatus{
		ServerID:    serverID,
		ServerName:  server.Name,
		IsConnected: server.IsActive,
		LastChecked: server.LastChecked,
	}

	// Try to get connection info
	connInfo, exists := s.connectionPool.GetConnectionInfo(serverID)
	if exists {
		status.IsConnected = connInfo.IsConnected
		status.LastError = connInfo.LastError

		if connInfo.IsConnected && connInfo.Client != nil {
			// Get host status
			if hostStatus, err := connInfo.Client.GetHostStatus(); err == nil {
				status.Hostname = hostStatus.Hostname
				status.HypervisorVersion = hostStatus.HypervisorVersion
				status.TotalVMs = hostStatus.TotalVMs
				status.RunningVMs = hostStatus.RunningVMs
				status.PausedVMs = hostStatus.PausedVMs
				status.ShutOffVMs = hostStatus.ShutOffVMs
				status.HealthChecks = hostStatus.HealthChecks
			}

			// Get host resources
			if resources, err := connInfo.Client.GetHostResources(); err == nil {
				status.Resources = resources
			}
		}
	}

	return status
}
