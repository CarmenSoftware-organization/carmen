# Static Analysis Report
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
Generated: 2025-07-25T12:05:58.397Z

## ESLint Analysis
```

> carmen@0.1.0 analyze:lint
> eslint . --ext .ts,.tsx


```

## TypeScript Type Checking
```

> carmen@0.1.0 analyze:types
> tsc --noEmit

app/(main)/vendor-management/pricelists/[id]/edit/page.tsx(71,3): error TS2322: Type 'null' is not assignable to type 'Date | undefined'.
app/(main)/vendor-management/templates/lib/excel-generator.ts(564,19): error TS2339: Property 'selectionType' does not exist on type 'ProductSelection'.
app/(main)/vendor-management/vendors/[id]/edit/page.tsx(28,8): error TS2306: File '/Users/peak/Documents/GitHub/carmen/lib/types/vendor-price-management.ts' is not a module.
app/(main)/vendor-management/vendors/[id]/edit/page.tsx(107,15): error TS7006: Parameter 'prev' implicitly has an 'any' type.
app/(main)/vendor-management/vendors/[id]/edit/page.tsx(334,43): error TS7006: Parameter 'status' implicitly has an 'any' type.
app/(main)/vendor-management/vendors/[id]/edit/page.tsx(412,46): error TS7006: Parameter 'currency' implicitly has an 'any' type.
app/(main)/vendor-management/vendors/[id]/page.tsx(24,8): error TS2306: File '/Users/peak/Documents/GitHub/carmen/lib/types/vendor-price-management.ts' is not a module.
app/(main)/vendor-management/vendors/[id]/page.tsx(25,10): error TS2305: Module '"@/lib/utils"' has no exported member 'formatDate'.
app/(main)/vendor-management/vendors/[id]/page.tsx(225,47): error TS7006: Parameter 'status' implicitly has an 'any' type.
app/(main)/vendor-management/vendors/[id]/page.tsx(265,51): error TS7006: Parameter 'category' implicitly has an 'any' type.
app/(main)/vendor-management/vendors/[id]/pricelist-settings/page.tsx(27,8): error TS2306: File '/Users/peak/Documents/GitHub/carmen/lib/types/vendor-price-management.ts' is not a module.
app/(main)/vendor-management/vendors/[id]/pricelist-settings/page.tsx(106,17): error TS7006: Parameter 'prev' implicitly has an 'any' type.
app/(main)/vendor-management/vendors/[id]/pricelist-settings/page.tsx(330,46): error TS7006: Parameter 'currency' implicitly has an 'any' type.
app/(main)/vendor-management/vendors/new/page.tsx(30,8): error TS2306: File '/Users/peak/Documents/GitHub/carmen/lib/types/vendor-price-management.ts' is not a module.
app/(main)/vendor-management/vendors/new/page.tsx(100,17): error TS7006: Parameter 'prev' implicitly has an 'any' type.
app/(main)/vendor-management/vendors/new/page.tsx(304,43): error TS7006: Parameter 'status' implicitly has an 'any' type.
app/(main)/vendor-management/vendors/new/page.tsx(382,46): error TS7006: Parameter 'currency' implicitly has an 'any' type.
app/(main)/vendor-management/vendors/page.tsx(43,8): error TS2306: File '/Users/peak/Documents/GitHub/carmen/lib/types/vendor-price-management.ts' is not a module.
app/(main)/vendor-management/vendors/page.tsx(44,10): error TS2305: Module '"@/lib/utils"' has no exported member 'formatDate'.
app/(main)/vendor-management/vendors/page.tsx(250,35): error TS7006: Parameter 'status' implicitly has an 'any' type.
app/(main)/vendor-management/vendors/page.tsx(383,71): error TS7006: Parameter 'category' implicitly has an 'any' type.
app/(main)/vendor-management/vendors/page.tsx(430,22): error TS2741: Property 'href' is missing in type '{ onClick: () => void; className: string; }' but required in type 'InternalLinkProps'.
app/(main)/vendor-management/vendors/page.tsx(451,26): error TS2741: Property 'href' is missing in type '{ children: number; isActive: boolean; onClick: () => void; }' but required in type 'InternalLinkProps'.
app/(main)/vendor-management/vendors/page.tsx(467,26): error TS2741: Property 'href' is missing in type '{ children: number; onClick: () => void; }' but required in type 'InternalLinkProps'.
app/(main)/vendor-management/vendors/page.tsx(475,22): error TS2741: Property 'href' is missing in type '{ onClick: () => void; className: string; }' but required in type 'InternalLinkProps'.
app/api/price-management/email-processing/route.ts(93,28): error TS2339: Property 'find' does not exist on type '{ vendors: { id: string; baseVendorId: string; priceCollectionPreferences: { preferredCurrency: string; defaultLeadTime: number; communicationLanguage: string; notificationPreferences: { ...; }; }; ... 5 more ...; createdBy: string; }[]; }'.
app/api/price-management/email-processing/route.ts(93,33): error TS7006: Parameter 'v' implicitly has an 'any' type.
app/api/price-management/route.ts(43,39): error TS2339: Property 'length' does not exist on type '{ vendors: { id: string; baseVendorId: string; priceCollectionPreferences: { preferredCurrency: string; defaultLeadTime: number; communicationLanguage: string; notificationPreferences: { ...; }; }; ... 5 more ...; createdBy: string; }[]; }'.
app/api/price-management/route.ts(44,40): error TS2339: Property 'filter' does not exist on type '{ vendors: { id: string; baseVendorId: string; priceCollectionPreferences: { preferredCurrency: string; defaultLeadTime: number; communicationLanguage: string; notificationPreferences: { ...; }; }; ... 5 more ...; createdBy: string; }[]; }'.
app/api/price-management/route.ts(44,47): error TS7006: Parameter 'v' implicitly has an 'any' type.
app/api/price-management/templates/download/[templateId]/route.ts(36,24): error TS2339: Property 'find' does not exist on type '{ vendors: { id: string; baseVendorId: string; priceCollectionPreferences: { preferredCurrency: string; defaultLeadTime: number; communicationLanguage: string; notificationPreferences: { ...; }; }; ... 5 more ...; createdBy: string; }[]; }'.
app/api/price-management/templates/download/[templateId]/route.ts(36,29): error TS7006: Parameter 'v' implicitly has an 'any' type.
app/api/price-management/vendors/route.ts(9,61): error TS2306: File '/Users/peak/Documents/GitHub/carmen/lib/types/vendor-price-management.ts' is not a module.
lib/middleware/__tests__/price-management-auth.test.ts(60,34): error TS2352: Conversion of type '{ headers: Map<any, any>; cookies?: RequestCookies | undefined; geo?: { city?: string | undefined; country?: string | undefined; region?: string | undefined; latitude?: string | undefined; longitude?: string | undefined; } | undefined; ... 25 more ...; text?: (() => Promise<string>) | undefined; }' to type 'NextRequest' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of property 'headers' are incompatible.
    Type 'Map<any, any>' is missing the following properties from type 'Headers': append, getSetCookie
lib/middleware/__tests__/price-management-auth.test.ts(214,29): error TS2352: Conversion of type '{ headers: Map<string, string>; nextUrl: { pathname: string; }; cookies?: RequestCookies | undefined; geo?: { city?: string | undefined; country?: string | undefined; region?: string | undefined; latitude?: string | undefined; longitude?: string | undefined; } | undefined; ... 24 more ...; text?: (() => Promise<stri...' to type 'NextRequest' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of property 'nextUrl' are incompatible.
    Type '{ pathname: string; }' is missing the following properties from type 'NextURL': analyze, formatPathname, formatSearch, buildId, and 18 more.
lib/middleware/__tests__/price-management-auth.test.ts(239,29): error TS2352: Conversion of type '{ headers: Map<string, string>; nextUrl: { pathname: string; }; cookies?: RequestCookies | undefined; geo?: { city?: string | undefined; country?: string | undefined; region?: string | undefined; latitude?: string | undefined; longitude?: string | undefined; } | undefined; ... 24 more ...; text?: (() => Promise<stri...' to type 'NextRequest' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of property 'nextUrl' are incompatible.
    Type '{ pathname: string; }' is missing the following properties from type 'NextURL': analyze, formatPathname, formatSearch, buildId, and 18 more.
lib/middleware/__tests__/price-management-auth.test.ts(280,32): error TS2352: Conversion of type '{ headers: Map<string, string>; cookies?: RequestCookies | undefined; geo?: { city?: string | undefined; country?: string | undefined; region?: string | undefined; latitude?: string | undefined; longitude?: string | undefined; } | undefined; ... 25 more ...; text?: (() => Promise<string>) | undefined; }' to type 'NextRequest' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of property 'headers' are incompatible.
    Type 'Map<string, string>' is missing the following properties from type 'Headers': append, getSetCookie
lib/middleware/__tests__/price-management-auth.test.ts(303,28): error TS2352: Conversion of type '{ headers: Map<string, string>; cookies?: RequestCookies | undefined; geo?: { city?: string | undefined; country?: string | undefined; region?: string | undefined; latitude?: string | undefined; longitude?: string | undefined; } | undefined; ... 25 more ...; text?: (() => Promise<string>) | undefined; }' to type 'NextRequest' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of property 'headers' are incompatible.
    Type 'Map<string, string>' is missing the following properties from type 'Headers': append, getSetCookie
lib/middleware/__tests__/price-management-auth.test.ts(326,23): error TS2352: Conversion of type '{ headers: Map<string, string>; }' to type 'NextRequest' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ headers: Map<string, string>; }' is missing the following properties from type 'NextRequest': cookies, geo, ip, nextUrl, and 24 more.
lib/middleware/__tests__/price-management-auth.test.ts(351,23): error TS2352: Conversion of type '{ headers: Map<string, string>; }' to type 'NextRequest' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ headers: Map<string, string>; }' is missing the following properties from type 'NextRequest': cookies, geo, ip, nextUrl, and 24 more.
lib/middleware/__tests__/price-management-auth.test.ts(385,14): error TS7053: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ id: string; publicField: string; sensitiveData: string; confidentialInfo: string; } | { id: string; publicField: string; sensitiveData: string; confidentialInfo: string; }[]'.
  Property '0' does not exist on type '{ id: string; publicField: string; sensitiveData: string; confidentialInfo: string; } | { id: string; publicField: string; sensitiveData: string; confidentialInfo: string; }[]'.
lib/middleware/__tests__/price-management-auth.test.ts(386,14): error TS7053: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ id: string; publicField: string; sensitiveData: string; confidentialInfo: string; } | { id: string; publicField: string; sensitiveData: string; confidentialInfo: string; }[]'.
  Property '0' does not exist on type '{ id: string; publicField: string; sensitiveData: string; confidentialInfo: string; } | { id: string; publicField: string; sensitiveData: string; confidentialInfo: string; }[]'.
lib/middleware/__tests__/price-management-auth.test.ts(387,14): error TS7053: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ id: string; publicField: string; sensitiveData: string; confidentialInfo: string; } | { id: string; publicField: string; sensitiveData: string; confidentialInfo: string; }[]'.
  Property '0' does not exist on type '{ id: string; publicField: string; sensitiveData: string; confidentialInfo: string; } | { id: string; publicField: string; sensitiveData: string; confidentialInfo: string; }[]'.
lib/middleware/__tests__/price-management-auth.test.ts(388,14): error TS7053: Element implicitly has an 'any' type because expression of type '0' can't be used to index type '{ id: string; publicField: string; sensitiveData: string; confidentialInfo: string; } | { id: string; publicField: string; sensitiveData: string; confidentialInfo: string; }[]'.
  Property '0' does not exist on type '{ id: string; publicField: string; sensitiveData: string; confidentialInfo: string; } | { id: string; publicField: string; sensitiveData: string; confidentialInfo: string; }[]'.
lib/middleware/__tests__/price-management-auth.test.ts(405,27): error TS2339: Property 'publicField' does not exist on type '{ id: string; publicField: string; sensitiveData: string; } | { id: string; publicField: string; sensitiveData: string; }[]'.
  Property 'publicField' does not exist on type '{ id: string; publicField: string; sensitiveData: string; }[]'.
lib/middleware/__tests__/price-management-auth.test.ts(406,27): error TS2339: Property 'id' does not exist on type '{ id: string; publicField: string; sensitiveData: string; } | { id: string; publicField: string; sensitiveData: string; }[]'.
  Property 'id' does not exist on type '{ id: string; publicField: string; sensitiveData: string; }[]'.
lib/middleware/__tests__/price-management-auth.test.ts(424,23): error TS2352: Conversion of type '{ headers: Map<string, string>; }' to type 'NextRequest' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ headers: Map<string, string>; }' is missing the following properties from type 'NextRequest': cookies, geo, ip, nextUrl, and 24 more.
lib/middleware/__tests__/price-management-auth.test.ts(436,23): error TS2352: Conversion of type '{ headers: Map<any, any>; }' to type 'NextRequest' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ headers: Map<any, any>; }' is missing the following properties from type 'NextRequest': cookies, geo, ip, nextUrl, and 24 more.
lib/services/__tests__/currency-management-service.test.ts(95,21): error TS2339: Property 'success' does not exist on type '{ updated: number; errors: string[]; }'.
lib/services/__tests__/currency-management-service.test.ts(96,21): error TS2339: Property 'updatedCount' does not exist on type '{ updated: number; errors: string[]; }'.
lib/services/__tests__/excel-template-service.test.ts(41,65): error TS2345: Argument of type 'string[]' is not assignable to parameter of type 'string'.
lib/services/__tests__/excel-template-service.test.ts(44,21): error TS2339: Property 'length' does not exist on type 'TemplateGenerationResult'.
lib/services/__tests__/excel-template-service.test.ts(48,65): error TS2345: Argument of type 'string[]' is not assignable to parameter of type 'string'.
lib/services/__tests__/excel-template-service.test.ts(55,57): error TS2345: Argument of type 'never[]' is not assignable to parameter of type 'string'.
lib/services/__tests__/excel-template-service.test.ts(59,63): error TS2345: Argument of type 'string[]' is not assignable to parameter of type 'string'.
lib/services/__tests__/excel-template-service.test.ts(68,36): error TS2339: Property 'processTemplate' does not exist on type 'ExcelTemplateService'.
lib/services/__tests__/excel-template-service.test.ts(79,36): error TS2339: Property 'processTemplate' does not exist on type 'ExcelTemplateService'.
lib/services/__tests__/excel-template-service.test.ts(89,36): error TS2339: Property 'processTemplate' does not exist on type 'ExcelTemplateService'.
lib/services/__tests__/excel-template-service.test.ts(92,35): error TS7006: Parameter 'error' implicitly has an 'any' type.
lib/services/__tests__/excel-template-service.test.ts(101,40): error TS2339: Property 'validateTemplate' does not exist on type 'ExcelTemplateService'.
lib/services/__tests__/excel-template-service.test.ts(111,40): error TS2339: Property 'validateTemplate' does not exist on type 'ExcelTemplateService'.
lib/services/__tests__/excel-template-service.test.ts(120,40): error TS2339: Property 'validateTemplate' does not exist on type 'ExcelTemplateService'.
lib/services/__tests__/excel-template-service.test.ts(123,39): error TS7006: Parameter 'error' implicitly has an 'any' type.
lib/services/__tests__/excel-template-service.test.ts(130,37): error TS2339: Property 'getTemplateHistory' does not exist on type 'ExcelTemplateService'.
lib/services/__tests__/excel-template-service.test.ts(134,25): error TS7006: Parameter 'entry' implicitly has an 'any' type.
lib/services/__tests__/excel-template-service.test.ts(143,37): error TS2339: Property 'getTemplateHistory' does not exist on type 'ExcelTemplateService'.
lib/services/__tests__/excel-template-service.test.ts(150,37): error TS2339: Property 'getSubmissionHistory' does not exist on type 'ExcelTemplateService'.
lib/services/__tests__/excel-template-service.test.ts(154,25): error TS7006: Parameter 'entry' implicitly has an 'any' type.
lib/services/__tests__/excel-template-service.test.ts(166,42): error TS2339: Property 'downloadTemplate' does not exist on type 'ExcelTemplateService'.
lib/services/__tests__/excel-template-service.test.ts(175,28): error TS2339: Property 'downloadTemplate' does not exist on type 'ExcelTemplateService'.
lib/services/__tests__/excel-template-service.test.ts(187,30): error TS2339: Property 'parseExcelData' does not exist on type 'ExcelTemplateService'.
lib/services/__tests__/excel-template-service.test.ts(197,30): error TS2339: Property 'parseExcelData' does not exist on type 'ExcelTemplateService'.
lib/services/__tests__/excel-template-service.test.ts(207,28): error TS2339: Property 'parseExcelData' does not exist on type 'ExcelTemplateService'.
lib/services/__tests__/notification-service.test.ts(51,36): error TS2339: Property 'sendPriceCollectionInvitation' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(72,28): error TS2339: Property 'sendPriceCollectionInvitation' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(90,28): error TS2339: Property 'sendPriceCollectionInvitation' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(121,36): error TS2339: Property 'sendPriceExpirationWarning' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(136,28): error TS2339: Property 'sendPriceExpirationWarning' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(159,36): error TS2339: Property 'sendSubmissionConfirmation' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(186,36): error TS2339: Property 'sendSubmissionConfirmation' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(211,36): error TS2339: Property 'sendPriceAssignmentNotification' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(226,33): error TS2339: Property 'processTemplate' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(238,33): error TS2339: Property 'processTemplate' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(244,33): error TS2339: Property 'processTemplate' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(250,33): error TS2339: Property 'processTemplate' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(264,24): error TS2339: Property 'validateEmail' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(278,24): error TS2339: Property 'validateEmail' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(298,36): error TS2339: Property 'queueNotifications' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(305,21): error TS2339: Property 'queueNotifications' does not exist on type 'NotificationService'.
lib/services/__tests__/notification-service.test.ts(313,36): error TS2339: Property 'processNotificationQueue' does not exist on type 'NotificationService'.
lib/services/__tests__/price-assignment-engine.test.ts(69,35): error TS2339: Property 'assignOptimalPrice' does not exist on type 'PriceAssignmentEngine'.
lib/services/__tests__/price-assignment-engine.test.ts(92,27): error TS2339: Property 'assignOptimalPrice' does not exist on type 'PriceAssignmentEngine'.
lib/services/__tests__/price-assignment-engine.test.ts(107,35): error TS2339: Property 'assignOptimalPrice' does not exist on type 'PriceAssignmentEngine'.
lib/services/__tests__/price-assignment-engine.test.ts(125,41): error TS2339: Property 'getAlternativeOptions' does not exist on type 'PriceAssignmentEngine'.
lib/services/__tests__/price-assignment-engine.test.ts(129,28): error TS7006: Parameter 'option' implicitly has an 'any' type.
lib/services/__tests__/price-assignment-engine.test.ts(150,41): error TS2339: Property 'getAlternativeOptions' does not exist on type 'PriceAssignmentEngine'.
lib/services/__tests__/price-assignment-engine.test.ts(169,27): error TS2339: Property 'overrideAssignment' does not exist on type 'PriceAssignmentEngine'.
lib/services/__tests__/price-assignment-engine.test.ts(182,27): error TS2339: Property 'overrideAssignment' does not exist on type 'PriceAssignmentEngine'.
lib/services/__tests__/price-assignment-engine.test.ts(188,36): error TS2339: Property 'getAssignmentHistory' does not exist on type 'PriceAssignmentEngine'.
lib/services/__tests__/price-assignment-engine.test.ts(192,25): error TS7006: Parameter 'entry' implicitly has an 'any' type.
lib/services/__tests__/price-assignment-engine.test.ts(201,36): error TS2339: Property 'getAssignmentHistory' does not exist on type 'PriceAssignmentEngine'.
lib/services/__tests__/price-assignment-engine.test.ts(221,33): error TS2339: Property 'calculateConfidenceScore' does not exist on type 'PriceAssignmentEngine'.
lib/services/__tests__/price-assignment-engine.test.ts(247,42): error TS2339: Property 'calculateConfidenceScore' does not exist on type 'PriceAssignmentEngine'.
lib/services/__tests__/price-assignment-engine.test.ts(248,40): error TS2339: Property 'calculateConfidenceScore' does not exist on type 'PriceAssignmentEngine'.
lib/services/__tests__/price-validation-engine.test.ts(1,10): error TS2300: Duplicate identifier 'it'.
lib/services/__tests__/price-validation-engine.test.ts(2,10): error TS2300: Duplicate identifier 'it'.
lib/services/__tests__/price-validation-engine.test.ts(3,10): error TS2300: Duplicate identifier 'it'.
lib/services/__tests__/price-validation-engine.test.ts(4,10): error TS2300: Duplicate identifier 'it'.
lib/services/__tests__/price-validation-engine.test.ts(5,10): error TS2300: Duplicate identifier 'it'.
lib/services/__tests__/price-validation-engine.test.ts(6,10): error TS2300: Duplicate identifier 'describe'.
lib/services/__tests__/price-validation-engine.test.ts(7,10): error TS2300: Duplicate identifier 'describe'.
lib/services/__tests__/price-validation-engine.test.ts(35,7): error TS2304: Cannot find name 'expect'.
lib/services/__tests__/price-validation-engine.test.ts(36,7): error TS2304: Cannot find name 'expect'.
lib/services/__tests__/price-validation-engine.test.ts(37,7): error TS2304: Cannot find name 'expect'.
lib/services/__tests__/price-validation-engine.test.ts(63,7): error TS2304: Cannot find name 'expect'.
lib/services/__tests__/price-validation-engine.test.ts(64,7): error TS2304: Cannot find name 'expect'.
lib/services/__tests__/price-validation-engine.test.ts(65,7): error TS2304: Cannot find name 'expect'.
lib/services/__tests__/price-validation-engine.test.ts(91,7): error TS2304: Cannot find name 'expect'.
lib/services/__tests__/price-validation-engine.test.ts(92,7): error TS2304: Cannot find name 'expect'.
lib/services/__tests__/price-validation-engine.test.ts(127,7): error TS2304: Cannot find name 'expect'.
lib/services/__tests__/price-validation-engine.test.ts(128,7): error TS2304: Cannot find name 'expect'.
lib/services/__tests__/price-validation-engine.test.ts(154,7): error TS2304: Cannot find name 'expect'.
lib/services/__tests__/price-validation-engine.test.ts(155,7): error TS2304: Cannot find name 'expect'.
lib/services/__tests__/price-validation-engine.test.ts(156,7): error TS2304: Cannot find name 'expect'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(64,54): error TS2345: Argument of type 'VendorPriceOption[]' is not assignable to parameter of type 'PriceAssignmentContext'.
  Type 'VendorPriceOption[]' is missing the following properties from type 'PriceAssignmentContext': prItemId, productId, categoryId, quantity, and 4 more.
lib/services/__tests__/vendor-selection-algorithm.test.ts(67,66): error TS2339: Property 'vendorId' does not exist on type 'Promise<VendorSelectionResult>'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(86,54): error TS2345: Argument of type 'VendorPriceOption[]' is not assignable to parameter of type 'PriceAssignmentContext'.
  Type 'VendorPriceOption[]' is missing the following properties from type 'PriceAssignmentContext': prItemId, productId, categoryId, quantity, and 4 more.
lib/services/__tests__/vendor-selection-algorithm.test.ts(87,23): error TS2339: Property 'rating' does not exist on type 'Promise<VendorSelectionResult>'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(92,54): error TS2345: Argument of type 'VendorPriceOption[]' is not assignable to parameter of type 'PriceAssignmentContext'.
  Type 'VendorPriceOption[]' is missing the following properties from type 'PriceAssignmentContext': prItemId, productId, categoryId, quantity, and 4 more.
lib/services/__tests__/vendor-selection-algorithm.test.ts(95,23): error TS2339: Property 'vendorId' does not exist on type 'Promise<VendorSelectionResult>'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(110,54): error TS2345: Argument of type 'VendorPriceOption[]' is not assignable to parameter of type 'PriceAssignmentContext'.
  Type 'VendorPriceOption[]' is missing the following properties from type 'PriceAssignmentContext': prItemId, productId, categoryId, quantity, and 4 more.
lib/services/__tests__/vendor-selection-algorithm.test.ts(111,23): error TS2339: Property 'availability' does not exist on type 'Promise<VendorSelectionResult>'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(122,50): error TS2345: Argument of type 'VendorPriceOption[]' is not assignable to parameter of type 'PriceAssignmentContext'.
  Type 'VendorPriceOption[]' is missing the following properties from type 'PriceAssignmentContext': prItemId, productId, categoryId, quantity, and 4 more.
lib/services/__tests__/vendor-selection-algorithm.test.ts(129,31): error TS2339: Property 'calculateVendorScore' does not exist on type 'VendorSelectionAlgorithm'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(136,40): error TS2339: Property 'calculateVendorScore' does not exist on type 'VendorSelectionAlgorithm'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(137,43): error TS2339: Property 'calculateVendorScore' does not exist on type 'VendorSelectionAlgorithm'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(145,40): error TS2339: Property 'calculateVendorScore' does not exist on type 'VendorSelectionAlgorithm'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(146,41): error TS2339: Property 'calculateVendorScore' does not exist on type 'VendorSelectionAlgorithm'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(154,34): error TS2339: Property 'filterEligibleVendors' does not exist on type 'VendorSelectionAlgorithm'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(156,24): error TS7006: Parameter 'vendor' implicitly has an 'any' type.
lib/services/__tests__/vendor-selection-algorithm.test.ts(163,34): error TS2339: Property 'filterEligibleVendors' does not exist on type 'VendorSelectionAlgorithm'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(165,24): error TS7006: Parameter 'vendor' implicitly has an 'any' type.
lib/services/__tests__/vendor-selection-algorithm.test.ts(177,34): error TS2339: Property 'filterEligibleVendors' does not exist on type 'VendorSelectionAlgorithm'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(184,32): error TS2339: Property 'sortVendorsByScore' does not exist on type 'VendorSelectionAlgorithm'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(187,40): error TS2339: Property 'calculateVendorScore' does not exist on type 'VendorSelectionAlgorithm'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(188,41): error TS2339: Property 'calculateVendorScore' does not exist on type 'VendorSelectionAlgorithm'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(199,32): error TS2339: Property 'sortVendorsByScore' does not exist on type 'VendorSelectionAlgorithm'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(208,32): error TS2339: Property 'getSelectionReason' does not exist on type 'VendorSelectionAlgorithm'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(217,32): error TS2339: Property 'getSelectionReason' does not exist on type 'VendorSelectionAlgorithm'.
lib/services/__tests__/vendor-selection-algorithm.test.ts(230,50): error TS2345: Argument of type 'never[]' is not assignable to parameter of type 'PriceAssignmentContext'.
  Type 'never[]' is missing the following properties from type 'PriceAssignmentContext': prItemId, productId, categoryId, quantity, and 4 more.
lib/services/__tests__/vendor-selection-algorithm.test.ts(236,54): error TS2345: Argument of type 'VendorPriceOption[]' is not assignable to parameter of type 'PriceAssignmentContext'.
  Type 'VendorPriceOption[]' is missing the following properties from type 'PriceAssignmentContext': prItemId, productId, categoryId, quantity, and 4 more.
lib/services/__tests__/vendor-selection-algorithm.test.ts(244,54): error TS2345: Argument of type 'VendorPriceOption[]' is not assignable to parameter of type 'PriceAssignmentContext'.
  Type 'VendorPriceOption[]' is missing the following properties from type 'PriceAssignmentContext': prItemId, productId, categoryId, quantity, and 4 more.
lib/services/__tests__/vendor-selection-algorithm.test.ts(245,23): error TS2339: Property 'price' does not exist on type 'Promise<VendorSelectionResult>'.
lib/services/campaign-management-service.ts(363,34): error TS2339: Property 'find' does not exist on type '{ vendors: { id: string; baseVendorId: string; priceCollectionPreferences: { preferredCurrency: string; defaultLeadTime: number; communicationLanguage: string; notificationPreferences: { ...; }; }; ... 5 more ...; createdBy: string; }[]; }'.
lib/services/campaign-management-service.ts(363,39): error TS7006: Parameter 'v' implicitly has an 'any' type.
lib/services/vendor-price-management-service.ts(14,8): error TS2306: File '/Users/peak/Documents/GitHub/carmen/lib/types/vendor-price-management.ts' is not a module.
lib/services/vendor-price-management-service.ts(84,36): error TS7006: Parameter 'obj' implicitly has an 'any' type.
lib/services/vendor-price-management-service.ts(84,41): error TS7006: Parameter 'key' implicitly has an 'any' type.
lib/services/vendor-price-management-service.ts(85,36): error TS7006: Parameter 'obj' implicitly has an 'any' type.
lib/services/vendor-price-management-service.ts(85,41): error TS7006: Parameter 'key' implicitly has an 'any' type.
lib/services/vendor-price-management-service.ts(87,22): error TS7053: Element implicitly has an 'any' type because expression of type 'string | number | symbol' can't be used to index type '{ id: string; baseVendorId: string; priceCollectionPreferences: { preferredCurrency: string; defaultLeadTime: number; communicationLanguage: string; notificationPreferences: { emailReminders: boolean; reminderFrequency: string; escalationEnabled: boolean; escalationDays: number; preferredContactTime: string; }; }; ....'.
  No index signature with a parameter of type 'string' was found on type '{ id: string; baseVendorId: string; priceCollectionPreferences: { preferredCurrency: string; defaultLeadTime: number; communicationLanguage: string; notificationPreferences: { emailReminders: boolean; reminderFrequency: string; escalationEnabled: boolean; escalationDays: number; preferredContactTime: string; }; }; ....'.
lib/services/vendor-price-management-service.ts(88,22): error TS7053: Element implicitly has an 'any' type because expression of type 'string | number | symbol' can't be used to index type '{ id: string; baseVendorId: string; priceCollectionPreferences: { preferredCurrency: string; defaultLeadTime: number; communicationLanguage: string; notificationPreferences: { emailReminders: boolean; reminderFrequency: string; escalationEnabled: boolean; escalationDays: number; preferredContactTime: string; }; }; ....'.
  No index signature with a parameter of type 'string' was found on type '{ id: string; baseVendorId: string; priceCollectionPreferences: { preferredCurrency: string; defaultLeadTime: number; communicationLanguage: string; notificationPreferences: { emailReminders: boolean; reminderFrequency: string; escalationEnabled: boolean; escalationDays: number; preferredContactTime: string; }; }; ....'.
lib/utils/vendor-validation.ts(17,8): error TS2306: File '/Users/peak/Documents/GitHub/carmen/lib/types/vendor-price-management.ts' is not a module.
lib/utils/vendor-validation.ts(467,50): error TS7006: Parameter 'item' implicitly has an 'any' type.
lib/utils/vendor-validation.ts(471,52): error TS7006: Parameter 'item' implicitly has an 'any' type.
lib/utils/vendor-validation.ts(480,41): error TS7006: Parameter 'item' implicitly has an 'any' type.
lib/utils/vendor-validation.ts(482,53): error TS7006: Parameter 'item' implicitly has an 'any' type.
temp_history_section.tsx(1,10): error TS2304: Cannot find name 'TabsContent'.
temp_history_section.tsx(4,14): error TS2304: Cannot find name 'Card'.
temp_history_section.tsx(5,16): error TS2304: Cannot find name 'CardHeader'.
temp_history_section.tsx(6,18): error TS2304: Cannot find name 'CardTitle'.
temp_history_section.tsx(7,20): error TS2304: Cannot find name 'Clock'.
temp_history_section.tsx(9,19): error TS2304: Cannot find name 'CardTitle'.
temp_history_section.tsx(10,18): error TS2304: Cannot find name 'CardDescription'.
temp_history_section.tsx(12,19): error TS2304: Cannot find name 'CardDescription'.
temp_history_section.tsx(13,17): error TS2304: Cannot find name 'CardHeader'.
temp_history_section.tsx(14,16): error TS2304: Cannot find name 'CardContent'.
temp_history_section.tsx(20,26): error TS2304: Cannot find name 'CheckCircle2'.
temp_history_section.tsx(24,38): error TS2304: Cannot find name 'mockPricelistDetail'.
temp_history_section.tsx(24,83): error TS2304: Cannot find name 'mockPricelistDetail'.
temp_history_section.tsx(27,41): error TS2304: Cannot find name 'mockPricelistDetail'.
temp_history_section.tsx(35,26): error TS2304: Cannot find name 'Upload'.
temp_history_section.tsx(39,39): error TS2304: Cannot find name 'mockPricelistDetail'.
temp_history_section.tsx(39,85): error TS2304: Cannot find name 'mockPricelistDetail'.
temp_history_section.tsx(42,33): error TS2304: Cannot find name 'mockPricelistDetail'.
temp_history_section.tsx(50,26): error TS2304: Cannot find name 'FileText'.
temp_history_section.tsx(54,55): error TS2304: Cannot find name 'mockPricelistDetail'.
temp_history_section.tsx(62,17): error TS2304: Cannot find name 'CardContent'.
temp_history_section.tsx(63,15): error TS2304: Cannot find name 'Card'.
temp_history_section.tsx(66,14): error TS2304: Cannot find name 'Card'.
temp_history_section.tsx(67,16): error TS2304: Cannot find name 'CardHeader'.
temp_history_section.tsx(68,18): error TS2304: Cannot find name 'CardTitle'.
temp_history_section.tsx(69,20): error TS2304: Cannot find name 'TrendingUp'.
temp_history_section.tsx(71,19): error TS2304: Cannot find name 'CardTitle'.
temp_history_section.tsx(72,18): error TS2304: Cannot find name 'CardDescription'.
temp_history_section.tsx(74,19): error TS2304: Cannot find name 'CardDescription'.
temp_history_section.tsx(75,17): error TS2304: Cannot find name 'CardHeader'.
temp_history_section.tsx(76,16): error TS2304: Cannot find name 'CardContent'.
temp_history_section.tsx(107,73): error TS2304: Cannot find name 'mockPricelistDetail'.
temp_history_section.tsx(108,69): error TS2304: Cannot find name 'mockPricelistDetail'.
temp_history_section.tsx(109,72): error TS2304: Cannot find name 'mockPricelistDetail'.
temp_history_section.tsx(109,106): error TS2304: Cannot find name 'mockPricelistDetail'.
temp_history_section.tsx(113,17): error TS2304: Cannot find name 'CardContent'.
temp_history_section.tsx(114,15): error TS2304: Cannot find name 'Card'.
temp_history_section.tsx(116,11): error TS2304: Cannot find name 'TabsContent'.
tests/e2e/price-assignment-flow.e2e.test.ts(29,40): error TS2551: Property 'toContainText' does not exist on type 'Assertion<Locator>'. Did you mean 'toContain'?
tests/e2e/price-assignment-flow.e2e.test.ts(44,40): error TS2551: Property 'toContainText' does not exist on type 'Assertion<Locator>'. Did you mean 'toContain'?
tests/e2e/price-assignment-flow.e2e.test.ts(64,72): error TS2551: Property 'toContainText' does not exist on type 'Assertion<Locator>'. Did you mean 'toContain'?
tests/e2e/price-assignment-flow.e2e.test.ts(68,40): error TS2551: Property 'toContainText' does not exist on type 'Assertion<Locator>'. Did you mean 'toContain'?
tests/e2e/price-assignment-flow.e2e.test.ts(110,71): error TS2339: Property 'toBeVisible' does not exist on type 'Assertion<Locator>'.
tests/e2e/price-assignment-flow.e2e.test.ts(111,75): error TS2339: Property 'toBeVisible' does not exist on type 'Assertion<Locator>'.
tests/e2e/price-assignment-flow.e2e.test.ts(112,71): error TS2339: Property 'toBeVisible' does not exist on type 'Assertion<Locator>'.
tests/e2e/price-assignment-flow.e2e.test.ts(147,63): error TS2551: Property 'toContainText' does not exist on type 'Assertion<Locator>'. Did you mean 'toContain'?
tests/e2e/price-assignment-flow.e2e.test.ts(188,70): error TS2551: Property 'toContainText' does not exist on type 'Assertion<Locator>'. Did you mean 'toContain'?
tests/e2e/price-assignment-flow.e2e.test.ts(189,71): error TS2551: Property 'toContainText' does not exist on type 'Assertion<Locator>'. Did you mean 'toContain'?
tests/e2e/price-assignment-flow.e2e.test.ts(190,69): error TS2339: Property 'toBeVisible' does not exist on type 'Assertion<Locator>'.
tests/e2e/price-assignment-flow.e2e.test.ts(196,40): error TS2551: Property 'toContainText' does not exist on type 'Assertion<Locator>'. Did you mean 'toContain'?
tests/e2e/price-assignment-flow.e2e.test.ts(265,75): error TS2339: Property 'toBeVisible' does not exist on type 'Assertion<Locator>'.
tests/e2e/price-assignment-flow.e2e.test.ts(266,76): error TS2339: Property 'toBeVisible' does not exist on type 'Assertion<Locator>'.
tests/e2e/price-assignment-flow.e2e.test.ts(273,65): error TS2551: Property 'toContainText' does not exist on type 'Assertion<Locator>'. Did you mean 'toContain'?
tests/e2e/price-assignment-flow.e2e.test.ts(274,76): error TS2339: Property 'toBeVisible' does not exist on type 'Assertion<Locator>'.
tests/e2e/price-assignment-flow.e2e.test.ts(275,72): error TS2339: Property 'toBeVisible' does not exist on type 'Assertion<Locator>'.
tests/e2e/price-assignment-flow.e2e.test.ts(285,77): error TS2339: Property 'toBeVisible' does not exist on type 'Assertion<Locator>'.
tests/e2e/price-assignment-flow.e2e.test.ts(286,80): error TS2339: Property 'toBeVisible' does not exist on type 'Assertion<Locator>'.
tests/e2e/price-assignment-flow.e2e.test.ts(303,76): error TS2339: Property 'toBeVisible' does not exist on type 'Assertion<Locator>'.
tests/e2e/price-assignment-flow.e2e.test.ts(304,79): error TS2339: Property 'toBeVisible' does not exist on type 'Assertion<Locator>'.
tests/e2e/price-assignment-flow.e2e.test.ts(314,67): error TS2339: Property 'toBeVisible' does not exist on type 'Assertion<Locator>'.
tests/e2e/price-assignment-flow.e2e.test.ts(321,40): error TS2551: Property 'toContainText' does not exist on type 'Assertion<Locator>'. Did you mean 'toContain'?
tests/e2e/price-assignment-flow.e2e.test.ts(362,78): error TS2339: Property 'toBeVisible' does not exist on type 'Assertion<Locator>'.
tests/e2e/price-assignment-flow.e2e.test.ts(368,82): error TS2339: Property 'toBeVisible' does not exist on type 'Assertion<Locator>'.
tests/performance/concurrent-users.perf.test.ts(47,20): error TS18046: 'error' is of type 'unknown'.
tests/performance/concurrent-users.perf.test.ts(124,20): error TS18046: 'error' is of type 'unknown'.
tests/performance/concurrent-users.perf.test.ts(181,20): error TS18046: 'error' is of type 'unknown'.
tests/performance/concurrent-users.perf.test.ts(244,20): error TS18046: 'error' is of type 'unknown'.
tests/performance/concurrent-users.perf.test.ts(288,20): error TS18046: 'error' is of type 'unknown'.
tests/performance/concurrent-users.perf.test.ts(339,20): error TS18046: 'error' is of type 'unknown'.
tests/performance/concurrent-users.perf.test.ts(419,20): error TS18046: 'error' is of type 'unknown'.
tests/performance/large-file-processing.perf.test.ts(399,20): error TS18046: 'error' is of type 'unknown'.
tests/purchase-request.spec.ts(1,30): error TS2307: Cannot find module '@playwright/test' or its corresponding type declarations.
tests/purchase-request.spec.ts(4,28): error TS7031: Binding element 'page' implicitly has an 'any' type.
tests/purchase-request.spec.ts(9,55): error TS7031: Binding element 'page' implicitly has an 'any' type.
tests/purchase-request.spec.ts(21,47): error TS7031: Binding element 'page' implicitly has an 'any' type.
tests/purchase-request.spec.ts(31,56): error TS7031: Binding element 'page' implicitly has an 'any' type.
tests/purchase-request.spec.ts(40,64): error TS7031: Binding element 'page' implicitly has an 'any' type.
tests/purchase-request.spec.ts(54,52): error TS7031: Binding element 'page' implicitly has an 'any' type.

```

## Dependency Analysis
```

> carmen@0.1.0 analyze:deps
> depcheck

Unused dependencies
* @radix-ui/react-focus-scope
* @stagewise-plugins/react
* @tanstack/react-query
* add
* dotenv
* embla-carousel-react
* form
* framer-motion
* postgres
* shadcn
Unused devDependencies
* @typescript-eslint/eslint-plugin
* @typescript-eslint/parser
* eslint-config-next
* postcss
Missing dependencies
* @playwright/test: ./tests/purchase-request.spec.ts

```

## Dead Code Analysis
```

> carmen@0.1.0 analyze:dead
> ts-prune

middleware.ts:4 - middleware
middleware.ts:11 - config
tailwind.config.ts:92 - default
vitest.config.ts:4 - default
components/BulkActions.tsx:9 - BulkActions
components/button.tsx:35 - ButtonProps (used in module)
components/button.tsx:55 - Button (used in module)
components/button.tsx:55 - buttonVariants (used in module)
components/card.tsx:78 - Card (used in module)
components/card.tsx:78 - CardHeader (used in module)
components/card.tsx:78 - CardFooter (used in module)
components/card.tsx:78 - CardTitle (used in module)
components/card.tsx:78 - CardDescription (used in module)
components/card.tsx:78 - CardContent (used in module)
components/carmen-header.tsx:17 - CarmenHeader
components/category-management.tsx:209 - CategoryManagement
components/EditProfile.tsx:14 - default
components/goods-receive-note-table.tsx:44 - GoodsReceiveNoteTable
components/improved-goods-receive-note.tsx:42 - GoodsReceiveNoteComponent
components/input.tsx:4 - InputProps (used in module)
components/input.tsx:24 - Input (used in module)
components/item-details-edit-form.tsx:69 - ItemDetailsEditForm
components/item-details.tsx:27 - ItemDetailsComponent
components/login-form.tsx:15 - LoginForm
components/pr-items-table.tsx:57 - PrItemsTable
components/pricing-form.tsx:35 - PricingFormComponent
components/select.tsx:4 - SelectProps (used in module)
components/select.tsx:28 - Select (used in module)
components/Sidebar.tsx:283 - Sidebar (used in module)
components/theme-provider.tsx:16 - ThemeProvider (used in module)
components/vendor-comparison.tsx:46 - VendorComparisonComponent
contexts/AuthContext.tsx:15 - AuthProvider
contexts/AuthContext.tsx:30 - useAuth
hooks/use-toast.ts:77 - reducer (used in module)
hooks/use-toast.ts:194 - toast (used in module)
lib/create-safe-action.ts:3 - FieldErrors (used in module)
lib/create-safe-action.ts:7 - ActionState (used in module)
lib/create-safe-action.ts:13 - createSafeAction
lib/mockData.ts:1 - CountItem (used in module)
lib/types.ts:14 - Money (used in module)
lib/types.ts:21 - Currency
lib/types.ts:29 - ExchangeRate
lib/types.ts:60 - CostingMethod
lib/types.ts:66 - InventoryTransaction
lib/types.ts:81 - TransactionType (used in module)
lib/types.ts:256 - PurchaseOrderLine
lib/types.ts:270 - POLineStatus (used in module)
lib/types.ts:277 - PurchaseRequest_1
lib/types.ts:646 - JournalEntryTotal (used in module)
lib/types.ts:753 - WorkflowAction
lib/types.ts:755 - ItemDetail (used in module)
lib/types.ts:819 - ActionState
lib/types.ts:838 - Budget (used in module)
lib/types.ts:844 - ApprovalHistoryItem (used in module)
lib/types.ts:851 - PurchaseRequest_3
lib/utils.ts:8 - formatNumber
app/(main)/layout.tsx:3 - default
app/data/mock-products.ts:1 - Product (used in module)
app/data/mock-products.ts:39 - UnitConversion (used in module)
app/data/mock-products.ts:49 - StoreAssignment (used in module)
app/data/mock-products.ts:56 - productList
app/data/mock-recipes.ts:1 - Recipe (used in module)
app/data/mock-recipes.ts:16 - mockRecipes
app/lib/create-safe-action.ts:3 - FieldErrors (used in module)
app/lib/create-safe-action.ts:7 - ActionState (used in module)
app/lib/create-safe-action.ts:13 - createSafeAction
app/lib/history.ts:1 - HistoryEntry
app/lib/types.ts:1 - Address (used in module)
app/lib/types.ts:17 - Contact (used in module)
app/lib/types.ts:28 - EnvironmentalImpact (used in module)
app/lib/types.ts:36 - Certification (used in module)
app/lib/types.ts:44 - Vendor (used in module)
app/lib/types.ts:61 - InventoryInfo (used in module)
app/lib/types.ts:73 - PurchaseRequestItem
app/lib/types.ts:120 - Money (used in module)
app/lib/types.ts:125 - Currency (used in module)
app/lib/types.ts:127 - ProductStatus (used in module)
app/lib/types.ts:129 - TaxType (used in module)
app/lib/types.ts:131 - UnitType (used in module)
app/lib/types.ts:133 - StockStatus (used in module)
app/lib/types.ts:135 - InventoryUnit (used in module)
app/lib/types.ts:142 - UnitConversion (used in module)
app/lib/types.ts:148 - Product
app/lib/types.ts:181 - GoodsReceiveNoteItem
app/lib/utils.ts:1 - formatCurrency
app/pr-approval/loading.tsx:1 - default
app/receiving/loading.tsx:1 - default
app/spot-check/loading.tsx:1 - default
components/navigation/config.ts:1 - mainNavItems
components/order-management/enhanced-order-card.tsx:175 - default
components/purchase-orders/ColumnSelectionScreen.tsx:22 - ColumnSelectionScreenProps (used in module)
components/purchase-orders/ExportContext.tsx:24 - ExportProvider
components/purchase-orders/ExportSidepanel.tsx:18 - ExportSidepanel
components/purchase-orders/PrintOptionsSidepanel.tsx:15 - PrintOptionsSidepanel
components/templates/DialogPageTemplate.tsx:75 - default
components/templates/FormPageTemplate.tsx:36 - default
components/ui/alert-dialog.tsx:131 - AlertDialogPortal (used in module)
components/ui/alert-dialog.tsx:132 - AlertDialogOverlay (used in module)
components/ui/aspect-ratio.tsx:7 - AspectRatio (used in module)
components/ui/badge.tsx:26 - BadgeProps (used in module)
components/ui/badge.tsx:36 - badgeVariants (used in module)
components/ui/breadcrumb.tsx:113 - BreadcrumbEllipsis (used in module)
components/ui/calendar.tsx:10 - CalendarProps (used in module)
components/ui/command.tsx:144 - CommandDialog (used in module)
components/ui/command.tsx:145 - CommandInput (used in module)
components/ui/command.tsx:150 - CommandShortcut (used in module)
components/ui/command.tsx:151 - CommandSeparator (used in module)
components/ui/custom-dialog.tsx:114 - DialogPortal (used in module)
components/ui/custom-dialog.tsx:115 - DialogOverlay (used in module)
components/ui/date-picker.tsx:21 - DatePicker
components/ui/date-picker.tsx:14 - DatePickerProps (used in module)
components/ui/date-picker.tsx:54 - DateRangePickerProps (used in module)
components/ui/dialog.tsx:112 - DialogPortal (used in module)
components/ui/dialog.tsx:113 - DialogOverlay (used in module)
components/ui/dropdown-menu.tsx:193 - DropdownMenuShortcut (used in module)
components/ui/dropdown-menu.tsx:195 - DropdownMenuPortal (used in module)
components/ui/form.tsx:170 - useFormField (used in module)
components/ui/icon-button.tsx:11 - IconButton
components/ui/popover.tsx:33 - PopoverAnchor (used in module)
components/ui/select.tsx:155 - SelectSeparator (used in module)
components/ui/select.tsx:156 - SelectScrollUpButton (used in module)
components/ui/select.tsx:157 - SelectScrollDownButton (used in module)
components/ui/sheet.tsx:131 - SheetPortal (used in module)
components/ui/sheet.tsx:132 - SheetOverlay (used in module)
components/ui/table.tsx:115 - TableFooter (used in module)
components/ui/table.tsx:119 - TableCaption (used in module)
components/ui/textarea.tsx:5 - TextareaProps (used in module)
components/ui/toast.tsx:128 - ToastAction (used in module)
components/ui/toaster.tsx:13 - Toaster
components/ui/tooltip-provider.tsx:4 - TooltipProvider (used in module)
components/ui/tooltip-provider.tsx:12 - Tooltip
components/ui/tooltip-provider.tsx:12 - TooltipTrigger
components/ui/tooltip-provider.tsx:12 - TooltipContent
components/ui/use-toast copy.ts:77 - reducer (used in module)
components/ui/use-toast copy.ts:194 - useToast (used in module)
components/ui/use-toast copy.ts:194 - toast (used in module)
components/ui/use-toast.ts:77 - reducer (used in module)
components/ui/use-toast.ts:194 - useToast (used in module)
lib/api/goodsReceiveNote.ts:4 - getGoodsReceiveNoteById
lib/constants/categoryFields.ts:7 - DYNAMIC_FIELDS_BY_CATEGORY (used in module)
lib/hooks/use-price-management-permissions.ts:33 - usePermission (used in module)
lib/hooks/use-price-management-permissions.ts:71 - usePermissions
lib/hooks/use-price-management-permissions.ts:107 - useUIPermissions (used in module)
lib/hooks/use-price-management-permissions.ts:144 - usePermissionFilter
lib/hooks/use-price-management-permissions.ts:164 - usePriceOverridePermission (used in module)
lib/hooks/use-price-management-permissions.ts:193 - useAuditLogPermission (used in module)
lib/hooks/use-price-management-permissions.ts:222 - useBusinessRulesPermission
lib/hooks/use-price-management-permissions.ts:251 - useExportPermissions (used in module)
lib/hooks/use-price-management-permissions.ts:267 - useVendorPermissions
lib/hooks/use-price-management-permissions.ts:294 - usePriceAssignmentPermissions
lib/hooks/use-price-management-permissions.ts:318 - useAnalyticsPermissions
lib/hooks/use-price-management-permissions.ts:334 - useUserContext
lib/hooks/use-price-management-permissions.ts:379 - usePriceManagementPermissions
lib/middleware/price-management-auth.ts:19 - AuthenticatedRequest (used in module)
lib/middleware/price-management-auth.ts:23 - RouteConfig (used in module)
lib/mock/credit-notes.ts:3 - mockCreditNotes
lib/mock/hotel-data.ts:35 - mockLocations (used in module)
lib/mock/hotel-data.ts:237 - generateProductsForLocation (used in module)
lib/mock/hotel-data.ts:284 - mockProducts (used in module)
lib/mock/hotel-data.ts:289 - getLocationsByType
lib/mock/hotel-data.ts:293 - getProductsByCategory
lib/mock/hotel-data.ts:297 - getProductsByLocation
lib/mock/hotel-data.ts:301 - getLowStockProducts
lib/mock/hotel-data.ts:305 - getNearExpiryProducts
lib/mock/inventory-data.ts:3 - Department (used in module)
lib/mock/inventory-data.ts:666 - getCountsByDepartment
lib/mock/inventory-data.ts:670 - getCountsByType
lib/mock/inventory-data.ts:674 - getLocationsByType
lib/mock/inventory-data.ts:688 - getProductsByCategory
lib/mock/inventory-data.ts:692 - getLowStockProducts
lib/mock/inventory-data.ts:696 - getProductsNeedingCount
lib/mock/mock_goodsReceiveNotes.tsx:3 - mockStockMovements (used in module)
lib/mock/mock_goodsReceiveNotes.tsx:793 - mockJournalEntries (used in module)
lib/mock/mock_goodsReceiveNotes.tsx:851 - mockFinancialSummary (used in module)
lib/mock/mock_goodsReceiveNotes.tsx:878 - mockGoodsReceiveNote
lib/services/alternative-options-service.ts:12 - AlternativeOptionsService (used in module)
lib/services/assignment-audit-service.ts:12 - AssignmentAuditService (used in module)
lib/services/assignment-fallback-service.ts:12 - AssignmentFallbackService (used in module)
lib/services/assignment-reasoning-service.ts:12 - AssignmentReasoningService (used in module)
lib/services/automated-quality-service.ts:5 - QualityCheckConfig (used in module)
lib/services/automated-quality-service.ts:16 - QualityFlag (used in module)
lib/services/automated-quality-service.ts:32 - QualityAlert (used in module)
lib/services/automated-quality-service.ts:45 - QualityTrendAnalysis
lib/services/automated-quality-service.ts:69 - AnomalyDetection (used in module)
lib/services/automated-quality-service.ts:80 - AutomatedQualityService (used in module)
lib/services/comparative-analysis-service.ts:1 - VendorComparison (used in module)
lib/services/comparative-analysis-service.ts:19 - CategoryComparison (used in module)
lib/services/comparative-analysis-service.ts:39 - PriceComparison (used in module)
lib/services/comparative-analysis-service.ts:63 - MarketAnalysis (used in module)
lib/services/comparative-analysis-service.ts:89 - CompetitivePosition (used in module)
lib/services/comparative-analysis-service.ts:105 - ComparativeAnalysisService (used in module)
lib/services/cost-savings-reporting-service.ts:1 - CostSavingsMetrics (used in module)
lib/services/cost-savings-reporting-service.ts:17 - CategorySavings (used in module)
lib/services/cost-savings-reporting-service.ts:34 - VendorSavings (used in module)
lib/services/cost-savings-reporting-service.ts:44 - MethodSavings (used in module)
lib/services/cost-savings-reporting-service.ts:53 - SavingsTrend (used in module)
lib/services/cost-savings-reporting-service.ts:62 - SavingsProjection (used in module)
lib/services/cost-savings-reporting-service.ts:70 - EfficiencyMetrics (used in module)
lib/services/cost-savings-reporting-service.ts:95 - ROIAnalysis (used in module)
lib/services/cost-savings-reporting-service.ts:118 - CostSavingsReportingService (used in module)
lib/services/currency-conversion-service.ts:3 - ConversionResult (used in module)
lib/services/currency-conversion-service.ts:9 - BatchConversionRequest (used in module)
lib/services/currency-conversion-service.ts:16 - BatchConversionResult (used in module)
lib/services/currency-conversion-service.ts:33 - ConversionHistory (used in module)
lib/services/currency-conversion-service.ts:375 - default
lib/services/currency-management-service.ts:22 - ExchangeRateHistory (used in module)
lib/services/currency-management-service.ts:307 - default
lib/services/custom-dashboard-service.ts:1 - DashboardWidget (used in module)
lib/services/custom-dashboard-service.ts:18 - CustomDashboard (used in module)
lib/services/custom-dashboard-service.ts:33 - DashboardTemplate (used in module)
lib/services/custom-dashboard-service.ts:42 - WidgetDataSource (used in module)
lib/services/custom-dashboard-service.ts:52 - CustomDashboardService (used in module)
lib/services/data-quality-service.ts:3 - QualityMetrics (used in module)
lib/services/data-quality-service.ts:30 - QualityTrend (used in module)
lib/services/data-quality-service.ts:42 - DataQualityService (used in module)
lib/services/error-reporting-service.ts:15 - ErrorSummary (used in module)
lib/services/error-reporting-service.ts:24 - DetailedError (used in module)
lib/services/error-reporting-service.ts:38 - CorrectionGuidance (used in module)
lib/services/error-reporting-service.ts:49 - CorrectionStep (used in module)
lib/services/error-reporting-service.ts:77 - ErrorReportingService (used in module)
lib/services/excel-template-service.ts:4 - ExcelTemplateConfig (used in module)
lib/services/excel-template-service.ts:19 - TemplateColumn (used in module)
lib/services/excel-template-service.ts:28 - ValidationRule (used in module)
lib/services/excel-template-service.ts:34 - TemplateGenerationResult (used in module)
lib/services/excel-template-service.ts:42 - TemplateProcessingResult (used in module)
lib/services/excel-template-service.ts:499 - excelTemplateService
lib/services/exchange-rate-automation-service.ts:4 - RateUpdateSchedule (used in module)
lib/services/exchange-rate-automation-service.ts:17 - RateUpdateResult (used in module)
lib/services/exchange-rate-automation-service.ts:41 - RateUpdateNotification (used in module)
lib/services/exchange-rate-automation-service.ts:52 - AutomationSettings (used in module)
lib/services/exchange-rate-automation-service.ts:662 - default
lib/services/notification-service.ts:1 - EmailNotification (used in module)
lib/services/notification-service.ts:11 - EmailAttachment (used in module)
lib/services/notification-service.ts:17 - NotificationTemplate (used in module)
lib/services/pr-price-assignment-service.ts:17 - PRPriceAssignmentService (used in module)
lib/services/price-assignment-service.ts:15 - PriceAssignmentService (used in module)
lib/services/price-expiration-notification-service.ts:5 - NotificationTemplate (used in module)
lib/services/price-expiration-notification-service.ts:19 - NotificationQueue (used in module)
lib/services/price-expiration-notification-service.ts:37 - NotificationRequest (used in module)
lib/services/price-expiration-notification-service.ts:50 - BulkNotificationRequest (used in module)
lib/services/price-expiration-notification-service.ts:63 - NotificationResult (used in module)
lib/services/price-expiration-notification-service.ts:71 - NotificationSettings
lib/services/price-expiration-notification-service.ts:92 - ExpirationNotificationSchedule (used in module)
lib/services/price-expiration-notification-service.ts:108 - PriceExpirationNotificationService (used in module)
lib/services/price-expiration-notification-service.ts:602 - priceExpirationNotificationService
lib/services/price-lifecycle-service.ts:5 - PriceLifecycleState (used in module)
lib/services/price-lifecycle-service.ts:21 - ValidityPeriod (used in module)
lib/services/price-lifecycle-service.ts:37 - StateTransitionRule (used in module)
lib/services/price-lifecycle-service.ts:45 - LifecycleEvent (used in module)
lib/services/price-lifecycle-service.ts:57 - RenewalRequest (used in module)
lib/services/price-lifecycle-service.ts:67 - RenewalResult (used in module)
lib/services/price-lifecycle-service.ts:77 - LifecycleMetrics (used in module)
lib/services/price-lifecycle-service.ts:88 - ExpirationForecast (used in module)
lib/services/price-lifecycle-service.ts:97 - PriceLifecycleService (used in module)
lib/services/price-management-audit-service.ts:12 - PriceManagementAuditEvent (used in module)
lib/services/price-management-audit-service.ts:55 - PriceManagementOperation (used in module)
lib/services/price-management-audit-service.ts:67 - AuditEventType (used in module)
lib/services/price-management-audit-service.ts:80 - FieldChange (used in module)
lib/services/price-management-audit-service.ts:87 - AuditQuery (used in module)
lib/services/price-management-audit-service.ts:102 - AuditSummary (used in module)
lib/services/price-management-audit-service.ts:119 - AuditReport (used in module)
lib/services/price-management-audit-service.ts:131 - PriceManagementAuditService (used in module)
lib/services/price-management-audit-service.ts:627 - priceManagementAudit
lib/services/price-management-rbac-service.ts:38 - AccessControlRule (used in module)
lib/services/price-management-rbac-service.ts:45 - AccessCondition (used in module)
lib/services/price-management-rbac-service.ts:68 - AccessResult (used in module)
lib/services/price-management-rbac-service.ts:81 - AuditEvent (used in module)
lib/services/price-normalization-service.ts:4 - PriceItem (used in module)
lib/services/price-normalization-service.ts:19 - NormalizedPriceItem (used in module)
lib/services/price-normalization-service.ts:27 - PriceComparison (used in module)
lib/services/price-normalization-service.ts:43 - PriceNormalizationOptions (used in module)
lib/services/price-normalization-service.ts:439 - default
lib/services/price-status-management-service.ts:5 - PriceStatusInfo (used in module)
lib/services/price-status-management-service.ts:21 - PriceStatusData (used in module)
lib/services/price-status-management-service.ts:40 - StatusHistoryEntry (used in module)
lib/services/price-status-management-service.ts:47 - StatusTransitionRequest (used in module)
lib/services/price-status-management-service.ts:57 - StatusTransitionResult (used in module)
lib/services/price-status-management-service.ts:65 - BulkStatusUpdate (used in module)
lib/services/price-status-management-service.ts:80 - StatusMetrics (used in module)
lib/services/price-status-management-service.ts:92 - PriceStatusManagementService (used in module)
lib/services/price-validation-engine.ts:4 - PriceItemSchema (used in module)
lib/services/price-validation-engine.ts:30 - PriceSubmissionSchema (used in module)
lib/services/price-validation-engine.ts:62 - BusinessRuleValidationContext (used in module)
lib/services/price-validation-engine.ts:71 - PriceValidationEngine (used in module)
lib/services/price-validity-reporting-service.ts:5 - PriceValidityReport (used in module)
lib/services/price-validity-reporting-service.ts:20 - ValidityReportSummary (used in module)
lib/services/price-validity-reporting-service.ts:33 - ValidityReportDetail (used in module)
lib/services/price-validity-reporting-service.ts:53 - ValidityAlert (used in module)
lib/services/price-validity-reporting-service.ts:68 - ValidityRecommendation (used in module)
lib/services/price-validity-reporting-service.ts:81 - ValidityReportFilters (used in module)
lib/services/price-validity-reporting-service.ts:94 - PriceValidityReportingService (used in module)
lib/services/report-export-service.ts:25 - ChartData (used in module)
lib/services/report-export-service.ts:33 - ReportExportService (used in module)
lib/services/resubmission-workflow-service.ts:5 - ResubmissionWorkflow (used in module)
lib/services/resubmission-workflow-service.ts:21 - RequiredChange (used in module)
lib/services/resubmission-workflow-service.ts:36 - CompletedChange (used in module)
lib/services/resubmission-workflow-service.ts:49 - ChangeHistoryEntry (used in module)
lib/services/resubmission-workflow-service.ts:62 - ResubmissionValidation (used in module)
lib/services/resubmission-workflow-service.ts:71 - ChangeComparison (used in module)
lib/services/resubmission-workflow-service.ts:81 - ResubmissionWorkflowService (used in module)
lib/services/rule-testing-management-service.ts:8 - RuleTestResult (used in module)
lib/services/rule-testing-management-service.ts:21 - RuleExecutionResult (used in module)
lib/services/rule-testing-management-service.ts:33 - TestCoverage (used in module)
lib/services/rule-testing-management-service.ts:41 - PerformanceMetrics (used in module)
lib/services/rule-testing-management-service.ts:49 - TestScenario (used in module)
lib/services/rule-testing-management-service.ts:57 - ExpectedResult (used in module)
lib/services/rule-testing-management-service.ts:64 - RuleVersion (used in module)
lib/services/rule-testing-management-service.ts:81 - ChangeImpact (used in module)
lib/services/rule-testing-management-service.ts:88 - RollbackResult (used in module)
lib/services/rule-testing-management-service.ts:97 - ValidationResults (used in module)
lib/services/rule-testing-management-service.ts:102 - TestSummary (used in module)
lib/services/rule-testing-management-service.ts:108 - DeactivationResult (used in module)
lib/services/rule-testing-management-service.ts:116 - ImpactAssessment (used in module)
lib/services/rule-testing-management-service.ts:122 - AuditEntry (used in module)
lib/services/rule-testing-management-service.ts:136 - ApprovalRequest (used in module)
lib/services/rule-testing-management-service.ts:153 - Approver (used in module)
lib/services/rule-testing-management-service.ts:160 - RequestImpactAssessment (used in module)
lib/services/rule-testing-management-service.ts:166 - RulePerformanceMetrics (used in module)
lib/services/rule-testing-management-service.ts:176 - TestCoverageMetrics (used in module)
lib/services/rule-testing-management-service.ts:182 - ExecutionMetrics (used in module)
lib/services/rule-testing-management-service.ts:189 - EffectivenessMetrics (used in module)
lib/services/rule-testing-management-service.ts:195 - QualityMetrics (used in module)
lib/services/rule-testing-management-service.ts:201 - ComplianceReport (used in module)
lib/services/rule-testing-management-service.ts:209 - ComplianceData (used in module)
lib/services/scheduled-report-service.ts:1 - ScheduledReport (used in module)
lib/services/scheduled-report-service.ts:17 - ReportSchedule (used in module)
lib/services/scheduled-report-service.ts:24 - ReportExecution (used in module)
lib/services/scheduled-report-service.ts:35 - ScheduledReportService (used in module)
lib/services/vendor-currency-preference-service.ts:4 - VendorCurrencyPreference (used in module)
lib/services/vendor-currency-preference-service.ts:31 - CurrencyPreferenceTemplate (used in module)
lib/services/vendor-currency-preference-service.ts:47 - CurrencyPreferenceHistory (used in module)
lib/services/vendor-currency-preference-service.ts:58 - VendorCurrencyValidation (used in module)
lib/services/vendor-currency-preference-service.ts:527 - default
lib/store/use-count-store.ts:5 - CountStatus (used in module)
lib/types/business-rules.ts:1 - BusinessRule
lib/types/business-rules.ts:18 - RuleCondition (used in module)
lib/types/business-rules.ts:26 - RuleAction (used in module)
lib/types/business-rules.ts:32 - ConditionTemplate
lib/types/business-rules.ts:44 - ActionTemplate
lib/types/business-rules.ts:52 - ActionParameter (used in module)
lib/types/business-rules.ts:61 - RuleAnalytics
lib/types/business-rules.ts:85 - RulePerformance (used in module)
lib/types/business-rules.ts:101 - CategoryPerformance (used in module)
lib/types/business-rules.ts:108 - DailyMetric (used in module)
lib/types/business-rules.ts:116 - HourlyMetric (used in module)
lib/types/business-rules.ts:122 - ErrorMetric (used in module)
lib/types/business-rules.ts:129 - ErrorSuggestion (used in module)
lib/types/business-rules.ts:134 - TestScenario
lib/types/business-rules.ts:142 - RuleTestResult
lib/types/campaign-management.ts:22 - RecurringPattern (used in module)
lib/types/campaign-management.ts:45 - CampaignSettings (used in module)
lib/types/campaign-management.ts:56 - ReminderSchedule (used in module)
lib/types/campaign-management.ts:79 - VendorFilters (used in module)
lib/types/count-allocation.ts:3 - CountAllocation (used in module)
lib/types/count-allocation.ts:17 - CountSession
lib/types/count-allocation.ts:35 - AllocationGroup
lib/types/credit-note.ts:25 - CreditNoteStatus
lib/types/credit-note.ts:27 - CreditNoteType
lib/types/credit-note.ts:30 - CreditNoteItem (used in module)
lib/types/credit-note.ts:39 - CreditNoteAttachment (used in module)
lib/types/enhanced-pr-types.ts:42 - CurrencyInfo (used in module)
lib/types/enhanced-pr-types.ts:98 - SavingsAnalysis (used in module)
lib/types/enhanced-pr-types.ts:176 - PRPriceAssignmentService
lib/types/hotel.ts:1 - LocationType (used in module)
lib/types/hotel.ts:3 - HotelLocation
lib/types/hotel.ts:17 - HotelProduct
lib/types/price-management.ts:70 - RuleCondition (used in module)
lib/types/price-management.ts:77 - RuleAction (used in module)
lib/types/price-management.ts:358 - VendorInfo
lib/types/price-management.ts:365 - Currency
lib/types/price-management.ts:371 - ProductCategory
lib/types/user.ts:20 - UserProfile (used in module)
lib/utils/field-permissions.ts:1 - FieldPermissions (used in module)
lib/utils/filter-storage.ts:1 - FilterOperator (used in module)
lib/utils/filter-storage.ts:14 - LogicalOperator (used in module)
lib/utils/filter-storage.ts:89 - toggleStar (used in module)
lib/utils/filter-storage.ts:113 - readSavedFilters
lib/utils/filter-storage.ts:114 - addSavedFilter
lib/utils/filter-storage.ts:115 - deleteSavedFilter
lib/utils/filter-storage.ts:116 - toggleFilterStar
lib/utils/price-management-permissions.ts:126 - getFieldPermissions (used in module)
lib/utils/price-management-permissions.ts:527 - canAccessVendorData
lib/utils/price-management-permissions.ts:587 - validatePermissionChange
lib/utils/price-management-permissions.ts:24 - FieldPermission (used in module)
lib/utils/template-validation.ts:1 - ValidationError (used in module)
lib/utils/template-validation.ts:9 - ValidationResult (used in module)
lib/utils/template-validation.ts:19 - TemplateColumn (used in module)
lib/utils/template-validation.ts:28 - ValidationRule (used in module)
lib/utils/test-permissions.ts:5 - testPermissions (used in module)
lib/utils/vendor-validation.ts:254 - validatePriceCollectionTemplate
lib/utils/vendor-validation.ts:273 - validateCollectionCampaign
lib/utils/vendor-validation.ts:292 - validateVendorPricelist
lib/utils/vendor-validation.ts:311 - validatePricelistItem
lib/utils/vendor-validation.ts:330 - validateMOQPricing
lib/utils/vendor-validation.ts:355 - validateValidationRule
lib/utils/vendor-validation.ts:388 - validatePriceLogic
lib/utils/vendor-validation.ts:417 - isCampaignActive
lib/utils/vendor-validation.ts:429 - isPricelistValid
lib/utils/vendor-validation.ts:441 - generateInvitationToken
lib/utils/vendor-validation.ts:452 - calculateInvitationExpiry
lib/utils/vendor-validation.ts:460 - calculateQualityScore
lib/utils/vendor-validation.ts:26 - notificationSettingsSchema (used in module)
lib/utils/vendor-validation.ts:37 - vendorPriceManagementSchema (used in module)
lib/utils/vendor-validation.ts:64 - validationRuleSchema (used in module)
lib/utils/vendor-validation.ts:77 - priceCollectionTemplateSchema (used in module)
lib/utils/vendor-validation.ts:108 - reminderConfigSchema (used in module)
lib/utils/vendor-validation.ts:119 - campaignScheduleSchema (used in module)
lib/utils/vendor-validation.ts:138 - collectionCampaignSchema (used in module)
lib/utils/vendor-validation.ts:162 - moqPricingSchema (used in module)
lib/utils/vendor-validation.ts:177 - pricelistItemSchema (used in module)
lib/utils/vendor-validation.ts:204 - vendorPricelistSchema (used in module)
.next/types/app/layout.ts:49 - PageProps
.next/types/app/layout.ts:53 - LayoutProps (used in module)
.next/types/app/page.ts:49 - PageProps (used in module)
.next/types/app/page.ts:53 - LayoutProps
app/(main)/dashboard/environment-dashboard.tsx:367 - default
app/components/ui/skeleton.tsx:15 - Skeleton (used in module)
components/purchase-orders/tabs/ActivityLogTab.tsx:8 - default
components/purchase-orders/tabs/CommentsAttachmentsTab.tsx:7 - default
components/purchase-orders/tabs/FinancialDetailsTab.tsx:7 - default
components/purchase-orders/tabs/GeneralInfoTab.tsx:7 - default
components/purchase-orders/tabs/GoodsReceiveNoteTab.tsx:104 - default
components/purchase-orders/tabs/InventoryStatusTab.tsx:7 - default
components/purchase-orders/tabs/ItemsTab.tsx:14 - default
components/purchase-orders/tabs/purchase-order-item-form.tsx:22 - PurchaseOrderItemFormComponent
components/purchase-orders/tabs/RelatedDocumentsTab.tsx:7 - default
.next/types/app/(auth)/layout.ts:49 - PageProps
.next/types/app/(auth)/layout.ts:53 - LayoutProps (used in module)
.next/types/app/inventory/layout.ts:49 - PageProps
.next/types/app/inventory/layout.ts:53 - LayoutProps (used in module)
.next/types/app/pr-approval/page.ts:49 - PageProps (used in module)
.next/types/app/pr-approval/page.ts:53 - LayoutProps
.next/types/app/profile/page.ts:49 - PageProps (used in module)
.next/types/app/profile/page.ts:53 - LayoutProps
.next/types/app/receiving/page.ts:49 - PageProps (used in module)
.next/types/app/receiving/page.ts:53 - LayoutProps
.next/types/app/select-business-unit/page.ts:49 - PageProps (used in module)
.next/types/app/select-business-unit/page.ts:53 - LayoutProps
.next/types/app/spot-check/page.ts:49 - PageProps (used in module)
.next/types/app/spot-check/page.ts:53 - LayoutProps
.next/types/app/stock-take/page.ts:49 - PageProps (used in module)
.next/types/app/stock-take/page.ts:53 - LayoutProps
.next/types/app/testui/page.ts:49 - PageProps (used in module)
.next/types/app/testui/page.ts:53 - LayoutProps
.next/types/app/transactions/page.ts:49 - PageProps (used in module)
.next/types/app/transactions/page.ts:53 - LayoutProps
app/(main)/inventory-management/components/stock-in-jv-entry.tsx:218 - default
app/(main)/inventory-management/components/stock-in-list.tsx:1018 - default
app/(main)/store-operations/store-requisitions/types.ts:1 - FilterCondition
app/(main)/store-operations/store-requisitions/types.ts:7 - Requisition
app/(main)/vendor-management/components/VendorForm.tsx:107 - default
app/(main)/vendor-management/lib/api.ts:689 - portalApi (used in module)
app/(main)/vendor-management/lib/api.ts:690 - moqApi (used in module)
app/(main)/vendor-management/lib/api.ts:691 - adminApi (used in module)
app/(main)/vendor-management/lib/mock-data.ts:496 - ProductSubcategory (used in module)
app/(main)/vendor-management/lib/mock-data.ts:502 - ProductItemGroup (used in module)
app/(main)/vendor-management/lib/permissions.ts:4 - User (used in module)
app/(main)/vendor-management/lib/permissions.ts:14 - UserRole (used in module)
app/(main)/vendor-management/lib/permissions.ts:22 - Permission (used in module)
app/(main)/vendor-management/lib/permissions.ts:83 - hasPermission (used in module)
app/(main)/vendor-management/lib/permissions.ts:92 - canCreatePricelists (used in module)
app/(main)/vendor-management/lib/permissions.ts:96 - canApprovePricelists (used in module)
app/(main)/vendor-management/lib/permissions.ts:100 - canManageVendors (used in module)
app/(main)/vendor-management/lib/permissions.ts:105 - canPerformStaffOperations (used in module)
app/(main)/vendor-management/lib/permissions.ts:110 - getRoleDisplayName (used in module)
app/(main)/vendor-management/lib/permissions.ts:123 - getAvailableActions (used in module)
app/(main)/vendor-management/lib/permissions.ts:134 - AuditLogEntry (used in module)
app/(main)/vendor-management/lib/permissions.ts:171 - requirePermission (used in module)
app/(main)/vendor-management/lib/permissions.ts:181 - requireRole (used in module)
app/(main)/vendor-management/lib/permissions.ts:190 - default
app/(main)/vendor-management/lib/product-utils.ts:17 - resolveProducts (used in module)
app/(main)/vendor-management/lib/product-utils.ts:91 - getProductName
app/(main)/vendor-management/lib/product-utils.ts:5 - ResolvedProductInfo (used in module)
app/(main)/vendor-management/manage-vendors/actions.ts:6 - createVendor (used in module)
app/(main)/vendor-management/manage-vendors/actions.ts:60 - getVendor (used in module)
app/(main)/vendor-management/types/index.ts:4 - Address (used in module)
app/(main)/vendor-management/types/index.ts:12 - VendorMetrics (used in module)
app/(main)/vendor-management/types/index.ts:23 - Vendor
app/(main)/vendor-management/types/index.ts:48 - ProductInstance (used in module)
app/(main)/vendor-management/types/index.ts:55 - ProductSelection (used in module)
app/(main)/vendor-management/types/index.ts:63 - CustomField (used in module)
app/(main)/vendor-management/types/index.ts:78 - PricelistTemplate
app/(main)/vendor-management/types/index.ts:103 - RequestForPricingSchedule (used in module)
app/(main)/vendor-management/types/index.ts:119 - VendorInvitation (used in module)
app/(main)/vendor-management/types/index.ts:141 - RequestForPricingAnalytics (used in module)
app/(main)/vendor-management/types/index.ts:161 - RequestForPricing
app/(main)/vendor-management/types/index.ts:182 - MOQPricing (used in module)
app/(main)/vendor-management/types/index.ts:194 - PricelistItem (used in module)
app/(main)/vendor-management/types/index.ts:213 - VendorPricelist
app/(main)/vendor-management/types/index.ts:244 - SessionActivity (used in module)
app/(main)/vendor-management/types/index.ts:256 - PortalSession
app/(main)/vendor-management/types/index.ts:281 - ValidationError (used in module)
app/(main)/vendor-management/types/index.ts:290 - ValidationResult
app/(main)/vendor-management/types/index.ts:299 - BusinessRule
app/(main)/vendor-management/types/index.ts:321 - EmailTemplate
app/(main)/vendor-management/types/index.ts:336 - NotificationSettings
app/(main)/vendor-management/types/index.ts:357 - AuditLog
app/(main)/vendor-management/types/index.ts:373 - SystemConfiguration
app/(main)/vendor-management/types/index.ts:394 - ApiResponse
app/(main)/vendor-management/types/index.ts:410 - PaginatedResponse
app/(main)/vendor-management/types/index.ts:419 - VendorFilters
app/(main)/vendor-management/types/index.ts:430 - RequestForPricingFilters
app/(main)/vendor-management/types/index.ts:443 - PricelistFilters
app/pr-approval/[id]/confirm/loading.tsx:1 - default
.next/types/app/(main)/dashboard/layout.ts:49 - PageProps
.next/types/app/(main)/dashboard/layout.ts:53 - LayoutProps (used in module)
.next/types/app/(main)/dashboard/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/dashboard/page.ts:53 - LayoutProps
.next/types/app/(main)/edit-profile/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/edit-profile/page.ts:53 - LayoutProps
.next/types/app/(main)/finance/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/finance/page.ts:53 - LayoutProps
.next/types/app/(main)/help-support/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/help-support/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/page.ts:53 - LayoutProps
.next/types/app/(main)/product-management/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/product-management/page.ts:53 - LayoutProps
.next/types/app/(main)/production/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/production/page.ts:53 - LayoutProps
.next/types/app/(main)/reporting-analytics/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/reporting-analytics/page.ts:53 - LayoutProps
.next/types/app/(main)/store-operations/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/store-operations/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/page.ts:53 - LayoutProps
.next/types/app/(main)/TEMPLATE/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/TEMPLATE/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/page.ts:53 - LayoutProps
.next/types/app/api/price-management/route.ts:309 - PageProps
.next/types/app/api/price-management/route.ts:313 - LayoutProps
.next/types/app/inventory/overview/page.ts:49 - PageProps (used in module)
.next/types/app/inventory/overview/page.ts:53 - LayoutProps
.next/types/app/pr-approval/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/pr-approval/[id]/page.ts:53 - LayoutProps
.next/types/app/receiving/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/receiving/[id]/page.ts:53 - LayoutProps
.next/types/app/stock-take/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/stock-take/[id]/page.ts:53 - LayoutProps
app/(main)/inventory-management/inventory-adjustments/components/types.ts:1 - Location (used in module)
app/(main)/inventory-management/inventory-adjustments/components/types.ts:7 - Lot (used in module)
app/(main)/inventory-management/inventory-adjustments/components/types.ts:24 - InventoryAdjustment
app/(main)/inventory-management/spot-check/components/count-detail-card.tsx:164 - mockSpotChecks
app/(main)/inventory-management/spot-check/components/count-items.tsx:25 - CountItems
app/(main)/inventory-management/spot-check/components/item-selection.tsx:36 - ItemSelection
app/(main)/inventory-management/spot-check/components/location-selection.tsx:32 - LocationSelection
app/(main)/inventory-management/spot-check/components/review.tsx:31 - Review
app/(main)/inventory-management/spot-check/components/setup.tsx:50 - SpotCheckSetup
app/(main)/inventory-management/spot-check/components/spot-check-nav.tsx:54 - SpotCheckNav
app/(main)/inventory-management/stock-overview/inventory-balance/utils.ts:26 - formatPercent
app/(main)/inventory-management/stock-overview/inventory-balance/utils.ts:49 - truncateText
app/(main)/inventory-management/stock-overview/inventory-balance/utils.ts:57 - stringToColor
app/(main)/inventory-management/stock-overview/stock-card/index.tsx:1 - Product
app/(main)/inventory-management/stock-overview/stock-card/index.tsx:25 - StockSummary
app/(main)/inventory-management/stock-overview/stock-card/index.tsx:38 - LocationStock
app/(main)/inventory-management/stock-overview/stock-card/index.tsx:46 - LotInformation
app/(main)/inventory-management/stock-overview/stock-card/index.tsx:58 - MovementRecord
app/(main)/inventory-management/stock-overview/stock-card/index.tsx:79 - ValuationRecord
app/(main)/inventory-management/stock-overview/stock-card/index.tsx:91 - FilterCriteria
app/(main)/inventory-management/stock-overview/stock-card/index.tsx:102 - StockCard
app/(main)/procurement/credit-note/components/advanced-filter.tsx:80 - AdvancedFilter
app/(main)/procurement/credit-note/components/grn-selection.tsx:15 - GRNSelection
app/(main)/procurement/credit-note/components/item-and-lot-selection.tsx:20 - ItemAndLotSelection
app/(main)/procurement/credit-note/components/item-details-edit.tsx:18 - ItemDetailsEdit
app/(main)/procurement/credit-note/components/lot-selection.tsx:24 - LotSelection
app/(main)/procurement/goods-received-note/[id]/edit.tsx:8 - default
app/(main)/procurement/goods-received-note/components/FilterBuilder.tsx:33 - FilterBuilder
app/(main)/procurement/goods-received-note/components/GoodsReceiveNoteDetail.tsx:489 - default
app/(main)/procurement/purchase-orders/components/ColumnSelectionScreen.tsx:22 - ColumnSelectionScreenProps (used in module)
app/(main)/procurement/purchase-orders/components/ExportContext.tsx:24 - ExportProvider
app/(main)/procurement/purchase-orders/components/ExportSidepanel.tsx:18 - ExportSidepanel
app/(main)/procurement/purchase-orders/components/po-item-form.tsx:19 - PurchaseOrderItemFormComponent
app/(main)/procurement/purchase-orders/components/PrintOptionsSidepanel.tsx:15 - PrintOptionsSidepanel
app/(main)/procurement/purchase-orders/components/PurchaseOrderList.tsx:90 - PurchaseOrderList (used in module)
app/(main)/procurement/purchase-requests/components/item-vendor-data.ts:21 - ItemVendorData (used in module)
app/(main)/procurement/purchase-requests/components/item-vendor-data.ts:29 - itemVendorDatabase (used in module)
app/(main)/procurement/purchase-requests/components/mockPRListData.ts:2600 - mockPRItemsWithBusinessDimensions
app/(main)/procurement/purchase-requests/components/mockPRListData.ts:3015 - statusDistribution
app/(main)/procurement/purchase-requests/components/mockPRListData.ts:3024 - departmentDistribution
app/(main)/procurement/purchase-requests/components/mockPRListData.ts:3039 - businessDimensionsData
app/(main)/procurement/purchase-requests/components/PRForm.tsx:16 - PRForm
app/(main)/procurement/purchase-requests/services/rbac-service.ts:2 - RoleConfiguration (used in module)
app/(main)/procurement/purchase-requests/services/rbac-service.ts:11 - User (used in module)
app/(main)/procurement/purchase-requests/services/rbac-service.ts:19 - WorkflowStage
app/(main)/procurement/purchase-requests/services/rbac-service.ts:25 - PurchaseRequestPermissions
app/(main)/procurement/purchase-requests/services/workflow-decision-engine.ts:20 - ItemWorkflowState (used in module)
app/(main)/product-management/products/components/environmental-impact-tab.tsx:27 - EnvironmentalImpactTab
app/(main)/product-management/products/components/ingredients.tsx:43 - IngredientUnitTabProps (used in module)
app/(main)/product-management/products/components/order-unit.tsx:54 - OrderUnitTabProps (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:4 - BaseProductUnit (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:9 - mockBaseProduct (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:15 - StockCountUnit (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:23 - mockStockCountUnits (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:41 - OrderUnit (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:49 - OrderUnitRules (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:56 - OrderUnitConfig (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:62 - mockOrderUnits (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:96 - ProductUnitsConfig (used in module)
app/(main)/product-management/products/data/mock-product-units.ts:102 - mockProductUnits
app/(main)/recipe-management/recipes/components/recipe-list-view.tsx:30 - RecipeListView
app/(main)/store-operations/store-requisitions/components/index.ts:20 - FilterBuilder
app/(main)/store-operations/store-requisitions/components/index.ts:31 - ListFilters
app/(main)/store-operations/store-requisitions/components/index.ts:12 - ListHeader
app/(main)/store-operations/store-requisitions/components/index.ts:13 - HeaderActions
app/(main)/store-operations/store-requisitions/components/index.ts:12 - HeaderInfo
app/(main)/store-operations/store-requisitions/components/stock-movement-sr.tsx:357 - default
app/(main)/store-operations/store-requisitions/types/index.ts:7 - Requisition
app/(main)/vendor-management/lib/services/vendor-dependency-checker.ts:32 - VendorDependencyChecker (used in module)
app/(main)/vendor-management/lib/services/vendor-dependency-checker.ts:488 - default
app/(main)/vendor-management/lib/services/vendor-search.ts:14 - SearchConfig (used in module)
app/(main)/vendor-management/lib/services/vendor-search.ts:53 - SearchResult (used in module)
app/(main)/vendor-management/lib/services/vendor-search.ts:62 - SavedSearch (used in module)
app/(main)/vendor-management/lib/services/vendor-search.ts:172 - VendorSearchService (used in module)
app/(main)/vendor-management/lib/services/vendor-search.ts:911 - default
app/(main)/vendor-management/lib/services/vendor-service.ts:17 - VendorValidationRules (used in module)
app/(main)/vendor-management/lib/services/vendor-service.ts:87 - VendorBusinessRules (used in module)
app/(main)/vendor-management/lib/services/vendor-service.ts:110 - VendorService (used in module)
app/(main)/vendor-management/lib/services/vendor-service.ts:938 - default
app/(main)/vendor-management/lib/services/vendor-validation.ts:13 - VendorValidationConfig (used in module)
app/(main)/vendor-management/lib/services/vendor-validation.ts:21 - CustomValidationRule (used in module)
app/(main)/vendor-management/lib/services/vendor-validation.ts:29 - FIELD_VALIDATORS (used in module)
app/(main)/vendor-management/lib/services/vendor-validation.ts:388 - VendorValidationService (used in module)
app/(main)/vendor-management/lib/services/vendor-validation.ts:752 - default
app/(main)/vendor-management/manage-vendors/[id]/types.ts:5 - Address (used in module)
app/(main)/vendor-management/manage-vendors/[id]/types.ts:7 - Contact (used in module)
app/(main)/vendor-management/manage-vendors/[id]/types.ts:9 - Certification (used in module)
app/(main)/vendor-management/manage-vendors/data/mock.ts:113 - getMockVendor
app/(main)/vendor-management/manage-vendors/data/mock.ts:4 - AddressType (used in module)
app/(main)/vendor-management/manage-vendors/data/mock.ts:11 - MOCK_VENDORS (used in module)
app/(main)/vendor-management/manage-vendors/data/mock.ts:106 - ADDRESS_TYPES
app/(main)/vendor-management/pricelists/components/StaffPricelistForm.tsx:56 - default
app/(main)/vendor-management/pricelists/types/PricelistEditingTypes.ts:21 - PricelistProductInstance
app/(main)/vendor-management/pricelists/utils/PriceValidation.ts:6 - validateMOQTier (used in module)
app/(main)/vendor-management/templates/components/CustomFieldsComponent.tsx:118 - default
app/(main)/vendor-management/templates/components/MOQPricingComponent.tsx:59 - default
app/(main)/vendor-management/templates/lib/excel-download-service.ts:438 - downloadMultipleFormats (used in module)
app/(main)/vendor-management/templates/lib/excel-download-service.ts:8 - DownloadOptions (used in module)
app/(main)/vendor-management/templates/lib/excel-download-service.ts:14 - DownloadResult (used in module)
app/(main)/vendor-management/templates/lib/excel-download-service.ts:26 - ExcelDownloadService (used in module)
app/(main)/vendor-management/templates/lib/excel-download-service.ts:428 - excelDownloadService (used in module)
app/(main)/vendor-management/templates/lib/excel-generator.ts:689 - createExcelTemplateGenerator (used in module)
app/(main)/vendor-management/templates/lib/excel-generator.ts:18 - ExcelColumn (used in module)
app/(main)/vendor-management/templates/lib/excel-generator.ts:114 - ExcelTemplateGenerator (used in module)
app/inventory/stock-overview/stock-card/components/stock-card-header.tsx:12 - StockCardHeader
app/inventory/stock-overview/stock-card/types/index.ts:1 - MovementType (used in module)
app/inventory/stock-overview/stock-card/types/index.ts:34 - StockCard
app/inventory/stock-overview/stock-card/types/index.ts:48 - FilterCriteria
app/inventory/stock-overview/stock-card/types/index.ts:60 - ItemHierarchy (used in module)
app/inventory/stock-overview/stock-card/types/index.ts:66 - MovementFilters
.next/types/app/(auth)/login/[[...login]]/page.ts:49 - PageProps (used in module)
.next/types/app/(auth)/login/[[...login]]/page.ts:53 - LayoutProps
.next/types/app/(auth)/signup/[[...signup]]/page.ts:49 - PageProps (used in module)
.next/types/app/(auth)/signup/[[...signup]]/page.ts:53 - LayoutProps
.next/types/app/(main)/finance/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/finance/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/finance/account-code-mapping/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/finance/account-code-mapping/page.ts:53 - LayoutProps
.next/types/app/(main)/finance/currency-management/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/finance/currency-management/page.ts:53 - LayoutProps
.next/types/app/(main)/finance/department-list/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/finance/department-list/page.ts:53 - LayoutProps
.next/types/app/(main)/finance/exchange-rates/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/finance/exchange-rates/page.ts:53 - LayoutProps
.next/types/app/(main)/help-support/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/help-support/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/inventory-adjustments/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/inventory-adjustments/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/period-end/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/period-end/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/physical-count/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/physical-count/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/physical-count-management/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/physical-count-management/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/spot-check/layout.ts:49 - PageProps
.next/types/app/(main)/inventory-management/spot-check/layout.ts:53 - LayoutProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/stock-in/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/stock-in/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/credit-note/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/credit-note/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/goods-received-note/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/goods-received-note/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/my-approvals/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/my-approvals/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-orders/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-orders/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-request-templates/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-request-templates/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-requests/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-requests/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/vendor-comparison/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/vendor-comparison/page.ts:53 - LayoutProps
.next/types/app/(main)/product-management/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/product-management/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/product-management/categories/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/product-management/categories/page.ts:53 - LayoutProps
.next/types/app/(main)/product-management/products/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/product-management/products/page.ts:53 - LayoutProps
.next/types/app/(main)/product-management/units/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/product-management/units/page.ts:53 - LayoutProps
.next/types/app/(main)/production/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/production/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/reporting-analytics/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/reporting-analytics/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/store-operations/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/store-operations/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/store-operations/stock-replenishment/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/store-operations/stock-replenishment/page.ts:53 - LayoutProps
.next/types/app/(main)/store-operations/store-requisitions/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/store-operations/store-requisitions/page.ts:53 - LayoutProps
.next/types/app/(main)/store-operations/wastage-reporting/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/store-operations/wastage-reporting/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/account-code-mapping/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/account-code-mapping/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/location-management/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/location-management/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integration/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integration/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/user-dashboard/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/user-dashboard/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/user-management/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/user-management/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/workflow/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/workflow/page.ts:53 - LayoutProps
.next/types/app/(main)/TEMPLATE/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/TEMPLATE/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/[subItem]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/[subItem]/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/campaigns/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/campaigns/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/manage-vendors/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/manage-vendors/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/pricelists/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/pricelists/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/templates/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/templates/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/vendors/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/vendors/page.ts:53 - LayoutProps
.next/types/app/api/price-management/analytics/route.ts:309 - PageProps
.next/types/app/api/price-management/analytics/route.ts:313 - LayoutProps
.next/types/app/api/price-management/assignments/route.ts:309 - PageProps
.next/types/app/api/price-management/assignments/route.ts:313 - LayoutProps
.next/types/app/api/price-management/bulk-assignments/route.ts:309 - PageProps
.next/types/app/api/price-management/bulk-assignments/route.ts:313 - LayoutProps
.next/types/app/api/price-management/bulk-operations/route.ts:309 - PageProps
.next/types/app/api/price-management/bulk-operations/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/route.ts:313 - LayoutProps
.next/types/app/api/price-management/campaigns/route.ts:309 - PageProps
.next/types/app/api/price-management/campaigns/route.ts:313 - LayoutProps
.next/types/app/api/price-management/dashboards/route.ts:309 - PageProps
.next/types/app/api/price-management/dashboards/route.ts:313 - LayoutProps
.next/types/app/api/price-management/email-processing/route.ts:309 - PageProps
.next/types/app/api/price-management/email-processing/route.ts:313 - LayoutProps
.next/types/app/api/price-management/multi-currency/route.ts:309 - PageProps
.next/types/app/api/price-management/multi-currency/route.ts:313 - LayoutProps
.next/types/app/api/price-management/portal-sessions/route.ts:309 - PageProps
.next/types/app/api/price-management/portal-sessions/route.ts:313 - LayoutProps
.next/types/app/api/price-management/price-assignment/route.ts:309 - PageProps
.next/types/app/api/price-management/price-assignment/route.ts:313 - LayoutProps
.next/types/app/api/price-management/price-lists/route.ts:309 - PageProps
.next/types/app/api/price-management/price-lists/route.ts:313 - LayoutProps
.next/types/app/api/price-management/price-validity/route.ts:309 - PageProps
.next/types/app/api/price-management/price-validity/route.ts:313 - LayoutProps
.next/types/app/api/price-management/pricing-trends/route.ts:309 - PageProps
.next/types/app/api/price-management/pricing-trends/route.ts:313 - LayoutProps
.next/types/app/api/price-management/products/route.ts:309 - PageProps
.next/types/app/api/price-management/products/route.ts:313 - LayoutProps
.next/types/app/api/price-management/reports/route.ts:309 - PageProps
.next/types/app/api/price-management/reports/route.ts:313 - LayoutProps
.next/types/app/api/price-management/templates/route.ts:309 - PageProps
.next/types/app/api/price-management/templates/route.ts:313 - LayoutProps
.next/types/app/api/price-management/validation/route.ts:309 - PageProps
.next/types/app/api/price-management/validation/route.ts:313 - LayoutProps
.next/types/app/api/price-management/vendors/route.ts:309 - PageProps
.next/types/app/api/price-management/vendors/route.ts:313 - LayoutProps
.next/types/app/inventory/stock-overview/stock-card/page.ts:49 - PageProps (used in module)
.next/types/app/inventory/stock-overview/stock-card/page.ts:53 - LayoutProps
.next/types/app/pr-approval/[id]/confirm/page.ts:49 - PageProps (used in module)
.next/types/app/pr-approval/[id]/confirm/page.ts:53 - LayoutProps
.next/types/app/receiving/[id]/confirm/page.ts:49 - PageProps (used in module)
.next/types/app/receiving/[id]/confirm/page.ts:53 - LayoutProps
.next/types/app/receiving/[id]/receive/page.ts:49 - PageProps (used in module)
.next/types/app/receiving/[id]/receive/page.ts:53 - LayoutProps
.next/types/app/stock-take/[id]/confirm/page.ts:49 - PageProps (used in module)
.next/types/app/stock-take/[id]/confirm/page.ts:53 - LayoutProps
app/(main)/inventory-management/stock-overview/stock-card/components/stock-card-client.tsx:6 - StockCardClient
app/(main)/inventory-management/stock-overview/stock-card/types/index.ts:1 - MovementType (used in module)
app/(main)/inventory-management/stock-overview/stock-card/types/index.ts:8 - Location (used in module)
app/(main)/inventory-management/stock-overview/stock-card/types/index.ts:16 - Movement (used in module)
app/(main)/inventory-management/stock-overview/stock-card/types/index.ts:26 - StockStatus (used in module)
app/(main)/inventory-management/stock-overview/stock-card/types/index.ts:34 - StockCard
app/(main)/inventory-management/stock-overview/stock-card/types/index.ts:48 - FilterCriteria
app/(main)/inventory-management/stock-overview/stock-card/types/index.ts:60 - ItemHierarchy (used in module)
app/(main)/inventory-management/stock-overview/stock-card/types/index.ts:66 - MovementFilters
app/(main)/operational-planning/recipe-management/recipes/components/recipe-form-skeleton.tsx:4 - RecipeFormSkeleton
app/(main)/operational-planning/recipe-management/recipes/components/recipe-view-skeleton.tsx:5 - RecipeViewSkeleton
app/(main)/procurement/goods-received-note/components/tabs/AttachmentTab.tsx:18 - AttachmentTab
app/(main)/procurement/goods-received-note/components/tabs/CommentTab.tsx:17 - CommentTab
app/(main)/procurement/goods-received-note/components/tabs/inventory-breakdown.tsx:60 - default
app/(main)/procurement/goods-received-note/components/tabs/pending-purchase-orders.tsx:45 - PendingPurchaseOrdersComponent
app/(main)/procurement/purchase-orders/components/tabs/GeneralInfoTab.tsx:7 - default
app/(main)/procurement/purchase-orders/components/tabs/InventoryStatusTab.tsx:7 - default
app/(main)/procurement/purchase-orders/components/tabs/VendorInfoTab.tsx:7 - default
app/(main)/procurement/purchase-requests/components/tabs/BudgetsTab.tsx:30 - BudgetsTab
app/(main)/procurement/purchase-requests/components/tabs/DetailsTab.tsx:15 - DetailsTab
app/(main)/procurement/purchase-requests/components/tabs/enhanced-order-card.tsx:149 - default
app/(main)/procurement/purchase-requests/components/tabs/EnhancedItemsTab.tsx:31 - EnhancedItemsTab
app/(main)/system-administration/system-integrations/pos/mapping/layout.tsx:12 - default
app/(main)/system-administration/workflow/role-assignment/data/mockData.ts:122 - initialRoleConfiguration
app/(main)/system-administration/workflow/role-assignment/types/approver.ts:26 - AssignedUser
app/(main)/system-administration/workflow/workflow-configuration/components/workflow-notifications.tsx:18 - WorkflowNotifications
app/(main)/system-administration/workflow/workflow-configuration/data/mockData.ts:301 - mockRoutingRules
app/(main)/system-administration/workflow/workflow-configuration/types/workflow.ts:34 - RoutingCondition (used in module)
app/(main)/system-administration/workflow/workflow-configuration/types/workflow.ts:40 - RoutingAction (used in module)
app/(main)/vendor-management/manage-vendors/[id]/components/addresses-tab.tsx:13 - AddressesTab
app/(main)/vendor-management/manage-vendors/[id]/components/basic-info-tab.tsx:15 - BasicInfoTab
app/(main)/vendor-management/manage-vendors/[id]/components/contacts-tab.tsx:13 - ContactsTab
app/(main)/vendor-management/manage-vendors/[id]/hooks/use-vendor.ts:12 - useVendor
app/(main)/vendor-management/manage-vendors/[id]/sections/addresses-section.tsx:13 - AddressesSection
app/(main)/vendor-management/manage-vendors/[id]/sections/basic-info-section.tsx:16 - BasicInfoSection
app/(main)/vendor-management/manage-vendors/[id]/sections/certifications-section.tsx:21 - CertificationsSection
app/(main)/vendor-management/manage-vendors/[id]/sections/contacts-section.tsx:13 - ContactsSection
app/(main)/vendor-management/manage-vendors/[id]/sections/environmental-profile.tsx:98 - EnvironmentalProfile
app/(main)/vendor-management/manage-vendors/[id]/sections/environmental-section.tsx:14 - EnvironmentalSection
app/(main)/vendor-management/manage-vendors/[id]/sections/performance-metrics-section.tsx:81 - default
.next/types/app/(main)/inventory-management/inventory-adjustments/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/inventory-adjustments/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/period-end/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/period-end/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/physical-count/dashboard/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/physical-count/dashboard/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/spot-check/active/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/active/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/spot-check/completed/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/completed/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/spot-check/dashboard/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/dashboard/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/spot-check/new/layout.ts:49 - PageProps
.next/types/app/(main)/inventory-management/spot-check/new/layout.ts:53 - LayoutProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/new/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/new/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/stock-overview/inventory-aging/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/stock-overview/inventory-aging/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/stock-overview/inventory-balance/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/stock-overview/inventory-balance/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/stock-overview/slow-moving/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/stock-overview/slow-moving/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/stock-overview/stock-card/layout.ts:49 - PageProps
.next/types/app/(main)/inventory-management/stock-overview/stock-card/layout.ts:53 - LayoutProps (used in module)
.next/types/app/(main)/inventory-management/stock-overview/stock-card/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/stock-overview/stock-card/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/stock-overview/stock-cards/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/stock-overview/stock-cards/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/recipe-management/categories/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/recipe-management/categories/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/recipe-management/cuisine-types/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/recipe-management/cuisine-types/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/recipe-management/recipes/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/recipe-management/recipes/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/credit-note/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/credit-note/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/credit-note/new/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/credit-note/new/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/goods-received-note/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/goods-received-note/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/goods-received-note/create/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/goods-received-note/create/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-orders/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-orders/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-orders/create/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-orders/create/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-request-templates/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-request-templates/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-requests/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-requests/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-requests/enhanced-demo/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-requests/enhanced-demo/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-requests/new-pr/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-requests/new-pr/page.ts:53 - LayoutProps
.next/types/app/(main)/product-management/products/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/product-management/products/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/store-operations/store-requisitions/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/store-operations/store-requisitions/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/location-management/new/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/location-management/new/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integration/pos/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integration/pos/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/layout.ts:49 - PageProps
.next/types/app/(main)/system-administration/system-integrations/pos/layout.ts:53 - LayoutProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/user-management/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/user-management/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/workflow/role-assignment/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/workflow/role-assignment/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/workflow/workflow-configuration/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/workflow/workflow-configuration/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/campaigns/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/campaigns/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/campaigns/new/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/campaigns/new/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/manage-vendors/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/manage-vendors/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/manage-vendors/new/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/manage-vendors/new/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/pricelists/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/pricelists/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/pricelists/add/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/pricelists/add/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/pricelists/new/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/pricelists/new/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/templates/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/templates/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/templates/new/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/templates/new/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/vendor-portal/sample/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/vendor-portal/sample/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/vendors/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/vendors/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/vendors/new/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/vendors/new/page.ts:53 - LayoutProps
.next/types/app/api/pr/[prId]/items/route.ts:309 - PageProps
.next/types/app/api/pr/[prId]/items/route.ts:313 - LayoutProps
.next/types/app/api/price-management/assignments/approvals/route.ts:309 - PageProps
.next/types/app/api/price-management/assignments/approvals/route.ts:313 - LayoutProps
.next/types/app/api/price-management/assignments/bulk/route.ts:309 - PageProps
.next/types/app/api/price-management/assignments/bulk/route.ts:313 - LayoutProps
.next/types/app/api/price-management/assignments/overrides/route.ts:309 - PageProps
.next/types/app/api/price-management/assignments/overrides/route.ts:313 - LayoutProps
.next/types/app/api/price-management/assignments/performance/route.ts:309 - PageProps
.next/types/app/api/price-management/assignments/performance/route.ts:313 - LayoutProps
.next/types/app/api/price-management/assignments/queues/route.ts:309 - PageProps
.next/types/app/api/price-management/assignments/queues/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/[id]/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/[id]/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/analytics/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/analytics/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/approvals/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/approvals/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/audit/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/audit/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/compliance-report/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/compliance-report/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/emergency-deactivate/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/emergency-deactivate/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/performance/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/performance/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/rollback/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/rollback/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/templates/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/templates/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/test/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/test/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/test-datasets/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/test-datasets/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/test-scenarios/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/test-scenarios/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/versions/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/versions/route.ts:313 - LayoutProps
.next/types/app/api/price-management/campaigns/[id]/route.ts:309 - PageProps
.next/types/app/api/price-management/campaigns/[id]/route.ts:313 - LayoutProps
.next/types/app/api/price-management/campaigns/duplicate/route.ts:309 - PageProps
.next/types/app/api/price-management/campaigns/duplicate/route.ts:313 - LayoutProps
.next/types/app/api/price-management/campaigns/templates/route.ts:309 - PageProps
.next/types/app/api/price-management/campaigns/templates/route.ts:313 - LayoutProps
.next/types/app/api/price-management/campaigns/validate/route.ts:309 - PageProps
.next/types/app/api/price-management/campaigns/validate/route.ts:313 - LayoutProps
.next/types/app/api/price-management/dashboards/templates/route.ts:309 - PageProps
.next/types/app/api/price-management/dashboards/templates/route.ts:313 - LayoutProps
.next/types/app/api/price-management/reports/comparative-analysis/route.ts:309 - PageProps
.next/types/app/api/price-management/reports/comparative-analysis/route.ts:313 - LayoutProps
.next/types/app/api/price-management/reports/cost-savings/route.ts:309 - PageProps
.next/types/app/api/price-management/reports/cost-savings/route.ts:313 - LayoutProps
.next/types/app/api/price-management/reports/export/route.ts:309 - PageProps
.next/types/app/api/price-management/reports/export/route.ts:313 - LayoutProps
.next/types/app/api/price-management/reports/scheduled/route.ts:309 - PageProps
.next/types/app/api/price-management/reports/scheduled/route.ts:313 - LayoutProps
.next/types/app/api/price-management/validation/flags/route.ts:309 - PageProps
.next/types/app/api/price-management/validation/flags/route.ts:313 - LayoutProps
.next/types/app/api/price-management/validation/workflows/route.ts:309 - PageProps
.next/types/app/api/price-management/validation/workflows/route.ts:313 - LayoutProps
.next/types/app/api/price-management/vendors/[id]/route.ts:309 - PageProps
.next/types/app/api/price-management/vendors/[id]/route.ts:313 - LayoutProps
.next/types/app/api/purchase-requests/[id]/price-assignment/route.ts:309 - PageProps
.next/types/app/api/purchase-requests/[id]/price-assignment/route.ts:313 - LayoutProps
.next/types/app/inventory/stock-overview/stock-card/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/inventory/stock-overview/stock-card/[id]/page.ts:53 - LayoutProps
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:1 - MappingHeader
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:2 - FilterBar
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:3 - DataTable
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:4 - StatusBadge
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:5 - RowActions
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:6 - MappingNav
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:8 - FilterOption
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:8 - FilterGroup
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:8 - AppliedFilter
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:9 - ActionType
app/(main)/system-administration/system-integrations/pos/mapping/components/index.ts:10 - StatusType
app/(main)/system-administration/system-integrations/pos/mapping/locations/types.ts:16 - LocationMappingFormData
app/(main)/system-administration/system-integrations/pos/mapping/recipes/types.ts:20 - RecipeMappingFormData
app/(main)/system-administration/system-integrations/pos/mapping/units/types.ts:18 - UnitMappingFormData
.next/types/app/(main)/inventory-management/physical-count/active/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/physical-count/active/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/spot-check/active/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/active/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/inventory-management/spot-check/completed/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/inventory-management/spot-check/completed/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/recipe-management/recipes/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/recipe-management/recipes/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/recipe-management/recipes/create/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/recipe-management/recipes/create/page.ts:53 - LayoutProps
.next/types/app/(main)/operational-planning/recipe-management/recipes/new/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/recipe-management/recipes/new/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/goods-received-note/[id]/edit/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/goods-received-note/[id]/edit/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/goods-received-note/new/item-location-selection/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/goods-received-note/new/item-location-selection/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/goods-received-note/new/manual-entry/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/goods-received-note/new/manual-entry/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/goods-received-note/new/po-selection/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/goods-received-note/new/po-selection/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/goods-received-note/new/vendor-selection/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/goods-received-note/new/vendor-selection/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-orders/[id]/edit/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-orders/[id]/edit/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-orders/create/bulk/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-orders/create/bulk/page.ts:53 - LayoutProps
.next/types/app/(main)/procurement/purchase-orders/create/from-pr/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/procurement/purchase-orders/create/from-pr/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/location-management/[id]/edit/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/location-management/[id]/edit/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/location-management/[id]/view/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/location-management/[id]/view/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/reports/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/reports/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/settings/layout.ts:49 - PageProps
.next/types/app/(main)/system-administration/system-integrations/pos/settings/layout.ts:53 - LayoutProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/settings/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/settings/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/transactions/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/transactions/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/workflow/role-assignment/components/layout.ts:49 - PageProps
.next/types/app/(main)/system-administration/workflow/role-assignment/components/layout.ts:53 - LayoutProps (used in module)
.next/types/app/(main)/system-administration/workflow/workflow-configuration/[id]/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/workflow/workflow-configuration/[id]/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/pricelists/[id]/edit/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/pricelists/[id]/edit/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/pricelists/[id]/edit-new/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/pricelists/[id]/edit-new/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/templates/[id]/edit/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/templates/[id]/edit/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/vendors/[id]/edit/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/vendors/[id]/edit/page.ts:53 - LayoutProps
.next/types/app/(main)/vendor-management/vendors/[id]/pricelist-settings/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/vendor-management/vendors/[id]/pricelist-settings/page.ts:53 - LayoutProps
.next/types/app/api/pr/[prId]/items/[itemId]/route.ts:309 - PageProps
.next/types/app/api/pr/[prId]/items/[itemId]/route.ts:313 - LayoutProps
.next/types/app/api/price-management/assignments/[itemId]/retry/route.ts:309 - PageProps
.next/types/app/api/price-management/assignments/[itemId]/retry/route.ts:313 - LayoutProps
.next/types/app/api/price-management/bulk-operations/[id]/control/route.ts:309 - PageProps
.next/types/app/api/price-management/bulk-operations/[id]/control/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/approvals/[requestId]/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/approvals/[requestId]/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/test-datasets/[id]/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/test-datasets/[id]/route.ts:313 - LayoutProps
.next/types/app/api/price-management/campaigns/[id]/actions/route.ts:309 - PageProps
.next/types/app/api/price-management/campaigns/[id]/actions/route.ts:313 - LayoutProps
.next/types/app/api/price-management/campaigns/[id]/analytics/route.ts:309 - PageProps
.next/types/app/api/price-management/campaigns/[id]/analytics/route.ts:313 - LayoutProps
.next/types/app/api/price-management/campaigns/[id]/vendors/route.ts:309 - PageProps
.next/types/app/api/price-management/campaigns/[id]/vendors/route.ts:313 - LayoutProps
.next/types/app/api/price-management/reports/download/[reportId]/route.ts:309 - PageProps
.next/types/app/api/price-management/reports/download/[reportId]/route.ts:313 - LayoutProps
.next/types/app/api/price-management/templates/download/[templateId]/route.ts:309 - PageProps
.next/types/app/api/price-management/templates/download/[templateId]/route.ts:313 - LayoutProps
.next/types/app/api/price-management/vendors/[id]/pricelist-settings/route.ts:309 - PageProps
.next/types/app/api/price-management/vendors/[id]/pricelist-settings/route.ts:313 - LayoutProps
.next/types/app/api/purchase-requests/items/[itemId]/price-alerts/route.ts:309 - PageProps
.next/types/app/api/purchase-requests/items/[itemId]/price-alerts/route.ts:313 - LayoutProps
.next/types/app/api/purchase-requests/items/[itemId]/price-assignment/route.ts:309 - PageProps
.next/types/app/api/purchase-requests/items/[itemId]/price-assignment/route.ts:313 - LayoutProps
.next/types/app/api/purchase-requests/items/[itemId]/price-history/route.ts:309 - PageProps
.next/types/app/api/purchase-requests/items/[itemId]/price-history/route.ts:313 - LayoutProps
.next/types/app/api/purchase-requests/items/[itemId]/vendor-comparison/route.ts:309 - PageProps
.next/types/app/api/purchase-requests/items/[itemId]/vendor-comparison/route.ts:313 - LayoutProps
.next/types/app/(main)/operational-planning/recipe-management/recipes/[id]/edit/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/operational-planning/recipe-management/recipes/[id]/edit/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/mapping/locations/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/mapping/locations/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/mapping/recipes/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/mapping/recipes/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/mapping/units/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/mapping/units/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/reports/consumption/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/reports/consumption/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/reports/gross-profit/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/reports/gross-profit/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/settings/config/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/settings/config/page.ts:53 - LayoutProps
.next/types/app/(main)/system-administration/system-integrations/pos/settings/system/page.ts:49 - PageProps (used in module)
.next/types/app/(main)/system-administration/system-integrations/pos/settings/system/page.ts:53 - LayoutProps
.next/types/app/api/pr/[prId]/items/[itemId]/transition/route.ts:309 - PageProps
.next/types/app/api/pr/[prId]/items/[itemId]/transition/route.ts:313 - LayoutProps
.next/types/app/api/price-management/business-rules/test-datasets/[id]/run/route.ts:309 - PageProps
.next/types/app/api/price-management/business-rules/test-datasets/[id]/run/route.ts:313 - LayoutProps
.next/types/app/api/price-management/reports/scheduled/[id]/execute/route.ts:309 - PageProps
.next/types/app/api/price-management/reports/scheduled/[id]/execute/route.ts:313 - LayoutProps

```
