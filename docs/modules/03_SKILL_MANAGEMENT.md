# Module 3: Skill Management

## Overview
Manages skills taxonomy, employee skill assignments, levels, and evolution tracking.

## Backend (NestJS)

### Directory Structure
```
src/modules/skills/
├── dto/
│   ├── create-skill.dto.ts
│   ├── update-skill.dto.ts
│   ├── assign-skill.dto.ts
│   ├── update-skill-level.dto.ts
│   └── bulk-assign-skills.dto.ts
├── entities/
│   ├── skill.entity.ts
│   ├── employee-skill.entity.ts
│   └── skill-evolution.entity.ts
├── skills.controller.ts
├── skills.service.ts
├── employee-skills.controller.ts
├── employee-skills.service.ts
└── skills.module.ts
```

### Database Schema

#### Skill
```typescript
Skill {
  id: UUID (PK)
  name: string (unique, indexed)
  type: enum (KNOWLEDGE, KNOW_HOW, SOFT_SKILL)
  category: string (indexed)
  subcategory: string (nullable)
  description: text
  keywords: string[] (for NLP matching)
  relatedSkills: UUID[] (FK to Skill)
  isActive: boolean (default: true)
  createdBy: UUID (FK to User)
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### EmployeeSkill
```typescript
EmployeeSkill {
  id: UUID (PK)
  employeeId: UUID (FK to Employee, indexed)
  skillId: UUID (FK to Skill, indexed)
  level: enum (LOW, MEDIUM, HIGH, EXPERT)
  score: number (0-100, calculated)
  yearsOfExperience: number (nullable)
  lastAssessed: DateTime
  assessedBy: UUID (FK to User, nullable)
  certifications: JSON[] (nullable)
  projects: string[] (nullable)
  notes: text (nullable)
  isVerified: boolean (default: false)
  createdAt: DateTime
  updatedAt: DateTime
  
  UNIQUE(employeeId, skillId)
}
```

#### SkillEvolution
```typescript
SkillEvolution {
  id: UUID (PK)
  employeeSkillId: UUID (FK to EmployeeSkill, indexed)
  previousLevel: enum (nullable)
  newLevel: enum
  previousScore: number (nullable)
  newScore: number
  changeReason: enum (ACTIVITY_COMPLETION, MANUAL_UPDATE, EVALUATION, CERTIFICATION)
  activityId: UUID (FK to Activity, nullable)
  evaluationId: UUID (FK to Evaluation, nullable)
  notes: text (nullable)
  changedBy: UUID (FK to User)
  changedAt: DateTime
}
```

### Key Features
- Skill taxonomy management (3 types)
- Skill CRUD operations
- Employee skill assignment with levels
- Dynamic score calculation
- Skill evolution tracking
- Bulk skill operations
- Skill relationships and dependencies
- Certification tracking
- Skill verification workflow

### API Endpoints

#### Skill Management
- `POST /skills` - Create skill
- `GET /skills` - List skills with filters
- `GET /skills/:id` - Get skill details
- `PATCH /skills/:id` - Update skill
- `DELETE /skills/:id` - Soft delete skill
- `GET /skills/categories` - Get skill categories
- `GET /skills/search` - Search skills by keyword

#### Employee Skill Assignment
- `POST /employees/:id/skills` - Assign skill to employee
- `GET /employees/:id/skills` - Get employee skills
- `PATCH /employees/:id/skills/:skillId` - Update skill level
- `DELETE /employees/:id/skills/:skillId` - Remove skill
- `POST /employees/:id/skills/bulk` - Bulk assign skills
- `GET /employees/:id/skills/matrix` - Get skill matrix

#### Skill Evolution
- `GET /employees/:id/skills/:skillId/evolution` - Get skill history
- `POST /employees/:id/skills/:skillId/evolution` - Add evolution entry
- `GET /skills/:id/evolution/stats` - Get evolution statistics

#### Analytics
- `GET /skills/coverage` - Get skill coverage across organization
- `GET /skills/:id/employees` - Get employees with specific skill
- `GET /skills/gaps` - Identify skill gaps
- `GET /skills/trending` - Get trending skills

## Frontend (React)

### Directory Structure
```
src/modules/skills/
├── components/
│   ├── SkillForm.tsx
│   ├── SkillList.tsx
│   ├── SkillCard.tsx
│   ├── SkillMatrix.tsx
│   ├── SkillLevelBadge.tsx
│   ├── SkillAssignment.tsx
│   ├── SkillEvolutionChart.tsx
│   ├── SkillTypeFilter.tsx
│   ├── SkillCategoryTree.tsx
│   └── SkillGapAnalysis.tsx
├── pages/
│   ├── SkillsManagementPage.tsx
│   ├── EmployeeSkillsPage.tsx
│   ├── SkillDetailPage.tsx
│   └── SkillMatrixPage.tsx
├── store/
│   └── skillSlice.ts
├── hooks/
│   ├── useSkills.ts
│   └── useEmployeeSkills.ts
├── services/
│   └── skillService.ts
└── types/
    └── skill.types.ts
```

### Key Components

#### SkillMatrix.tsx
- Heatmap visualization (employees × skills)
- Color-coded skill levels
- Interactive cells with tooltips
- Filter by department/team
- Export to Excel

#### SkillAssignment.tsx
- Skill search and selection
- Level selector (LOW/MEDIUM/HIGH/EXPERT)
- Years of experience input
- Certification upload
- Bulk assignment mode

#### SkillEvolutionChart.tsx
- Line chart showing skill progression
- Timeline with milestones
- Activity markers
- Level transitions
- Score trends

#### SkillLevelBadge.tsx
- Visual indicator for skill level
- Color coding (LOW: red, MEDIUM: yellow, HIGH: blue, EXPERT: green)
- Score display
- Verification status

#### SkillGapAnalysis.tsx
- Compare required vs actual skills
- Gap identification
- Recommendations
- Priority ranking

### State Management

#### skillSlice.ts
```typescript
interface SkillState {
  skills: Skill[];
  employeeSkills: EmployeeSkill[];
  selectedSkill: Skill | null;
  evolution: SkillEvolution[];
  loading: boolean;
  error: string | null;
  filters: {
    type: SkillType[];
    category: string[];
    level: SkillLevel[];
    search: string;
  };
}
```

### Features

#### Skill Types
1. **Knowledge (Savoir)**: Theoretical knowledge
   - Examples: Project Management Theory, Agile Methodology, Cloud Architecture
   
2. **Know-how (Savoir-faire)**: Technical/practical skills
   - Examples: Python Programming, AWS Deployment, Data Analysis
   
3. **Soft Skills (Savoir-être)**: Behavioral qualities
   - Examples: Leadership, Communication, Problem Solving

#### Skill Levels
- **LOW (0-25)**: Beginner, basic understanding
- **MEDIUM (26-50)**: Intermediate, can work with guidance
- **HIGH (51-75)**: Advanced, can work independently
- **EXPERT (76-100)**: Master, can teach others

#### Score Calculation
```typescript
calculateSkillScore(employeeSkill) {
  baseScore = levelToScore(employeeSkill.level)
  experienceBonus = min(employeeSkill.yearsOfExperience * 5, 20)
  certificationBonus = employeeSkill.certifications.length * 10
  verificationBonus = employeeSkill.isVerified ? 5 : 0
  
  return min(baseScore + experienceBonus + certificationBonus + verificationBonus, 100)
}
```

## Integration Points
- Links to Employee Management for skill assignments
- Links to Activity Management for skill requirements
- Links to AI/NLP for skill extraction
- Links to Analytics for skill gap analysis
