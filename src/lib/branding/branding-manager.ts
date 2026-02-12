export interface BrandConfig {
  id: string;
  name: string;
  logo?: {
    url?: string;
    data?: string; // Base64 encoded image
    size: { width: number; height: number };
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      inverse: string;
    };
  };
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
  };
  layout: {
    borderRadius: string;
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  company: {
    name: string;
    website?: string;
    supportEmail?: string;
    phone?: string;
    address?: string;
  };
  customCSS?: string;
  favicon?: string;
  loginPage?: {
    backgroundImage?: string;
    welcomeMessage?: string;
    customMessage?: string;
  };
  dashboard?: {
    title?: string;
    subtitle?: string;
    widgets?: string[];
  };
}

export class BrandingManager {
  private static defaultConfig: BrandConfig = {
    id: 'default',
    name: 'Private Cloud Platform',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#10b981',
      background: '#ffffff',
      surface: '#f8fafc',
      text: {
        primary: '#1e293b',
        secondary: '#64748b',
        inverse: '#ffffff'
      }
    },
    typography: {
      fontFamily: {
        primary: 'Inter, system-ui, sans-serif',
        secondary: 'Roboto, system-ui, sans-serif',
        mono: 'JetBrains Mono, monospace'
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      }
    },
    layout: {
      borderRadius: '0.5rem',
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem'
      }
    },
    company: {
      name: 'Your Company'
    }
  };

  static async createCustomConfig(overrides: Partial<BrandConfig>): Promise<BrandConfig> {
    const config: BrandConfig = {
      ...this.defaultConfig,
      ...overrides,
      id: crypto.randomUUID(),
      colors: {
        ...this.defaultConfig.colors,
        ...overrides.colors
      },
      typography: {
        fontFamily: {
          ...this.defaultConfig.typography.fontFamily,
          ...overrides.typography?.fontFamily
        },
        fontSize: {
          ...this.defaultConfig.typography.fontSize,
          ...overrides.typography?.fontSize
        }
      },
      layout: {
        ...this.defaultConfig.layout,
        spacing: {
          ...this.defaultConfig.layout.spacing,
          ...overrides.layout?.spacing
        }
      },
      company: {
        ...this.defaultConfig.company,
        ...overrides.company
      }
    };

    return config;
  }

  static generateCSSVariables(config: BrandConfig): string {
    const cssVariables = `
      :root {
        /* Colors */
        --color-primary: ${config.colors.primary};
        --color-secondary: ${config.colors.secondary};
        --color-accent: ${config.colors.accent};
        --color-background: ${config.colors.background};
        --color-surface: ${config.colors.surface};
        --color-text-primary: ${config.colors.text.primary};
        --color-text-secondary: ${config.colors.text.secondary};
        --color-text-inverse: ${config.colors.text.inverse};
        
        /* Typography */
        --font-primary: ${config.typography.fontFamily.primary};
        --font-secondary: ${config.typography.fontFamily.secondary};
        --font-mono: ${config.typography.fontFamily.mono};
        
        --font-size-xs: ${config.typography.fontSize.xs};
        --font-size-sm: ${config.typography.fontSize.sm};
        --font-size-base: ${config.typography.fontSize.base};
        --font-size-lg: ${config.typography.fontSize.lg};
        --font-size-xl: ${config.typography.fontSize.xl};
        --font-size-2xl: ${config.typography.fontSize['2xl']};
        --font-size-3xl: ${config.typography.fontSize['3xl']};
        --font-size-4xl: ${config.typography.fontSize['4xl']};
        
        /* Layout */
        --border-radius: ${config.layout.borderRadius};
        --spacing-xs: ${config.layout.spacing.xs};
        --spacing-sm: ${config.layout.spacing.sm};
        --spacing-md: ${config.layout.spacing.md};
        --spacing-lg: ${config.layout.spacing.lg};
        --spacing-xl: ${config.layout.spacing.xl};
        
        /* Company Info */
        --company-name: '${config.company.name}';
        --company-website: '${config.company.website || ''}';
        --company-support-email: '${config.company.supportEmail || ''}';
      }
    `;

    return cssVariables + (config.customCSS || '');
  }

  static generateTailwindConfig(config: BrandConfig): any {
    return {
      theme: {
        extend: {
          colors: {
            primary: config.colors.primary,
            secondary: config.colors.secondary,
            accent: config.colors.accent,
            background: config.colors.background,
            surface: config.colors.surface,
            'text-primary': config.colors.text.primary,
            'text-secondary': config.colors.text.secondary,
            'text-inverse': config.colors.text.inverse
          },
          fontFamily: {
            primary: [config.typography.fontFamily.primary],
            secondary: [config.typography.fontFamily.secondary],
            mono: [config.typography.fontFamily.mono]
          },
          borderRadius: {
            'brand': config.layout.borderRadius
          },
          spacing: {
            'xs': config.layout.spacing.xs,
            'sm': config.layout.spacing.sm,
            'md': config.layout.spacing.md,
            'lg': config.layout.spacing.lg,
            'xl': config.layout.spacing.xl
          }
        }
      }
    };
  }

  static validateConfig(config: Partial<BrandConfig>): { 
    valid: boolean; 
    errors: string[] 
  } {
    const errors: string[] = [];

    // Validate colors
    if (config.colors) {
      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      Object.entries(config.colors).forEach(([key, value]) => {
        if (key === 'text') {
          Object.entries(value).forEach(([textKey, textValue]) => {
            if (!colorRegex.test(textValue)) {
              errors.push(`Invalid color format for colors.text.${textKey}: ${textValue}`);
            }
          });
        } else if (!colorRegex.test(value)) {
          errors.push(`Invalid color format for colors.${key}: ${value}`);
        }
      });
    }

    // Validate logo dimensions
    if (config.logo && config.logo.size) {
      const { width, height } = config.logo.size;
      if (width < 100 || width > 500 || height < 50 || height > 200) {
        errors.push('Logo dimensions must be between 100-500px width and 50-200px height');
      }
    }

    // Validate company name
    if (config.company && !config.company.name?.trim()) {
      errors.push('Company name is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static async saveConfig(config: BrandConfig): Promise<void> {
    // In a real implementation, this would save to a database
    // For now, we'll simulate saving
    console.log('Saving brand config:', config.id);
    
    // Validate before saving
    const validation = this.validateConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    // Save to localStorage in client-side or database in server-side
    if (typeof window !== 'undefined') {
      localStorage.setItem('brand-config', JSON.stringify(config));
    }
  }

  static async loadConfig(id?: string): Promise<BrandConfig> {
    // In a real implementation, this would load from a database
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('brand-config');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    
    return this.defaultConfig;
  }

  static async resetToDefault(): Promise<BrandConfig> {
    const config = { ...this.defaultConfig };
    await this.saveConfig(config);
    return config;
  }

  static exportConfig(config: BrandConfig): string {
    return JSON.stringify(config, null, 2);
  }

  static importConfig(configJson: string): BrandConfig {
    try {
      const config = JSON.parse(configJson);
      const validation = this.validateConfig(config);
      
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }
      
      return config;
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}