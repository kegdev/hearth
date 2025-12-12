# 🗄️ Database Schema - Hearth App
**Firestore Database Layout with Mermaid Diagrams**

## 📊 Database Overview

The Hearth application uses Google Firestore as its NoSQL database. The schema is designed for scalability, security, and efficient querying while maintaining data integrity and user isolation.

### 🏗️ Architecture Principles
- **User Isolation**: All data is scoped to individual users
- **Security First**: Comprehensive Firestore rules enforce access control
- **Scalable Design**: Optimized for growth and performance
- **Audit Trail**: Complete tracking of creation and modification times
- **Flexible Schema**: Support for optional fields and future enhancements

## 📋 Collections Overview

```mermaid
graph TB
    subgraph "Core Inventory Collections"
        A[containers] --> B[items]
        C[tags] --> B
        D[categories] --> B
    end
    
    subgraph "User Management Collections"
        E[userProfiles] --> F[registrationRequests]
    end
    
    subgraph "User Data Isolation"
        G[userId] --> A
        G --> B
        G --> C
        G --> D
        H[uid] --> E
        I[email] --> F
    end
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#f1f8e9
```

## 🏠 Core Inventory Schema

### 📦 Containers Collection

Containers represent physical storage locations where items are kept.

```mermaid
erDiagram
    containers {
        string id PK "Auto-generated document ID"
        string name "Container name (required, 1-100 chars)"
        string description "Optional description (max 500 chars)"
        string location "Optional location info (max 100 chars)"
        string imageUrl "Base64 encoded image or URL"
        string userId FK "Owner's Firebase Auth ID"
        timestamp createdAt "Creation timestamp"
     "
    }
```

**Example Document:**
```json
{
  "id": "container_abc123",
  "name": "Kitchen Drawer #3",
  "description": "Top drawer next to the stove",
  "location": "Kitchen",
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQ...",
  "userId": "user_xyz789",
  "createdAt": "2024-12-11T10:30:00Z",
  "updatedAt": "2024-12-11T10:30:00Z"
}
```

### 📝 Items Collection

Items are individual objects stored within containers.

```mermaid
erDiagram
    items {
        string id PK "Auto-generated document ID"
        string name "Item name (required, 1-100 chars)"
        string description "Optional description (max 1000 chars)"
        string containerId FK "Reference to container"
        string imageUrl "Base64 encoded image or URL"
        array tags "Array of tag IDs"
        string categoryId FK "Reference to category"
        number purchasePrice "Original purchase price"
        number currentValue "Current estimated value"
        timestamp purchaseDate "When item was purchased"
        string condition "new|excellent|good|fair|poor"
        string warranty "Warranty information (max 200 chars)"
        string serialNumber "Serial number (max 100 chars)"
        string model "Model information (max 100 chars)"
        string brand "Brand name (max 100 chars)"
        string userId FK "Owner's Firebase Auth UID"
        timestamp createdAt "Creation timestamp"
        timestamp updatedAt "Last modification timestamp"
    }
```

**Example Document:**
```json
{
  "id": "item_def456",
  "name": "Bluetooth Headphones",
  "description": "Sony WH-1000XM4 noise-canceling headphones",
  "containerId": "container_abc123",
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQ...",
  "tags": ["tag_electronics", "tag_audio"],
  "categoryId": "category_electronics_audio",
  "purchasePrice": 299.99,
  "currentValue": 250.00,
  "purchaseDate": "2024-01-15T00:00:00Z",
  "condition": "excellent",
  "warranty": "2 year manufacturer warranty",
  "serialNumber": "SN123456789",
  "model": "WH-1000XM4",
  "brand": "Sony",
  "userId": "user_xyz789",
  "createdAt": "2024-12-11T10:35:00Z",
  "updatedAt": "2024-12-11T10:35:00Z"
}
```

### 🏷️ Tags Collection

Tags provide flexible labeling for items.

```mermaid
erDiagram
    tags {
        string id PK "Auto-generated document ID"
        string name "Tag name (required, 1-50 chars)"
        string color "Hex color code for UI display"
        string userId FK "Owner's Firebase Auth UID"
        timestamp createdAt "Creation timestamp"
        timestamp updatedAt "Last modification timestamp"
    }
```

**Example Document:**
```json
{
  "id": "tag_electronics",
  "name": "Electronics",
  "color": "#2196F3",
  "userId": "user_xyz789",
  "createdAt": "2024-12-11T10:25:00Z",
  "updatedAt": "2024-12-11T10:25:00Z"
}
```

### 📂 Categories Collection

Categories provide hierarchical organization for items.

```mermaid
erDiagram
    categories {
        string id PK "Auto-generated document ID"
        string name "Category name (required, 1-50 chars)"
        string parentId FK "Parent category ID (optional)"
        string path "Full hierarchical path"
        string userId FK "Owner's Firebase Auth UID"
        timestamp createdAt "Creation timestamp"
        timestamp updatedAt "Last modification timestamp"
    }
```

**Example Document:**
```json
{
  "id": "category_electronics_audio",
  "name": "Audio Equipment",
  "parentId": "category_electronics",
  "path": "Electronics > Audio Equipment",
  "userId": "user_xyz789",
  "createdAt": "2024-12-11T10:20:00Z",
  "updatedAt": "2024-12-11T10:20:00Z"
}
```

## 👥 User Management Schema

### 👤 User Profiles Collection

User profiles store account status and metadata for approved users.

```mermaid
erDiagram
    userProfiles {
        string id PK "Auto-generated document ID"
        string uid FK "Firebase Auth UID"
        string email "User's email address"
        string displayName "Optional display name"
        string status "pending|approved|denied|admin"
        boolean isAdmin "Admin flag (optional)"
        timestamp approvedAt "When user was approved (optional)"
        string approvedBy "Admin UID who approved (optional)"
        timestamp createdAt "Profile creation timestamp"
        timestamp updatedAt "Last modification timestamp"
    }
```

**Example Document:**
```json
{
  "id": "profile_ghi789",
  "uid": "user_xyz789",
  "email": "user@example.com",
  "displayName": "John Doe",
  "status": "approved",
  "isAdmin": false,
  "approvedAt": "2024-12-11T09:00:00Z",
  "approvedBy": "admin_abc123",
  "createdAt": "2024-12-10T15:30:00Z",
  "updatedAt": "2024-12-11T09:00:00Z"
}
```

### 📝 Registration Requests Collection

Registration requests manage the user approval workflow.

```mermaid
erDiagram
    registrationRequests {
        string id PK "Auto-generated document ID"
        string email "Requester's email address"
        string displayName "Optional display name"
        string reason "Why they want access (required)"
        string status "pending|approved|denied"
        timestamp requestedAt "When request was submitted"
        timestamp reviewedAt "When request was reviewed (optional)"
        string reviewedBy "Admin UID who reviewed (optional)"
        string reviewNotes "Admin notes (optional)"
        timestamp createdAt "Request creation timestamp"
        timestamp updatedAt "Last modification timestamp"
    }
```

**Example Document:**
```json
{
  "id": "request_jkl012",
  "email": "newuser@example.com",
  "displayName": "Jane Smith",
  "reason": "I want to organize my home inventory and track my belongings",
  "status": "pending",
  "requestedAt": "2024-12-11T14:30:00Z",
  "reviewedAt": null,
  "reviewedBy": null,
  "reviewNotes": null,
  "createdAt": "2024-12-11T14:30:00Z",
  "updatedAt": "2024-12-11T14:30:00Z"
}
```

## 🔗 Relationships & Data Flow

### Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ containers : owns
    users ||--o{ items : owns
    users ||--o{ tags : owns
    users ||--o{ categories : owns
    users ||--|| userProfiles : has
    users ||--o{ registrationRequests : submits
    
    containers ||--o{ items : contains
    categories ||--o{ items : categorizes
    tags }o--o{ items : labels
    categories ||--o{ categories : "parent-child"
    
    userProfiles ||--o{ registrationRequests : "approval-workflow"
    
    users {
        string uid PK
        string email
        string displayName
    }
    
    containers {
        string id PK
        string name
        string userId FK
    }
    
    items {
        string id PK
        string name
        string containerId FK
        string categoryId FK
        string userId FK
    }
    
    tags {
        string id PK
        string name
        string userId FK
    }
    
    categories {
        string id PK
        string name
        string parentId FK
        string userId FK
    }
    
    userProfiles {
        string id PK
        string uid FK
        string status
    }
    
    registrationRequests {
        string id PK
        string email
        string status
    }
```

### Data Flow Diagram

```mermaid
flowchart TD
    A[User Registration] --> B{Admin Approval}
    B -->|Approved| C[User Profile Created]
    B -->|Denied| D[Request Deleted]
    
    C --> E[User Can Access App]
    E --> F[Create Containers]
    F --> G[Add Items to Containers]
    G --> H[Apply Tags & Categories]
    
    I[QR Code Generation] --> F
    J[Image Upload] --> G
    K[Search & Filter] --> G
    
    subgraph "Security Layer"
        L[Firestore Rules]
        M[User Authentication]
        N[Data Validation]
    end
    
    E --> L
    F --> L
    G --> L
    H --> L
    
    style A fill:#e3f2fd
    style C fill:#e8f5e8
    style D fill:#ffebee
    style E fill:#f3e5f5
    style L fill:#fff3e0
```

## 🔒 Security Model

### Access Control Rules

```mermaid
graph TB
    subgraph "Authentication Layer"
        A[Firebase Auth] --> B[User UID]
    end
    
    subgraph "Authorization Layer"
        C[Firestore Rules] --> D{User Type}
        D -->|Regular User| E[Own Data Only]
        D -->|Admin User| F[All User Management]
    end
    
    subgraph "Data Access Patterns"
        E --> G[containers: userId == auth.uid]
        E --> H[items: userId == auth.uid]
        E --> I[tags: userId == auth.uid]
        E --> J[categories: userId == auth.uid]
        
        F --> K[userProfiles: admin access]
        F --> L[registrationRequests: admin access]
    end
    
    B --> C
    
    style A fill:#e1f5fe
    style C fill:#fff3e0
    style E fill:#e8f5e8
    style F fill:#fce4ec
```

### Security Rules Summary

| Collection | Create | Read | Update | Delete |
|------------|--------|------|--------|--------|
| **containers** | Own data only | Own data only | Own data only | Own data only |
| **items** | Own data only | Own data only | Own data only | Own data only |
| **tags** | Own data only | Own data only | Own data only | Own data only |
| **categories** | Own data only | Own data only | Own data only | Own data only |
| **userProfiles** | Admin only | Own + Admin | Admin only | None |
| **registrationRequests** | Anyone | Own + Admin | Admin only | Admin only |

## 📊 Indexing Strategy

### Firestore Indexes

```mermaid
graph LR
    subgraph "Single Field Indexes (Auto)"
        A[userId] --> B[createdAt]
        A --> C[updatedAt]
        A --> D[status]
        A --> E[email]
    end
    
    subgraph "Composite Indexes (Manual)"
        F[userId + createdAt] --> G[Efficient Sorting]
        H[containerId + userId] --> I[Container Items]
        J[status + requestedAt] --> K[Admin Dashboard]
    end
    
    style F fill:#e3f2fd
    style H fill:#e3f2fd
    style J fill:#e3f2fd
```

### Query Optimization

- **User Data Queries**: Always include `userId` filter first
- **Sorting**: Performed in JavaScript to avoid composite index requirements
- **Pagination**: Implemented using `startAfter` for large datasets
- **Search**: Client-side filtering for flexibility

## 🚀 Performance Considerations

### Data Size Limits

| Field Type | Limit | Usage |
|------------|-------|-------|
| **Document Size** | 1MB | Firestore limit |
| **Image Storage** | <1MB | Base64 compression |
| **String Fields** | Varies | See validation rules |
| **Array Fields** | 20,000 elements | Firestore limit |

### Optimization Strategies

```mermaid
flowchart TD
    A[Client Request] --> B{Data Size Check}
    B -->|Small| C[Direct Query]
    B -->|Large| D[Paginated Query]
    
    C --> E[JavaScript Sorting]
    D --> E
    
    E --> F[Client-side Filtering]
    F --> G[UI Rendering]
    
    H[Image Upload] --> I[Compression]
    I --> J[Base64 Encoding]
    J --> K[Firestore Storage]
    
    style I fill:#e8f5e8
    style E fill:#e3f2fd
    style F fill:#f3e5f5
```

## 🔄 Data Migration & Versioning

### Schema Evolution

```mermaid
timeline
    title Database Schema Evolution
    
    section Phase 1
        Basic Inventory : containers
                        : items
                        : Basic fields only
    
    section Phase 2
        Enhanced Features : tags
                         : categories
                         : Advanced item properties
    
    section Phase 3
        User Management : userProfiles
                       : registrationRequests
                       : Admin system
    
    section Future
        Analytics : usage tracking
                 : performance metrics
                 : Advanced reporting
```

### Migration Strategy

- **Backward Compatibility**: New fields are optional
- **Gradual Rollout**: Features enabled progressively
- **Data Validation**: Firestore rules enforce schema compliance
- **Fallback Handling**: Client handles missing fields gracefully

## 📈 Monitoring & Analytics

### Key Metrics

```mermaid
pie title Database Usage Distribution
    "Items" : 45
    "Containers" : 25
    "User Profiles" : 15
    "Tags" : 10
    "Categories" : 5
```

### Performance Monitoring

- **Query Performance**: Track response times
- **Storage Usage**: Monitor document sizes
- **User Activity**: Track CRUD operations
- **Error Rates**: Monitor failed operations

## 🎯 Best Practices

### Development Guidelines

1. **Always Include User ID**: Every query must filter by `userId`
2. **Validate Input**: Use Firestore rules for server-side validation
3. **Handle Offline**: Design for offline-first functionality
4. **Optimize Images**: Compress before storing
5. **Batch Operations**: Use transactions for related updates

### Security Best Practices

1. **Principle of Least Privilege**: Users access only their data
2. **Input Sanitization**: Validate all user inputs
3. **Audit Trails**: Track all administrative actions
4. **Regular Reviews**: Monitor access patterns
5. **Secure Defaults**: Deny access unless explicitly allowed

---

**This database schema supports a scalable, secure, and performant home inventory management system! 🏠📊**