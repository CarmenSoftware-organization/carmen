# Recipe Module - Page Flow

**Status**: Draft  
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Last Updated**: March 27, 2024

## Introduction

This document outlines the page flows and user journeys within the Recipe Management module. It provides visual representations of how users navigate through different screens and the actions they can perform at each step.

## Main Page Flows

### Recipe Management Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Recipe List    │────▶│  Recipe Detail  │────▶│  Recipe Edit    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       │                       │
┌─────────────────┐             │                       │
│                 │             │                       │
│  Recipe Create  │◀────────────┴───────────────────────┘
│                 │
└─────────────────┘
```

### Recipe List Flow

```
┌─────────────────┐
│                 │
│  Recipe List    │
│                 │
└─────────────────┘
        │
        ├─────────────┬─────────────┬─────────────┐
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│             │ │             │ │             │ │             │
│ View Recipe │ │ Create New  │ │ Filter/Sort │ │ Batch       │
│             │ │             │ │             │ │ Operations  │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### Recipe Detail Flow

```
┌─────────────────┐
│                 │
│  Recipe Detail  │
│                 │
└─────────────────┘
        │
        ├─────────────┬─────────────┬─────────────┬─────────────┐
        │             │             │             │             │
        ▼             ▼             ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│             │ │             │ │             │ │             │ │             │
│ Edit Recipe │ │ Print       │ │ Share       │ │ Download    │ │ Back to     │
│             │ │             │ │             │ │             │ │ List        │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### Recipe Creation Flow

```
┌─────────────────┐
│                 │
│  Recipe Create  │
│                 │
└─────────────────┘
        │
        ├─────────────┬─────────────┬─────────────┬─────────────┐
        │             │             │             │             │
        ▼             ▼             ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│             │ │             │ │             │ │             │ │             │
│ Basic Info  │ │ Ingredients │ │ Prep Steps  │ │ Cost/Pricing│ │ Save/Publish│
│             │ │             │ │             │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

## Recipe Status Flow

```
┌─────────────┐         ┌─────────────┐
│             │ Publish │             │
│    Draft    │────────▶│  Published  │
│             │         │             │
└─────────────┘         └─────────────┘
      ▲                        │
      │                        │
      │         Archive        │
      └────────────────────────┘
```

## Tab Navigation

### Recipe Detail Tabs

```
┌───────────┬───────────┬───────────┬───────────┬───────────┐
│           │           │           │           │           │
│Ingredients│Preparation│   Cost    │  Details  │   Notes   │
│           │           │           │           │           │
└───────────┴───────────┴───────────┴───────────┴───────────┘
```

## User Journeys

### Journey 1: Creating a New Recipe

1. **Start**: User navigates to Recipe List page
2. **Action**: User clicks "Create New Recipe" button
3. **Result**: System displays Recipe Create page
4. **Action**: User fills in basic information and uploads image
5. **Action**: User adds ingredients with quantities and units
6. **Action**: User adds preparation steps with instructions
7. **Action**: User reviews cost calculations and pricing
8. **Action**: User clicks "Save as Draft" or "Publish"
9. **Result**: System saves recipe and redirects to Recipe Detail page

### Journey 2: Editing an Existing Recipe

1. **Start**: User navigates to Recipe List page
2. **Action**: User finds and clicks on a recipe
3. **Result**: System displays Recipe Detail page
4. **Action**: User clicks "Edit Recipe" button
5. **Result**: System displays Recipe Edit page with pre-filled data
6. **Action**: User makes necessary changes
7. **Action**: User clicks "Save Changes"
8. **Result**: System updates recipe and redirects to Recipe Detail page

### Journey 3: Filtering and Finding Recipes

1. **Start**: User navigates to Recipe List page
2. **Action**: User uses search bar to enter keywords
3. **Action**: User applies category and cuisine filters
4. **Action**: User adjusts cost range filter
5. **Result**: System displays filtered recipe list
6. **Action**: User toggles between grid and list views
7. **Action**: User sorts recipes by cost, name, or date
8. **Result**: System displays sorted recipe list

### Journey 4: Batch Operations

1. **Start**: User navigates to Recipe List page
2. **Action**: User selects multiple recipes using checkboxes
3. **Action**: User clicks "Export Selected" button
4. **Result**: System exports selected recipes
5. **Action**: User selects different recipes
6. **Action**: User clicks "Print Selected" button
7. **Result**: System generates print view for selected recipes

## Mobile User Flow

### Mobile Recipe List

```
┌─────────────────┐
│                 │
│  Recipe List    │
│  (Card View)    │
│                 │
└─────────────────┘
        │
        ├─────────────┬─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│             │ │             │ │             │
│ View Recipe │ │ Create New  │ │ Filter/Sort │
│             │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Mobile Recipe Detail

```
┌─────────────────┐
│                 │
│  Recipe Detail  │
│  (Stacked View) │
│                 │
└─────────────────┘
        │
        ├─────────────┬─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│             │ │             │ │             │
│ Edit Recipe │ │ Share/Print │ │ Back to List│
│             │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
```

## Integration Points

### Inventory Integration

```
┌─────────────────┐                  ┌─────────────────┐
│                 │  Get Products    │                 │
│  Recipe Module  │◀────────────────▶│  Inventory      │
│                 │  Update Stock    │  Module         │
└─────────────────┘                  └─────────────────┘
```

### Cost Control Integration

```
┌─────────────────┐                  ┌─────────────────┐
│                 │  Cost Data       │                 │
│  Recipe Module  │◀────────────────▶│  Cost Control   │
│                 │  Pricing Rules   │  Module         │
└─────────────────┘                  └─────────────────┘
```

## Error Handling Flows

### Validation Errors

```
┌─────────────────┐                  ┌─────────────────┐
│                 │  Invalid Data    │                 │
│  Form Input     │─────────────────▶│  Error Display  │
│                 │                  │                 │
└─────────────────┘                  └─────────────────┘
        │                                     │
        │                                     │
        │         User Corrects               │
        └────────────────────────────────────┘
```

### System Errors

```
┌─────────────────┐                  ┌─────────────────┐
│                 │  System Error    │                 │
│  User Action    │─────────────────▶│  Error Message  │
│                 │                  │                 │
└─────────────────┘                  └─────────────────┘
        │                                     │
        │                                     │
        │         User Retries                │
        └────────────────────────────────────┘
```

## Related Documentation

- [Recipe Module Overview](./RECIPE-Overview.md)
- [Business Requirements](./RECIPE-Business-Requirements.md)
- [Product Requirements Document](./RECIPE-PRD.md)
- [Component Structure](./RECIPE-Component-Structure.md)
- [API Documentation](./RECIPE-API-Endpoints-Overview.md) 