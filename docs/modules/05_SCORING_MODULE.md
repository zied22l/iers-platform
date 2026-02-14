# Module 5: Dynamic Scoring Module

## Overview
Calculates numeric scores for employee-activity matching based on skills, experience, and context.

## Backend (NestJS)

### Directory Structure
```
src/modules/scoring/
├── dto/
│   ├── calculate-score.dto.ts
│   ├── batch-score.dto.ts
│   └── score-result.dto.ts
├── interfaces/
│   ├── scorer.interface.ts
│   └── score-breakdown.interface.ts
├── algorithms/
│   ├── skill-scorer.ts
│   ├── experience-scorer.ts
│   ├── progression-scorer.ts
│   ├── context-scorer.ts
│   └── composite-scorer.ts
├── scoring.controller.ts
├── scoring.service.ts
└── scoring.module.ts
```

### Scoring Algorithm

#### Main Score Calculation
```typescript
calculateEmployeeScore(employee, activity) {
  // 1. Skill Match Score (50%)
  skillScore = calculateSkillMatch(employee.skills, activity.requiredSkills)
  
  // 2. Experience Score (20%)
  experienceScore = calculateExperienceScore(employee.experience, activity.type)
  
  // 3. Progression Potential (15%)
  progressionScore = calculateProgressionPotential(employee.skillEvolution)
  
  // 4. Contextual Fit (15%)
  contextScore = calculateContextualFit(activity.targetLevel, employee.level)
  
  // Weighted composite score
  finalScore = (skillScore * 0.5) + 
               (experienceScore * 0.2) + 
               (progressionScore * 0.15) + 
               (contextScore * 0.15)
  
  return {
    totalScore: finalScore,
    breakdown: {
      skillScore,
      experienceScore,
      progressionScore,
      contextScore
    }
  }
}
```

#### Skill Match Calculation
```typescript
calculateSkillMatch(employeeSkills, requiredSkills) {
  let totalWeight = 0
  let weightedScore = 0
  
  for (const required of requiredSkills) {
    totalWeight += required.weight
    
    const employeeSkill = employeeSkills.find(s => s.skillId === required.skillId)
    
    if (!employeeSkill) {
      // Missing skill penalty
      if (required.isMandatory) {
        return 0 // Disqualified
      }
      continue
    }
    
    // Level match score
    const levelScore = calculateLevelMatch(
      employeeSkill.level,
      required.requiredLevel
    )
    
    weightedScore += levelScore * required.weight
  }
  
  return totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0
}
```

#### Level Match Scoring
```typescript
calculateLevelMatch(employeeLevel, requiredLevel) {
  const levelMap = { LOW: 1, MEDIUM: 2, HIGH: 3, EXPERT: 4 }
  
  const empLevel = levelMap[employeeLevel]
  const reqLevel = levelMap[requiredLevel]
  
  if (empLevel >= reqLevel) {
    // Meets or exceeds requirement
    return 1.0
  } else {
    // Below requirement - partial credit
    return empLevel / reqLevel * 0.7
  }
}
```

#### Experience Scoring
```typescript
calculateExperienceScore(employee, activityType) {
  const totalExperience = employee.yearsOfExperience
  const relevantExperience = calculateRelevantExperience(
    employee.history,
    activityType
  )
  
  // Base score from total experience
  const baseScore = Math.min(totalExperience * 5, 50)
  
  // Bonus for relevant experience
  const relevantBonus = Math.min(relevantExperience * 10, 50)
  
  return Math.min(baseScore + relevantBonus, 100)
}
```

#### Progression Potential
```typescript
calculateProgressionPotential(skillEvolution) {
  if (skillEvolution.length === 0) return 50 // Neutral
  
  // Calculate average skill improvement rate
  const recentEvolutions = skillEvolution.slice(-5)
  let totalImprovement = 0
  
  for (const evolution of recentEvolutions) {
    const improvement = evolution.newScore - evolution.previousScore
    totalImprovement += improvement
  }
  
  const avgImprovement = totalImprovement / recentEvolutions.length
  
  // Convert to 0-100 scale
  return Math.min(Math.max(50 + avgImprovement * 2, 0), 100)
}
```

#### Contextual Fit
```typescript
calculateContextualFit(targetLevel, employeeLevel) {
  const levelMap = { LOW: 1, MEDIUM: 2, HIGH: 3, EXPERT: 4 }
  
  const target = levelMap[targetLevel]
  const employee = levelMap[employeeLevel]
  
  // Perfect match
  if (target === employee) return 100
  
  // One level difference
  if (Math.abs(target - employee) === 1) return 80
  
  // Two levels difference
  if (Math.abs(target - employee) === 2) return 50
  
  // Three levels difference
  return 20
}
```

### API Endpoints
- `POST /scoring/calculate` - Calculate score for single employee-activity pair
- `POST /scoring/batch` - Calculate scores for multiple employees
- `GET /scoring/activity/:id/rankings` - Get ranked employees for activity
- `POST /scoring/simulate` - Simulate scoring with different weights
- `GET /scoring/employee/:id/matches` - Get best activity matches for employee

### Response Format
```typescript
{
  employeeId: UUID,
  activityId: UUID,
  totalScore: 85.5,
  breakdown: {
    skillScore: 90,
    experienceScore: 75,
    progressionScore: 88,
    contextScore: 85
  },
  matchedSkills: [
    {
      skillId: UUID,
      skillName: "Python",
      employeeLevel: "HIGH",
      requiredLevel: "MEDIUM",
      score: 100
    }
  ],
  missingSkills: [
    {
      skillId: UUID,
      skillName: "Docker",
      requiredLevel: "MEDIUM",
      isMandatory: false
    }
  ],
  recommendations: string[]
}
```

## Frontend (React)

### Directory Structure
```
src/modules/scoring/
├── components/
│   ├── ScoreBreakdown.tsx
│   ├── ScoreVisualization.tsx
│   ├── RankingTable.tsx
│   ├── ScoreGauge.tsx
│   ├── SkillMatchChart.tsx
│   └── WeightAdjuster.tsx
├── hooks/
│   └── useScoring.ts
├── services/
│   └── scoringService.ts
└── types/
    └── scoring.types.ts
```

### Key Components

#### ScoreBreakdown.tsx
- Pie chart showing score components
- Detailed breakdown table
- Skill match details
- Missing skills list

#### ScoreGauge.tsx
- Circular gauge (0-100)
- Color-coded ranges
- Animated transitions

#### RankingTable.tsx
- Sortable employee rankings
- Score columns
- Quick actions (invite, view profile)
- Export rankings

## Integration Points
- Uses Skill Management data
- Uses Employee Management data
- Uses Activity Management requirements
- Feeds into Optimization Module
