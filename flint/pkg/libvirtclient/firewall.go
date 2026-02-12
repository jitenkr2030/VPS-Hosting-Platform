package libvirtclient

import (
	"encoding/xml"
	"fmt"
	"github.com/volantvm/flint/pkg/core"
	"strings"
)

// ListNWFilters fetches all network filters
func (c *Client) ListNWFilters() ([]core.NWFilter, error) {
	filters, err := c.conn.ListAllNWFilters(0)
	if err != nil {
		return nil, fmt.Errorf("list nwfilters: %w", err)
	}

	out := make([]core.NWFilter, 0, len(filters))
	for _, f := range filters {
		name, _ := f.GetName()
		uuid, _ := f.GetUUIDString()
		xmlDesc, _ := f.GetXMLDesc(0)

		out = append(out, core.NWFilter{
			Name: name,
			UUID: uuid,
			XML:  xmlDesc,
		})
		f.Free()
	}
	return out, nil
}

// GetNWFilter gets a specific network filter by name
func (c *Client) GetNWFilter(name string) (core.NWFilter, error) {
	filter, err := c.conn.LookupNWFilterByName(name)
	if err != nil {
		return core.NWFilter{}, fmt.Errorf("lookup nwfilter '%s': %w", name, err)
	}
	defer filter.Free()

	uuid, _ := filter.GetUUIDString()
	xmlDesc, err := filter.GetXMLDesc(0)
	if err != nil {
		return core.NWFilter{}, fmt.Errorf("get nwfilter XML: %w", err)
	}

	return core.NWFilter{
		Name: name,
		UUID: uuid,
		XML:  xmlDesc,
	}, nil
}

// CreateNWFilter creates a new network filter
func (c *Client) CreateNWFilter(req core.CreateNWFilterRequest) error {
	// Build XML from rules
	xmlStr := buildNWFilterXML(req.Name, req.Rules)

	// Define the filter
	filter, err := c.conn.NWFilterDefineXML(xmlStr)
	if err != nil {
		return fmt.Errorf("define nwfilter: %w", err)
	}
	defer filter.Free()

	return nil
}

// UpdateNWFilter updates an existing network filter
func (c *Client) UpdateNWFilter(name string, req core.CreateNWFilterRequest) error {
	// In libvirt, updating a filter is done by redefining it
	xmlStr := buildNWFilterXML(name, req.Rules)

	filter, err := c.conn.NWFilterDefineXML(xmlStr)
	if err != nil {
		return fmt.Errorf("update nwfilter: %w", err)
	}
	defer filter.Free()

	return nil
}

// DeleteNWFilter deletes a network filter by name
func (c *Client) DeleteNWFilter(name string) error {
	filter, err := c.conn.LookupNWFilterByName(name)
	if err != nil {
		return fmt.Errorf("lookup nwfilter '%s': %w", name, err)
	}
	defer filter.Free()

	if err := filter.Undefine(); err != nil {
		return fmt.Errorf("undefine nwfilter: %w", err)
	}

	return nil
}

// buildNWFilterXML generates the XML for a network filter
func buildNWFilterXML(name string, rules []core.NWFilterRule) string {
	type Rule struct {
		Action    string `xml:"action,attr"`
		Direction string `xml:"direction,attr"`
		Priority  int    `xml:"priority,attr"`
		Protocol  string `xml:",innerxml"`
	}

	type Filter struct {
		XMLName xml.Name `xml:"filter"`
		Name    string   `xml:"name,attr"`
		Rules   []Rule   `xml:"rule"`
	}

	filter := Filter{
		Name:  name,
		Rules: make([]Rule, 0, len(rules)),
	}

	for _, r := range rules {
		ruleXML := buildRuleProtocol(r)
		filter.Rules = append(filter.Rules, Rule{
			Action:    r.Action,
			Direction: r.Direction,
			Priority:  r.Priority,
			Protocol:  ruleXML,
		})
	}

	xmlBytes, _ := xml.MarshalIndent(filter, "", "  ")
	return string(xmlBytes)
}

// buildRuleProtocol builds the protocol-specific XML for a rule
func buildRuleProtocol(rule core.NWFilterRule) string {
	var parts []string

	switch strings.ToLower(rule.Protocol) {
	case "tcp":
		parts = append(parts, "<tcp")
		if rule.SrcIP != "" {
			parts = append(parts, fmt.Sprintf(" srcipaddr='%s'", rule.SrcIP))
		}
		if rule.DstIP != "" {
			parts = append(parts, fmt.Sprintf(" dstipaddr='%s'", rule.DstIP))
		}
		if rule.SrcPort != "" {
			parts = append(parts, fmt.Sprintf(" srcportstart='%s'", rule.SrcPort))
		}
		if rule.DstPort != "" {
			parts = append(parts, fmt.Sprintf(" dstportstart='%s'", rule.DstPort))
		}
		parts = append(parts, "/>")

	case "udp":
		parts = append(parts, "<udp")
		if rule.SrcIP != "" {
			parts = append(parts, fmt.Sprintf(" srcipaddr='%s'", rule.SrcIP))
		}
		if rule.DstIP != "" {
			parts = append(parts, fmt.Sprintf(" dstipaddr='%s'", rule.DstIP))
		}
		if rule.SrcPort != "" {
			parts = append(parts, fmt.Sprintf(" srcportstart='%s'", rule.SrcPort))
		}
		if rule.DstPort != "" {
			parts = append(parts, fmt.Sprintf(" dstportstart='%s'", rule.DstPort))
		}
		parts = append(parts, "/>")

	case "icmp":
		parts = append(parts, "<icmp")
		if rule.SrcIP != "" {
			parts = append(parts, fmt.Sprintf(" srcipaddr='%s'", rule.SrcIP))
		}
		if rule.DstIP != "" {
			parts = append(parts, fmt.Sprintf(" dstipaddr='%s'", rule.DstIP))
		}
		parts = append(parts, "/>")

	case "all":
		parts = append(parts, "<all")
		if rule.SrcIP != "" {
			parts = append(parts, fmt.Sprintf(" srcipaddr='%s'", rule.SrcIP))
		}
		if rule.DstIP != "" {
			parts = append(parts, fmt.Sprintf(" dstipaddr='%s'", rule.DstIP))
		}
		parts = append(parts, "/>")

	default:
		// Default to IP protocol
		parts = append(parts, "<ip")
		if rule.SrcIP != "" {
			parts = append(parts, fmt.Sprintf(" srcipaddr='%s'", rule.SrcIP))
		}
		if rule.DstIP != "" {
			parts = append(parts, fmt.Sprintf(" dstipaddr='%s'", rule.DstIP))
		}
		parts = append(parts, "/>")
	}

	return strings.Join(parts, "")
}
