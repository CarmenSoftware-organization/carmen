# Monitoring - Use Cases (UC)

**Module**: System Administration - Monitoring
**Version**: 1.0
**Last Updated**: 2025-01-16
**Status**: Active Development

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Use Case Index

| ID | Use Case Name | Priority | Status |
|----|---------------|----------|--------|
| UC-MON-001 | View System Health Dashboard | Critical | Planned |
| UC-MON-002 | Investigate Performance Issues | High | Planned |
| UC-MON-003 | Review Error Logs and Troubleshoot | Critical | Planned |
| UC-MON-004 | Search Audit Trail | High | Planned |
| UC-MON-005 | Configure Alert Rules | Critical | Planned |
| UC-MON-006 | Create Custom Dashboard | Medium | Planned |
| UC-MON-007 | Monitor Integration Health | Medium | Planned |
| UC-MON-008 | Analyze User Activity | Medium | Planned |

---

## UC-MON-001: View System Health Dashboard

### Basic Information
- **Actor**: Administrator, Operations Team
- **Preconditions**:
  - User authenticated
  - User has monitoring view permissions
  - System health monitoring enabled
- **Postconditions**:
  - User has visibility into overall system health
  - Critical issues identified
- **Priority**: Critical
- **Frequency**: Multiple times per day

### Main Flow
1. User navigates to Monitoring > System Health Dashboard
2. System loads current health status from all monitored services
3. System displays overall system status with color indicator:
   - Green: All systems operational
   - Yellow: Degraded performance (1+ services degraded)
   - Red: Critical issues (1+ services down)
4. System shows individual service health cards:
   - Database (connection pool, slow queries, replication lag)
   - Cache (hit rate, memory usage, eviction rate)
   - Email Service (delivery rate, bounce rate, queue size)
   - Storage (available space, upload/download speed)
   - External APIs (response times, error rates)
5. User views uptime metrics for each service:
   - Current status (up/down/degraded)
   - Uptime percentage (24h, 7d, 30d, 90d)
   - Last health check timestamp
6. System displays infrastructure metrics:
   - CPU Usage gauge with current percentage
   - Memory Usage gauge with current percentage
   - Disk Space gauge with current percentage
   - Network Latency graph (last 24h)
7. User views active alerts summary:
   - Critical alerts count (red badge)
   - Warning alerts count (yellow badge)
   - Recent alerts timeline (last 10)
8. User views quick performance metrics:
   - Average API response time (p95)
   - Error rate (last hour)
   - Active user sessions
   - Database query performance
9. System auto-refreshes dashboard every 30 seconds
10. User clicks on any service card to view detailed metrics

### Alternative Flows

#### A1: View Detailed Service Health
**Trigger**: User clicks on a service health card (step 10)

1. System navigates to detailed service monitoring page
2. System displays service-specific metrics:
   - Real-time performance graphs
   - Historical trends (7d, 30d)
   - Related alerts
   - Recent errors
3. System shows service dependencies and their status
4. User can trigger manual health check
5. User can view service configuration
6. Return to main flow

#### A2: Acknowledge Critical Alert
**Trigger**: User sees critical alert on dashboard (step 7)

1. User clicks on critical alert
2. System displays alert details modal:
   - Alert rule name
   - Severity and trigger time
   - Current metric value vs. threshold
   - Affected services/resources
3. User clicks "Acknowledge" button
4. System prompts for acknowledgment note (optional)
5. User enters note and confirms
6. System marks alert as acknowledged
7. System records acknowledgment in audit log
8. System updates alert status badge
9. Return to main flow

#### A3: Filter Health Dashboard by Time Period
**Trigger**: User wants to view historical health data (step 5)

1. User selects time period from dropdown (24h, 7d, 30d, 90d)
2. System updates all metrics for selected period
3. System recalculates uptime percentages
4. System updates all graphs and trends
5. System displays historical alert summary for period
6. Return to main flow

#### A4: Export Health Report
**Trigger**: User needs health report for stakeholders (step 9)

1. User clicks "Export Report" button
2. System prompts for report options:
   - Time period (24h, 7d, 30d)
   - Services to include (select all/specific)
   - Format (PDF, CSV)
3. User selects options and confirms
4. System generates comprehensive health report
5. System downloads report file
6. System logs export action in audit trail
7. Return to main flow

### Exception Flows

#### E1: Health Check Service Unavailable
**Trigger**: Health check service not responding (step 2)

1. System displays error message: "Unable to load health status"
2. System shows last known health status with timestamp
3. System displays warning banner: "Real-time monitoring temporarily unavailable"
4. System attempts to reconnect every 30 seconds
5. System sends alert to operations team
6. When service recovers, system auto-refreshes dashboard
7. Return to main flow

#### E2: Service Critical Threshold Exceeded
**Trigger**: Service metric exceeds critical threshold (step 4)

1. System highlights affected service card in red
2. System displays "CRITICAL" badge on card
3. System shows specific metric that exceeded threshold
4. System automatically triggers critical alert
5. System sends immediate notification to on-call team
6. System creates incident ticket (if configured)
7. System suggests troubleshooting steps
8. Continue main flow with critical status visible

#### E3: No Data Available for Service
**Trigger**: Service has no recent health check data (step 4)

1. System displays "No Data" status for service
2. System shows last successful health check timestamp
3. System indicates potential monitoring configuration issue
4. System provides link to monitoring configuration
5. System logs missing data event
6. Continue main flow with incomplete data

---

## UC-MON-002: Investigate Performance Issues

### Basic Information
- **Actor**: Developer, Operations Team, Administrator
- **Preconditions**:
  - User authenticated
  - User has performance monitoring access
  - Performance metrics being collected
- **Postconditions**:
  - Performance bottleneck identified
  - Root cause analysis documented
- **Priority**: High
- **Frequency**: As needed (triggered by alerts or user reports)

### Main Flow
1. User navigates to Monitoring > Performance Dashboard
2. System displays performance overview:
   - API Response Time graph (p50, p95, p99 over last 24h)
   - Page Load Time graph (TTFB, FCP, LCP)
   - Database Query Performance graph
   - Error Rate graph by endpoint
3. User notices elevated response times in graph
4. User selects time range around the spike:
   - Drag selection on graph to zoom in
   - Or use time range picker (last 1h, 6h, 24h, custom)
5. System updates all metrics for selected time range
6. System displays slowest endpoints during that period:
   - Endpoint URL/name
   - Average response time
   - Request count
   - Error rate
   - P95 and P99 response times
7. User clicks on slowest endpoint to drill down
8. System shows endpoint-specific performance data:
   - Response time distribution histogram
   - Throughput (requests per minute)
   - Status code breakdown (200, 400, 500)
   - Geographic distribution of requests
9. System displays recent slow requests table:
   - Request timestamp
   - Response time
   - User (if authenticated)
   - Request parameters
   - Trace ID for detailed investigation
10. User clicks on specific slow request
11. System displays request trace details:
    - Full request/response cycle timeline
    - Database queries executed (with durations)
    - External API calls (with durations)
    - Function call stack
    - Resource usage (CPU, memory)
12. User identifies slow database query as root cause
13. User clicks "View Query Details"
14. System displays query execution plan and suggestions
15. User documents findings in performance investigation notes
16. User creates task for optimization

### Alternative Flows

#### A1: Analyze Database Performance
**Trigger**: User suspects database bottleneck (step 7)

1. User navigates to Database Performance tab
2. System displays database-specific metrics:
   - Query execution time trends
   - Connection pool utilization
   - Lock wait times
   - Transaction durations
3. System shows slow queries list (>500ms):
   - Query text (parameterized)
   - Average execution time
   - Execution count
   - Last execution timestamp
4. User sorts by execution time or frequency
5. User clicks on slow query
6. System displays query analysis:
   - Execution plan
   - Index usage
   - Table scans detected
   - Optimization suggestions
7. User can export query for offline analysis
8. Return to main flow

#### A2: Compare Performance Across Time Periods
**Trigger**: User wants to compare current vs. historical performance (step 5)

1. User clicks "Compare" button
2. System prompts for comparison periods:
   - Current period (default: last 24h)
   - Comparison period (default: previous 24h)
3. User selects periods and confirms
4. System displays side-by-side comparison:
   - Response time delta (% change)
   - Throughput delta
   - Error rate delta
   - Visual indicators (improved/degraded)
5. System highlights significant changes (>20% delta)
6. User can download comparison report
7. Return to main flow

#### A3: Set Performance Budget Alert
**Trigger**: User wants to be notified of future performance degradation (step 9)

1. User clicks "Create Alert" button
2. System pre-fills alert configuration:
   - Metric: P95 response time
   - Endpoint: Current endpoint
   - Threshold: Current baseline + 20%
3. User reviews and adjusts configuration:
   - Modify threshold
   - Set evaluation frequency
   - Configure notification channels
4. User saves alert rule
5. System validates and activates alert
6. System confirms alert creation
7. Return to main flow

#### A4: Analyze Client-Side Performance
**Trigger**: User investigates page load performance (step 2)

1. User clicks on "Page Performance" tab
2. System displays Core Web Vitals metrics:
   - Largest Contentful Paint (LCP) distribution
   - First Input Delay (FID) distribution
   - Cumulative Layout Shift (CLS) distribution
3. System shows performance by page:
   - Page URL
   - Average LCP, FID, CLS
   - Score (Good/Needs Improvement/Poor)
4. User filters by browser, device, or geography
5. System updates metrics for selected filters
6. User drills down into specific page
7. System shows detailed load timeline:
   - DNS lookup time
   - Connection time
   - Server response time
   - Resource load times (JS, CSS, images)
   - Render time
8. System provides optimization recommendations
9. Return to main flow

### Exception Flows

#### E1: Insufficient Data for Analysis
**Trigger**: Not enough performance data collected (step 2)

1. System displays message: "Insufficient data for analysis"
2. System shows data collection status:
   - Collection start time
   - Current data points count
   - Minimum required data points
3. System provides estimated time until sufficient data
4. System offers to configure performance monitoring
5. User can return to dashboard or configure monitoring
6. End use case

#### E2: Trace Data Not Available
**Trigger**: Detailed trace not found for selected request (step 11)

1. System displays message: "Detailed trace data not available"
2. System shows available request metadata:
   - Timestamp, endpoint, response time, status code
3. System explains potential reasons:
   - Trace retention period expired
   - Sampling did not capture this request
   - Trace collection not enabled at time
4. System suggests enabling trace collection for future requests
5. Continue main flow with limited data

#### E3: Performance Data Aggregation Delay
**Trigger**: Recent metrics not yet aggregated (step 2)

1. System displays notice: "Recent data being processed"
2. System shows last aggregation timestamp
3. System displays data with partial results:
   - Real-time data (last 5 minutes) marked as preliminary
   - Aggregated historical data (>5 minutes ago)
4. System auto-refreshes when aggregation completes
5. Continue main flow with delayed data

---

## UC-MON-003: Review Error Logs and Troubleshoot

### Basic Information
- **Actor**: Developer, Support Team, Administrator
- **Preconditions**:
  - User authenticated
  - User has error log access permissions
  - Error logging enabled
- **Postconditions**:
  - Error root cause identified
  - Resolution path documented or issue assigned
- **Priority**: Critical
- **Frequency**: Daily or triggered by error alerts

### Main Flow
1. User navigates to Monitoring > Error Tracking
2. System displays error dashboard:
   - Error rate graph (last 24h, 7d, 30d)
   - Total errors count by severity (debug, info, warning, error, fatal)
   - New errors (first seen in last 24h)
   - Active errors (unresolved, not ignored)
3. System shows error list table with columns:
   - Error message (truncated)
   - Type/category
   - Severity
   - First seen timestamp
   - Last seen timestamp
   - Occurrence count
   - Affected users count
   - Status (new, acknowledged, in-progress, resolved, ignored)
4. User sorts errors by occurrence count (descending)
5. User clicks on error with highest occurrence
6. System navigates to error detail page
7. System displays error information:
   - Full error message
   - Error type and severity
   - Stack trace with syntax highlighting
   - Occurrence statistics:
     - First occurrence: 2025-01-15 08:23:45 UTC
     - Last occurrence: 2025-01-16 14:30:12 UTC
     - Total occurrences: 1,247
     - Unique users affected: 89
   - Trend graph (occurrences over time)
8. System shows contextual information:
   - Browser/device information
   - User role and permissions
   - Request details (URL, method, headers)
   - Session information
   - Environment (production, staging)
9. System displays recent error instances (last 10):
   - Timestamp
   - User
   - Request parameters
   - Full context link
10. User expands first error instance
11. System shows detailed context:
    - Full request/response
    - Database query logs (if applicable)
    - Prior user actions (breadcrumbs)
    - Related log entries (before/after)
12. User identifies root cause: validation error on missing required field
13. User adds investigation note documenting findings
14. User assigns error to development team member
15. System sends notification to assigned developer
16. User sets status to "In Progress"
17. System updates error status and logs change
18. System saves investigation notes in error history

### Alternative Flows

#### A1: Search and Filter Errors
**Trigger**: User looking for specific error (step 3)

1. User enters search query in search box:
   - Error message text
   - Stack trace content
   - User ID or email
2. User applies filters:
   - Severity: error, fatal
   - Date range: Last 7 days
   - Module: Procurement
   - Status: New, Acknowledged
   - Browser: Chrome
3. System filters error list based on criteria
4. System updates error count and graph
5. User can save filter as template
6. System stores saved filter
7. Return to main flow with filtered results

#### A2: Mark Error as Resolved
**Trigger**: Error has been fixed (step 16)

1. User clicks "Mark as Resolved" button
2. System prompts for resolution details:
   - Resolution description
   - Fix implemented (code change, config update, etc.)
   - Deployment version/date
3. User enters resolution details and confirms
4. System changes error status to "Resolved"
5. System creates resolved event in error timeline
6. System monitors for error recurrence
7. If error recurs within 7 days:
   - System automatically reopens error
   - System notifies assigned developer
   - System increments recurrence counter
8. Return to main flow

#### A3: Ignore Error
**Trigger**: Error is not actionable or expected (step 13)

1. User clicks "Ignore" button
2. System prompts for ignore configuration:
   - Ignore reason (dropdown: Expected behavior, Third-party issue, etc.)
   - Ignore duration (Forever, 7 days, 30 days, Custom)
   - Ignore conditions (All instances, Specific user/browser)
3. User selects options and confirms
4. System marks error as ignored
5. System removes error from active list
6. System stops sending alerts for this error
7. System creates audit log entry
8. Return to main flow

#### A4: View Similar Errors
**Trigger**: User wants to find related errors (step 7)

1. User clicks "Find Similar" button
2. System analyzes error characteristics:
   - Stack trace similarity
   - Error message patterns
   - Same file/function
   - Similar request context
3. System displays similar errors list:
   - Similarity score (%)
   - Error message
   - Occurrence count
   - Status
4. User can merge similar errors
5. System consolidates error statistics
6. System updates main error with merged data
7. Return to main flow

#### A5: Set Error Alert
**Trigger**: User wants notification on error spike (step 9)

1. User clicks "Create Alert" button
2. System displays alert configuration form:
   - Alert name (pre-filled: Error spike for [error type])
   - Condition: Occurrence count > X in Y minutes
   - Severity: Warning, Critical
   - Notification channels: Email, Slack, SMS
3. User configures alert thresholds
4. User selects notification recipients
5. User saves alert rule
6. System validates and activates alert
7. System confirms alert creation
8. Return to main flow

### Exception Flows

#### E1: Error Details Not Available
**Trigger**: Error details incomplete or missing (step 7)

1. System displays message: "Limited error information available"
2. System shows available data:
   - Error message
   - Timestamp
   - Basic metadata
3. System explains potential reasons:
   - Data retention period expired
   - Error occurred before detailed logging enabled
   - Context collection failed
4. System provides partial information for investigation
5. Continue main flow with limited data

#### E2: Unable to Assign Error
**Trigger**: Assignment fails (step 14)

1. System displays error message: "Unable to assign error"
2. System validates:
   - User exists and is active
   - User has required permissions
   - System connectivity
3. System suggests alternative actions:
   - Try different team member
   - Add to error backlog
   - Create manual ticket
4. User selects alternative action
5. System executes alternative
6. Return to main flow

#### E3: Error Log Access Denied
**Trigger**: User lacks permission for sensitive errors (step 5)

1. System displays message: "Access denied for this error"
2. System explains: "This error contains sensitive information"
3. System shows sanitized error summary:
   - Error type and category
   - Occurrence count and trend
   - Status
4. System provides option to request access
5. User can request access from administrator
6. End use case

---

## UC-MON-004: Search Audit Trail

### Basic Information
- **Actor**: Administrator, Auditor, Compliance Officer
- **Preconditions**:
  - User authenticated
  - User has audit trail access permissions
  - Audit logging enabled
- **Postconditions**:
  - Relevant audit events found and reviewed
  - Audit report generated (if needed)
- **Priority**: High
- **Frequency**: Weekly or as needed for compliance/investigation

### Main Flow
1. User navigates to Monitoring > Audit Trail
2. System displays audit search interface:
   - Search filters panel (left sidebar)
   - Audit events list (center)
   - Event details panel (right, initially hidden)
3. System shows audit event summary:
   - Total events today
   - Events by type (authentication, data-modification, config-change)
   - Events by severity (info, warning, critical)
4. User configures search filters:
   - Date range: Last 30 days
   - User: "All Users" or specific user
   - Action type: "Data Modification"
   - Resource type: "Purchase Order"
   - Outcome: "Success"
5. User clicks "Search" button
6. System executes audit trail search query
7. System displays filtered audit events (paginated, 50 per page):
   - Timestamp (UTC and local)
   - User (name, ID, role)
   - Action (e.g., "Updated Purchase Order")
   - Resource (e.g., "PO-2024-001")
   - Outcome (Success/Failure)
   - IP Address
   - Quick view icon
8. User sorts results by timestamp (descending)
9. User clicks on specific audit event
10. System displays event details panel:
    - Full event information:
      - Event ID: AUD-2025-001234
      - Timestamp: 2025-01-16 10:35:22 UTC (Local: 2025-01-16 02:35:22 PST)
      - User: John Doe (user-123, purchasing-manager)
      - IP Address: 192.168.1.100
      - User Agent: Chrome 120.0 on Windows 10
    - Action details:
      - Action: Updated Purchase Order
      - Resource Type: Purchase Order
      - Resource ID: PO-2024-001
      - Outcome: Success
    - Data changes (before/after):
      ```json
      Before: { "status": "draft", "total_amount": 1500.00 }
      After:  { "status": "submitted", "total_amount": 1650.00 }
      ```
    - Request metadata:
      - Session ID: sess-abc123
      - Request ID: req-xyz789
11. User reviews changes to verify legitimacy
12. User can export event details or continue searching

### Alternative Flows

#### A1: Advanced Search with Multiple Filters
**Trigger**: User needs complex search criteria (step 4)

1. User clicks "Advanced Search" toggle
2. System displays additional filter options:
   - Multiple users (select from list)
   - Multiple action types (checkboxes)
   - IP address range
   - Severity level
   - Module/feature
   - Custom field search
3. User configures multiple filters:
   - Users: User A, User B, User C
   - Actions: Create, Update, Delete
   - Date range: Specific dates
   - Resource type: Purchase Order, Vendor
4. User combines filters with AND/OR logic
5. User clicks "Search"
6. System applies all filters
7. System displays matching events count
8. Return to main flow with filtered results

#### A2: Save Search Template
**Trigger**: User performs frequent similar searches (step 5)

1. User clicks "Save Search" button
2. System prompts for template details:
   - Template name: "Purchase Order Changes - Last 30 Days"
   - Description (optional)
   - Share with team (checkbox)
3. User enters details and saves
4. System stores search template
5. System adds template to "Saved Searches" dropdown
6. User can load template later for quick access
7. Return to main flow

#### A3: Export Audit Report
**Trigger**: User needs audit report for compliance (step 12)

1. User clicks "Export" button
2. System displays export options:
   - Format: CSV, Excel, PDF, JSON
   - Include: Current search results or all events
   - Date range: Confirm or modify
   - Fields to include: Select columns
3. User selects options:
   - Format: PDF
   - Include: Current search results (87 events)
   - All fields
4. User clicks "Generate Report"
5. System generates comprehensive audit report:
   - Report header (title, date, filters applied)
   - Event list table
   - Summary statistics
   - Footer (generated by, timestamp)
6. System downloads report file
7. System logs report generation in audit trail
8. Return to main flow

#### A4: Investigate Related Events
**Trigger**: User finds suspicious event (step 11)

1. User clicks "Find Related Events" button
2. System searches for related audit events:
   - Same user (within ±1 hour)
   - Same resource (all actions)
   - Same session ID
   - Same IP address (within ±1 hour)
3. System displays related events timeline:
   - Visual timeline graph
   - Event markers
   - Event list below timeline
4. User reviews event sequence
5. User can identify patterns or anomalies
6. User can flag events for review
7. Return to main flow

#### A5: View User Activity Timeline
**Trigger**: User wants complete user activity history (step 9)

1. User clicks on username in event list
2. System navigates to user activity page
3. System displays user audit trail:
   - All actions by user
   - Activity timeline (graphical)
   - Activity summary (logins, changes, access)
4. System highlights unusual activity:
   - Multiple failed login attempts
   - Access from new location
   - High volume of changes
5. User can filter by date range or action type
6. User can export user activity report
7. Return to main flow

### Exception Flows

#### E1: No Audit Events Found
**Trigger**: Search returns no results (step 7)

1. System displays message: "No audit events found matching criteria"
2. System shows applied filters summary
3. System suggests:
   - Expand date range
   - Remove some filters
   - Check for typos in search terms
4. User can modify filters and search again
5. Return to main flow with modified search

#### E2: Audit Trail Search Timeout
**Trigger**: Search query takes too long (step 6)

1. System displays message: "Search timed out. Please narrow your search criteria."
2. System explains: Large date range or broad filters
3. System suggests:
   - Reduce date range to <90 days
   - Add more specific filters
   - Use indexed fields (user, resource type)
4. User modifies search criteria
5. User retries search
6. Return to main flow

#### E3: Audit Data Access Denied
**Trigger**: User lacks permission for sensitive audit data (step 7)

1. System filters out events user cannot access
2. System displays accessible events only
3. System shows notice: "X events hidden due to permissions"
4. User can request access from administrator
5. Continue main flow with filtered results

#### E4: Audit Data Integrity Issue
**Trigger**: Audit event data corrupted or inconsistent (step 10)

1. System displays warning: "Audit data integrity issue detected"
2. System shows event with integrity indicator
3. System displays available data
4. System logs integrity issue for investigation
5. System notifies security team
6. User can still review available information
7. Continue main flow with data quality warning

---

## UC-MON-005: Configure Alert Rules

### Basic Information
- **Actor**: Administrator, Operations Team, Developer
- **Preconditions**:
  - User authenticated
  - User has alert configuration permissions
  - Metrics being collected for alert conditions
- **Postconditions**:
  - Alert rule created and activated
  - Notifications configured
- **Priority**: Critical
- **Frequency**: Weekly or as needed

### Main Flow
1. User navigates to Monitoring > Alerts > Alert Rules
2. System displays alert rules list:
   - Active rules count
   - Triggered alerts (last 24h)
   - Alert rules table (name, status, last triggered, actions)
3. User clicks "Create Alert Rule" button
4. System displays alert rule configuration form
5. User enters alert rule basic information:
   - Name: "High API Response Time"
   - Description: "Alert when API p95 exceeds 1000ms"
   - Severity: Warning
   - Enabled: Yes
6. User configures alert condition:
   - Metric: API Response Time (P95)
   - Operator: Greater than
   - Threshold: 1000 (ms)
   - Duration: 5 minutes
   - Evaluation frequency: Every 1 minute
7. User adds additional condition (optional):
   - Metric: Error Rate
   - Operator: Greater than
   - Threshold: 5 (%)
   - Logic: AND (both conditions must be true)
8. User configures alert scope:
   - Apply to: Specific endpoints
   - Endpoints: /api/purchase-orders, /api/vendors
   - Environment: Production only
9. User configures notification settings:
   - Channels: Email, Slack
   - Recipients:
     - Email: ops-team@company.com, on-call@company.com
     - Slack: #alerts channel
   - Notification template: Default alert template
10. User configures alert behavior:
    - Auto-resolve: Yes (when condition no longer met)
    - Suppress duration: 5 minutes (avoid alert storm)
    - Max alerts per hour: 10
11. User configures escalation (optional):
    - Escalate if unacknowledged after: 30 minutes
    - Escalation policy: "Operations Escalation"
    - Escalation channels: SMS, PagerDuty
12. User reviews alert rule configuration summary
13. User clicks "Test Alert Rule" button
14. System validates alert configuration
15. System simulates alert evaluation with current metrics
16. System displays test results:
    - Would trigger: No (current p95: 450ms)
    - Evaluation time: 125ms
    - Notifications would be sent to: ops-team@company.com, #alerts
17. User clicks "Save and Activate"
18. System saves alert rule
19. System activates alert rule
20. System starts evaluating alert condition every minute
21. System displays success message with alert rule ID
22. System returns to alert rules list with new rule visible

### Alternative Flows

#### A1: Use Alert Rule Template
**Trigger**: User wants to use pre-configured alert (step 3)

1. User clicks "Use Template" button
2. System displays alert rule templates:
   - High CPU Usage
   - High Error Rate
   - Slow Database Queries
   - Failed Login Attempts
   - Low Disk Space
3. User selects "High Error Rate" template
4. System pre-fills alert configuration:
   - Name: "High Error Rate"
   - Condition: Error rate > 5% for 5 minutes
   - Notification: Email to operations team
5. User reviews and modifies as needed
6. Continue main flow from step 12

#### A2: Configure Advanced Alert Condition
**Trigger**: User needs complex alert logic (step 6)

1. User clicks "Advanced Condition" toggle
2. System displays advanced configuration options:
   - Multiple metrics with AND/OR logic
   - Anomaly detection (statistical deviation)
   - Rate of change threshold
   - Time window aggregation
3. User configures complex condition:
   - (Error Rate > 5% AND Response Time > 1000ms)
   - OR (Error Count increased by >200% in last 10 min)
4. System validates condition logic
5. System displays visual condition builder
6. User can test condition with historical data
7. Continue main flow from step 8

#### A3: Configure On-Call Schedule
**Trigger**: User wants to use on-call rotation for alerts (step 9)

1. User selects "Use On-Call Schedule" option
2. System displays on-call schedules:
   - Primary On-Call (current: John Doe)
   - Secondary On-Call (current: Jane Smith)
   - Weekend On-Call (current: Bob Johnson)
3. User selects schedule: "Primary On-Call"
4. System configures notifications to current on-call person
5. System explains schedule rotation and overrides
6. User can view full on-call calendar
7. Continue main flow from step 10

#### A4: Clone Existing Alert Rule
**Trigger**: User wants to create similar alert (step 2)

1. User clicks "Clone" icon on existing alert rule
2. System creates copy of alert rule with "(Copy)" suffix
3. System opens cloned rule in edit mode
4. User modifies cloned rule:
   - Change name
   - Adjust thresholds
   - Update recipients
5. User saves modified rule
6. System activates new alert rule
7. Return to alert rules list

#### A5: Configure Alert Dependencies
**Trigger**: User wants to suppress child alerts when parent alert active (step 11)

1. User clicks "Add Dependency" in alert behavior section
2. System displays available parent alerts:
   - Database Server Down
   - Network Connectivity Issues
   - Service Degradation
3. User selects parent alert: "Database Server Down"
4. System configures dependency:
   - Suppress this alert when parent alert is active
   - Reason: Database issues cause cascading alerts
5. System saves dependency configuration
6. System will suppress alert when database is down
7. Continue main flow from step 12

### Exception Flows

#### E1: Invalid Alert Configuration
**Trigger**: Validation fails (step 14)

1. System displays validation errors:
   - Threshold must be numeric
   - Evaluation frequency minimum: 1 minute
   - At least one notification channel required
2. System highlights invalid fields
3. User corrects errors
4. User clicks "Test Alert Rule" again
5. Return to main flow at step 14

#### E2: Alert Rule Test Fails
**Trigger**: Test evaluation fails (step 15)

1. System displays error message: "Alert test failed"
2. System shows error details:
   - Metric not available
   - Insufficient data for evaluation
   - Query syntax error
3. System suggests fixes:
   - Verify metric name
   - Check data collection status
   - Review condition logic
4. User corrects configuration
5. User retries test
6. Return to main flow at step 13

#### E3: Notification Channel Unavailable
**Trigger**: Email or Slack not configured (step 9)

1. System displays warning: "Notification channel not configured"
2. System shows unconfigured channels:
   - Slack: No webhook configured
   - SMS: No SMS provider configured
3. System provides links to configure channels
4. User can:
   - Configure channel now
   - Remove channel from alert
   - Continue without that channel
5. User makes selection
6. Continue main flow from step 10

#### E4: Alert Rule Quota Exceeded
**Trigger**: Maximum alert rules reached (step 3)

1. System displays message: "Alert rule limit reached (100/100)"
2. System explains: Enterprise plan allows max 100 active alert rules
3. System suggests:
   - Disable unused alert rules
   - Upgrade to higher plan
   - Combine similar alerts
4. User can:
   - View and disable inactive rules
   - Contact support for upgrade
   - Cancel alert creation
5. End use case

---

## UC-MON-006: Create Custom Dashboard

### Basic Information
- **Actor**: Administrator, Operations Team, Developer, Manager
- **Preconditions**:
  - User authenticated
  - User has dashboard creation permissions
  - Metrics and data sources available
- **Postconditions**:
  - Custom dashboard created and saved
  - Dashboard accessible to authorized users
- **Priority**: Medium
- **Frequency**: Weekly or as needed

### Main Flow
1. User navigates to Monitoring > Dashboards
2. System displays dashboards list:
   - Default dashboards (System Health, Performance, Errors)
   - User's custom dashboards
   - Shared team dashboards
3. User clicks "Create Dashboard" button
4. System displays dashboard builder interface:
   - Empty canvas (grid layout)
   - Widget library (left sidebar)
   - Dashboard settings (top bar)
5. User enters dashboard details:
   - Name: "Procurement Module Performance"
   - Description: "Monitor procurement module health and usage"
   - Tags: procurement, performance
   - Visibility: Private
6. User clicks "Add Widget" button
7. System displays widget type selector:
   - Time Series Chart
   - Counter/Stat
   - Table
   - Gauge
   - Pie Chart
   - Heatmap
   - Alert List
8. User selects "Time Series Chart" widget
9. System displays widget configuration panel:
   - Widget title: "API Response Times"
   - Data source: Performance Metrics
   - Metric: API Response Time
   - Aggregation: P95
   - Time range: Last 24 hours
   - Refresh interval: 30 seconds
10. User configures metric filters:
    - Filter: Endpoint starts with "/api/procurement"
    - Environment: Production
11. User configures visualization:
    - Chart type: Line chart
    - Show: P50, P95, P99 (multiple series)
    - Y-axis: Time (ms), logarithmic scale
    - X-axis: Time
    - Legend: Bottom
    - Colors: Auto
12. User clicks "Add to Dashboard"
13. System adds widget to dashboard canvas
14. User drags widget to desired position
15. User resizes widget to preferred size (4 columns × 2 rows)
16. User repeats steps 6-15 to add more widgets:
    - Error Rate counter
    - Active Users gauge
    - Slow Queries table
    - Recent Alerts list
17. User arranges widgets in logical layout
18. User configures dashboard-level settings:
    - Auto-refresh: Every 30 seconds
    - Default time range: Last 24 hours
    - Theme: Dark mode
19. User clicks "Save Dashboard"
20. System validates dashboard configuration
21. System saves dashboard
22. System displays success message
23. System navigates to view dashboard

### Alternative Flows

#### A1: Use Dashboard Template
**Trigger**: User wants pre-configured dashboard (step 3)

1. User clicks "Use Template" button
2. System displays dashboard templates:
   - Application Performance Monitoring
   - Infrastructure Monitoring
   - Business Metrics
   - User Activity
3. User selects "Application Performance Monitoring"
4. System creates dashboard from template
5. System pre-configures widgets:
   - API Response Times
   - Error Rates
   - Database Performance
   - Cache Hit Rates
6. User can customize widgets and layout
7. Continue main flow from step 18

#### A2: Clone Existing Dashboard
**Trigger**: User wants to create similar dashboard (step 2)

1. User finds dashboard to clone
2. User clicks "Clone" button
3. System creates copy with "(Copy)" suffix
4. System opens cloned dashboard in edit mode
5. User modifies dashboard:
   - Change name and description
   - Adjust widgets
   - Update filters
6. User saves modified dashboard
7. Return to main flow

#### A3: Share Dashboard with Team
**Trigger**: User wants to share dashboard (step 19)

1. User clicks "Share Settings" before saving
2. System displays sharing options:
   - Visibility: Private, Team, Organization, Public
   - Permissions: View only, Can edit
   - Specific users (if Team visibility)
3. User selects:
   - Visibility: Team
   - Team: Procurement Team
   - Permissions: View only
4. System configures sharing settings
5. System will notify team members when saved
6. Continue main flow from step 19

#### A4: Add Custom Query Widget
**Trigger**: User needs advanced data query (step 8)

1. User selects "Custom Query" widget
2. System displays query editor:
   - Query language: SQL, PromQL, or JSON
   - Data source selector
   - Query input area
3. User writes custom query:
   ```sql
   SELECT
     DATE_TRUNC('hour', timestamp) as hour,
     COUNT(*) as request_count,
     AVG(response_time) as avg_response
   FROM api_metrics
   WHERE endpoint LIKE '/api/procurement%'
   AND timestamp > NOW() - INTERVAL '24 hours'
   GROUP BY hour
   ORDER BY hour DESC
   ```
4. User clicks "Test Query"
5. System executes query and displays preview
6. User configures visualization for query results
7. Continue main flow from step 12

#### A5: Configure Dashboard Variables
**Trigger**: User wants dynamic filters for entire dashboard (step 18)

1. User clicks "Variables" in dashboard settings
2. System displays variable configuration:
   - Add variable button
   - Existing variables list
3. User clicks "Add Variable"
4. User configures variable:
   - Name: environment
   - Type: Dropdown
   - Label: Environment
   - Options: Production, Staging, Development
   - Default: Production
5. User adds variable to dashboard
6. User applies variable to widgets: $environment
7. System enables environment filter in dashboard header
8. Continue main flow from step 19

### Exception Flows

#### E1: Invalid Widget Configuration
**Trigger**: Widget configuration incomplete or invalid (step 12)

1. System displays validation error:
   - Metric required
   - Invalid time range
   - Data source unavailable
2. System highlights invalid fields
3. User corrects configuration
4. User clicks "Add to Dashboard" again
5. Return to main flow at step 12

#### E2: Data Source Unavailable
**Trigger**: Selected metric not available (step 9)

1. System displays error: "Data source unavailable"
2. System shows alternative data sources:
   - Similar metrics
   - Available metrics for selected source
3. User can:
   - Select alternative metric
   - Configure data collection
   - Remove widget
4. User makes selection
5. Continue main flow from step 9

#### E3: Dashboard Quota Exceeded
**Trigger**: Maximum dashboards limit reached (step 3)

1. System displays message: "Dashboard limit reached (20/20)"
2. System suggests:
   - Delete unused dashboards
   - Upgrade to higher plan
3. User can:
   - View and delete old dashboards
   - Contact support for upgrade
   - Cancel dashboard creation
4. End use case

#### E4: Dashboard Save Failed
**Trigger**: Save operation fails (step 21)

1. System displays error: "Failed to save dashboard"
2. System shows error details:
   - Network connectivity issue
   - Storage quota exceeded
   - Permission denied
3. System auto-saves draft to browser cache
4. User can retry save
5. If retry fails, user can export dashboard config
6. End use case with draft saved locally

---

## UC-MON-007: Monitor Integration Health

### Basic Information
- **Actor**: Administrator, Operations Team, Integration Manager
- **Preconditions**:
  - User authenticated
  - User has integration monitoring access
  - Integrations configured and active
- **Postconditions**:
  - Integration health status verified
  - Issues identified and documented
- **Priority**: Medium
- **Frequency**: Daily or triggered by integration alerts

### Main Flow
1. User navigates to Monitoring > Integrations
2. System displays integration health dashboard:
   - Total integrations count: 12
   - Healthy integrations: 10 (green)
   - Degraded integrations: 1 (yellow)
   - Failed integrations: 1 (red)
3. System shows integration list grouped by category:
   - Payment Gateways (3 integrations)
   - Email Services (2 integrations)
   - Cloud Storage (2 integrations)
   - Authentication Providers (2 integrations)
   - Analytics (1 integration)
   - ERP Systems (2 integrations)
4. Each integration card displays:
   - Integration name and logo
   - Status indicator (healthy/degraded/failed)
   - Last successful call timestamp
   - Success rate (last 24h): 99.2%
   - Average response time: 245ms
   - Quick actions (test, configure, view logs)
5. User notices "Email Service - SendGrid" is degraded
6. User clicks on SendGrid integration card
7. System navigates to integration detail page
8. System displays integration overview:
   - Status: Degraded (high error rate)
   - Integration type: Email Service Provider
   - Configured: 2024-11-15
   - Last health check: 2 minutes ago
   - API version: v3
9. System shows integration metrics (last 24h):
   - Total API calls: 1,247
   - Successful calls: 1,189 (95.3%)
   - Failed calls: 58 (4.7%)
   - Average response time: 312ms (↑ from 245ms baseline)
   - Rate limit usage: 45% of quota
10. System displays error breakdown:
    - Authentication failures: 0
    - Timeout errors: 42 (72%)
    - Rate limit exceeded: 0
    - Server errors (5xx): 16 (28%)
11. System shows recent failed requests (last 10):
    - Timestamp: 2025-01-16 14:25:33
    - Endpoint: /v3/mail/send
    - Error: Timeout after 30s
    - Retry attempts: 3
    - Final status: Failed
12. User clicks "View Logs" for failed request
13. System displays detailed request/response logs:
    - Request payload (sanitized, no email content)
    - Response headers
    - Error message
    - Retry history
14. User identifies pattern: timeouts during peak hours (2pm-4pm)
15. User clicks "Test Integration" button
16. System executes integration health check:
    - Test authentication
    - Send test email
    - Verify webhook endpoint
17. System displays test results:
    - Authentication: ✅ Success (125ms)
    - Send test email: ✅ Success (2.3s)
    - Webhook: ✅ Success (89ms)
    - Overall: ✅ Integration operational
18. User documents findings in integration notes:
    - Issue: Timeout errors during peak hours (2pm-4pm)
    - Likely cause: SendGrid experiencing load issues
    - Action: Monitor for 24h, contact SendGrid if persists
19. User clicks "Save Notes"
20. System saves notes and updates integration timeline

### Alternative Flows

#### A1: View Webhook Delivery Status
**Trigger**: User wants to check webhook deliveries (step 8)

1. User clicks "Webhooks" tab
2. System displays webhook configuration:
   - Webhook URL: https://app.company.com/webhooks/sendgrid
   - Events subscribed: bounce, delivered, opened, clicked
   - Authentication: HMAC signature verification
3. System shows webhook delivery statistics (last 24h):
   - Total webhooks received: 892
   - Successfully processed: 875 (98.1%)
   - Failed processing: 17 (1.9%)
4. System displays recent webhook deliveries:
   - Timestamp, event type, status, processing time
5. User can filter by event type or status
6. User can view failed webhook details
7. Return to main flow

#### A2: Configure Integration Alerts
**Trigger**: User wants alerts for integration issues (step 8)

1. User clicks "Alerts" tab
2. System displays current alert rules for integration:
   - Error rate > 5%: Email to ops-team
   - Response time > 1000ms: Slack #alerts
3. User clicks "Add Alert Rule"
4. System displays alert configuration form
5. User configures new alert:
   - Metric: Failed calls
   - Threshold: > 10 failures in 10 minutes
   - Notification: Email to integration-team
6. User saves alert rule
7. System activates alert for integration
8. Return to main flow

#### A3: View Integration Cost Tracking
**Trigger**: User wants to monitor integration costs (step 9)

1. User clicks "Cost" tab
2. System displays integration cost metrics:
   - Current month usage: $145.00
   - Billing tier: Professional ($0.12 per 1000 emails)
   - Projected monthly cost: $180.00
   - Cost trend graph (last 6 months)
3. System shows usage breakdown:
   - Transactional emails: 950,000 ($114)
   - Marketing emails: 250,000 ($30)
   - SMS (if applicable): $1
4. System highlights cost optimization opportunities:
   - Consider bulk sending for marketing emails
   - Review unused features
5. User can export cost report
6. Return to main flow

#### A4: Disable Integration Temporarily
**Trigger**: Integration causing system issues (step 8)

1. User clicks "Disable Integration" button
2. System displays confirmation dialog:
   - Warning: Integration will be disabled immediately
   - Impact: Email sending will fail until re-enabled
   - Alternative: Use fallback email service (if configured)
3. User confirms disable action
4. System disables integration
5. System marks integration status as "Disabled by user"
6. System sends notification to admin team
7. System logs disable action in audit trail
8. Return to main flow with integration disabled

#### A5: Update Integration Configuration
**Trigger**: User needs to update API credentials (step 8)

1. User clicks "Configure" button
2. System displays integration configuration form:
   - API Key (encrypted, partially visible)
   - API Secret (encrypted, hidden)
   - Webhook URL
   - Settings (timeout, retry policy)
3. User updates API key
4. User clicks "Test Connection"
5. System validates new credentials
6. System displays validation result
7. If valid, user saves configuration
8. System updates integration with new credentials
9. Return to main flow

### Exception Flows

#### E1: Integration Health Check Failed
**Trigger**: Health check cannot execute (step 16)

1. System displays error: "Health check failed to execute"
2. System shows error details:
   - Cannot reach integration endpoint
   - Authentication failed
   - Service unavailable
3. System suggests troubleshooting steps:
   - Verify credentials
   - Check network connectivity
   - Review integration configuration
4. User can retry health check
5. Continue main flow with failed check recorded

#### E2: Integration Completely Unavailable
**Trigger**: Integration endpoint unreachable (step 7)

1. System displays critical warning:
   - "Integration completely unavailable"
   - Last successful call: 2 hours ago
   - All recent attempts failed
2. System shows impact:
   - 127 failed email deliveries
   - 34 queued retries
3. System suggests actions:
   - Switch to fallback service
   - Contact integration provider
   - Check service status page
4. User can activate fallback
5. Continue main flow with critical status

#### E3: Integration Logs Not Available
**Trigger**: Detailed logs not found (step 12)

1. System displays message: "Detailed logs not available"
2. System explains potential reasons:
   - Logs retention period expired (30 days)
   - Detailed logging not enabled
   - Log storage issue
3. System shows available summary data:
   - Error count and type
   - Timestamp
   - Basic metadata
4. User can enable detailed logging for future
5. Continue main flow with limited data

---

## UC-MON-008: Analyze User Activity

### Basic Information
- **Actor**: Administrator, Product Manager, Business Analyst
- **Preconditions**:
  - User authenticated
  - User has user activity analytics access
  - User tracking enabled and compliant with privacy policies
- **Postconditions**:
  - User behavior patterns identified
  - Activity insights documented
- **Priority**: Medium
- **Frequency**: Weekly or monthly for business reviews

### Main Flow
1. User navigates to Monitoring > User Activity
2. System displays user activity analytics dashboard:
   - Active users summary:
     - Real-time active: 45 users
     - Today: 234 users
     - This week: 678 users
     - This month: 1,245 users
   - User engagement metrics:
     - Average session duration: 24 minutes
     - Average pages per session: 12
     - Bounce rate: 8%
3. System shows user activity graph (last 30 days):
   - Daily active users trend line
   - Peak hours heatmap (hourly)
   - Weekly pattern (Mon-Sun)
4. System displays feature usage ranking (last 30 days):
   - Purchase Orders module: 4,567 visits (32%)
   - Inventory Management: 3,234 visits (23%)
   - Vendor Management: 2,890 visits (20%)
   - Reports & Analytics: 1,456 visits (10%)
   - Procurement: 1,234 visits (9%)
   - Others: 879 visits (6%)
5. User selects "Purchase Orders" module to drill down
6. System displays module-specific analytics:
   - Unique users: 89
   - Total visits: 4,567
   - Average time spent: 8 minutes per visit
   - Feature usage within module:
     - List view: 85%
     - Create PO: 45%
     - Edit PO: 38%
     - Approve PO: 22%
     - Export data: 15%
7. System shows user journey flow:
   - Entry points (where users come from):
     - Dashboard: 45%
     - Direct URL: 30%
     - Search: 15%
     - Notifications: 10%
   - Common paths:
     - Dashboard → PO List → View PO → Approve
     - Dashboard → PO List → Create PO → Submit
   - Exit points (where users go next):
     - Stay in module: 35%
     - Dashboard: 30%
     - Inventory: 20%
     - Logout: 15%
8. User clicks "User Segmentation" tab
9. System displays user segments:
   - By role:
     - Purchasing Staff: 34 users (45% of activity)
     - Managers: 23 users (30% of activity)
     - Finance: 18 users (15% of activity)
     - Others: 14 users (10% of activity)
   - By engagement level:
     - Power users (>20 sessions/month): 12 users
     - Active users (5-20 sessions/month): 45 users
     - Casual users (1-5 sessions/month): 32 users
     - Inactive (0 sessions last 30 days): 18 users
10. User selects "Power Users" segment
11. System displays power user details:
    - User list with activity metrics
    - Common workflows
    - Feature adoption rate
    - Time spent per module
12. User clicks "Export Analytics Report"
13. System generates comprehensive report:
    - User activity summary
    - Feature usage statistics
    - User segmentation analysis
    - Trend analysis and insights
    - Recommendations
14. System downloads report as PDF
15. System logs report generation in audit trail

### Alternative Flows

#### A1: Analyze User Retention
**Trigger**: User wants to understand user retention (step 3)

1. User clicks "Retention" tab
2. System displays retention cohort analysis:
   - Cohort definition: Users by signup month
   - Retention periods: Week 1, Week 2, Week 4, Month 3, Month 6
3. System shows retention table:
   - Jan 2025 cohort: 100 users
     - Week 1: 85% (85 users)
     - Week 2: 72% (72 users)
     - Month 1: 65% (65 users)
   - Dec 2024 cohort: 95 users
     - Similar breakdown
4. System displays retention curve graph
5. System highlights retention insights:
   - Strong week 1 retention (85%)
   - Drop-off at week 2 (13% loss)
   - Stable after month 1
6. User can filter cohorts by user attribute
7. Return to main flow

#### A2: View Individual User Activity
**Trigger**: User wants detailed user activity (step 11)

1. User clicks on specific user name
2. System displays user activity profile:
   - User: John Doe (purchasing-staff)
   - Member since: 2024-11-15
   - Last active: 2 hours ago
   - Total sessions: 124
   - Total time: 48 hours 23 minutes
3. System shows user activity timeline:
   - Session history (last 30 days)
   - Actions performed
   - Modules accessed
4. System displays user preferences:
   - Most used features
   - Preferred workflows
   - Device and browser
5. User can view complete session replay (if enabled)
6. Return to main flow

#### A3: Compare Time Periods
**Trigger**: User wants to compare current vs. previous period (step 3)

1. User clicks "Compare" button
2. System prompts for comparison periods:
   - Current period: Last 30 days
   - Compare to: Previous 30 days
3. User confirms comparison
4. System displays side-by-side metrics:
   - Active users: 1,245 vs. 1,180 (+5.5%)
   - Session duration: 24 min vs. 22 min (+9%)
   - Feature usage changes
5. System highlights significant changes:
   - Purchase Orders usage +15%
   - Reports usage -8%
6. System provides insights on changes
7. Return to main flow

#### A4: Set Up Activity Alerts
**Trigger**: User wants alerts for activity anomalies (step 3)

1. User clicks "Configure Alerts" button
2. System displays activity alert options:
   - Unusual drop in active users
   - Spike in error-triggering actions
   - Feature adoption milestones
3. User configures alert:
   - Alert: Daily active users drop >20%
   - Notification: Email to product-team
4. User saves alert configuration
5. System activates activity monitoring alert
6. Return to main flow

#### A5: Analyze Feature Adoption
**Trigger**: User wants to track new feature usage (step 4)

1. User clicks "Feature Adoption" tab
2. System displays recent feature launches:
   - Bulk PO Import (launched: 2024-12-01)
   - Advanced Filters (launched: 2024-11-15)
   - Mobile App (launched: 2024-11-01)
3. System shows adoption metrics for each feature:
   - Bulk PO Import:
     - Aware: 65% (saw feature announcement)
     - Tried: 28% (used at least once)
     - Adopted: 15% (used >5 times)
     - Power users: 5% (used weekly)
4. System displays adoption curve over time
5. System provides adoption insights and recommendations
6. Return to main flow

### Exception Flows

#### E1: Insufficient Activity Data
**Trigger**: Not enough data for analysis (step 2)

1. System displays message: "Insufficient activity data"
2. System explains:
   - User tracking enabled: 15 days ago
   - Minimum data required: 30 days
   - Current data points: 450
3. System shows available data with disclaimer
4. System estimates when full analysis available
5. Continue main flow with limited data and disclaimer

#### E2: Privacy Restrictions Apply
**Trigger**: User requests data that violates privacy policy (step 11)

1. System displays notice: "Privacy restrictions apply"
2. System explains:
   - Individual user data anonymized after 30 days
   - Some metrics unavailable due to privacy settings
   - Aggregate data available
3. System displays anonymized data only
4. System logs privacy-compliant access
5. Continue main flow with restricted data

#### E3: Export Generation Failed
**Trigger**: Report generation fails (step 13)

1. System displays error: "Report generation failed"
2. System shows error details:
   - Large dataset (timeout)
   - Storage quota exceeded
   - Processing error
3. System suggests alternatives:
   - Reduce date range
   - Export in smaller chunks
   - Schedule report for later
4. User selects alternative
5. Continue with alternative approach

#### E4: Real-Time Data Delay
**Trigger**: Real-time metrics not current (step 2)

1. System displays notice: "Real-time data delayed"
2. System shows:
   - Last update: 15 minutes ago
   - Normal update frequency: 5 minutes
   - Reason: High system load
3. System provides option to refresh manually
4. System continues with most recent available data
5. Continue main flow with delayed data indicator

---

**Document Control**:
- **Created**: 2025-01-16
- **Version**: 1.0
- **Status**: Active Development
- **Next Review**: Q2 2025
