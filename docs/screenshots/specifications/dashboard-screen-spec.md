# Dashboard Screen Specification

**Module**: Dashboard  
**Function**: Executive Overview  
**Screen**: Main Dashboard  
**Version**: 1.0  
**Date**: January 22, 2025  
**Status**: Based on Actual Source Code Analysis

## Implementation Overview

- **Purpose**: Provides executive-level overview of key business metrics, operational status, and performance indicators across all Carmen ERP modules
- **File Locations**: `app/(main)/dashboard/page.tsx`, dashboard components
- **User Types**: All authenticated users with role-based data visibility
- **Current Status**: Core dashboard functionality operational with real-time data integration

## Visual Reference

![Dashboard Screen](../dashboard.png)

## Layout & Navigation

### Header Area
- **Main Navigation**: Full sidebar with module access based on user permissions
- **Breadcrumb Path**: Shows "Dashboard" as the current location
- **User Context**: Display current user role, department, and location in top navigation
- **Action Buttons**: Quick access to frequently used functions like "New Purchase Request" and "Quick Count"

### Layout Structure  
- **Grid-Based Layout**: Responsive card grid system accommodating various widget sizes
- **Four-Column Design**: Optimal information density for desktop viewing
- **Card-Based Widgets**: Individual functional areas contained in distinct cards with consistent styling

## Data Display

### Key Performance Indicators
- **Financial Metrics**: Total revenue, expenses, profit margins displayed prominently
- **Operational Metrics**: Inventory levels, pending approvals, active orders
- **Status Indicators**: Color-coded badges showing system health and urgent items
- **Trend Visualization**: Graphical representation of key metrics over time periods

### Information Cards
- **Purchase Request Summary**: Current pending, approved, and rejected PR counts
- **Inventory Alerts**: Low stock warnings, expiring items, and reorder notifications  
- **Vendor Performance**: Top vendors by volume, performance ratings, payment status
- **Order Status**: Active purchase orders, delivery schedules, and fulfillment tracking
- **Financial Overview**: Budget utilization, spending patterns, and cost center performance
- **System Notifications**: Important alerts, system updates, and user messages

### Real-Time Data
- **Live Updates**: Automatic refresh of critical metrics without page reload
- **Time-Sensitive Alerts**: Immediate notification of urgent items requiring attention
- **Dynamic Content**: Data reflects current user's department and location context
- **Drill-Down Capability**: Click-through navigation to detailed views from summary cards

## User Interactions

### Dashboard Customization
- **Widget Arrangement**: Users can reorder dashboard cards based on priorities
- **Data Filtering**: Time period selectors for historical data comparison
- **Department Context**: Switch between different department views if user has access
- **Refresh Controls**: Manual refresh option for real-time data updates

### Quick Actions
- **Fast Navigation**: Direct links to frequently used functions from dashboard widgets
- **Create Actions**: Quick access buttons for common tasks like creating purchase requests
- **Approval Workflows**: Direct approval/rejection capabilities for authorized users
- **Search Integration**: Global search functionality accessible from dashboard

### Interactive Elements
- **Expandable Cards**: Click to expand cards for detailed information without navigation
- **Contextual Menus**: Right-click options for additional actions on data items
- **Filter Toggles**: Quick filter buttons to show/hide specific data categories
- **Export Options**: Data export capabilities for reporting and analysis

## Role-Based Functionality

### Staff User Permissions
- **Read-Only Access**: View departmental metrics and general business indicators
- **Limited Scope**: Dashboard shows only data relevant to user's department and role
- **Basic Navigation**: Access to standard operational modules based on job function
- **Personal Metrics**: Individual performance indicators and assigned tasks

### Department Manager Permissions  
- **Department Overview**: Complete visibility into departmental operations and metrics
- **Approval Capabilities**: Dashboard widgets show items requiring managerial approval
- **Budget Monitoring**: Financial performance indicators and budget utilization displays
- **Team Management**: Staff performance metrics and resource allocation information

### Financial Manager Permissions
- **Financial Focus**: Emphasis on cost control, budget performance, and financial KPIs
- **Cross-Department View**: Access to financial metrics across all operational departments
- **Approval Authority**: High-level financial approvals and budget modification capabilities
- **Reporting Tools**: Advanced financial reporting and analysis tool access

### Purchasing Staff Permissions
- **Procurement Focus**: Dashboard emphasizes vendor relationships, order status, and purchasing metrics
- **Vendor Management**: Quick access to vendor performance data and relationship status
- **Order Tracking**: Detailed visibility into purchase order lifecycle and delivery status
- **Supplier Analytics**: Performance metrics and cost analysis for procurement optimization

### Counter Staff Permissions
- **Inventory Focus**: Real-time stock levels, movement patterns, and counting activities
- **Location-Specific**: Data filtered to user's assigned location and inventory zones
- **Operational Alerts**: Immediate notifications for stock issues, discrepancies, and required actions
- **Count Management**: Quick access to physical count processes and variance reports

### Chef Permissions
- **Recipe and Consumption**: Focus on ingredient usage, recipe performance, and menu analytics
- **Production Planning**: Kitchen operations metrics, prep schedules, and resource requirements
- **Cost Analysis**: Food cost tracking, portion control, and recipe profitability metrics
- **Menu Performance**: Sales data integration showing recipe popularity and profit margins

## Business Rules & Validation

### Data Access Rules
- **Role-Based Filtering**: Dashboard data automatically filtered based on user permissions
- **Department Boundaries**: Users see only data from authorized departments and locations
- **Time-Based Access**: Some metrics restricted based on user's shift or working hours
- **Approval Hierarchies**: Workflow items appear based on user's position in approval chain

### Real-Time Updates
- **Refresh Intervals**: Critical metrics update every 30 seconds, non-critical every 5 minutes
- **Alert Thresholds**: System-defined and user-configurable thresholds trigger notifications
- **Data Validation**: All displayed metrics validated against business rules before presentation
- **Error Handling**: Graceful degradation when data sources unavailable

### Performance Standards
- **Load Time**: Dashboard loads completely within 3 seconds of navigation
- **Responsiveness**: Interactive elements respond within 500ms of user action
- **Data Accuracy**: All metrics reflect real-time system state with maximum 1-minute lag
- **Concurrent Users**: Supports multiple simultaneous users without performance degradation

## Current Limitations

### Implementation Status
- **Mock Data Integration**: Some widgets currently display placeholder data during development
- **Real-Time Connectivity**: Partial implementation of live data feeds, full implementation pending
- **Customization Features**: Dashboard layout customization in development phase
- **Mobile Responsiveness**: Optimized for desktop, mobile layout improvements planned

### Known Technical Debt
- **Performance Optimization**: Query optimization needed for complex dashboard metrics
- **Caching Strategy**: Implementing efficient caching for frequently accessed dashboard data
- **Error Boundaries**: Enhanced error handling for individual widget failures
- **Accessibility**: Ongoing improvements for screen reader compatibility and keyboard navigation

### Integration Points
- **External Systems**: API integration with accounting software in progress
- **Reporting Engine**: Connection to advanced reporting tools under development
- **Notification System**: Email and mobile notification integration planned
- **Data Warehouse**: Business intelligence integration for historical trend analysis

---

*This specification documents the current implementation state of the Dashboard screen and should be updated as development progresses.*