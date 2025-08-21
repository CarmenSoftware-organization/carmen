import vendorCurrencyPreferences from '@/lib/mock/price-management/vendor-currency-preferences.json';
import { CurrencyManagementService, Currency } from './currency-management-service';

export interface VendorCurrencyPreference {
  vendorId: string;
  vendorName: string;
  preferredCurrency: string;
  supportedCurrencies: string[];
  defaultCurrency: string;
  currencySettings: {
    allowMultipleCurrencies: boolean;
    requireCurrencySpecification: boolean;
    autoConvertToPreferred: boolean;
    displayOriginalCurrency: boolean;
  };
  priceSubmissionPreferences: {
    preferredSubmissionCurrency: string;
    acceptedCurrencies: string[];
    currencyConversionTolerance: number;
    requireExchangeRateConfirmation: boolean;
  };
  paymentPreferences: {
    invoiceCurrency: string;
    paymentCurrency: string;
    acceptMultiCurrencyPayments: boolean;
  };
  lastUpdated: string;
  updatedBy: string;
}

export interface CurrencyPreferenceTemplate {
  templateId: string;
  templateName: string;
  description: string;
  defaultSettings: {
    preferredCurrency: string;
    supportedCurrencies: string[];
    allowMultipleCurrencies: boolean;
    requireCurrencySpecification: boolean;
    autoConvertToPreferred: boolean;
    currencyConversionTolerance: number;
  };
  applicableRegions: string[];
  isActive: boolean;
}

export interface CurrencyPreferenceHistory {
  id: string;
  vendorId: string;
  changeType: string;
  previousSettings: any;
  newSettings: any;
  reason: string;
  changedBy: string;
  changeDate: string;
}

export interface VendorCurrencyValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export class VendorCurrencyPreferenceService {
  private static instance: VendorCurrencyPreferenceService;
  private currencyService: CurrencyManagementService;

  private constructor() {
    this.currencyService = CurrencyManagementService.getInstance();
  }

  public static getInstance(): VendorCurrencyPreferenceService {
    if (!VendorCurrencyPreferenceService.instance) {
      VendorCurrencyPreferenceService.instance = new VendorCurrencyPreferenceService();
    }
    return VendorCurrencyPreferenceService.instance;
  }

  /**
   * Get currency preferences for a specific vendor
   */
  async getVendorCurrencyPreferences(vendorId: string): Promise<VendorCurrencyPreference | null> {
    const preferences = vendorCurrencyPreferences.vendorCurrencyPreferences.find(
      pref => pref.vendorId === vendorId
    );

    return preferences || null;
  }

  /**
   * Get all vendor currency preferences
   */
  async getAllVendorCurrencyPreferences(): Promise<VendorCurrencyPreference[]> {
    return vendorCurrencyPreferences.vendorCurrencyPreferences;
  }

  /**
   * Update vendor currency preferences
   */
  async updateVendorCurrencyPreferences(
    vendorId: string,
    preferences: Partial<VendorCurrencyPreference>,
    updatedBy: string
  ): Promise<{ success: boolean; error?: string; preferences?: VendorCurrencyPreference }> {
    try {
      const existingPreferences = await this.getVendorCurrencyPreferences(vendorId);
      
      if (!existingPreferences) {
        return {
          success: false,
          error: 'Vendor currency preferences not found'
        };
      }

      // Validate the new preferences
      const validation = await this.validateCurrencyPreferences(vendorId, preferences);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Create updated preferences
      const updatedPreferences: VendorCurrencyPreference = {
        ...existingPreferences,
        ...preferences,
        lastUpdated: new Date().toISOString(),
        updatedBy
      };

      // In a real system, this would update the database
      console.log('Updated vendor currency preferences:', updatedPreferences);

      // Log the change to history
      await this.logPreferenceChange(
        vendorId,
        'preference_update',
        existingPreferences,
        updatedPreferences,
        'Manual preference update',
        updatedBy
      );

      return {
        success: true,
        preferences: updatedPreferences
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create new vendor currency preferences
   */
  async createVendorCurrencyPreferences(
    vendorId: string,
    vendorName: string,
    preferences: Partial<VendorCurrencyPreference>,
    createdBy: string,
    templateId?: string
  ): Promise<{ success: boolean; error?: string; preferences?: VendorCurrencyPreference }> {
    try {
      // Check if preferences already exist
      const existing = await this.getVendorCurrencyPreferences(vendorId);
      if (existing) {
        return {
          success: false,
          error: 'Currency preferences already exist for this vendor'
        };
      }

      // Apply template if specified
      let basePreferences: Partial<VendorCurrencyPreference> = {};
      if (templateId) {
        const template = await this.getCurrencyPreferenceTemplate(templateId);
        if (template) {
          basePreferences = this.applyTemplate(template);
        }
      }

      // Create new preferences
      const newPreferences: VendorCurrencyPreference = {
        vendorId,
        vendorName,
        preferredCurrency: 'USD',
        supportedCurrencies: ['USD'],
        defaultCurrency: 'USD',
        currencySettings: {
          allowMultipleCurrencies: true,
          requireCurrencySpecification: false,
          autoConvertToPreferred: false,
          displayOriginalCurrency: true
        },
        priceSubmissionPreferences: {
          preferredSubmissionCurrency: 'USD',
          acceptedCurrencies: ['USD'],
          currencyConversionTolerance: 2.0,
          requireExchangeRateConfirmation: false
        },
        paymentPreferences: {
          invoiceCurrency: 'USD',
          paymentCurrency: 'USD',
          acceptMultiCurrencyPayments: false
        },
        ...basePreferences,
        ...preferences,
        lastUpdated: new Date().toISOString(),
        updatedBy: createdBy
      };

      // Validate the new preferences
      const validation = await this.validateCurrencyPreferences(vendorId, newPreferences);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // In a real system, this would save to database
      console.log('Created vendor currency preferences:', newPreferences);

      return {
        success: true,
        preferences: newPreferences
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get currency preference templates
   */
  async getCurrencyPreferenceTemplates(): Promise<CurrencyPreferenceTemplate[]> {
    return vendorCurrencyPreferences.currencyPreferenceTemplates;
  }

  /**
   * Get specific currency preference template
   */
  async getCurrencyPreferenceTemplate(templateId: string): Promise<CurrencyPreferenceTemplate | null> {
    const template = vendorCurrencyPreferences.currencyPreferenceTemplates.find(
      t => t.templateId === templateId
    );

    return template || null;
  }

  /**
   * Apply template to create base preferences
   */
  private applyTemplate(template: CurrencyPreferenceTemplate): Partial<VendorCurrencyPreference> {
    return {
      preferredCurrency: template.defaultSettings.preferredCurrency,
      supportedCurrencies: template.defaultSettings.supportedCurrencies,
      defaultCurrency: template.defaultSettings.preferredCurrency,
      currencySettings: {
        allowMultipleCurrencies: template.defaultSettings.allowMultipleCurrencies,
        requireCurrencySpecification: template.defaultSettings.requireCurrencySpecification,
        autoConvertToPreferred: template.defaultSettings.autoConvertToPreferred,
        displayOriginalCurrency: true
      },
      priceSubmissionPreferences: {
        preferredSubmissionCurrency: template.defaultSettings.preferredCurrency,
        acceptedCurrencies: template.defaultSettings.supportedCurrencies,
        currencyConversionTolerance: template.defaultSettings.currencyConversionTolerance,
        requireExchangeRateConfirmation: false
      }
    };
  }

  /**
   * Validate currency preferences
   */
  async validateCurrencyPreferences(
    vendorId: string,
    preferences: Partial<VendorCurrencyPreference>
  ): Promise<VendorCurrencyValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Get supported currencies from system
    const supportedCurrencies = await this.currencyService.getSupportedCurrencies();
    const supportedCurrencyCodes = supportedCurrencies.map(c => c.code);

    // Validate preferred currency
    if (preferences.preferredCurrency && !supportedCurrencyCodes.includes(preferences.preferredCurrency)) {
      errors.push(`Preferred currency ${preferences.preferredCurrency} is not supported by the system`);
    }

    // Validate supported currencies
    if (preferences.supportedCurrencies) {
      const invalidCurrencies = preferences.supportedCurrencies.filter(
        currency => !supportedCurrencyCodes.includes(currency)
      );
      if (invalidCurrencies.length > 0) {
        errors.push(`Unsupported currencies: ${invalidCurrencies.join(', ')}`);
      }

      // Check if preferred currency is in supported currencies
      if (preferences.preferredCurrency && 
          !preferences.supportedCurrencies.includes(preferences.preferredCurrency)) {
        errors.push('Preferred currency must be included in supported currencies');
      }

      // Warn if too many currencies are supported
      if (preferences.supportedCurrencies.length > 5) {
        warnings.push('Supporting many currencies may complicate price management');
        recommendations.push('Consider limiting to 3-5 most commonly used currencies');
      }
    }

    // Validate currency conversion tolerance
    if (preferences.priceSubmissionPreferences?.currencyConversionTolerance !== undefined) {
      const tolerance = preferences.priceSubmissionPreferences.currencyConversionTolerance;
      if (tolerance < 0 || tolerance > 10) {
        errors.push('Currency conversion tolerance must be between 0% and 10%');
      } else if (tolerance > 5) {
        warnings.push('High conversion tolerance may lead to significant price variations');
      }
    }

    // Validate payment preferences
    if (preferences.paymentPreferences?.invoiceCurrency && 
        preferences.supportedCurrencies &&
        !preferences.supportedCurrencies.includes(preferences.paymentPreferences.invoiceCurrency)) {
      warnings.push('Invoice currency should be one of the supported currencies');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }

  /**
   * Get vendor's acceptable currencies for price submission
   */
  async getVendorAcceptableCurrencies(vendorId: string): Promise<Currency[]> {
    const preferences = await this.getVendorCurrencyPreferences(vendorId);
    
    if (!preferences) {
      // Return default USD if no preferences found
      const usdCurrency = await this.currencyService.getCurrency('USD');
      return usdCurrency ? [usdCurrency] : [];
    }

    const acceptedCurrencies = preferences.priceSubmissionPreferences.acceptedCurrencies;
    const currencies: Currency[] = [];

    for (const currencyCode of acceptedCurrencies) {
      const currency = await this.currencyService.getCurrency(currencyCode);
      if (currency) {
        currencies.push(currency);
      }
    }

    return currencies;
  }

  /**
   * Check if vendor accepts a specific currency
   */
  async isVendorCurrencyAcceptable(vendorId: string, currencyCode: string): Promise<boolean> {
    const preferences = await this.getVendorCurrencyPreferences(vendorId);
    
    if (!preferences) {
      return currencyCode === 'USD'; // Default to USD only
    }

    return preferences.priceSubmissionPreferences.acceptedCurrencies.includes(currencyCode);
  }

  /**
   * Get vendor's preferred currency for price display
   */
  async getVendorPreferredDisplayCurrency(vendorId: string): Promise<string> {
    const preferences = await this.getVendorCurrencyPreferences(vendorId);
    return preferences?.preferredCurrency || 'USD';
  }

  /**
   * Log preference changes to history
   */
  private async logPreferenceChange(
    vendorId: string,
    changeType: string,
    previousSettings: any,
    newSettings: any,
    reason: string,
    changedBy: string
  ): Promise<void> {
    const historyEntry: CurrencyPreferenceHistory = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      vendorId,
      changeType,
      previousSettings,
      newSettings,
      reason,
      changedBy,
      changeDate: new Date().toISOString()
    };

    // In a real system, this would save to database
    console.log('Currency preference change logged:', historyEntry);
  }

  /**
   * Get preference change history for a vendor
   */
  async getVendorPreferenceHistory(vendorId: string): Promise<CurrencyPreferenceHistory[]> {
    return vendorCurrencyPreferences.currencyPreferenceHistory.filter(
      history => history.vendorId === vendorId
    );
  }

  /**
   * Get system currency settings
   */
  async getSystemCurrencySettings(): Promise<any> {
    return vendorCurrencyPreferences.systemCurrencySettings;
  }

  /**
   * Recommend currency preferences based on vendor location/region
   */
  async recommendCurrencyPreferences(
    vendorRegion: string,
    vendorCountry: string
  ): Promise<{
    recommendedTemplate?: CurrencyPreferenceTemplate;
    recommendedCurrencies: string[];
    reasoning: string;
  }> {
    const templates = await this.getCurrencyPreferenceTemplates();
    
    // Find template that matches the region
    const matchingTemplate = templates.find(template => 
      template.applicableRegions.includes(vendorCountry) || 
      template.applicableRegions.includes(vendorRegion)
    );

    let recommendedCurrencies: string[] = ['USD']; // Default fallback
    let reasoning = 'Default USD recommendation';

    if (matchingTemplate) {
      recommendedCurrencies = matchingTemplate.defaultSettings.supportedCurrencies;
      reasoning = `Based on ${matchingTemplate.templateName} template for ${vendorRegion} region`;
    } else {
      // Provide region-specific recommendations
      switch (vendorRegion.toLowerCase()) {
        case 'europe':
        case 'eu':
          recommendedCurrencies = ['EUR', 'USD'];
          reasoning = 'European vendor - EUR primary with USD support';
          break;
        case 'asia':
        case 'asia-pacific':
          recommendedCurrencies = ['USD', 'JPY'];
          reasoning = 'Asia-Pacific vendor - USD primary with regional currency support';
          break;
        case 'north america':
        case 'na':
          recommendedCurrencies = ['USD', 'CAD'];
          reasoning = 'North American vendor - USD primary with CAD support';
          break;
        default:
          recommendedCurrencies = ['USD'];
          reasoning = 'Global standard - USD primary currency';
      }
    }

    return {
      recommendedTemplate: matchingTemplate,
      recommendedCurrencies,
      reasoning
    };
  }

  /**
   * Bulk update currency preferences for multiple vendors
   */
  async bulkUpdateCurrencyPreferences(
    updates: { vendorId: string; preferences: Partial<VendorCurrencyPreference> }[],
    updatedBy: string
  ): Promise<{
    successful: string[];
    failed: { vendorId: string; error: string }[];
  }> {
    const successful: string[] = [];
    const failed: { vendorId: string; error: string }[] = [];

    for (const update of updates) {
      const result = await this.updateVendorCurrencyPreferences(
        update.vendorId,
        update.preferences,
        updatedBy
      );

      if (result.success) {
        successful.push(update.vendorId);
      } else {
        failed.push({
          vendorId: update.vendorId,
          error: result.error || 'Unknown error'
        });
      }
    }

    return { successful, failed };
  }
}

export default VendorCurrencyPreferenceService;