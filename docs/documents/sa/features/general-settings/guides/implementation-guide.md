# General Settings - Technical Implementation Guide

**Document Version**: 1.0
**Last Updated**: October 21, 2025
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Target Audience**: Frontend Developers, Backend Developers, Full-Stack Engineers

---

## Overview

This guide provides comprehensive technical implementation details for the General Settings feature, covering the Settings Hub, Company Settings, Security Settings, and Application Settings. Each section includes component architecture, state management patterns, API specifications, and code examples.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Structure](#component-structure)
3. [State Management](#state-management)
4. [Type Definitions](#type-definitions)
5. [API Integration](#api-integration)
6. [Form Handling](#form-handling)
7. [Validation Rules](#validation-rules)
8. [Testing Strategy](#testing-strategy)
9. [Performance Optimization](#performance-optimization)
10. [Security Considerations](#security-considerations)

---

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.x with strict mode
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Form Management**: React Hook Form
- **Validation**: Zod schemas
- **State Management**: React useState with controlled components

### File Structure
```
app/(main)/system-administration/settings/
├── page.tsx                    # Settings Hub
├── company/
│   └── page.tsx               # Company Settings (3 tabs)
├── security/
│   └── page.tsx               # Security Settings (4 tabs)
├── application/
│   └── page.tsx               # Application Settings (4 tabs)
└── notifications/
    └── page.tsx               # Notification Settings (6 tabs)

lib/
├── types/
│   └── settings.ts            # All settings type definitions
└── mock-data/
    └── settings.ts            # Mock data for development
```

---

## Component Structure

### 1. Settings Hub Component

**File**: `app/(main)/system-administration/settings/page.tsx`

**Purpose**: Central dashboard providing navigation to all settings categories

**Key Features**:
- Grid layout with navigation cards
- Icon-based visual hierarchy
- Status badges for planned features
- Responsive design with mobile optimization

**Component Pattern**:
```typescript
export default function SettingsPage() {
  const router = useRouter();

  const settingsCategories = [
    {
      title: "Company Settings",
      description: "Organization information and branding",
      icon: Building2,
      href: "/system-administration/settings/company",
      available: true
    },
    {
      title: "Security Settings",
      description: "Security policies and authentication",
      icon: Shield,
      href: "/system-administration/settings/security",
      available: true
    },
    // ... more categories
  ];

  return (
    <div className="px-9 pt-9 pb-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">General Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure system-wide settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories.map((category) => (
          <Card key={category.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{category.title}</CardTitle>
                <category.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {category.available ? (
                <Button asChild className="w-full" variant="default">
                  <Link href={category.href}>Configure {category.title}</Link>
                </Button>
              ) : (
                <Badge variant="secondary">Coming Soon</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### 2. Company Settings Component

**File**: `app/(main)/system-administration/settings/company/page.tsx` (539 lines)

**Purpose**: Manage company information, branding, and operational settings

**Tab Structure**:
1. General Information (Company identity, contact, address)
2. Branding (Logos, colors, visual identity)
3. Operational Settings (Currency, timezone, fiscal year)

**State Management Pattern**:
```typescript
const [settings, setSettings] = useState<CompanySettings>(mockCompanySettings);
const [activeTab, setActiveTab] = useState("general");
const [hasChanges, setHasChanges] = useState(false);

// Nested state update pattern
const handleGeneralChange = (field: keyof CompanySettings["general"], value: string) => {
  setSettings({
    ...settings,
    general: {
      ...settings.general,
      [field]: value
    }
  });
  setHasChanges(true);
};

const handleContactChange = (field: keyof CompanySettings["contact"], value: string) => {
  setSettings({
    ...settings,
    contact: {
      ...settings.contact,
      [field]: value
    }
  });
  setHasChanges(true);
};

// Similar patterns for address, branding, operational
```

**Save Handler**:
```typescript
const handleSave = () => {
  // TODO: Implement API call to save settings
  toast({
    title: "Settings Saved",
    description: "Company settings have been updated successfully.",
  });
  setHasChanges(false);
};

const handleReset = () => {
  setSettings(mockCompanySettings);
  setHasChanges(false);
  toast({
    title: "Settings Reset",
    description: "Company settings have been reset to default values.",
  });
};
```

**Tab Navigation Implementation**:
```typescript
<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
  <TabsList>
    <TabsTrigger value="general">
      <Building2 className="h-4 w-4 mr-2" />
      General Information
    </TabsTrigger>
    <TabsTrigger value="branding">
      <Palette className="h-4 w-4 mr-2" />
      Branding
    </TabsTrigger>
    <TabsTrigger value="operational">
      <Settings className="h-4 w-4 mr-2" />
      Operational Settings
    </TabsTrigger>
  </TabsList>

  <TabsContent value="general" className="space-y-6">
    {/* General Information Form */}
  </TabsContent>

  <TabsContent value="branding" className="space-y-6">
    {/* Branding Form */}
  </TabsContent>

  <TabsContent value="operational" className="space-y-6">
    {/* Operational Settings Form */}
  </TabsContent>
</Tabs>
```

### 3. Security Settings Component

**File**: `app/(main)/system-administration/settings/security/page.tsx` (713 lines)

**Purpose**: Manage security policies, authentication, access control, and audit logging

**Tab Structure**:
1. Password Policy (Complexity requirements, expiry, history)
2. Authentication (2FA, session management, login security)
3. Access Control (IP whitelisting, security questions)
4. Audit & Logging (Audit trails, data encryption)

**Password Strength Calculation**:
```typescript
const getPasswordStrength = () => {
  const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = settings.passwordPolicy;
  let strength = 0;

  if (minLength >= 12) strength += 2;
  else if (minLength >= 8) strength += 1;

  if (requireUppercase) strength += 1;
  if (requireLowercase) strength += 1;
  if (requireNumbers) strength += 1;
  if (requireSpecialChars) strength += 1;

  if (strength <= 2) return { label: "Weak", color: "destructive" };
  if (strength <= 4) return { label: "Medium", color: "warning" };
  return { label: "Strong", color: "success" };
};

const passwordStrength = getPasswordStrength();
```

**Slider Component for Password Length**:
```typescript
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <Label htmlFor="min-length">
      Minimum Password Length: {settings.passwordPolicy.minLength}
    </Label>
  </div>
  <Slider
    id="min-length"
    value={[settings.passwordPolicy.minLength]}
    onValueChange={([value]) => handlePasswordPolicyChange("minLength", value)}
    min={6}
    max={32}
    step={1}
  />
  <p className="text-sm text-muted-foreground">
    Recommended: At least 12 characters
  </p>
</div>
```

**Checkbox Array Handling**:
```typescript
// 2FA Methods
<div className="space-y-2">
  <Label>Allowed Methods</Label>
  <div className="space-y-2">
    {(["authenticator", "sms", "email"] as const).map((method) => (
      <div key={method} className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={`method-${method}`}
          checked={settings.twoFactor.methods.includes(method)}
          onChange={(e) => {
            const methods = e.target.checked
              ? [...settings.twoFactor.methods, method]
              : settings.twoFactor.methods.filter((m) => m !== method);
            handleTwoFactorChange("methods", methods);
          }}
          className="rounded"
        />
        <Label htmlFor={`method-${method}`} className="capitalize font-normal">
          {method === "authenticator" ? "Authenticator App" : method.toUpperCase()}
        </Label>
      </div>
    ))}
  </div>
</div>
```

**Security Warning Component**:
```typescript
<div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
  <div className="flex gap-3">
    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
    <div>
      <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Security Warning</h4>
      <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
        Changes to security settings may affect all users. Ensure you understand the implications
        before saving. Consider testing changes in a non-production environment first.
      </p>
    </div>
  </div>
</div>
```

### 4. Application Settings Component

**File**: `app/(main)/system-administration/settings/application/page.tsx` (633 lines)

**Purpose**: Manage email configuration, backups, integrations, and performance

**Tab Structure**:
1. Email Configuration (SMTP, email templates, testing)
2. Backup & Recovery (Automated backups, storage, recovery)
3. Integrations (POS, ERP, accounting systems)
4. Features & Performance (Feature toggles, caching, API limits)

**Provider Selection Pattern**:
```typescript
<div className="space-y-2">
  <Label htmlFor="email-provider">Email Provider</Label>
  <Select
    value={settings.email.provider}
    onValueChange={(value) => handleEmailChange("provider", value)}
  >
    <SelectTrigger id="email-provider">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="smtp">SMTP</SelectItem>
      <SelectItem value="sendgrid">SendGrid</SelectItem>
      <SelectItem value="aws-ses">AWS SES</SelectItem>
      <SelectItem value="custom">Custom</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**Conditional Form Fields**:
```typescript
// Show SMTP fields only when SMTP provider is selected
{settings.email.provider === "smtp" && (
  <>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="smtp-host">SMTP Host</Label>
        <Input
          id="smtp-host"
          value={settings.email.smtpHost}
          onChange={(e) => handleEmailChange("smtpHost", e.target.value)}
          placeholder="smtp.example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="smtp-port">SMTP Port</Label>
        <Input
          id="smtp-port"
          type="number"
          value={settings.email.smtpPort}
          onChange={(e) => handleEmailChange("smtpPort", parseInt(e.target.value))}
          placeholder="587"
        />
      </div>
    </div>
    {/* More SMTP fields */}
  </>
)}
```

**Integration Status Badge**:
```typescript
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label htmlFor="pos-enabled">Enable POS Integration</Label>
    <p className="text-sm text-muted-foreground">
      Connect to Point of Sale systems
    </p>
  </div>
  <div className="flex items-center gap-2">
    {settings.integrations.pos.enabled && (
      <Badge variant="success">Connected</Badge>
    )}
    <Switch
      id="pos-enabled"
      checked={settings.integrations.pos.enabled}
      onCheckedChange={(checked) => handlePOSChange("enabled", checked)}
    />
  </div>
</div>
```

---

## State Management

### State Structure

**Company Settings State**:
```typescript
const [settings, setSettings] = useState<CompanySettings>({
  general: {
    companyName: "",
    legalName: "",
    taxId: "",
    registrationNumber: "",
    incorporationDate: "",
    website: ""
  },
  contact: {
    primaryPhone: "",
    secondaryPhone: "",
    primaryEmail: "",
    supportEmail: ""
  },
  address: {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: ""
  },
  branding: {
    logoUrl: "",
    darkModeLogoUrl: "",
    faviconUrl: "",
    primaryColor: "#000000",
    secondaryColor: "#000000",
    accentColor: "#000000"
  },
  operational: {
    defaultCurrency: "USD",
    timezone: "America/New_York",
    language: "en",
    fiscalYearStart: "01-01",
    fiscalYearEnd: "12-31"
  }
});
```

**Security Settings State**:
```typescript
const [settings, setSettings] = useState<SecuritySettings>({
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: 90,
    historyCount: 5
  },
  twoFactor: {
    enabled: true,
    required: false,
    methods: ["authenticator", "sms"],
    gracePeriodDays: 7
  },
  sessionSettings: {
    timeout: 30,
    maxConcurrentSessions: 3,
    rememberMe: true,
    absoluteTimeout: false
  },
  loginAttempts: {
    maxAttempts: 5,
    lockoutDuration: 30,
    notifyAdmin: true
  },
  ipAccessControl: {
    enabled: false,
    whitelist: []
  },
  securityQuestions: {
    enabled: true,
    minRequired: 3
  },
  auditLogging: {
    enabled: true,
    retentionDays: 365,
    events: ["login", "logout", "dataAccess", "dataModification", "settingsChange"]
  },
  dataEncryption: {
    atRest: true,
    inTransit: true,
    algorithm: "AES-256"
  }
});
```

**Application Settings State**:
```typescript
const [settings, setSettings] = useState<ApplicationSettings>({
  email: {
    provider: "smtp",
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    encryption: "tls",
    fromEmail: "",
    fromName: ""
  },
  backup: {
    enabled: true,
    frequency: "daily",
    retentionDays: 30,
    storageLocation: "cloud",
    cloudProvider: "aws-s3"
  },
  integrations: {
    pos: {
      enabled: false,
      provider: "",
      apiEndpoint: "",
      apiKey: ""
    },
    erp: {
      enabled: false,
      system: "",
      endpoint: ""
    },
    accounting: {
      enabled: false,
      system: "",
      mode: "realtime"
    }
  },
  features: {
    advancedSearch: true,
    realtimeNotifications: true,
    mobileAccess: true,
    offlineMode: false
  },
  performance: {
    caching: {
      enabled: true,
      type: "redis",
      duration: 3600
    },
    apiRateLimit: 1000
  }
});
```

### Update Patterns

**Nested Object Update Pattern**:
```typescript
// Pattern for updating nested objects
const handleNestedChange = (
  parent: keyof Settings,
  field: keyof Settings[parent],
  value: any
) => {
  setSettings(prev => ({
    ...prev,
    [parent]: {
      ...prev[parent],
      [field]: value
    }
  }));
  setHasChanges(true);
};

// Usage
handleNestedChange("general", "companyName", "New Company Name");
```

**Array Update Pattern**:
```typescript
// Adding to array
const addToArray = (item: string) => {
  setSettings(prev => ({
    ...prev,
    someArray: [...prev.someArray, item]
  }));
};

// Removing from array
const removeFromArray = (item: string) => {
  setSettings(prev => ({
    ...prev,
    someArray: prev.someArray.filter(i => i !== item)
  }));
};
```

---

## Type Definitions

### Core Settings Types

**File**: `lib/types/settings.ts`

```typescript
// Company Settings Types
export interface CompanySettings {
  general: {
    companyName: string;
    legalName: string;
    taxId: string;
    registrationNumber: string;
    incorporationDate: string;
    website: string;
  };
  contact: {
    primaryPhone: string;
    secondaryPhone?: string;
    primaryEmail: string;
    supportEmail: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  branding: {
    logoUrl: string;
    darkModeLogoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  operational: {
    defaultCurrency: string;
    timezone: string;
    language: string;
    fiscalYearStart: string;
    fiscalYearEnd: string;
  };
}

// Security Settings Types
export type TwoFactorMethod = "authenticator" | "sms" | "email";
export type AuditEvent = "login" | "logout" | "dataAccess" | "dataModification" | "settingsChange";
export type EncryptionAlgorithm = "AES-256" | "AES-128" | "RSA-2048";

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
    historyCount: number;
  };
  twoFactor: {
    enabled: boolean;
    required: boolean;
    methods: TwoFactorMethod[];
    gracePeriodDays: number;
  };
  sessionSettings: {
    timeout: number;
    maxConcurrentSessions: number;
    rememberMe: boolean;
    absoluteTimeout: boolean;
  };
  loginAttempts: {
    maxAttempts: number;
    lockoutDuration: number;
    notifyAdmin: boolean;
  };
  ipAccessControl: {
    enabled: boolean;
    whitelist: string[];
  };
  securityQuestions: {
    enabled: boolean;
    minRequired: number;
  };
  auditLogging: {
    enabled: boolean;
    retentionDays: number;
    events: AuditEvent[];
  };
  dataEncryption: {
    atRest: boolean;
    inTransit: boolean;
    algorithm: EncryptionAlgorithm;
  };
}

// Application Settings Types
export type EmailProvider = "smtp" | "sendgrid" | "aws-ses" | "custom";
export type EncryptionType = "tls" | "ssl" | "none";
export type BackupFrequency = "hourly" | "daily" | "weekly" | "monthly";
export type StorageLocation = "local" | "cloud" | "both";
export type IntegrationMode = "realtime" | "batch";
export type CacheType = "memory" | "redis" | "memcached";

export interface ApplicationSettings {
  email: {
    provider: EmailProvider;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    encryption: EncryptionType;
    fromEmail: string;
    fromName: string;
  };
  backup: {
    enabled: boolean;
    frequency: BackupFrequency;
    retentionDays: number;
    storageLocation: StorageLocation;
    cloudProvider?: string;
  };
  integrations: {
    pos: {
      enabled: boolean;
      provider: string;
      apiEndpoint: string;
      apiKey: string;
    };
    erp: {
      enabled: boolean;
      system: string;
      endpoint: string;
    };
    accounting: {
      enabled: boolean;
      system: string;
      mode: IntegrationMode;
    };
  };
  features: {
    advancedSearch: boolean;
    realtimeNotifications: boolean;
    mobileAccess: boolean;
    offlineMode: boolean;
  };
  performance: {
    caching: {
      enabled: boolean;
      type: CacheType;
      duration: number;
    };
    apiRateLimit: number;
  };
}
```

---

## API Integration

### API Endpoints

**Base URL**: `/api/system-administration/settings`

#### Company Settings
```typescript
// GET /api/system-administration/settings/company
// Response: CompanySettings
interface GetCompanySettingsResponse {
  success: boolean;
  data: CompanySettings;
}

// PUT /api/system-administration/settings/company
// Request: CompanySettings
// Response: Success message
interface UpdateCompanySettingsRequest {
  settings: CompanySettings;
}

interface UpdateCompanySettingsResponse {
  success: boolean;
  message: string;
  data: CompanySettings;
}
```

#### Security Settings
```typescript
// GET /api/system-administration/settings/security
// Response: SecuritySettings
interface GetSecuritySettingsResponse {
  success: boolean;
  data: SecuritySettings;
}

// PUT /api/system-administration/settings/security
// Request: SecuritySettings
// Response: Success message
interface UpdateSecuritySettingsRequest {
  settings: SecuritySettings;
}

interface UpdateSecuritySettingsResponse {
  success: boolean;
  message: string;
  data: SecuritySettings;
  affectedUsers?: number; // Number of users affected by the change
}
```

#### Application Settings
```typescript
// GET /api/system-administration/settings/application
// Response: ApplicationSettings
interface GetApplicationSettingsResponse {
  success: boolean;
  data: ApplicationSettings;
}

// PUT /api/system-administration/settings/application
// Request: ApplicationSettings
// Response: Success message
interface UpdateApplicationSettingsRequest {
  settings: ApplicationSettings;
}

interface UpdateApplicationSettingsResponse {
  success: boolean;
  message: string;
  data: ApplicationSettings;
}

// POST /api/system-administration/settings/application/test-email
// Request: Test email data
interface TestEmailRequest {
  recipientEmail: string;
}

interface TestEmailResponse {
  success: boolean;
  message: string;
  deliveryTime?: number; // in milliseconds
}

// POST /api/system-administration/settings/application/test-integration
// Request: Integration type and credentials
interface TestIntegrationRequest {
  type: "pos" | "erp" | "accounting";
  credentials: Record<string, string>;
}

interface TestIntegrationResponse {
  success: boolean;
  message: string;
  responseTime?: number; // in milliseconds
  data?: any; // Sample data from integration
}
```

### API Service Implementation

```typescript
// lib/api/settings.ts
import { CompanySettings, SecuritySettings, ApplicationSettings } from "@/lib/types/settings";

export class SettingsAPI {
  private static baseUrl = "/api/system-administration/settings";

  // Company Settings
  static async getCompanySettings(): Promise<CompanySettings> {
    const response = await fetch(`${this.baseUrl}/company`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data.data;
  }

  static async updateCompanySettings(settings: CompanySettings): Promise<void> {
    const response = await fetch(`${this.baseUrl}/company`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
  }

  // Security Settings
  static async getSecuritySettings(): Promise<SecuritySettings> {
    const response = await fetch(`${this.baseUrl}/security`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data.data;
  }

  static async updateSecuritySettings(settings: SecuritySettings): Promise<{ affectedUsers: number }> {
    const response = await fetch(`${this.baseUrl}/security`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return { affectedUsers: data.affectedUsers };
  }

  // Application Settings
  static async getApplicationSettings(): Promise<ApplicationSettings> {
    const response = await fetch(`${this.baseUrl}/application`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data.data;
  }

  static async updateApplicationSettings(settings: ApplicationSettings): Promise<void> {
    const response = await fetch(`${this.baseUrl}/application`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
  }

  static async testEmail(recipientEmail: string): Promise<{ deliveryTime: number }> {
    const response = await fetch(`${this.baseUrl}/application/test-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientEmail })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return { deliveryTime: data.deliveryTime };
  }

  static async testIntegration(type: string, credentials: Record<string, string>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/application/test-integration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, credentials })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  }
}
```

---

## Form Handling

### Validation Patterns

**Email Validation**:
```typescript
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

**URL Validation**:
```typescript
const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "https:";
  } catch {
    return false;
  }
};
```

**Hex Color Validation**:
```typescript
const validateHexColor = (color: string): boolean => {
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  return hexRegex.test(color);
};
```

**IP Address Validation**:
```typescript
const validateIP = (ip: string): boolean => {
  // IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // CIDR notation validation
  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;

  return ipv4Regex.test(ip) || cidrRegex.test(ip);
};
```

### Input Debouncing

```typescript
import { useCallback } from "react";
import { debounce } from "lodash";

const CompanySettings = () => {
  // Debounce input changes for performance
  const debouncedUpdate = useCallback(
    debounce((field: string, value: string) => {
      handleGeneralChange(field, value);
    }, 300),
    []
  );

  return (
    <Input
      value={settings.general.companyName}
      onChange={(e) => debouncedUpdate("companyName", e.target.value)}
    />
  );
};
```

---

## Validation Rules

### Server-Side Validation

**Company Settings Validation**:
```typescript
import { z } from "zod";

export const companySettingsSchema = z.object({
  general: z.object({
    companyName: z.string().min(3).max(200),
    legalName: z.string().min(3).max(200),
    taxId: z.string().regex(/^[0-9]{2}-[0-9]{7}$/),
    registrationNumber: z.string().min(5).max(50),
    incorporationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    website: z.string().url().startsWith("https://")
  }),
  contact: z.object({
    primaryPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    secondaryPhone: z.string().optional(),
    primaryEmail: z.string().email(),
    supportEmail: z.string().email()
  }),
  address: z.object({
    street: z.string().min(5).max(200),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    postalCode: z.string().min(3).max(20),
    country: z.string().length(2) // ISO country code
  }),
  branding: z.object({
    logoUrl: z.string().url().startsWith("https://"),
    darkModeLogoUrl: z.string().url().startsWith("https://"),
    faviconUrl: z.string().url().startsWith("https://"),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
  }),
  operational: z.object({
    defaultCurrency: z.string().length(3), // ISO currency code
    timezone: z.string(), // IANA timezone
    language: z.string().length(2), // ISO language code
    fiscalYearStart: z.string().regex(/^\d{2}-\d{2}$/),
    fiscalYearEnd: z.string().regex(/^\d{2}-\d{2}$/)
  })
});
```

**Security Settings Validation**:
```typescript
export const securitySettingsSchema = z.object({
  passwordPolicy: z.object({
    minLength: z.number().min(6).max(32),
    requireUppercase: z.boolean(),
    requireLowercase: z.boolean(),
    requireNumbers: z.boolean(),
    requireSpecialChars: z.boolean(),
    expiryDays: z.number().min(0).max(365),
    historyCount: z.number().min(0).max(24)
  }),
  twoFactor: z.object({
    enabled: z.boolean(),
    required: z.boolean(),
    methods: z.array(z.enum(["authenticator", "sms", "email"])).min(1),
    gracePeriodDays: z.number().min(0).max(90)
  }),
  sessionSettings: z.object({
    timeout: z.number().min(5).max(1440),
    maxConcurrentSessions: z.number().min(1).max(10),
    rememberMe: z.boolean(),
    absoluteTimeout: z.boolean()
  }),
  loginAttempts: z.object({
    maxAttempts: z.number().min(3).max(20),
    lockoutDuration: z.number().min(1).max(1440),
    notifyAdmin: z.boolean()
  }),
  ipAccessControl: z.object({
    enabled: z.boolean(),
    whitelist: z.array(z.string())
  }),
  securityQuestions: z.object({
    enabled: z.boolean(),
    minRequired: z.number().min(1).max(10)
  }),
  auditLogging: z.object({
    enabled: z.boolean(),
    retentionDays: z.number().min(30).max(3650),
    events: z.array(z.enum(["login", "logout", "dataAccess", "dataModification", "settingsChange"]))
  }),
  dataEncryption: z.object({
    atRest: z.boolean(),
    inTransit: z.boolean(),
    algorithm: z.enum(["AES-256", "AES-128", "RSA-2048"])
  })
});
```

**Application Settings Validation**:
```typescript
export const applicationSettingsSchema = z.object({
  email: z.object({
    provider: z.enum(["smtp", "sendgrid", "aws-ses", "custom"]),
    smtpHost: z.string().min(3).max(255),
    smtpPort: z.number().min(1).max(65535),
    smtpUser: z.string().min(1).max(255),
    smtpPassword: z.string().min(1).max(255),
    encryption: z.enum(["tls", "ssl", "none"]),
    fromEmail: z.string().email(),
    fromName: z.string().min(1).max(100)
  }),
  backup: z.object({
    enabled: z.boolean(),
    frequency: z.enum(["hourly", "daily", "weekly", "monthly"]),
    retentionDays: z.number().min(7).max(3650),
    storageLocation: z.enum(["local", "cloud", "both"]),
    cloudProvider: z.string().optional()
  }),
  integrations: z.object({
    pos: z.object({
      enabled: z.boolean(),
      provider: z.string(),
      apiEndpoint: z.string().url(),
      apiKey: z.string()
    }),
    erp: z.object({
      enabled: z.boolean(),
      system: z.string(),
      endpoint: z.string().url()
    }),
    accounting: z.object({
      enabled: z.boolean(),
      system: z.string(),
      mode: z.enum(["realtime", "batch"])
    })
  }),
  features: z.object({
    advancedSearch: z.boolean(),
    realtimeNotifications: z.boolean(),
    mobileAccess: z.boolean(),
    offlineMode: z.boolean()
  }),
  performance: z.object({
    caching: z.object({
      enabled: z.boolean(),
      type: z.enum(["memory", "redis", "memcached"]),
      duration: z.number().min(60).max(86400)
    }),
    apiRateLimit: z.number().min(10).max(10000)
  })
});
```

---

## Testing Strategy

### Unit Tests

**Component Testing**:
```typescript
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CompanySettingsPage from "../page";

describe("Company Settings", () => {
  it("renders all tabs", () => {
    render(<CompanySettingsPage />);
    expect(screen.getByText("General Information")).toBeInTheDocument();
    expect(screen.getByText("Branding")).toBeInTheDocument();
    expect(screen.getByText("Operational Settings")).toBeInTheDocument();
  });

  it("updates company name", () => {
    render(<CompanySettingsPage />);
    const input = screen.getByLabelText("Company Name");
    fireEvent.change(input, { target: { value: "New Company" } });
    expect(input).toHaveValue("New Company");
  });

  it("enables save button on changes", () => {
    render(<CompanySettingsPage />);
    const saveButton = screen.getByText("Save Changes");
    expect(saveButton).toBeDisabled();

    const input = screen.getByLabelText("Company Name");
    fireEvent.change(input, { target: { value: "New Company" } });
    expect(saveButton).not.toBeDisabled();
  });
});
```

**Password Strength Testing**:
```typescript
describe("Password Strength Calculator", () => {
  it("calculates weak password strength", () => {
    const settings = {
      minLength: 6,
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSpecialChars: false
    };
    const strength = getPasswordStrength(settings);
    expect(strength.label).toBe("Weak");
  });

  it("calculates strong password strength", () => {
    const settings = {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    };
    const strength = getPasswordStrength(settings);
    expect(strength.label).toBe("Strong");
  });
});
```

### Integration Tests

**API Integration Testing**:
```typescript
describe("Settings API", () => {
  it("saves company settings", async () => {
    const settings: CompanySettings = {
      general: {
        companyName: "Test Company",
        // ... other fields
      },
      // ... other sections
    };

    await SettingsAPI.updateCompanySettings(settings);
    const retrieved = await SettingsAPI.getCompanySettings();
    expect(retrieved.general.companyName).toBe("Test Company");
  });

  it("tests email configuration", async () => {
    const result = await SettingsAPI.testEmail("test@example.com");
    expect(result.deliveryTime).toBeLessThan(5000);
  });
});
```

### End-to-End Tests

**Settings Workflow Testing**:
```typescript
import { test, expect } from "@playwright/test";

test.describe("General Settings E2E", () => {
  test("complete company settings workflow", async ({ page }) => {
    await page.goto("/system-administration/settings/company");

    // Update company name
    await page.fill("#company-name", "New Company Name");

    // Switch to branding tab
    await page.click('button[value="branding"]');

    // Update primary color
    await page.fill("#primary-color", "#FF0000");

    // Save changes
    await page.click("button:has-text('Save Changes')");

    // Verify toast notification
    await expect(page.getByText("Settings Saved")).toBeVisible();
  });

  test("security settings with 2FA", async ({ page }) => {
    await page.goto("/system-administration/settings/security");

    // Enable 2FA
    await page.click("#2fa-enabled");

    // Set required
    await page.click("#2fa-required");

    // Select methods
    await page.check("#method-authenticator");
    await page.check("#method-sms");

    // Save
    await page.click("button:has-text('Save Changes')");

    // Verify warning
    await expect(page.getByText("Security Warning")).toBeVisible();
  });
});
```

---

## Performance Optimization

### Code Splitting

```typescript
// Lazy load tab content
import dynamic from "next/dynamic";

const GeneralInformationTab = dynamic(
  () => import("./components/general-information-tab"),
  { loading: () => <p>Loading...</p> }
);

const BrandingTab = dynamic(
  () => import("./components/branding-tab"),
  { loading: () => <p>Loading...</p> }
);
```

### Memoization

```typescript
import { useMemo } from "react";

const CompanySettings = () => {
  // Memoize password strength calculation
  const passwordStrength = useMemo(() => {
    return getPasswordStrength(settings.passwordPolicy);
  }, [settings.passwordPolicy]);

  // Memoize filtered options
  const filteredProviders = useMemo(() => {
    return emailProviders.filter(p => p.enabled);
  }, [emailProviders]);
};
```

### Debouncing

```typescript
import { useCallback } from "react";
import { debounce } from "lodash";

const debouncedSave = useCallback(
  debounce(async (settings: CompanySettings) => {
    await SettingsAPI.updateCompanySettings(settings);
  }, 1000),
  []
);
```

---

## Security Considerations

### Credential Management

```typescript
// Mask sensitive fields in UI
const maskCredential = (credential: string): string => {
  if (credential.length <= 4) return "****";
  return credential.substring(0, 2) + "****" + credential.substring(credential.length - 2);
};

// Example usage
<Input
  type="password"
  value={maskCredential(settings.email.smtpPassword)}
  placeholder="Enter SMTP password"
/>
```

### Permission Checks

```typescript
import { useUserContext } from "@/lib/context/user-context";

const SecuritySettingsPage = () => {
  const { hasPermission } = useUserContext();

  if (!hasPermission("system_administration.settings.security.manage")) {
    return <AccessDenied />;
  }

  // Rest of component
};
```

### Audit Logging

```typescript
// Log all settings changes
const logSettingsChange = async (
  userId: string,
  settingsType: string,
  changes: Record<string, any>
) => {
  await fetch("/api/audit/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      action: "settings_change",
      settingsType,
      changes,
      timestamp: new Date().toISOString(),
      ipAddress: req.headers["x-forwarded-for"] || req.connection.remoteAddress
    })
  });
};
```

---

## Best Practices

### 1. State Management
- Use controlled components for all form inputs
- Track changes with `hasChanges` flag
- Implement optimistic UI updates
- Reset state on cancel or discard

### 2. Error Handling
- Display user-friendly error messages
- Implement retry logic for failed saves
- Validate inputs on both client and server
- Show loading states during async operations

### 3. Accessibility
- Provide proper labels for all inputs
- Use semantic HTML
- Implement keyboard navigation
- Add ARIA attributes where needed

### 4. Performance
- Debounce input changes
- Lazy load tab content
- Memoize expensive calculations
- Use code splitting for large components

### 5. Security
- Validate all inputs on server
- Sanitize user inputs
- Mask sensitive credentials
- Implement permission checks
- Log all settings changes

---

## Related Documentation

- [General Settings Overview](/docs/documents/sa/features/general-settings/README.md)
- [General Settings Business Rules](/docs/documents/sa/features/general-settings/guides/business-rules.md)
- [Notification Settings](/docs/documents/sa/features/notification-settings/)
- [Type Definitions](/lib/types/settings.ts)
- [Mock Data](/lib/mock-data/settings.ts)

---

*Last updated: October 21, 2025*
