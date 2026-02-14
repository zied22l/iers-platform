# Module 11: History & Tracking (Audit)

## Overview
Provides complete traceability of all system actions for compliance and auditing.

## Backend (NestJS)

### Directory Structure
```
src/modules/audit/
├── dto/
│   ├── audit-query.dto.ts
│   └── audit-filter.dto.ts
├── entities/
│   └── audit-log.entity.ts
├── interceptors/
│   └── audit.interceptor.ts
├── decorators/
│   └── auditable.decorator.ts
├── audit.controller.ts
├── audit.service.ts
└── audit.module.ts
```

### Database Schema
```typescript
AuditLog {
  id: UUID (PK)
  userId: UUID (FK to User, indexed)
  action: string (indexed)
  entity: string (indexed)
  entityId: UUID (indexed)
  changes: JSON
  previousState: JSON (nullable)
  newState: JSON (nullable)
  ipAddress: string
  userAgent: string
  method: string (GET, POST, PATCH, DELETE)
  endpoint: string
  statusCode: number
  duration: number (ms)
  timestamp: DateTime (indexed)
}
```

### Audit Interceptor
```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    
    return next.handle().pipe(
      tap(async (data) => {
        const duration = Date.now() - startTime;
        
        await this.auditService.log({
          userId: request.user?.id,
          action: this.getAction(request),
          entity: this.getEntity(request),
          entityId: this.getEntityId(request, data),
          changes: this.extractChanges(request),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          method: request.method,
          endpoint: request.url,
          statusCode: context.switchToHttp().getResponse().statusCode,
          duration
        });
      })
    );
  }
}
```

### API Endpoints
- `GET /audit/logs` - List audit logs
- `GET /audit/entity/:type/:id` - Get logs for entity
- `GET /audit/user/:id` - Get user activity
- `GET /audit/export` - Export logs to CSV
- `GET /audit/stats` - Get audit statistics

## Frontend (React)

### Directory Structure
```
src/modules/audit/
├── components/
│   ├── AuditLogTable.tsx
│   ├── ChangesDiff.tsx
│   ├── AuditFilters.tsx
│   └── AuditTimeline.tsx
├── pages/
│   └── AuditPage.tsx
└── services/
    └── auditService.ts
```

## Integration Points
- Tracks all CRUD operations
- Records user actions
- Monitors system changes
