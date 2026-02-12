package server

import (
	"github.com/volantvm/flint/pkg/config"
	"github.com/volantvm/flint/pkg/logger"
)

// migrateToMultiServer migrates from single-server configuration to multi-server registry
func (s *Server) migrateToMultiServer() {
	// Check if we need to migrate (no servers in registry yet)
	if s.serverRegistry.GetServerCount() > 0 {
		logger.Info("Server registry already initialized", map[string]interface{}{
			"server_count": s.serverRegistry.GetServerCount(),
		})
		return
	}

	logger.Info("Migrating from single-server config to multi-server registry")

	// Load the existing configuration to get libvirt settings
	cfg, err := config.LoadConfig("")
	if err != nil {
		logger.Warn("Failed to load config for migration, skipping migration", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	// Migrate the default libvirt configuration to a server entry
	if err := s.serverRegistry.MigrateFromConfig(
		cfg.Libvirt.URI,
		cfg.Libvirt.ISOPool,
		cfg.Libvirt.TemplatePool,
		cfg.Libvirt.ImagePoolPath,
	); err != nil {
		logger.Error("Failed to migrate config to server registry", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	logger.Info("Successfully migrated to multi-server configuration", map[string]interface{}{
		"server_count": s.serverRegistry.GetServerCount(),
	})

	// Now get the default server and try to establish connection
	defaultServer, err := s.serverRegistry.GetDefaultServer()
	if err != nil {
		logger.Warn("Failed to get default server after migration", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	// Try to connect to the migrated server
	_, connErr := s.connectionPool.GetConnection(defaultServer)
	if connErr != nil {
		logger.Warn("Failed to connect to migrated server", map[string]interface{}{
			"server_id": defaultServer.ID,
			"error":     connErr.Error(),
		})
		s.serverRegistry.UpdateServerStatus(defaultServer.ID, false, connErr.Error())
	} else {
		logger.Info("Successfully connected to migrated server", map[string]interface{}{
			"server_id":   defaultServer.ID,
			"server_name": defaultServer.Name,
		})
		s.serverRegistry.UpdateServerStatus(defaultServer.ID, true, "")
	}
}
