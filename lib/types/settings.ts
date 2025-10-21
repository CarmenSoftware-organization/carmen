// Settings Types for Carmen ERP
// Comprehensive settings system for user preferences and system configuration

// ============================================================================
// Display & Regional Settings
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'pt' | 'it' | 'ru' | 'ko' | 'ar';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD.MM.YYYY';
export type TimeFormat = '12h' | '24h';
export type NumberFormat = 'en-US' | 'en-GB' | 'de-DE' | 'fr-FR' | 'es-ES' | 'ja-JP' | 'zh-CN';
export type FirstDayOfWeek = 'sunday' | 'monday' | 'saturday';

export interface DisplaySettings {
  theme: ThemeMode;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  compactMode: boolean;
  showAnimations: boolean;
  sidebarCollapsed: boolean;
}

export interface RegionalSettings {
  language: Language;
  timezone: string; // IANA timezone identifier (e.g., 'America/New_York')
  currency: string; // ISO 4217 currency code (e.g., 'USD')
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  numberFormat: NumberFormat;
  firstDayOfWeek: FirstDayOfWeek;
}

// ============================================================================
// Notification Settings
// ============================================================================

export type NotificationChannel = 'email' | 'in-app' | 'sms' | 'push';
export type NotificationEventType =
  | 'purchase-request-submitted'
  | 'purchase-request-approved'
  | 'purchase-request-rejected'
  | 'purchase-order-created'
  | 'purchase-order-approved'
  | 'goods-received'
  | 'invoice-received'
  | 'payment-due'
  | 'low-stock-alert'
  | 'stock-count-required'
  | 'workflow-assignment'
  | 'comment-mention'
  | 'document-shared'
  | 'price-update'
  | 'vendor-update'
  | 'system-maintenance'
  | 'security-alert';

export interface NotificationPreference {
  eventType: NotificationEventType;
  channels: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
    push: boolean;
  };
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  enabled: boolean;
}

export interface NotificationSettings {
  preferences: NotificationPreference[];
  emailDigest: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:mm format
  };
  doNotDisturb: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  };
  soundEnabled: boolean;
  desktopNotifications: boolean;
}

// ============================================================================
// Default Views & Preferences
// ============================================================================

export interface DefaultViews {
  landingPage: string; // Route path (e.g., '/dashboard')
  listPageSize: 10 | 25 | 50 | 100;
  defaultFilterView: 'all' | 'my-items' | 'department' | 'location';
  dashboardWidgets: string[]; // Widget IDs to display
  favoritePages: string[]; // Pinned/favorite page routes
}

export interface AccessibilitySettings {
  screenReaderOptimized: boolean;
  keyboardNavigationHints: boolean;
  focusIndicatorEnhanced: boolean;
  reduceMotion: boolean;
  audioDescriptions: boolean;
}

// ============================================================================
// User Preferences (Individual User Settings)
// ============================================================================

export interface UserPreferences {
  id: string;
  userId: string;
  display: DisplaySettings;
  regional: RegionalSettings;
  notifications: NotificationSettings;
  defaultViews: DefaultViews;
  accessibility: AccessibilitySettings;
  updatedAt: Date;
  createdAt: Date;
}

// ============================================================================
// Company Settings (Organization-wide)
// ============================================================================

export interface CompanySettings {
  id: string;

  // Basic Information
  companyName: string;
  legalName: string;
  taxId: string;
  registrationNumber: string;

  // Contact Information
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  website: string;

  // Branding
  logo: {
    url: string;
    darkUrl?: string; // Optional dark mode logo
    faviconUrl?: string;
  };
  primaryColor: string; // Hex color code
  secondaryColor: string;

  // Business Settings
  industry: string;
  fiscalYearStart: string; // MM-DD format
  defaultCurrency: string; // ISO 4217 currency code
  defaultTimezone: string; // IANA timezone identifier
  defaultLanguage: Language;

  // Operating Hours
  operatingHours: {
    [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: {
      open: boolean;
      start: string; // HH:mm format
      end: string; // HH:mm format
    };
  };

  // Multi-location/Department
  multiLocation: boolean;
  multiDepartment: boolean;

  updatedAt: Date;
  updatedBy: string; // User ID
  createdAt: Date;
}

// ============================================================================
// Security Settings
// ============================================================================

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number; // Number of previous passwords to check
  expiryDays: number; // 0 = never expires
  complexityScore: number; // Minimum password strength score (0-4)
}

export interface SessionSettings {
  timeout: number; // Minutes of inactivity before logout
  maxConcurrentSessions: number; // Max simultaneous sessions per user
  rememberMeEnabled: boolean;
  rememberMeDuration: number; // Days
}

export interface TwoFactorSettings {
  enabled: boolean;
  required: boolean; // Mandatory for all users
  requiredForRoles: string[]; // Role IDs that require 2FA
  methods: {
    authenticatorApp: boolean;
    sms: boolean;
    email: boolean;
  };
}

export interface IPAccessControl {
  enabled: boolean;
  whitelist: string[]; // IP addresses or CIDR ranges
  blacklist: string[]; // IP addresses or CIDR ranges
  allowVPN: boolean;
}

export interface SecuritySettings {
  id: string;

  passwordPolicy: PasswordPolicy;
  sessionSettings: SessionSettings;
  twoFactor: TwoFactorSettings;
  ipAccessControl: IPAccessControl;

  // Security Features
  loginAttempts: {
    maxAttempts: number;
    lockoutDuration: number; // Minutes
    resetAfter: number; // Minutes
  };

  securityQuestions: {
    enabled: boolean;
    required: boolean;
    minQuestions: number;
  };

  // Audit & Compliance
  auditLogging: {
    enabled: boolean;
    events: string[]; // Event types to log
    retentionDays: number;
  };

  dataEncryption: {
    atRest: boolean;
    inTransit: boolean;
  };

  updatedAt: Date;
  updatedBy: string; // User ID
  createdAt: Date;
}

// ============================================================================
// Application Settings
// ============================================================================

export interface EmailConfiguration {
  enabled: boolean;
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'custom';

  // SMTP Settings
  smtp: {
    host: string;
    port: number;
    secure: boolean; // Use TLS
    username: string;
    password: string; // Encrypted
  };

  // Sender Settings
  fromEmail: string;
  fromName: string;
  replyToEmail: string;

  // Advanced
  maxRetries: number;
  retryDelay: number; // Seconds
  batchSize: number;

  // Templates
  useCustomTemplates: boolean;
  templatePath: string;
}

export interface BackupSettings {
  enabled: boolean;
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    time: string; // HH:mm format
    dayOfWeek?: number; // 0-6 for weekly backups
    dayOfMonth?: number; // 1-31 for monthly backups
  };

  retention: {
    keepDaily: number; // Days
    keepWeekly: number; // Weeks
    keepMonthly: number; // Months
  };

  storage: {
    type: 'local' | 's3' | 'azure' | 'gcp';
    path: string;
    encrypted: boolean;
  };

  includeAttachments: boolean;
  compressionEnabled: boolean;
  notifyOnComplete: boolean;
  notifyOnFailure: boolean;
}

export interface DataRetentionSettings {
  documents: {
    purchaseRequests: number; // Days, 0 = indefinite
    purchaseOrders: number;
    invoices: number;
    receipts: number;
  };

  logs: {
    auditLogs: number;
    systemLogs: number;
    errorLogs: number;
  };

  archived: {
    autoArchiveAfter: number; // Days
    deleteArchivedAfter: number; // Days, 0 = never
  };
}

export interface IntegrationSettings {
  api: {
    enabled: boolean;
    rateLimiting: {
      enabled: boolean;
      requestsPerMinute: number;
      requestsPerHour: number;
    };
    allowedOrigins: string[]; // CORS origins
  };

  webhooks: {
    enabled: boolean;
    endpoints: {
      url: string;
      events: string[];
      secret: string; // Signing secret
      enabled: boolean;
    }[];
  };

  thirdParty: {
    posSystem: {
      enabled: boolean;
      provider: string;
      apiKey: string; // Encrypted
      syncInterval: number; // Minutes
    };

    accounting: {
      enabled: boolean;
      provider: string;
      apiKey: string; // Encrypted
      syncInterval: number; // Minutes
    };
  };
}

export interface ApplicationSettings {
  id: string;

  email: EmailConfiguration;
  backup: BackupSettings;
  dataRetention: DataRetentionSettings;
  integrations: IntegrationSettings;

  // System Features
  features: {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    guestAccessEnabled: boolean;
    apiAccessEnabled: boolean;
  };

  // Performance
  performance: {
    cacheEnabled: boolean;
    cacheTTL: number; // Seconds
    sessionStorage: 'memory' | 'redis' | 'database';
    compressionEnabled: boolean;
  };

  updatedAt: Date;
  updatedBy: string; // User ID
  createdAt: Date;
}

// ============================================================================
// Settings Update DTOs
// ============================================================================

export interface UpdateUserPreferencesDTO {
  display?: Partial<DisplaySettings>;
  regional?: Partial<RegionalSettings>;
  notifications?: Partial<NotificationSettings>;
  defaultViews?: Partial<DefaultViews>;
  accessibility?: Partial<AccessibilitySettings>;
}

export interface UpdateCompanySettingsDTO {
  companyName?: string;
  legalName?: string;
  taxId?: string;
  address?: Partial<CompanySettings['address']>;
  phone?: string;
  email?: string;
  website?: string;
  logo?: Partial<CompanySettings['logo']>;
  primaryColor?: string;
  secondaryColor?: string;
  fiscalYearStart?: string;
  defaultCurrency?: string;
  defaultTimezone?: string;
  defaultLanguage?: Language;
}

export interface UpdateSecuritySettingsDTO {
  passwordPolicy?: Partial<PasswordPolicy>;
  sessionSettings?: Partial<SessionSettings>;
  twoFactor?: Partial<TwoFactorSettings>;
  ipAccessControl?: Partial<IPAccessControl>;
}

export interface UpdateApplicationSettingsDTO {
  email?: Partial<EmailConfiguration>;
  backup?: Partial<BackupSettings>;
  dataRetention?: Partial<DataRetentionSettings>;
  integrations?: Partial<IntegrationSettings>;
  features?: Partial<ApplicationSettings['features']>;
  performance?: Partial<ApplicationSettings['performance']>;
}

// ============================================================================
// Settings Response Types
// ============================================================================

export interface SettingsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface SettingsValidationResult {
  valid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

// ============================================================================
// Email Test Types
// ============================================================================

export interface EmailTestRequest {
  to: string;
  subject: string;
  body: string;
}

export interface EmailTestResponse {
  success: boolean;
  message: string;
  details?: {
    responseCode: number;
    responseMessage: string;
    messageId?: string;
  };
  error?: string;
}

// ============================================================================
// System Notification Settings (Admin Level)
// ============================================================================

export interface RoleNotificationDefaults {
  roleId: string;
  roleName: string;
  eventDefaults: NotificationPreference[];
}

export interface TemplateVariable {
  name: string;
  description: string;
  example: string;
  required: boolean;
}

export interface EmailTemplate {
  id: string;
  eventType: NotificationEventType;
  name: string;
  description: string;
  language: Language;
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: TemplateVariable[];
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

export interface RoutingCondition {
  field: string; // e.g., 'documentValue', 'department', 'urgency'
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains';
  value: any;
}

export interface RoutingAction {
  type: 'notify' | 'escalate' | 'skip';
  recipientType: 'user' | 'role' | 'department' | 'webhook';
  recipient: string;
  delay?: number; // Delay in minutes before escalation
  channels?: NotificationChannel[];
}

export interface NotificationRoutingRule {
  id: string;
  name: string;
  eventType: NotificationEventType;
  conditions: RoutingCondition[];
  actions: RoutingAction[];
  priority: number;
  enabled: boolean;
}

export interface EscalationStage {
  level: number;
  delayMinutes: number;
  recipientRole: string;
  channels: NotificationChannel[];
  condition: 'unacknowledged' | 'unresolved';
}

export interface EscalationPolicy {
  id: string;
  name: string;
  description?: string;
  eventType: NotificationEventType;
  stages: EscalationStage[];
  enabled: boolean;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  secret: string;
  eventTypes: NotificationEventType[];
  enabled: boolean;
  headers?: Record<string, string>;
}

export interface DeliverySettings {
  rateLimiting: {
    enabled: boolean;
    perUserPerHour: number;
    organizationPerHour: number;
  };
  retryPolicy: {
    maxRetries: number;
    initialDelaySeconds: number;
    backoffMultiplier: number;
  };
  batching: {
    enabled: boolean;
    windowMinutes: number;
    maxBatchSize: number;
  };
  channels: {
    email: { enabled: boolean; quotaPerDay?: number; };
    sms: { enabled: boolean; quotaPerDay?: number; provider?: string; apiKey?: string; };
    push: { enabled: boolean; quotaPerDay?: number; fcmKey?: string; apnsKey?: string; };
    webhook: { enabled: boolean; endpoints: WebhookEndpoint[]; };
  };
}

export interface NotificationLog {
  id: string;
  timestamp: Date;
  eventType: NotificationEventType;
  recipientId: string;
  recipientEmail: string;
  channel: NotificationChannel;
  status: 'sent' | 'failed' | 'pending' | 'retrying' | 'bounced' | 'opened' | 'clicked';
  templateId: string;
  metadata: any;
  retryCount: number;
  errorMessage?: string;
  sentAt: Date;
  recipient: string;
  subject?: string;
  attempts: number;
  maxAttempts?: number;
}

export interface SystemNotificationSettings {
  id: string;
  globalDefaults: NotificationPreference[];
  roleDefaults: RoleNotificationDefaults[];
  emailTemplates: EmailTemplate[];
  routingRules: NotificationRoutingRule[];
  escalationPolicies: EscalationPolicy[];
  deliverySettings: DeliverySettings;
  updatedAt: Date;
  updatedBy: string;
}
