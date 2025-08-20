# TAT API Services - Data Flow Diagram (DFD)

## Level 0 - Context Diagram
```mermaid
graph TB
    subgraph "External Systems"
        Client[Client Applications]
        LDAP[LDAP Server]
        DB[(Database)]
        Redis[(Redis Cache)]
        WS[WebSocket Clients]
    end
    
    subgraph "TAT API Services"
        API[TAT API Gateway]
    end
    
    Client -->|HTTP/HTTPS Requests| API
    LDAP -->|Authentication| API
    API -->|Data Operations| DB
    API -->|Cache Operations| Redis
    API -->|Real-time Updates| WS
    
    style API fill:#e1f5fe
    style Client fill:#f3e5f5
    style LDAP fill:#fff3e0
    style DB fill:#e8f5e8
    style Redis fill:#ffebee
    style WS fill:#f1f8e9
```

## Level 1 - System Overview
```mermaid
graph TB
    subgraph "External Interfaces"
        Client[Client Applications]
        LDAP[LDAP Server]
        DB[(Database)]
        Redis[(Redis Cache)]
        WS[WebSocket Clients]
    end
    
    subgraph "API Gateway Layer"
        Gateway[API Gateway<br/>Port 3000]
        WSGateway[WebSocket Gateway<br/>Port 8080]
    end
    
    subgraph "Core Services"
        Auth[Authentication Service]
        Users[User Management]
        MasterData[Master Data Service]
        Approval[Approval Workflow]
        Reports[Report Services]
        Files[File Management]
        Notifications[Notification Service]
        LDAPService[LDAP Service]
    end
    
    subgraph "Data Layer"
        Repos[Repository Layer]
        Cache[Cache Service]
        Logger[Logging Service]
    end
    
    Client -->|HTTP Requests| Gateway
    LDAP -->|Auth| LDAPService
    Gateway --> Auth
    Gateway --> Users
    Gateway --> MasterData
    Gateway --> Approval
    Gateway --> Reports
    Gateway --> Files
    Gateway --> Notifications
    Gateway --> LDAPService
    
    Auth --> Users
    Approval --> Files
    Approval --> Notifications
    Reports --> Approval
    Reports --> MasterData
    
    Users --> Repos
    MasterData --> Repos
    Approval --> Repos
    Reports --> Repos
    Files --> Repos
    Notifications --> Repos
    LDAPService --> Repos
    
    Repos --> DB
    Repos --> Cache
    Cache --> Redis
    
    Notifications --> WSGateway
    WSGateway --> WS
    
    Logger -->|Logs| DB
    
    style Gateway fill:#e3f2fd
    style Auth fill:#e8f5e8
    style Approval fill:#fff3e0
    style MasterData fill:#f3e5f5
    style Reports fill:#e1f5fe
```

## Level 2 - Authentication & User Management Flow
```mermaid
graph TB
    subgraph "Client Layer"
        Client[Client Application]
    end
    
    subgraph "Authentication Flow"
        Login[Login Request]
        JWTStrategy[JWT Strategy]
        LocalStrategy[Local Strategy]
        LDAPStrategy[LDAP Strategy]
        AuthService[Auth Service]
        SessionService[Session Service]
        AuditLogService[Audit Log Service]
    end
    
    subgraph "User Management"
        UserService[User Service]
        UserRepo[User Repository]
        EmployeeRepo[Employee Repository]
    end
    
    subgraph "Cache Layer"
        RedisCache[Redis Cache Service]
    end
    
    subgraph "Database"
        DB[(Database)]
    end
    
    Client -->|POST /api/v1/auth/login| Login
    Login --> AuthService
    AuthService --> LocalStrategy
    AuthService --> LDAPStrategy
    AuthService --> JWTStrategy
    
    LocalStrategy --> UserService
    LDAPStrategy --> UserService
    UserService --> UserRepo
    UserService --> EmployeeRepo
    
    UserRepo --> DB
    EmployeeRepo --> DB
    
    AuthService --> SessionService
    SessionService --> RedisCache
    RedisCache --> DB
    
    AuthService --> AuditLogService
    AuditLogService --> DB
    
    style AuthService fill:#e8f5e8
    style UserService fill:#e1f5fe
    style RedisCache fill:#ffebee
```

## Level 2 - Approval Workflow Data Flow
```mermaid
graph TB
    subgraph "Client Layer"
        Client[Client Application]
    end
    
    subgraph "Approval Module"
        ApprovalController[Approval Controller]
        ApprovalService[Approval Service]
        ApprovalRepo[Approval Repository]
        StatusLabelRepo[Status Label Repository]
        AttachmentService[Attachment Service]
    end
    
    subgraph "Supporting Services"
        FileService[File Service]
        NotificationService[Notification Service]
        MasterDataService[Master Data Service]
    end
    
    subgraph "Data Storage"
        DB[(Database)]
        FileStorage[File Storage]
        Redis[(Redis Cache)]
    end
    
    Client -->|POST /api/v1/approval| ApprovalController
    Client -->|GET /api/v1/approval| ApprovalController
    Client -->|PUT /api/v1/approval/:id| ApprovalController
    
    ApprovalController --> ApprovalService
    ApprovalService --> ApprovalRepo
    ApprovalService --> StatusLabelRepo
    ApprovalService --> AttachmentService
    
    ApprovalService --> MasterDataService
    AttachmentService --> FileService
    
    ApprovalRepo --> DB
    StatusLabelRepo --> DB
    FileService --> FileStorage
    FileService --> DB
    
    ApprovalService --> NotificationService
    NotificationService --> Redis
    NotificationService --> DB
    
    style ApprovalService fill:#fff3e0
    style FileService fill:#e1f5fe
    style NotificationService fill:#f3e5f5
```

## Level 2 - Master Data Management Flow
```mermaid
graph TB
    subgraph "Client Layer"
        Client[Client Application]
    end
    
    subgraph "Master Data Module"
        MDController[Master Data Controller]
        MDService[Master Data Service]
        MDRepo[Master Data Repository]
    end
    
    subgraph "Data Categories"
        Countries[Countries]
        Places[Places]
        Rates[Rates & Allowances]
        Expenses[Expense Types]
        Offices[Office Locations]
        Positions[Committee Positions]
    end
    
    subgraph "Cache Layer"
        RedisCache[Redis Cache Service]
    end
    
    subgraph "Database"
        DB[(Database)]
    end
    
    Client -->|GET /api/v1/master-data/*| MDController
    Client -->|POST /api/v1/master-data/*| MDController
    Client -->|PUT /api/v1/master-data/*| MDController
    Client -->|DELETE /api/v1/master-data/*| MDController
    
    MDController --> MDService
    MDService --> MDRepo
    
    MDService --> Countries
    MDService --> Places
    MDService --> Rates
    MDService --> Expenses
    MDService --> Offices
    MDService --> Positions
    
    MDRepo --> DB
    MDService --> RedisCache
    RedisCache --> DB
    
    style MDService fill:#e8f5e8
    style RedisCache fill:#ffebee
```

## Level 2 - Report Generation Flow
```mermaid
graph TB
    subgraph "Client Layer"
        Client[Client Application]
    end
    
    subgraph "Report Module"
        ReportController[Report Controller]
        ReportService[Report Service]
        ReportRepo[Report Repository]
        EntertainmentController[Entertainment Controller]
        MeetingController[Meeting Controller]
    end
    
    subgraph "Report Types"
        TravelReports[Travel Reports]
        ExpenseReports[Expense Reports]
        EntertainmentReports[Entertainment Reports]
        MeetingReports[Meeting Reports]
        AccommodationReports[Accommodation Reports]
    end
    
    subgraph "Data Sources"
        ApprovalData[Approval Data]
        MasterData[Master Data]
        UserData[User Data]
    end
    
    subgraph "Output"
        DB[(Database)]
        FileOutput[File Output]
        Cache[Cache]
    end
    
    Client -->|GET /api/v1/reports/*| ReportController
    Client -->|POST /api/v1/reports/*| ReportController
    
    ReportController --> ReportService
    ReportService --> ReportRepo
    
    ReportService --> TravelReports
    ReportService --> ExpenseReports
    ReportService --> EntertainmentReports
    ReportService --> MeetingReports
    ReportService --> AccommodationReports
    
    TravelReports --> ApprovalData
    ExpenseReports --> MasterData
    EntertainmentReports --> UserData
    MeetingReports --> UserData
    AccommodationReports --> ApprovalData
    
    ReportRepo --> DB
    ReportService --> FileOutput
    ReportService --> Cache
    
    style ReportService fill:#e1f5fe
    style ReportRepo fill:#e8f5e8
```

## Level 2 - File Management Flow
```mermaid
graph TB
    subgraph "Client Layer"
        Client[Client Application]
    end
    
    subgraph "File Module"
        FileController[File Controller]
        FileService[File Service]
        FileRepo[File Repository]
    end
    
    subgraph "File Operations"
        Upload[File Upload]
        Download[File Download]
        Delete[File Delete]
        Metadata[File Metadata]
    end
    
    subgraph "Storage"
        FileStorage[File Storage]
        DB[(Database)]
        Cache[(Redis Cache)]
    end
    
    Client -->|POST /api/v1/files/upload| FileController
    Client -->|GET /api/v1/files/:id| FileController
    Client -->|DELETE /api/v1/files/:id| FileController
    Client -->|GET /api/v1/files| FileController
    
    FileController --> FileService
    FileService --> FileRepo
    
    FileService --> Upload
    FileService --> Download
    FileService --> Delete
    FileService --> Metadata
    
    Upload --> FileStorage
    Upload --> DB
    Download --> FileStorage
    Delete --> FileStorage
    Delete --> DB
    Metadata --> DB
    
    FileService --> Cache
    Cache --> DB
    
    style FileService fill:#e1f5fe
    style FileStorage fill:#fff3e0
```

## Level 2 - Notification & WebSocket Flow
```mermaid
graph TB
    subgraph "Client Layer"
        WebSocketClient[WebSocket Client]
        HTTPClient[HTTP Client]
    end
    
    subgraph "Notification Module"
        NotificationController[Notification Controller]
        NotificationService[Notification Service]
        NotificationRepo[Notification Repository]
        WebSocketUtil[WebSocket Utility]
    end
    
    subgraph "Notification Types"
        ApprovalNotifications[Approval Notifications]
        SystemNotifications[System Notifications]
        UserNotifications[User Notifications]
    end
    
    subgraph "Delivery Methods"
        WebSocket[WebSocket Delivery]
        Database[Database Storage]
        Cache[Cache Storage]
    end
    
    subgraph "Storage"
        DB[(Database)]
        Redis[(Redis Cache)]
    end
    
    HTTPClient -->|POST /api/v1/notifications| NotificationController
    HTTPClient -->|GET /api/v1/notifications| NotificationController
    
    NotificationController --> NotificationService
    NotificationService --> NotificationRepo
    
    NotificationService --> ApprovalNotifications
    NotificationService --> SystemNotifications
    NotificationService --> UserNotifications
    
    ApprovalNotifications --> WebSocketUtil
    SystemNotifications --> WebSocketUtil
    UserNotifications --> WebSocketUtil
    
    WebSocketUtil --> WebSocket
    WebSocket --> WebSocketClient
    
    NotificationRepo --> DB
    NotificationService --> Cache
    Cache --> Redis
    
    style NotificationService fill:#f3e5f5
    style WebSocketUtil fill:#e8f5e8
```

## Level 3 - Database Schema Overview
```mermaid
erDiagram
    USERS {
        int id PK
        string username
        string email
        string employee_code
        string role
        datetime created_at
        datetime updated_at
    }
    
    SESSIONS {
        int id PK
        int user_id FK
        string token
        datetime expires_at
        datetime created_at
    }
    
    APPROVALS {
        int id PK
        int user_id FK
        string type
        string status
        json data
        datetime created_at
        datetime updated_at
    }
    
    APPROVAL_ATTACHMENTS {
        int id PK
        int approval_id FK
        int file_id FK
        string description
        datetime created_at
    }
    
    FILES {
        int id PK
        string filename
        string path
        string mime_type
        int size
        datetime created_at
    }
    
    NOTIFICATIONS {
        int id PK
        int user_id FK
        string type
        string message
        boolean read
        datetime created_at
    }
    
    MASTER_DATA {
        int id PK
        string category
        string code
        string name
        json data
        datetime created_at
        datetime updated_at
    }
    
    USERS ||--o{ SESSIONS : "has"
    USERS ||--o{ APPROVALS : "creates"
    APPROVALS ||--o{ APPROVAL_ATTACHMENTS : "contains"
    APPROVAL_ATTACHMENTS ||--o{ FILES : "references"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ MASTER_DATA : "manages"
```

## Data Flow Summary

### Key Data Flows:
1. **Authentication Flow**: Client → Auth Service → User Service → Database/Cache
2. **Approval Workflow**: Client → Approval Service → File Service → Notification Service
3. **Master Data Management**: Client → Master Data Service → Cache → Database
4. **Report Generation**: Client → Report Service → Multiple Data Sources → Output
5. **File Operations**: Client → File Service → File Storage + Database
6. **Real-time Notifications**: Services → Notification Service → WebSocket → Clients

### Data Storage:
- **Primary Database**: PostgreSQL/MySQL via Knex.js
- **Cache Layer**: Redis for performance optimization
- **File Storage**: Local file system or cloud storage
- **Session Storage**: Redis for user sessions

### Security Features:
- JWT-based authentication
- Role-based access control
- LDAP integration
- Audit logging
- Request validation and sanitization

This DFD represents a comprehensive travel and expense management system with approval workflows, real-time notifications, and extensive master data management capabilities.
