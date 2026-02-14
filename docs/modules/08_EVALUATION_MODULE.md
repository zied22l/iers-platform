# Module 8: Post-Activity Evaluation

## Overview
Manages post-activity evaluations and automatically updates employee skill levels based on performance.

## Backend (NestJS)

### Directory Structure
```
src/modules/evaluations/
├── dto/
│   ├── create-evaluation.dto.ts
│   ├── update-evaluation.dto.ts
│   ├── skill-update.dto.ts
│   └── bulk-evaluate.dto.ts
├── entities/
│   └── evaluation.entity.ts
├── evaluations.controller.ts
├── evaluations.service.ts
├── skill-update.service.ts
└── evaluations.module.ts
```

### Database Schema
```typescript
Evaluation {
  id: UUID (PK)
  activityId: UUID (FK to Activity, indexed)
  employeeId: UUID (FK to Employee, indexed)
  evaluatorId: UUID (FK to User)
  overallRating: number (1-5)
  attendanceRate: number (0-100)
  participationLevel: enum (LOW, MEDIUM, HIGH, EXCELLENT)
  skillUpdates: JSON[] // Array of skill changes
  strengths: text[]
  areasForImprovement: text[]
  feedback: text
  recommendations: text
  certificateIssued: boolean
  certificateUrl: string (nullable)
  completionDate: DateTime
  evaluatedAt: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Skill Update Logic
```typescript
async updateSkillsAfterEvaluation(evaluation) {
  for (const skillUpdate of evaluation.skillUpdates) {
    const employeeSkill = await this.getEmployeeSkill(
      evaluation.employeeId,
      skillUpdate.skillId
    )
    
    // Calculate new score based on evaluation
    const newScore = this.calculateNewScore(
      employeeSkill.score,
      evaluation.overallRating,
      skillUpdate.performanceRating
    )
    
    // Determine new level
    const newLevel = this.scoreToLevel(newScore)
    
    // Update employee skill
    await this.updateEmployeeSkill(employeeSkill.id, {
      score: newScore,
      level: newLevel,
      lastAssessed: new Date()
    })
    
    // Record evolution
    await this.recordSkillEvolution({
      employeeSkillId: employeeSkill.id,
      previousLevel: employeeSkill.level,
      newLevel: newLevel,
      previousScore: employeeSkill.score,
      newScore: newScore,
      changeReason: 'ACTIVITY_COMPLETION',
      activityId: evaluation.activityId,
      evaluationId: evaluation.id,
      changedBy: evaluation.evaluatorId,
      changedAt: new Date()
    })
  }
}
```

### Score Calculation
```typescript
calculateNewScore(currentScore, overallRating, skillPerformance) {
  // Base improvement from overall rating
  const ratingBonus = (overallRating - 3) * 5 // -10 to +10
  
  // Skill-specific performance
  const performanceBonus = (skillPerformance - 3) * 3 // -6 to +6
  
  // Calculate new score
  let newScore = currentScore + ratingBonus + performanceBonus
  
  // Apply diminishing returns for high scores
  if (currentScore > 80) {
    newScore = currentScore + (ratingBonus + performanceBonus) * 0.5
  }
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, newScore))
}
```

### API Endpoints
- `POST /evaluations` - Create evaluation
- `GET /evaluations` - List evaluations
- `GET /evaluations/:id` - Get evaluation details
- `PATCH /evaluations/:id` - Update evaluation
- `DELETE /evaluations/:id` - Delete evaluation
- `GET /evaluations/activity/:id` - Get evaluations for activity
- `GET /evaluations/employee/:id` - Get employee evaluations
- `POST /evaluations/bulk` - Bulk create evaluations
- `GET /evaluations/:id/impact` - Get skill impact analysis

## Frontend (React)

### Directory Structure
```
src/modules/evaluations/
├── components/
│   ├── EvaluationForm.tsx
│   ├── SkillRatingWidget.tsx
│   ├── EvaluationSummary.tsx
│   ├── ImpactAnalysis.tsx
│   ├── EvaluationList.tsx
│   └── BulkEvaluationForm.tsx
├── pages/
│   ├── EvaluationPage.tsx
│   ├── CreateEvaluationPage.tsx
│   └── EvaluationHistoryPage.tsx
├── store/
│   └── evaluationSlice.ts
├── hooks/
│   └── useEvaluations.ts
├── services/
│   └── evaluationService.ts
└── types/
    └── evaluation.types.ts
```

### Key Components

#### EvaluationForm.tsx
- Overall rating (1-5 stars)
- Attendance rate input
- Participation level selector
- Skill-by-skill rating
- Strengths and improvements
- Feedback text area
- Certificate generation

#### SkillRatingWidget.tsx
- Skill name display
- Before/after level comparison
- Performance rating (1-5)
- Visual progress indicator
- Notes field

#### ImpactAnalysis.tsx
- Skill level changes visualization
- Score progression chart
- Comparison with peers
- Recommendations

## Integration Points
- Updates Skill Management data
- Links to Activity Management
- Feeds into Analytics Dashboard
- Triggers Notifications
