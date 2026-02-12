package core

import "time"

// ServerConfig represents a single libvirt server configuration
type ServerConfig struct {
	ID              string    `json:"id"`               // Unique identifier for the server
	Name            string    `json:"name"`             // User-friendly name
	Description     string    `json:"description"`      // Server description
	URI             string    `json:"uri"`              // Libvirt connection URI (e.g., "qemu:///system", "qemu+ssh://user@host/system")
	ISOPool         string    `json:"iso_pool"`         // ISO storage pool name
	TemplatePool    string    `json:"template_pool"`    // Template storage pool name
	ImagePoolPath   string    `json:"image_pool_path"`  // Path to managed image pool
	IsDefault       bool      `json:"is_default"`       // Whether this is the default server
	IsActive        bool      `json:"is_active"`        // Whether the server is currently active/reachable
	LastChecked     time.Time `json:"last_checked"`     // Last time server was checked
	Tags            []string  `json:"tags"`             // User-defined tags for organization
	SSHKeyPath      string    `json:"ssh_key_path"`     // Path to SSH key for remote connections
	SSHUser         string    `json:"ssh_user"`         // SSH username for remote connections
	ConnectionRetry int       `json:"connection_retry"` // Number of retry attempts
	Timeout         int       `json:"timeout"`          // Connection timeout in seconds
	CreatedAt       time.Time `json:"created_at"`       // Server registration time
	UpdatedAt       time.Time `json:"updated_at"`       // Last update time
}

// ServerStatus represents the runtime status of a server
type ServerStatus struct {
	ServerID          string        `json:"server_id"`
	ServerName        string        `json:"server_name"`
	IsConnected       bool          `json:"is_connected"`
	LastError         string        `json:"last_error,omitempty"`
	Hostname          string        `json:"hostname"`
	HypervisorVersion string        `json:"hypervisor_version"`
	TotalVMs          int           `json:"total_vms"`
	RunningVMs        int           `json:"running_vms"`
	PausedVMs         int           `json:"paused_vms"`
	ShutOffVMs        int           `json:"shutoff_vms"`
	HealthChecks      []HealthCheck `json:"health_checks"`
	Resources         HostResources `json:"resources"`
	LastChecked       time.Time     `json:"last_checked"`
}

// ServerListResponse represents a list of servers with their status
type ServerListResponse struct {
	Servers []ServerWithStatus `json:"servers"`
	Total   int                `json:"total"`
}

// ServerWithStatus combines server config with its current status
type ServerWithStatus struct {
	ServerConfig
	Status ServerStatus `json:"status"`
}

// CreateServerRequest represents a request to add a new server
type CreateServerRequest struct {
	Name            string   `json:"name" binding:"required"`
	Description     string   `json:"description"`
	URI             string   `json:"uri" binding:"required"`
	ISOPool         string   `json:"iso_pool"`
	TemplatePool    string   `json:"template_pool"`
	ImagePoolPath   string   `json:"image_pool_path"`
	IsDefault       bool     `json:"is_default"`
	Tags            []string `json:"tags"`
	SSHKeyPath      string   `json:"ssh_key_path"`
	SSHUser         string   `json:"ssh_user"`
	ConnectionRetry int      `json:"connection_retry"`
	Timeout         int      `json:"timeout"`
}

// UpdateServerRequest represents a request to update a server
type UpdateServerRequest struct {
	Name            *string   `json:"name"`
	Description     *string   `json:"description"`
	URI             *string   `json:"uri"`
	ISOPool         *string   `json:"iso_pool"`
	TemplatePool    *string   `json:"template_pool"`
	ImagePoolPath   *string   `json:"image_pool_path"`
	IsDefault       *bool     `json:"is_default"`
	Tags            *[]string `json:"tags"`
	SSHKeyPath      *string   `json:"ssh_key_path"`
	SSHUser         *string   `json:"ssh_user"`
	ConnectionRetry *int      `json:"connection_retry"`
	Timeout         *int      `json:"timeout"`
}

// ValidateServerRequest validates server connection without saving
type ValidateServerRequest struct {
	URI        string `json:"uri" binding:"required"`
	SSHKeyPath string `json:"ssh_key_path"`
	SSHUser    string `json:"ssh_user"`
	Timeout    int    `json:"timeout"`
}

// ValidateServerResponse returns validation result
type ValidateServerResponse struct {
	IsValid           bool   `json:"is_valid"`
	Message           string `json:"message"`
	Hostname          string `json:"hostname,omitempty"`
	HypervisorVersion string `json:"hypervisor_version,omitempty"`
}
