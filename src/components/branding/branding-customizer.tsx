'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BrandConfig, BrandingManager } from '@/lib/branding/branding-manager';
import { Upload, Download, RotateCcw, Save, Eye } from 'lucide-react';

interface BrandingCustomizerProps {
  onConfigChange?: (config: BrandConfig) => void;
  initialConfig?: BrandConfig;
}

export function BrandingCustomizer({ onConfigChange, initialConfig }: BrandingCustomizerProps) {
  const [config, setConfig] = useState<BrandConfig>(initialConfig || BrandingManager.defaultConfig);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });

  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(config);
    }
  }, [config, onConfigChange]);

  const updateConfig = (updates: Partial<BrandConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    setValidation(BrandingManager.validateConfig(newConfig));
  };

  const handleColorChange = (colorPath: string, value: string) => {
    const keys = colorPath.split('.');
    const updates: any = {};
    let current = updates;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = current[keys[i]] || {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    updateConfig(updates);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        updateConfig({
          logo: {
            ...config.logo,
            data,
            size: config.logo?.size || { width: 200, height: 60 }
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await BrandingManager.saveConfig(config);
      // Show success message
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const exportData = BrandingManager.exportConfig(config);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brand-config-${config.company.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = BrandingManager.importConfig(e.target?.result as string);
          setConfig(importedConfig);
        } catch (error) {
          console.error('Failed to import config:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = async () => {
    try {
      const defaultConfig = await BrandingManager.resetToDefault();
      setConfig(defaultConfig);
    } catch (error) {
      console.error('Failed to reset config:', error);
    }
  };

  return (
    <div className={`space-y-6 ${previewMode ? 'pointer-events-none opacity-75' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brand Customization</h2>
          <p className="text-muted-foreground">Customize the appearance and feel of your platform</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" asChild>
            <Label htmlFor="import-config" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Label>
          </Button>
          <input
            id="import-config"
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button onClick={handleSave} disabled={saving || !validation.valid}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {!validation.valid && (
        <Alert variant="destructive">
          <AlertDescription>
            Please fix the following errors:
            <ul className="mt-2 list-disc list-inside">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Company Info */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic information about your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={config.company.name}
                    onChange={(e) => updateConfig({
                      company: { ...config.company, name: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="company-website">Website</Label>
                  <Input
                    id="company-website"
                    type="url"
                    value={config.company.website || ''}
                    onChange={(e) => updateConfig({
                      company: { ...config.company, website: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={config.company.supportEmail || ''}
                    onChange={(e) => updateConfig({
                      company: { ...config.company, supportEmail: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="support-phone">Support Phone</Label>
                  <Input
                    id="support-phone"
                    value={config.company.phone || ''}
                    onChange={(e) => updateConfig({
                      company: { ...config.company, phone: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="company-address">Address</Label>
                <Input
                  id="company-address"
                  value={config.company.address || ''}
                  onChange={(e) => updateConfig({
                    company: { ...config.company, address: e.target.value }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors */}
        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>Define your brand colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="color-primary">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="color-primary"
                      type="color"
                      value={config.colors.primary}
                      onChange={(e) => handleColorChange('colors.primary', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={config.colors.primary}
                      onChange={(e) => handleColorChange('colors.primary', e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="color-secondary">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="color-secondary"
                      type="color"
                      value={config.colors.secondary}
                      onChange={(e) => handleColorChange('colors.secondary', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={config.colors.secondary}
                      onChange={(e) => handleColorChange('colors.secondary', e.target.value)}
                      placeholder="#64748b"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="color-accent">Accent Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="color-accent"
                      type="color"
                      value={config.colors.accent}
                      onChange={(e) => handleColorChange('colors.accent', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={config.colors.accent}
                      onChange={(e) => handleColorChange('colors.accent', e.target.value)}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="color-background">Background Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="color-background"
                      type="color"
                      value={config.colors.background}
                      onChange={(e) => handleColorChange('colors.background', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={config.colors.background}
                      onChange={(e) => handleColorChange('colors.background', e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Text Colors</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="color-text-primary">Primary Text</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="color-text-primary"
                        type="color"
                        value={config.colors.text.primary}
                        onChange={(e) => handleColorChange('colors.text.primary', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.colors.text.primary}
                        onChange={(e) => handleColorChange('colors.text.primary', e.target.value)}
                        placeholder="#1e293b"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="color-text-secondary">Secondary Text</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="color-text-secondary"
                        type="color"
                        value={config.colors.text.secondary}
                        onChange={(e) => handleColorChange('colors.text.secondary', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.colors.text.secondary}
                        onChange={(e) => handleColorChange('colors.text.secondary', e.target.value)}
                        placeholder="#64748b"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="color-text-inverse">Inverse Text</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="color-text-inverse"
                        type="color"
                        value={config.colors.text.inverse}
                        onChange={(e) => handleColorChange('colors.text.inverse', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.colors.text.inverse}
                        onChange={(e) => handleColorChange('colors.text.inverse', e.target.value)}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography */}
        <TabsContent value="typography">
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Configure fonts and text sizes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Font Families</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="font-primary">Primary Font</Label>
                    <Input
                      id="font-primary"
                      value={config.typography.fontFamily.primary}
                      onChange={(e) => handleColorChange('typography.fontFamily.primary', e.target.value)}
                      placeholder="Inter, system-ui, sans-serif"
                    />
                  </div>
                  <div>
                    <Label htmlFor="font-secondary">Secondary Font</Label>
                    <Input
                      id="font-secondary"
                      value={config.typography.fontFamily.secondary}
                      onChange={(e) => handleColorChange('typography.fontFamily.secondary', e.target.value)}
                      placeholder="Roboto, system-ui, sans-serif"
                    />
                  </div>
                  <div>
                    <Label htmlFor="font-mono">Monospace Font</Label>
                    <Input
                      id="font-mono"
                      value={config.typography.fontFamily.mono}
                      onChange={(e) => handleColorChange('typography.fontFamily.mono', e.target.value)}
                      placeholder="JetBrains Mono, monospace"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Font Sizes</h4>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(config.typography.fontSize).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={`font-size-${key}`}>{key}</Label>
                      <Input
                        id={`font-size-${key}`}
                        value={value}
                        onChange={(e) => handleColorChange(`typography.fontSize.${key}`, e.target.value)}
                        placeholder="1rem"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout */}
        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
              <CardDescription>Configure spacing and border radius</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="border-radius">Border Radius</Label>
                <Input
                  id="border-radius"
                  value={config.layout.borderRadius}
                  onChange={(e) => handleColorChange('layout.borderRadius', e.target.value)}
                  placeholder="0.5rem"
                />
              </div>

              <div>
                <h4 className="font-medium mb-3">Spacing</h4>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(config.layout.spacing).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={`spacing-${key}`}>{key}</Label>
                      <Input
                        id={`spacing-${key}`}
                        value={value}
                        onChange={(e) => handleColorChange(`layout.spacing.${key}`, e.target.value)}
                        placeholder="1rem"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Logo, custom CSS, and other advanced options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="logo-upload">Logo</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                  {config.logo?.data && (
                    <div className="flex items-center space-x-2">
                      <img 
                        src={config.logo.data} 
                        alt="Logo" 
                        className="h-12 max-w-xs object-contain"
                      />
                      <Badge variant="secondary">Logo uploaded</Badge>
                    </div>
                  )}
                </div>
                {config.logo?.size && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Current size: {config.logo.size.width} x {config.logo.size.height}px
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="custom-css">Custom CSS</Label>
                <textarea
                  id="custom-css"
                  className="w-full h-32 p-3 border rounded-md font-mono text-sm"
                  value={config.customCSS || ''}
                  onChange={(e) => updateConfig({ customCSS: e.target.value })}
                  placeholder="/* Add custom CSS here */"
                />
              </div>

              <div>
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input
                  id="favicon"
                  value={config.favicon || ''}
                  onChange={(e) => updateConfig({ favicon: e.target.value })}
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}