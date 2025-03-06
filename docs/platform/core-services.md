```mermaid
graph LR
    subgraph Event Sources
        ES_BusinessEvents[Business Process Events]
        ES_SystemEvents[System Events]
        ES_IntegrationEvents[Integration Events]
        ES_ScheduledEvents[Scheduled Events]
        ES_ManualEvents[Manual Events]
    end

    subgraph Core Notification Services
        CNS_EventHub[Event Hub]
        CNS_RulesEngine[Rules Engine]
        CNS_TemplateService[Template Service]
        CNS_PreferenceService[Preference Service]
        CNS_PriorityQueue[Priority & Queue Manager]
        CNS_NotificationGenerator[Notification Generator]
    end

    subgraph Delivery Services
        DS_InApp[In-App Service]
        DS_Email[Email Service]
        DS_SMS[SMS Service]
        DS_Push[Push Service]
        DS_Dashboard[Dashboard Service]
        DS_Webhook[Webhook Service]
    end

    subgraph Management & Analytics
        MA_Tracking[Tracking Service]
        MA_Escalation[Escalation Service]
        MA_Archiving[Archiving Service]
        MA_Analytics[Analytics Service]
        MA_AdminConsole[Admin Console]
        MA_Reporting[Reporting Service]
    end

    subgraph Data Stores
        Store_NotificationDB[Notification DB]
        Store_TemplateDB[Template DB]
        Store_PreferenceDB[Preference DB]
        Store_AnalyticsDB[Analytics DB]
    end

    subgraph Integration Layer
        IL_APIGateway[API Gateway]
        IL_SyncAdapters[Sync Adapters]
        IL_AsyncAdapters[Async Adapters]
        IL_Connectors[Connectors]
    end

    Event Sources --> CNS_EventHub
    CNS_EventHub --> CNS_RulesEngine
    CNS_RulesEngine --> CNS_TemplateService
    CNS_RulesEngine --> CNS_PreferenceService
    CNS_RulesEngine --> CNS_PriorityQueue
    CNS_TemplateService --> CNS_NotificationGenerator
    CNS_PreferenceService --> CNS_NotificationGenerator
    CNS_PriorityQueue --> CNS_NotificationGenerator
    CNS_NotificationGenerator --> Delivery Services

    Core Notification Services --> Management & Analytics
    Core Notification Services --> Data Stores
    Integration Layer --> Core Notification Services
    Delivery Services --> Tracking Service
    Management & Analytics --> Data Stores
    Data Stores --> Analytics Service

    style Core Notification Services fill:#f9f,stroke:#333,stroke-width:2px
    style Delivery Services fill:#ccf,stroke:#333,stroke-width:2px
    style Management & Analytics fill:#fcc,stroke:#333,stroke-width:2px
    style Data Stores fill:#efe,stroke:#333,stroke-width:2px
    style Integration Layer fill:#cfc,stroke:#333,stroke-width:2px
    style Event Sources fill:#eee,stroke:#333,stroke-width:2px
```