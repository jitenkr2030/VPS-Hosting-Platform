package libvirtclient

import (
	"encoding/xml"
	"fmt"
	"github.com/volantvm/flint/pkg/core"
)

// DomainXMLForVNC represents the structure for parsing libvirt domain XML to extract VNC details
type DomainXMLForVNC struct {
	Devices struct {
		Graphics struct {
			Type   string `xml:"type,attr"`
			Port   string `xml:"port,attr"`
			Listen string `xml:"listen,attr"`
		} `xml:"graphics"`
	} `xml:"devices"`
}

// GetVMVNCInfo retrieves VNC connection information for a VM
func (c *Client) GetVMVNCInfo(uuidStr string) (core.VNCInfo, error) {
	var vncInfo core.VNCInfo

	dom, err := c.conn.LookupDomainByUUIDString(uuidStr)
	if err != nil {
		return vncInfo, fmt.Errorf("failed to lookup domain: %w", err)
	}
	defer dom.Free()

	// Check if VM is running
	state, _, err := dom.GetState()
	if err != nil {
		return vncInfo, fmt.Errorf("failed to get domain state: %w", err)
	}

	if state != 1 { // 1 = VIR_DOMAIN_RUNNING
		return vncInfo, fmt.Errorf("VM is not running (current state: %d)", state)
	}

	// Get XML description
	xmlDesc, err := dom.GetXMLDesc(0)
	if err != nil {
		return vncInfo, fmt.Errorf("failed to get domain XML: %w", err)
	}

	// Parse XML to extract VNC info
	var domainXML DomainXMLForVNC
	if err := xml.Unmarshal([]byte(xmlDesc), &domainXML); err != nil {
		return vncInfo, fmt.Errorf("failed to parse domain XML: %w", err)
	}

	// Validate VNC is configured
	if domainXML.Devices.Graphics.Type != "vnc" {
		return vncInfo, fmt.Errorf("VM does not have VNC graphics configured (type: %s)", domainXML.Devices.Graphics.Type)
	}

	// Extract port
	port := domainXML.Devices.Graphics.Port
	if port == "" || port == "-1" {
		return vncInfo, fmt.Errorf("VNC port not available (VM may need to be started)")
	}

	// Extract listen address (defaults to localhost)
	listen := domainXML.Devices.Graphics.Listen
	if listen == "" {
		listen = "127.0.0.1"
	}

	vncInfo.Host = listen
	vncInfo.Port = port
	vncInfo.VMUUID = uuidStr

	return vncInfo, nil
}
