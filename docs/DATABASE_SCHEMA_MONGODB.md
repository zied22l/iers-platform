# MongoDB Database Schema

## Technology
- Database: MongoDB 6+
- ODM: Mongoose
- Transactions: Multi-document ACID transactions

## Collections Overview

### Core Collections
- `users` - User accounts and authentication
- `employees` - Employee profiles
- `employeehistories` - Activity participation history
- `skills` - Skill definitions
- `employeeskills` - Employee skill assignments
- `skillevolutions` - Skill progression tracking
- `activities` - Activities (trainings, projects, etc.)
- `activityskills` - Activity skill requirements
- `activityparticipants` - Activity participants
- `evaluations` - Post-activity evaluations
- `requests` - Activity requests and approvals
- `notifications` - User notifications
- `auditlogs` - System audit trail
- `savedsearches` - Saved search queries

## Schema Definitions

### User Schema
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  HR = 'HR',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ type: String, enum: UserRole, required: true })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  verificationToken?: string;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop()
  lastLogin?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
```


### Employee Schema
```typescript
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

  @Prop({ type: String, enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
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
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ managerId: 1 });
```

### Skill Schema
```typescript
export enum SkillType {
  KNOWLEDGE = 'KNOWLEDGE',
  KNOW_HOW = 'KNOW_HOW',
  SOFT_SKILL = 'SOFT_SKILL'
}

@Schema({ timestamps: true })
export class Skill extends Document {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({ type: String, enum: SkillType, required: true })
  type: SkillType;

  @Prop({ required: true, index: true })
  category: string;

  @Prop()
  subcategory?: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ type: [Types.ObjectId], ref: 'Skill', default: [] })
  relatedSkills: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
SkillSchema.index({ name: 'text', description: 'text' });
SkillSchema.index({ type: 1, category: 1 });
```

### EmployeeSkill Schema
```typescript
export enum SkillLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EXPERT = 'EXPERT'
}

@Schema({ timestamps: true })
export class EmployeeSkill extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Skill', required: true, index: true })
  skillId: Types.ObjectId;

  @Prop({ type: String, enum: SkillLevel, required: true })
  level: SkillLevel;

  @Prop({ required: true, min: 0, max: 100 })
  score: number;

  @Prop()
  yearsOfExperience?: number;

  @Prop({ required: true })
  lastAssessed: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assessedBy?: Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  certifications: Array<{
    name: string;
    issuer: string;
    date: Date;
    url?: string;
  }>;

  @Prop({ type: [String], default: [] })
  projects: string[];

  @Prop()
  notes?: string;

  @Prop({ default: false })
  isVerified: boolean;
}

export const EmployeeSkillSchema = SchemaFactory.createForClass(EmployeeSkill);
EmployeeSkillSchema.index({ employeeId: 1, skillId: 1 }, { unique: true });
EmployeeSkillSchema.index({ level: 1 });
```

### SkillEvolution Schema
```typescript
export enum ChangeReason {
  ACTIVITY_COMPLETION = 'ACTIVITY_COMPLETION',
  MANUAL_UPDATE = 'MANUAL_UPDATE',
  EVALUATION = 'EVALUATION',
  CERTIFICATION = 'CERTIFICATION'
}

@Schema({ timestamps: false })
export class SkillEvolution extends Document {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeSkill', required: true, index: true })
  employeeSkillId: Types.ObjectId;

  @Prop({ type: String, enum: SkillLevel })
  previousLevel?: SkillLevel;

  @Prop({ type: String, enum: SkillLevel, required: true })
  newLevel: SkillLevel;

  @Prop()
  previousScore?: number;

  @Prop({ required: true })
  newScore: number;

  @Prop({ type: String, enum: ChangeReason, required: true })
  changeReason: ChangeReason;

  @Prop({ type: Types.ObjectId, ref: 'Activity' })
  activityId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Evaluation' })
  evaluationId?: Types.ObjectId;

  @Prop()
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  changedBy: Types.ObjectId;

  @Prop({ required: true })
  changedAt: Date;
}

export const SkillEvolutionSchema = SchemaFactory.createForClass(SkillEvolution);
SkillEvolutionSchema.index({ employeeSkillId: 1, changedAt: -1 });
```

### Activity Schema
```typescript
export enum ActivityType {
  TRAINING = 'TRAINING',
  CERTIFICATION = 'CERTIFICATION',
  PROJECT = 'PROJECT',
  MISSION = 'MISSION',
  AUDIT = 'AUDIT'
}

export enum ActivityStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

@Schema({ timestamps: true })
export class Activity extends Document {
  @Prop({ required: true, index: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, enum: ActivityType, required: true })
  type: ActivityType;

  @Prop({ type: String, enum: ActivityStatus, default: ActivityStatus.DRAFT })
  status: ActivityStatus;

  @Prop({ type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' })
  priority: string;

  @Prop({ type: String, enum: SkillLevel, required: true })
  targetLevel: SkillLevel;

  @Prop({ required: true, index: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop()
  location?: string;

  @Prop({ default: false })
  isRemote: boolean;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  availableSeats: number;

  @Prop({ default: 0 })
  filledSeats: number;

  @Prop()
  budget?: number;

  @Prop()
  department?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [Object], default: [] })
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  managerId?: Types.ObjectId;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
ActivitySchema.index({ status: 1, startDate: 1 });
ActivitySchema.index({ type: 1 });
ActivitySchema.index({ title: 'text', description: 'text' });
```

### ActivitySkill Schema
```typescript
@Schema({ timestamps: true })
export class ActivitySkill extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Activity', required: true, index: true })
  activityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Skill', required: true, index: true })
  skillId: Types.ObjectId;

  @Prop({ type: String, enum: SkillLevel, required: true })
  requiredLevel: SkillLevel;

  @Prop({ required: true, min: 0, max: 1 })
  weight: number;

  @Prop({ default: false })
  isMandatory: boolean;

  @Prop({ min: 0, max: 100 })
  minScore?: number;
}

export const ActivitySkillSchema = SchemaFactory.createForClass(ActivitySkill);
ActivitySkillSchema.index({ activityId: 1, skillId: 1 }, { unique: true });
```

### ActivityParticipant Schema
```typescript
export enum ParticipantStatus {
  INVITED = 'INVITED',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  WAITLIST = 'WAITLIST',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum InvitationType {
  AUTO_RECOMMENDED = 'AUTO_RECOMMENDED',
  MANUAL = 'MANUAL',
  SELF_REGISTERED = 'SELF_REGISTERED'
}

@Schema({ timestamps: true })
export class ActivityParticipant extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Activity', required: true, index: true })
  activityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ type: String, enum: ParticipantStatus, default: ParticipantStatus.INVITED })
  status: ParticipantStatus;

  @Prop({ type: String, enum: InvitationType, required: true })
  invitationType: InvitationType;

  @Prop({ min: 0, max: 100 })
  recommendationScore?: number;

  @Prop({ type: Object })
  scoreBreakdown?: {
    skillScore: number;
    experienceScore: number;
    progressionScore: number;
    contextScore: number;
  };

  @Prop({ required: true })
  invitedAt: Date;

  @Prop()
  respondedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  feedback?: string;

  @Prop({ min: 1, max: 5 })
  rating?: number;

  @Prop()
  notes?: string;
}

export const ActivityParticipantSchema = SchemaFactory.createForClass(ActivityParticipant);
ActivityParticipantSchema.index({ activityId: 1, employeeId: 1 }, { unique: true });
ActivityParticipantSchema.index({ status: 1 });
```

### Evaluation Schema
```typescript
export enum ParticipationLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EXCELLENT = 'EXCELLENT'
}

@Schema({ timestamps: true })
export class Evaluation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Activity', required: true, index: true })
  activityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, index: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  evaluatorId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  overallRating: number;

  @Prop({ min: 0, max: 100 })
  attendanceRate: number;

  @Prop({ type: String, enum: ParticipationLevel })
  participationLevel: ParticipationLevel;

  @Prop({ type: [Object], default: [] })
  skillUpdates: Array<{
    skillId: Types.ObjectId;
    performanceRating: number;
    improvement: number;
  }>;

  @Prop({ type: [String], default: [] })
  strengths: string[];

  @Prop({ type: [String], default: [] })
  areasForImprovement: string[];

  @Prop()
  feedback?: string;

  @Prop()
  recommendations?: string;

  @Prop({ default: false })
  certificateIssued: boolean;

  @Prop()
  certificateUrl?: string;

  @Prop({ required: true })
  completionDate: Date;

  @Prop({ required: true })
  evaluatedAt: Date;
}

export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);
EvaluationSchema.index({ activityId: 1, employeeId: 1 });
```

### Notification Schema
```typescript
export enum NotificationType {
  INVITATION = 'INVITATION',
  REMINDER = 'REMINDER',
  APPROVAL = 'APPROVAL',
  UPDATE = 'UPDATE',
  ALERT = 'ALERT',
  MESSAGE = 'MESSAGE'
}

export enum NotificationCategory {
  ACTIVITY = 'ACTIVITY',
  EVALUATION = 'EVALUATION',
  SKILL = 'SKILL',
  SYSTEM = 'SYSTEM'
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ type: String, enum: NotificationCategory, required: true })
  category: NotificationCategory;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  link?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: false, index: true })
  isRead: boolean;

  @Prop()
  readAt?: Date;

  @Prop({ type: String, enum: ['LOW', 'NORMAL', 'HIGH'], default: 'NORMAL' })
  priority: string;

  @Prop()
  expiresAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });
```

### AuditLog Schema
```typescript
@Schema({ timestamps: false })
export class AuditLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ required: true, index: true })
  action: string;

  @Prop({ required: true, index: true })
  entity: string;

  @Prop({ type: Types.ObjectId, index: true })
  entityId?: Types.ObjectId;

  @Prop({ type: Object })
  changes?: Record<string, any>;

  @Prop({ type: Object })
  previousState?: Record<string, any>;

  @Prop({ type: Object })
  newState?: Record<string, any>;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  endpoint: string;

  @Prop({ required: true })
  statusCode: number;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true, index: true })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });
```

## Indexes Strategy

### Compound Indexes
```typescript
// Employee
{ userId: 1 } - unique
{ employeeCode: 1 } - unique
{ department: 1, status: 1 }

// EmployeeSkill
{ employeeId: 1, skillId: 1 } - unique
{ skillId: 1, level: 1 }

// Activity
{ status: 1, startDate: 1 }
{ type: 1, status: 1 }

// ActivityParticipant
{ activityId: 1, employeeId: 1 } - unique
{ employeeId: 1, status: 1 }

// Notification
{ userId: 1, isRead: 1, createdAt: -1 }

// AuditLog
{ timestamp: -1 }
{ entity: 1, entityId: 1, timestamp: -1 }
```

### Text Indexes
```typescript
// Skill
{ name: 'text', description: 'text' }

// Activity
{ title: 'text', description: 'text' }

// Employee
{ jobPosition: 'text', jobDescription: 'text' }
```

## Relationships

MongoDB uses references (ObjectId) instead of foreign keys:

```
User (1) ─────── (1) Employee
  │                    │
  │                    ├─── (N) EmployeeSkill ───── (1) Skill
  │                    │           │
  │                    │           └─── (N) SkillEvolution
  │                    │
  │                    └─── (N) EmployeeHistory ───── (1) Activity
  │
  ├─── (N) Notification
  ├─── (N) AuditLog
  └─── (N) Evaluation

Activity (1) ───── (N) ActivitySkill ───── (1) Skill
    │
    ├─── (N) ActivityParticipant ───── (1) Employee
    │
    └─── (N) Evaluation ───── (1) Employee
```

## Data Validation

Mongoose provides built-in validation:

```typescript
@Prop({ required: true, min: 0, max: 100 })
score: number;

@Prop({ required: true, unique: true, match: /^[A-Z0-9]+$/ })
employeeCode: string;

@Prop({ type: String, enum: SkillLevel, required: true })
level: SkillLevel;
```

## Transactions

For operations requiring atomicity:

```typescript
const session = await this.connection.startSession();
session.startTransaction();

try {
  await this.employeeSkillModel.create([newSkill], { session });
  await this.skillEvolutionModel.create([evolution], { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

## Aggregation Pipelines

For complex queries and analytics:

```typescript
// Skill coverage by department
await this.employeeModel.aggregate([
  {
    $lookup: {
      from: 'employeeskills',
      localField: '_id',
      foreignField: 'employeeId',
      as: 'skills'
    }
  },
  {
    $group: {
      _id: '$department',
      totalEmployees: { $sum: 1 },
      avgSkillCount: { $avg: { $size: '$skills' } }
    }
  }
]);
```
