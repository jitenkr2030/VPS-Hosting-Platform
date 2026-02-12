"use client"

import { useEffect, useState } from "react"
import { nwfilters, type NWFilter, type CreateNWFilterRequest, type NWFilterRule } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Plus, Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function FirewallView() {
  const [filters, setFilters] = useState<NWFilter[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newFilter, setNewFilter] = useState<CreateNWFilterRequest>({
    name: "",
    rules: []
  })
  const [newRule, setNewRule] = useState<NWFilterRule>({
    action: "accept",
    direction: "in",
    priority: 500,
    protocol: "tcp",
    srcip: "",
    dstip: "",
    srcport: "",
    dstport: ""
  })
  const { toast } = useToast()

  const fetchFilters = async () => {
    try {
      setLoading(true)
      const data = await nwfilters.list()
      setFilters(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load network filters",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFilters()
  }, [])

  const handleAddRule = () => {
    setNewFilter(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }))
    // Reset rule form
    setNewRule({
      action: "accept",
      direction: "in",
      priority: 500,
      protocol: "tcp",
      srcip: "",
      dstip: "",
      srcport: "",
      dstport: ""
    })
  }

  const handleRemoveRule = (index: number) => {
    setNewFilter(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }))
  }

  const handleCreateFilter = async () => {
    if (!newFilter.name) {
      toast({
        title: "Error",
        description: "Filter name is required",
        variant: "destructive"
      })
      return
    }

    if (newFilter.rules.length === 0) {
      toast({
        title: "Error",
        description: "At least one rule is required",
        variant: "destructive"
      })
      return
    }

    try {
      await nwfilters.create(newFilter)
      toast({
        title: "Success",
        description: `Network filter '${newFilter.name}' created successfully`
      })
      setNewFilter({ name: "", rules: [] })
      setShowCreate(false)
      fetchFilters()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create filter: ${error}`,
        variant: "destructive"
      })
    }
  }

  const handleDeleteFilter = async (name: string) => {
    if (!confirm(`Are you sure you want to delete filter '${name}'?`)) {
      return
    }

    try {
      await nwfilters.delete(name)
      toast({
        title: "Success",
        description: `Network filter '${name}' deleted successfully`
      })
      fetchFilters()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete filter: ${error}`,
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Filters</h1>
          <p className="text-muted-foreground">Manage libvirt network filters for VM firewall rules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchFilters}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Filter
          </Button>
        </div>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Network Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Filter Name</Label>
              <Input
                id="filter-name"
                placeholder="my-filter"
                value={newFilter.name}
                onChange={(e) => setNewFilter(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Add Rule</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Action</Label>
                  <Select value={newRule.action} onValueChange={(value) => setNewRule(prev => ({ ...prev, action: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accept">Accept</SelectItem>
                      <SelectItem value="drop">Drop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Direction</Label>
                  <Select value={newRule.direction} onValueChange={(value) => setNewRule(prev => ({ ...prev, direction: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">Inbound</SelectItem>
                      <SelectItem value="out">Outbound</SelectItem>
                      <SelectItem value="inout">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Protocol</Label>
                  <Select value={newRule.protocol} onValueChange={(value) => setNewRule(prev => ({ ...prev, protocol: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tcp">TCP</SelectItem>
                      <SelectItem value="udp">UDP</SelectItem>
                      <SelectItem value="icmp">ICMP</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    value={newRule.priority}
                    onChange={(e) => setNewRule(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label>Source IP (optional)</Label>
                  <Input
                    placeholder="192.168.1.0/24"
                    value={newRule.srcip}
                    onChange={(e) => setNewRule(prev => ({ ...prev, srcip: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Dest IP (optional)</Label>
                  <Input
                    placeholder="10.0.0.0/8"
                    value={newRule.dstip}
                    onChange={(e) => setNewRule(prev => ({ ...prev, dstip: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Source Port (optional)</Label>
                  <Input
                    placeholder="80"
                    value={newRule.srcport}
                    onChange={(e) => setNewRule(prev => ({ ...prev, srcport: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Dest Port (optional)</Label>
                  <Input
                    placeholder="443"
                    value={newRule.dstport}
                    onChange={(e) => setNewRule(prev => ({ ...prev, dstport: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleAddRule} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>

            {newFilter.rules.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Rules ({newFilter.rules.length})</h3>
                <div className="space-y-2">
                  {newFilter.rules.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="text-sm">
                        <span className="font-medium">{rule.action.toUpperCase()}</span> {rule.protocol.toUpperCase()} {rule.direction}
                        {rule.srcip && ` from ${rule.srcip}`}
                        {rule.dstip && ` to ${rule.dstip}`}
                        {rule.srcport && ` sport ${rule.srcport}`}
                        {rule.dstport && ` dport ${rule.dstport}`}
                        <span className="text-muted-foreground ml-2">(priority: {rule.priority})</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveRule(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateFilter}>Create Filter</Button>
              <Button variant="outline" onClick={() => {
                setShowCreate(false)
                setNewFilter({ name: "", rules: [] })
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading network filters...
            </CardContent>
          </Card>
        ) : filters.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No network filters found. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          filters.map((filter) => (
            <Card key={filter.uuid}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {filter.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFilter(filter.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>UUID: {filter.uuid}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer hover:underline">View XML</summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                      {filter.xml}
                    </pre>
                  </details>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
