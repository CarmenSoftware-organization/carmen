import { NextRequest, NextResponse } from 'next/server';
import { CurrencyManagementService } from '@/lib/services/currency-management-service';
import { CurrencyConversionService } from '@/lib/services/currency-conversion-service';
import { PriceNormalizationService } from '@/lib/services/price-normalization-service';
import { VendorCurrencyPreferenceService } from '@/lib/services/vendor-currency-preference-service';
import { ExchangeRateAutomationService } from '@/lib/services/exchange-rate-automation-service';

const currencyService = CurrencyManagementService.getInstance();
const conversionService = CurrencyConversionService.getInstance();
const normalizationService = PriceNormalizationService.getInstance();
const preferenceService = VendorCurrencyPreferenceService.getInstance();
const automationService = ExchangeRateAutomationService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const vendorId = searchParams.get('vendorId');
    const fromCurrency = searchParams.get('fromCurrency');
    const toCurrency = searchParams.get('toCurrency');
    const amount = searchParams.get('amount');

    switch (action) {
      case 'currencies':
        const currencies = await currencyService.getSupportedCurrencies();
        return NextResponse.json({ success: true, data: currencies });

      case 'exchange-rates':
        const rates = await currencyService.getCurrentExchangeRates();
        return NextResponse.json({ success: true, data: rates });

      case 'exchange-rate':
        if (!fromCurrency || !toCurrency) {
          return NextResponse.json(
            { success: false, error: 'fromCurrency and toCurrency are required' },
            { status: 400 }
          );
        }
        const rate = await currencyService.getExchangeRate(fromCurrency, toCurrency);
        return NextResponse.json({ success: true, data: rate });

      case 'convert':
        if (!amount || !fromCurrency || !toCurrency) {
          return NextResponse.json(
            { success: false, error: 'amount, fromCurrency, and toCurrency are required' },
            { status: 400 }
          );
        }
        const conversion = await currencyService.convertCurrency(
          parseFloat(amount),
          fromCurrency,
          toCurrency
        );
        return NextResponse.json({ success: true, data: conversion });

      case 'vendor-preferences':
        if (!vendorId) {
          return NextResponse.json(
            { success: false, error: 'vendorId is required' },
            { status: 400 }
          );
        }
        const preferences = await preferenceService.getVendorCurrencyPreferences(vendorId);
        return NextResponse.json({ success: true, data: preferences });

      case 'vendor-acceptable-currencies':
        if (!vendorId) {
          return NextResponse.json(
            { success: false, error: 'vendorId is required' },
            { status: 400 }
          );
        }
        const acceptableCurrencies = await preferenceService.getVendorAcceptableCurrencies(vendorId);
        return NextResponse.json({ success: true, data: acceptableCurrencies });

      case 'rate-history':
        if (!fromCurrency || !toCurrency) {
          return NextResponse.json(
            { success: false, error: 'fromCurrency and toCurrency are required' },
            { status: 400 }
          );
        }
        const days = parseInt(searchParams.get('days') || '30');
        const history = await currencyService.getExchangeRateHistory(fromCurrency, toCurrency, days);
        return NextResponse.json({ success: true, data: history });

      case 'conversion-history':
        const conversionHistory = conversionService.getConversionHistory(
          fromCurrency || undefined,
          toCurrency || undefined,
          parseInt(searchParams.get('limit') || '100')
        );
        return NextResponse.json({ success: true, data: conversionHistory });

      case 'rate-alerts':
        const hours = parseInt(searchParams.get('hours') || '24');
        const alerts = conversionService.getRateChangeAlerts(hours);
        return NextResponse.json({ success: true, data: alerts });

      case 'conversion-stats':
        const currencyPair = searchParams.get('currencyPair');
        const stats = conversionService.getConversionStatistics(currencyPair || undefined);
        return NextResponse.json({ success: true, data: stats });

      case 'automation-schedules':
        const schedules = await automationService.getUpdateSchedules();
        return NextResponse.json({ success: true, data: schedules });

      case 'automation-history':
        const limit = parseInt(searchParams.get('limit') || '50');
        const updateHistory = await automationService.getUpdateHistory(limit);
        return NextResponse.json({ success: true, data: updateHistory });

      case 'automation-notifications':
        const unreadOnly = searchParams.get('unreadOnly') === 'true';
        const notifications = await automationService.getNotifications(unreadOnly);
        return NextResponse.json({ success: true, data: notifications });

      case 'automation-stats':
        const statsDays = parseInt(searchParams.get('days') || '30');
        const automationStats = await automationService.getUpdateStatistics(statsDays);
        return NextResponse.json({ success: true, data: automationStats });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Multi-currency API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'convert-with-tracking':
        const { amount, fromCurrency, toCurrency, requestId } = body;
        if (!amount || !fromCurrency || !toCurrency) {
          return NextResponse.json(
            { success: false, error: 'amount, fromCurrency, and toCurrency are required' },
            { status: 400 }
          );
        }
        const conversionResult = await conversionService.convertWithTracking(
          amount,
          fromCurrency,
          toCurrency,
          requestId
        );
        return NextResponse.json({ success: true, data: conversionResult });

      case 'batch-convert':
        const { requests } = body;
        if (!Array.isArray(requests)) {
          return NextResponse.json(
            { success: false, error: 'requests array is required' },
            { status: 400 }
          );
        }
        const batchResults = await conversionService.batchConvert(requests);
        return NextResponse.json({ success: true, data: batchResults });

      case 'normalize-prices':
        const { priceItems, options } = body;
        if (!Array.isArray(priceItems)) {
          return NextResponse.json(
            { success: false, error: 'priceItems array is required' },
            { status: 400 }
          );
        }
        const comparisons = await normalizationService.createPriceComparison(priceItems, options);
        return NextResponse.json({ success: true, data: comparisons });

      case 'update-vendor-preferences':
        const { vendorId, preferences, updatedBy } = body;
        if (!vendorId || !preferences || !updatedBy) {
          return NextResponse.json(
            { success: false, error: 'vendorId, preferences, and updatedBy are required' },
            { status: 400 }
          );
        }
        const updateResult = await preferenceService.updateVendorCurrencyPreferences(
          vendorId,
          preferences,
          updatedBy
        );
        return NextResponse.json({ success: true, data: updateResult });

      case 'create-vendor-preferences':
        const { vendorId: newVendorId, vendorName, preferences: newPreferences, createdBy, templateId } = body;
        if (!newVendorId || !vendorName || !createdBy) {
          return NextResponse.json(
            { success: false, error: 'vendorId, vendorName, and createdBy are required' },
            { status: 400 }
          );
        }
        const createResult = await preferenceService.createVendorCurrencyPreferences(
          newVendorId,
          vendorName,
          newPreferences || {},
          createdBy,
          templateId
        );
        return NextResponse.json({ success: true, data: createResult });

      case 'trigger-rate-update':
        const { currencyPairs } = body;
        const manualUpdateResult = await automationService.triggerManualUpdate(currencyPairs);
        return NextResponse.json({ success: true, data: manualUpdateResult });

      case 'execute-scheduled-updates':
        const scheduledResults = await automationService.executeScheduledUpdates();
        return NextResponse.json({ success: true, data: scheduledResults });

      case 'create-update-schedule':
        const { schedule } = body;
        if (!schedule) {
          return NextResponse.json(
            { success: false, error: 'schedule object is required' },
            { status: 400 }
          );
        }
        const newSchedule = await automationService.createUpdateSchedule(schedule);
        return NextResponse.json({ success: true, data: newSchedule });

      case 'update-automation-settings':
        const { settings } = body;
        if (!settings) {
          return NextResponse.json(
            { success: false, error: 'settings object is required' },
            { status: 400 }
          );
        }
        const updatedSettings = await automationService.updateAutomationSettings(settings);
        return NextResponse.json({ success: true, data: updatedSettings });

      case 'mark-notification-read':
        const { notificationId } = body;
        if (!notificationId) {
          return NextResponse.json(
            { success: false, error: 'notificationId is required' },
            { status: 400 }
          );
        }
        const markResult = await automationService.markNotificationAsRead(notificationId);
        return NextResponse.json({ success: true, data: { marked: markResult } });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Multi-currency API POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'update-schedule':
        const { scheduleId, updates } = body;
        if (!scheduleId || !updates) {
          return NextResponse.json(
            { success: false, error: 'scheduleId and updates are required' },
            { status: 400 }
          );
        }
        const updatedSchedule = await automationService.updateSchedule(scheduleId, updates);
        return NextResponse.json({ success: true, data: updatedSchedule });

      case 'set-rate-threshold':
        const { fromCurrency, toCurrency, threshold } = body;
        if (!fromCurrency || !toCurrency || threshold === undefined) {
          return NextResponse.json(
            { success: false, error: 'fromCurrency, toCurrency, and threshold are required' },
            { status: 400 }
          );
        }
        conversionService.setRateChangeThreshold(fromCurrency, toCurrency, threshold);
        return NextResponse.json({ success: true, data: { message: 'Threshold updated successfully' } });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Multi-currency API PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const scheduleId = searchParams.get('scheduleId');

    switch (action) {
      case 'delete-schedule':
        if (!scheduleId) {
          return NextResponse.json(
            { success: false, error: 'scheduleId is required' },
            { status: 400 }
          );
        }
        const deleteResult = await automationService.deleteSchedule(scheduleId);
        return NextResponse.json({ success: true, data: { deleted: deleteResult } });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Multi-currency API DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}