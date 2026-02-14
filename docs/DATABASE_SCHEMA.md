# Database Schema Overview

## Technology
- Database: PostgreSQL 15+
- ORM: Prisma
- Migrations: Prisma Migrate

## Schema Relationships

```
User (1) ─────── (1) Employee
  │                    │
  │                    ├─── (N) EmployeeSkill ───── (1) Skill
  │                    │           │
  │                    │           └─── (N) SkillEvolution
  │                    │
  │                    └─── (N) EmployeeHistory ───── (1) Activity
  │
  ├─── (N) Request
  ├─── (N) Notification
  ├─── (N) AuditLog
  └─── (N) Evaluation

Activity (1) ───── (N) ActivitySkill ───── (1) Skill
    │
    ├─── (N) ActivityParticipant ───── (1) Employee
    │
    └─── (N) Evaluation ───── (1) Employee

Skill (1) ───── (N) EmployeeSkill
  │
  └─── (N) ActivitySkill
```

## Core Tables

### Users & Authentication
- User
- RefreshToken (optional)

### HR Management
- Employee
- EmployeeHistory

### Skills
- Skill
- EmployeeSkill
- SkillEvolution

### Activities
- Activity
- ActivitySkill
- ActivityParticipant

### Evaluation
- Evaluation

### System
- Request
- Notification
- AuditLog
- SavedSearch

## Indexes

### Performance Indexes
```sql
CREATE INDEX idx_employee_department ON Employee(department);
CREATE INDEX idx_employee_status ON Employee(status);
CREATE INDEX idx_skill_type ON Skill(type);
CREATE INDEX idx_skill_category ON Skill(category);
CREATE INDEX idx_employee_skill_employee ON EmployeeSkill(employeeId);
CREATE INDEX idx_employee_skill_skill ON EmployeeSkill(skillId);
CREATE INDEX idx_activity_status ON Activity(status);
CREATE INDEX idx_activity_start_date ON Activity(startDate);
CREATE INDEX idx_notification_user ON Notification(userId);
CREATE INDEX idx_notification_read ON Notification(isRead);
CREATE INDEX idx_audit_timestamp ON AuditLog(timestamp);
CREATE INDEX idx_audit_entity ON AuditLog(entity, entityId);
```

### Full-Text Search Indexes
```sql
CREATE INDEX idx_skill_name_trgm ON Skill USING gin(name gin_trgm_ops);
CREATE INDEX idx_activity_title_trgm ON Activity USING gin(title gin_trgm_ops);
CREATE INDEX idx_employee_job_position_trgm ON Employee USING gin(jobPosition gin_trgm_ops);
```

## Data Integrity

### Foreign Key Constraints
- ON DELETE CASCADE for dependent records
- ON DELETE SET NULL for optional references
- ON DELETE RESTRICT for critical references

### Check Constraints
```sql
ALTER TABLE EmployeeSkill ADD CONSTRAINT check_score_range 
  CHECK (score >= 0 AND score <= 100);

ALTER TABLE Activity ADD CONSTRAINT check_seats 
  CHECK (filledSeats <= availableSeats);

ALTER TABLE Evaluation ADD CONSTRAINT check_rating 
  CHECK (overallRating >= 1 AND overallRating <= 5);
```

## Prisma Schema Example

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  firstName     String
  lastName      String
  role          Role
  isActive      Boolean  @default(true)
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  employee      Employee?
  requests      Request[]
  notifications Notification[]
  auditLogs     AuditLog[]
  
  @@index([email])
}

model Employee {
  id                 String   @id @default(uuid())
  userId             String   @unique
  employeeCode       String   @unique
  department         String
  jobPosition        String
  jobDescription     String   @db.Text
  yearsOfExperience  Int
  hireDate           DateTime
  location           String
  managerId          String?
  status             EmployeeStatus
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  user               User     @relation(fields: [userId], references: [id])
  manager            Employee? @relation("ManagerSubordinates", fields: [managerId], references: [id])
  subordinates       Employee[] @relation("ManagerSubordinates")
  skills             EmployeeSkill[]
  history            EmployeeHistory[]
  participations     ActivityParticipant[]
  evaluations        Evaluation[]
  
  @@index([department])
  @@index([status])
}

model Skill {
  id          String     @id @default(uuid())
  name        String     @unique
  type        SkillType
  category    String
  description String     @db.Text
  keywords    String[]
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  employeeSkills  EmployeeSkill[]
  activitySkills  ActivitySkill[]
  
  @@index([type])
  @@index([category])
}

model Activity {
  id              String         @id @default(uuid())
  title           String
  description     String         @db.Text
  type            ActivityType
  status          ActivityStatus
  targetLevel     SkillLevel
  startDate       DateTime
  endDate         DateTime
  location        String?
  duration        Int
  availableSeats  Int
  filledSeats     Int            @default(0)
  createdBy       String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  requiredSkills  ActivitySkill[]
  participants    ActivityParticipant[]
  evaluations     Evaluation[]
  
  @@index([status])
  @@index([startDate])
}

enum Role {
  HR
  MANAGER
  EMPLOYEE
}

enum SkillType {
  KNOWLEDGE
  KNOW_HOW
  SOFT_SKILL
}

enum SkillLevel {
  LOW
  MEDIUM
  HIGH
  EXPERT
}

enum ActivityType {
  TRAINING
  CERTIFICATION
  PROJECT
  MISSION
  AUDIT
}

enum ActivityStatus {
  DRAFT
  OPEN
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
  TERMINATED
}
```
