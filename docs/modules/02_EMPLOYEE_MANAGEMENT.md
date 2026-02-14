# Module 2: Employee Management

## Overview
Manages employee profiles, organizational structure, and participation history.

## Backend (NestJS)

### Directory Structure
```
src/modules/employees/
├── dto/
│   ├── create-employee.dto.ts
│   ├── update-employee.dto.ts
│   ├── filter-employee.dto.ts
│   └── employee-history.dto.ts
├── entities/
│   ├── employee.entity.ts
│   └── employee-history.entity.ts
├── employees.controller.ts
├── employees.service.ts
└── employees.module.ts
```

### Database Schema (Mongoose)

#### Employee
```typescript
// employee.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED'
}

@Schema({ timestamps: true })
export class Employee extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  employeeCode: string;

  @Prop({ required: true, index: true })
  department: string;

  @Prop({ required: true })
  jobPosition: string;

  @Prop({ required: true })
  jobDescription: string;

  @Prop({ required: true })
  yearsOfExperience: number;

  @Prop({ required: true })
  hireDate: Date;

  @Prop({ required: true })
  location: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  managerId?: Types.ObjectId;

  @Prop({ type: String, enum: EmployeeStatus, default: EmployeeStatus.ACTIVE, index: true })
  status: EmployeeStatus;

  @Prop()
  phoneNumber?: string;

  @Prop({ type: Object })
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };

  @Prop()
  notes?: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// Indexes
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ managerId: 1 });
```

#### EmployeeHistory
```typescript
// employee-history.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CompletionStatus {
  REGISTERED = 'REGISTERED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

@Schema({ timestamps: true })
export class EmployeeHistory extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Activity', required: true, index: true })
  activityId: Types.ObjectId;

  @Prop({ required: true })
  participationDate: Date;

  @Prop()
  completionDate?: Date;

  @Prop({ type: String, enum: CompletionStatus, required: true })
  completionStatus: CompletionStatus;

  @Prop({ min: 0, max: 100 })
  attendanceRate?: number;

  @Prop()
  feedback?: string;

  @Prop({ type: Object })
  preSkillLevels: Record<string, any>;

  @Prop({ type: Object })
  postSkillLevels?: Record<string, any>;

  @Prop()
  certificateUrl?: string;
}

export const EmployeeHistorySchema = SchemaFactory.createForClass(EmployeeHistory);

// Indexes
EmployeeHistorySchema.index({ employeeId: 1, activityId: 1 });
```

### Key Features
- Employee CRUD operations
- Organizational hierarchy management
- Department and location tracking
- Manager-employee relationships
- Activity participation history
- Skill progression tracking
- Document management (certificates, evaluations)
- Bulk import/export (CSV, Excel)

### API Endpoints

#### Employee Management
- `POST /employees` - Create employee
- `GET /employees` - List employees with filters
- `GET /employees/:id` - Get employee details
- `PATCH /employees/:id` - Update employee
- `DELETE /employees/:id` - Soft delete employee
- `GET /employees/:id/full-profile` - Get complete profile with skills and history

#### Organizational Structure
- `GET /employees/:id/subordinates` - Get direct reports
- `GET /employees/:id/manager` - Get manager
- `GET /employees/department/:dept` - Get employees by department
- `GET /employees/hierarchy` - Get organizational tree

#### History & Tracking
- `GET /employees/:id/history` - Get participation history
- `POST /employees/:id/history` - Add history entry
- `GET /employees/:id/timeline` - Get chronological timeline
- `GET /employees/:id/certificates` - Get certificates

#### Bulk Operations
- `POST /employees/import` - Bulk import employees
- `GET /employees/export` - Export employees to CSV/Excel
- `PATCH /employees/bulk-update` - Bulk update employees

## Frontend (React)

### Directory Structure
```
src/modules/employees/
├── components/
│   ├── EmployeeForm.tsx
│   ├── EmployeeList.tsx
│   ├── EmployeeCard.tsx
│   ├── EmployeeHistory.tsx
│   ├── EmployeeTimeline.tsx
│   ├── DepartmentFilter.tsx
│   ├── OrganizationChart.tsx
│   ├── EmployeeImport.tsx
│   └── EmployeeStats.tsx
├── pages/
│   ├── EmployeesPage.tsx
│   ├── EmployeeDetailPage.tsx
│   ├── CreateEmployeePage.tsx
│   └── OrganizationPage.tsx
├── store/
│   └── employeeSlice.ts
├── hooks/
│   ├── useEmployees.ts
│   └── useEmployeeHistory.ts
├── services/
│   └── employeeService.ts
└── types/
    └── employee.types.ts
```

### Key Components

#### EmployeeForm.tsx
- Personal information section
- Job details (position, department, location)
- Manager assignment
- Hire date picker
- Job description editor
- Form validation

#### EmployeeList.tsx
- DataGrid with advanced filtering
- Search by name, code, department
- Status badges
- Quick actions (view, edit, delete)
- Pagination and sorting
- Export functionality

#### EmployeeHistory.tsx
- Activity participation table
- Completion status indicators
- Skill evolution tracking
- Certificate links
- Feedback display

#### OrganizationChart.tsx
- Interactive hierarchy visualization
- Expandable/collapsible nodes
- Search and highlight
- Department grouping
- Manager-subordinate connections

#### EmployeeTimeline.tsx
- Chronological activity view
- Milestones and achievements
- Skill level changes
- Promotions and transfers

### State Management

#### employeeSlice.ts
```typescript
interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  history: EmployeeHistory[];
  loading: boolean;
  error: string | null;
  filters: {
    department: string[];
    status: string[];
    location: string[];
    search: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### Features

#### Advanced Filtering
- Filter by department, location, status
- Search by name, employee code
- Date range filters (hire date)
- Manager filter
- Experience range filter

#### Bulk Import
- CSV/Excel file upload
- Data validation and preview
- Error handling and reporting
- Mapping columns to fields
- Duplicate detection

#### Export Options
- Export to CSV/Excel
- Custom field selection
- Filtered export
- Include/exclude history

## Integration Points
- Links to User Management for account creation
- Links to Skill Management for skill assignments
- Links to Activity Management for participation
- Links to Analytics for reporting
