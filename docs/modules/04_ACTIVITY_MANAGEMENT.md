# Module 4: Activity Management

## Overview
Manages activities (trainings, certifications, projects, missions, audits) with skill requirements and participant tracking.

## Backend (NestJS)

### Directory Structure
```
src/modules/activities/
├── dto/
│   ├── create-activity.dto.ts
│   ├── update-activity.dto.ts
│   ├── activity-filter.dto.ts
│   ├── add-skill-requirement.dto.ts
│   └── invite-participant.dto.ts
├── entities/
│   ├── activity.entity.ts
│   ├── activity-skill.entity.ts
│   └── activity-participant.entity.ts
├── activities.controller.ts
├── activities.service.ts
├── activity-skills.service.ts
├── activity-participants.service.ts
└── activities.module.ts
```

### Database Schema

#### Activity
```typescript
Activity {
  id: UUID (PK)
  title: string (indexed)
  description: text
  type: enum (TRAINING, CERTIFICATION, PROJECT, MISSION, AUDIT)
  status: enum (DRAFT, OPEN, IN_PROGRESS, COMPLETED, CANCELLED)
  priority: enum (LOW, MEDIUM, HIGH, CRITICAL)
  targetLevel: enum (LOW, MEDIUM, HIGH, EXPERT)
  startDate: DateTime (indexed)
  endDate: DateTime
  location: string (nullable)
  isRemote: boolean (default: false)
  duration: number (hours)
  availableSeats: number
  filledSeats: number (default: 0)
  budget: number (nullable)
  department: string (nullable)
  tags: string[]
  attachments: JSON[] (nullable)
  createdBy: UUID (FK to User)
  managerId: UUID (FK to User, nullable)
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### ActivitySkill
```typescript
ActivitySkill {
  id: UUID (PK)
  activityId: UUID (FK to Activity, indexed)
  skillId: UUID (FK to Skill, indexed)
  requiredLevel: enum (LOW, MEDIUM, HIGH, EXPERT)
  weight: number (0-1, importance weight)
  isMandatory: boolean (default: false)
  minScore: number (0-100, nullable)
  createdAt: DateTime
  
  UNIQUE(activityId, skillId)
}
```

#### ActivityParticipant
```typescript
ActivityParticipant {
  id: UUID (PK)
  activityId: UUID (FK to Activity, indexed)
  employeeId: UUID (FK to Employee, indexed)
  status: enum (INVITED, CONFIRMED, DECLINED, WAITLIST, COMPLETED, CANCELLED)
  invitationType: enum (AUTO_RECOMMENDED, MANUAL, SELF_REGISTERED)
  recommendationScore: number (0-100, nullable)
  scoreBreakdown: JSON (nullable)
  invitedAt: DateTime
  respondedAt: DateTime (nullable)
  completedAt: DateTime (nullable)
  feedback: text (nullable)
  rating: number (1-5, nullable)
  notes: text (nullable)
  createdAt: DateTime
  updatedAt: DateTime
  
  UNIQUE(activityId, employeeId)
}
```

### Key Features
- Activity CRUD operations
- Multiple activity types support
- Skill requirements definition with weights
- Participant invitation and tracking
- Seat management
- Status workflow management
- Calendar integration
- Attachment handling
- Activity templates
- Recurring activities

### API Endpoints

#### Activity Management
- `POST /activities` - Create activity
- `GET /activities` - List activities with filters
- `GET /activities/:id` - Get activity details
- `PATCH /activities/:id` - Update activity
- `DELETE /activities/:id` - Delete activity
- `POST /activities/:id/duplicate` - Duplicate activity
- `PATCH /activities/:id/status` - Update status

#### Skill Requirements
- `POST /activities/:id/skills` - Add skill requirement
- `GET /activities/:id/skills` - Get skill requirements
- `PATCH /activities/:id/skills/:skillId` - Update requirement
- `DELETE /activities/:id/skills/:skillId` - Remove requirement
- `POST /activities/:id/skills/bulk` - Bulk add requirements

#### Participant Management
- `POST /activities/:id/invite` - Invite participant
- `GET /activities/:id/participants` - Get participants
- `PATCH /activities/:id/participants/:participantId` - Update status
- `DELETE /activities/:id/participants/:participantId` - Remove participant
- `POST /activities/:id/participants/bulk-invite` - Bulk invite
- `GET /activities/:id/waitlist` - Get waitlist

#### Recommendations
- `GET /activities/:id/recommendations` - Get recommended employees
- `POST /activities/:id/auto-invite` - Auto-invite top matches

#### Calendar & Scheduling
- `GET /activities/calendar` - Get calendar view
- `GET /activities/upcoming` - Get upcoming activities
- `GET /activities/conflicts/:employeeId` - Check scheduling conflicts

## Frontend (React)

### Directory Structure
```
src/modules/activities/
├── components/
│   ├── ActivityForm.tsx
│   ├── ActivityList.tsx
│   ├── ActivityCard.tsx
│   ├── ActivityCalendar.tsx
│   ├── ActivityTimeline.tsx
│   ├── SkillRequirements.tsx
│   ├── SkillRequirementBuilder.tsx
│   ├── ParticipantsList.tsx
│   ├── ParticipantInvite.tsx
│   ├── RecommendationPanel.tsx
│   ├── ActivityStatusBadge.tsx
│   └── ActivityFilters.tsx
├── pages/
│   ├── ActivitiesPage.tsx
│   ├── CreateActivityPage.tsx
│   ├── ActivityDetailPage.tsx
│   ├── CalendarPage.tsx
│   └── MyActivitiesPage.tsx
├── store/
│   └── activitySlice.ts
├── hooks/
│   ├── useActivities.ts
│   └── useActivityParticipants.ts
├── services/
│   └── activityService.ts
└── types/
    └── activity.types.ts
```

### Key Components

#### ActivityForm.tsx
- Multi-step wizard
- Basic info (title, type, dates)
- Skill requirements builder
- Seat management
- Location and remote options
- File attachments

#### ActivityCalendar.tsx
- Month/week/day views
- Color-coded by type
- Drag-and-drop rescheduling
- Filter by type/status
- Click to view details

#### SkillRequirementBuilder.tsx
- Skill search and selection
- Level selector
- Weight slider (0-100%)
- Mandatory checkbox
- Visual weight distribution

#### RecommendationPanel.tsx
- Top recommended employees
- Score breakdown visualization
- Quick invite buttons
- Filter by department
- Export recommendations

#### ParticipantsList.tsx
- Participant table with status
- Status update actions
- Waitlist management
- Bulk operations
- Communication tools

### State Management

#### activitySlice.ts
```typescript
interface ActivityState {
  activities: Activity[];
  selectedActivity: Activity | null;
  participants: ActivityParticipant[];
  recommendations: EmployeeRecommendation[];
  loading: boolean;
  error: string | null;
  filters: {
    type: ActivityType[];
    status: ActivityStatus[];
    dateRange: [Date, Date];
    department: string[];
  };
  calendarView: 'month' | 'week' | 'day';
}
```

### Features

#### Activity Types
1. **TRAINING**: Skill development sessions
2. **CERTIFICATION**: Official certification programs
3. **PROJECT**: Project assignments
4. **MISSION**: Short-term missions
5. **AUDIT**: Audit activities

#### Status Workflow
```
DRAFT → OPEN → IN_PROGRESS → COMPLETED
              ↓
           CANCELLED
```

#### Participant Status Flow
```
INVITED → CONFIRMED → COMPLETED
        ↓
      DECLINED
        ↓
      WAITLIST → CONFIRMED
```

#### Seat Management
- Track available vs filled seats
- Automatic waitlist when full
- Notification when seats available
- Overbooking prevention

## Integration Points
- Links to Skill Management for requirements
- Links to Employee Management for participants
- Links to Scoring Module for recommendations
- Links to Notifications for invites
- Links to Evaluation for post-activity assessment
