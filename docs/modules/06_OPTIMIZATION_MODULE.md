# Module 6: Optimization & Contextual Prioritization

## Overview
Optimizes employee selection based on context, constraints, and organizational goals.

## Backend (NestJS)

### Directory Structure
```
src/modules/optimization/
├── dto/
│   ├── optimization-params.dto.ts
│   ├── constraint.dto.ts
│   └── optimization-result.dto.ts
├── interfaces/
│   ├── strategy.interface.ts
│   └── constraint.interface.ts
├── strategies/
│   ├── upskilling-strategy.ts
│   ├── expertise-strategy.ts
│   ├── balanced-strategy.ts
│   └── diversity-strategy.ts
├── constraints/
│   ├── seat-constraint.ts
│   ├── availability-constraint.ts
│   └── mandatory-skill-constraint.ts
├── optimization.controller.ts
├── optimization.service.ts
└── optimization.module.ts
```

### Optimization Strategies

#### 1. Upskilling Strategy
Prioritizes employees who would benefit most from skill development.

```typescript
class UpskillingStrategy {
  optimize(employees, activity) {
    return employees
      .filter(emp => meetsMinimumRequirements(emp, activity))
      .map(emp => ({
        employee: emp,
        score: calculateUpskillingScore(emp, activity)
      }))
      .sort((a, b) => b.score - a.score)
  }
  
  calculateUpskillingScore(employee, activity) {
    // Favor employees slightly below target level
    const gapScore = calculateSkillGap(employee, activity)
    const potentialScore = employee.progressionPotential
    const motivationScore = employee.recentActivityEngagement
    
    return (gapScore * 0.4) + (potentialScore * 0.4) + (motivationScore * 0.2)
  }
}
```

#### 2. Expertise Strategy
Prioritizes employees with highest skill levels.

```typescript
class ExpertiseStrategy {
  optimize(employees, activity) {
    return employees
      .filter(emp => meetsRequirements(emp, activity))
      .map(emp => ({
        employee: emp,
        score: calculateExpertiseScore(emp, activity)
      }))
      .sort((a, b) => b.score - a.score)
  }
  
  calculateExpertiseScore(employee, activity) {
    const skillLevel = averageSkillLevel(employee, activity.requiredSkills)
    const experience = employee.yearsOfExperience
    const certifications = countRelevantCertifications(employee, activity)
    
    return (skillLevel * 0.5) + (experience * 0.3) + (certifications * 0.2)
  }
}
```

#### 3. Balanced Strategy
Balances skill development and expertise needs.

```typescript
class BalancedStrategy {
  optimize(employees, activity) {
    const experts = this.selectExperts(employees, activity, 0.3)
    const developers = this.selectDevelopers(employees, activity, 0.7)
    
    return [...experts, ...developers]
  }
}
```

#### 4. Diversity Strategy
Ensures diverse team composition.

```typescript
class DiversityStrategy {
  optimize(employees, activity) {
    return employees
      .filter(emp => meetsRequirements(emp, activity))
      .map(emp => ({
        employee: emp,
        score: calculateDiversityScore(emp, activity, currentSelection)
      }))
      .sort((a, b) => b.score - a.score)
  }
  
  calculateDiversityScore(employee, activity, currentSelection) {
    const skillDiversity = calculateSkillDiversity(employee, currentSelection)
    const departmentDiversity = calculateDepartmentDiversity(employee, currentSelection)
    const experienceDiversity = calculateExperienceDiversity(employee, currentSelection)
    
    return (skillDiversity * 0.4) + (departmentDiversity * 0.3) + (experienceDiversity * 0.3)
  }
}
```

### Constraint Management

#### Seat Constraint
```typescript
class SeatConstraint {
  validate(selection, activity) {
    return selection.length <= activity.availableSeats
  }
  
  apply(candidates, activity) {
    return candidates.slice(0, activity.availableSeats)
  }
}
```

#### Availability Constraint
```typescript
class AvailabilityConstraint {
  validate(employee, activity) {
    // Check for scheduling conflicts
    const conflicts = checkScheduleConflicts(employee, activity)
    return conflicts.length === 0
  }
}
```

#### Mandatory Skill Constraint
```typescript
class MandatorySkillConstraint {
  validate(employee, activity) {
    const mandatorySkills = activity.requiredSkills.filter(s => s.isMandatory)
    
    for (const required of mandatorySkills) {
      const employeeSkill = employee.skills.find(s => s.skillId === required.skillId)
      
      if (!employeeSkill || employeeSkill.level < required.requiredLevel) {
        return false
      }
    }
    
    return true
  }
}
```

### Tie-Breaking Algorithm

```typescript
breakTies(candidates) {
  // When multiple candidates have same score
  return candidates.sort((a, b) => {
    // 1. Prioritize by progression potential
    if (a.progressionScore !== b.progressionScore) {
      return b.progressionScore - a.progressionScore
    }
    
    // 2. Prioritize by availability
    if (a.availabilityScore !== b.availabilityScore) {
      return b.availabilityScore - a.availabilityScore
    }
    
    // 3. Prioritize by last activity date (give chance to less active)
    return a.lastActivityDate - b.lastActivityDate
  })
}
```

### Multi-Objective Optimization

```typescript
multiObjectiveOptimize(employees, activity, objectives) {
  // Pareto optimization for multiple objectives
  const paretoFront = []
  
  for (const employee of employees) {
    const scores = objectives.map(obj => obj.calculate(employee, activity))
    
    if (isDominated(scores, paretoFront)) {
      continue
    }
    
    paretoFront.push({ employee, scores })
  }
  
  return paretoFront
}
```

### API Endpoints
- `POST /optimization/recommend` - Get optimized recommendations
- `POST /optimization/simulate` - Simulate different strategies
- `POST /optimization/compare-strategies` - Compare strategy results
- `GET /optimization/strategies` - List available strategies
- `POST /optimization/custom` - Apply custom optimization rules

### Request/Response Format

#### Request
```typescript
{
  activityId: UUID,
  strategy: "UPSKILLING" | "EXPERTISE" | "BALANCED" | "DIVERSITY",
  constraints: {
    maxSeats: number,
    mandatorySkills: boolean,
    checkAvailability: boolean,
    departmentLimit: number (optional)
  },
  weights: {
    skillMatch: 0.5,
    experience: 0.2,
    progression: 0.15,
    context: 0.15
  }
}
```

#### Response
```typescript
{
  recommendations: [
    {
      employeeId: UUID,
      employee: Employee,
      totalScore: 85.5,
      rank: 1,
      reasoning: string[],
      constraints: {
        passed: boolean,
        violations: string[]
      }
    }
  ],
  strategy: "UPSKILLING",
  appliedConstraints: string[],
  alternativeRecommendations: [...],
  statistics: {
    totalCandidates: 50,
    qualified: 30,
    recommended: 10
  }
}
```

## Frontend (React)

### Directory Structure
```
src/modules/optimization/
├── components/
│   ├── OptimizationConfig.tsx
│   ├── StrategySelector.tsx
│   ├── ConstraintBuilder.tsx
│   ├── WeightSliders.tsx
│   ├── RecommendationResults.tsx
│   ├── SimulationPanel.tsx
│   ├── StrategyComparison.tsx
│   └── ParetoChart.tsx
├── hooks/
│   └── useOptimization.ts
├── services/
│   └── optimizationService.ts
└── types/
    └── optimization.types.ts
```

### Key Components

#### OptimizationConfig.tsx
- Strategy selection dropdown
- Constraint checkboxes
- Weight adjustment sliders
- Preview mode

#### StrategyComparison.tsx
- Side-by-side strategy results
- Difference highlighting
- Metrics comparison
- Export comparison

#### SimulationPanel.tsx
- What-if analysis
- Parameter adjustment
- Real-time results
- Scenario saving

## Integration Points
- Uses Scoring Module results
- Applies Activity constraints
- Considers Employee availability
- Feeds into Recommendation Module
