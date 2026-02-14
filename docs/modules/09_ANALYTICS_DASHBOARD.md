# Module 9: Analytical & Predictive Dashboard

## Overview
Provides comprehensive analytics, visualizations, and predictive insights for skills management.

## Backend (NestJS)

### Directory Structure
```
src/modules/analytics/
├── dto/
│   ├── analytics-query.dto.ts
│   ├── date-range.dto.ts
│   └── filter-options.dto.ts
├── reports/
│   ├── skill-gap-analyzer.ts
│   ├── progression-tracker.ts
│   ├── coverage-calculator.ts
│   ├── trend-analyzer.ts
│   └── predictor.ts
├── analytics.controller.ts
├── analytics.service.ts
└── analytics.module.ts
```

### Analytics Calculations

#### Skill Coverage Analysis
```typescript
async calculateSkillCoverage(filters) {
  const allSkills = await this.skillsService.findAll()
  const employees = await this.employeesService.findAll(filters)
  
  const coverage = {}
  
  for (const skill of allSkills) {
    const employeesWithSkill = employees.filter(emp =>
      emp.skills.some(s => s.skillId === skill.id)
    )
    
    const levels = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      EXPERT: 0
    }
    
    employeesWithSkill.forEach(emp => {
      const empSkill = emp.skills.find(s => s.skillId === skill.id)
      levels[empSkill.level]++
    })
    
    coverage[skill.name] = {
      total: employeesWithSkill.length,
      percentage: (employeesWithSkill.length / employees.length) * 100,
      levels: levels,
      avgScore: this.calculateAvgScore(employeesWithSkill, skill.id)
    }
  }
  
  return coverage
}
```

#### Skill Gap Analysis
```typescript
async analyzeSkillGaps(department) {
  // Get required skills from upcoming activities
  const upcomingActivities = await this.activitiesService.findUpcoming({
    department
  })
  
  const requiredSkills = this.extractRequiredSkills(upcomingActivities)
  
  // Get current employee skills
  const employees = await this.employeesService.findByDepartment(department)
  const currentSkills = this.aggregateEmployeeSkills(employees)
  
  // Identify gaps
  const gaps = []
  
  for (const required of requiredSkills) {
    const current = currentSkills[required.skillId]
    
    if (!current || current.count < required.minEmployees) {
      gaps.push({
        skill: required.skill,
        requiredLevel: required.level,
        requiredCount: required.minEmployees,
        currentCount: current?.count || 0,
        gap: required.minEmployees - (current?.count || 0),
        priority: this.calculateGapPriority(required, current)
      })
    }
  }
  
  return gaps.sort((a, b) => b.priority - a.priority)
}
```

#### Progression Tracking
```typescript
async trackProgression(employeeId, timeRange) {
  const evolutions = await this.skillEvolutionService.find({
    employeeId,
    dateRange: timeRange
  })
  
  const progression = {
    totalSkills: 0,
    improved: 0,
    declined: 0,
    stable: 0,
    avgImprovement: 0,
    timeline: []
  }
  
  const skillChanges = {}
  
  for (const evolution of evolutions) {
    const skillId = evolution.employeeSkill.skillId
    
    if (!skillChanges[skillId]) {
      skillChanges[skillId] = {
        skill: evolution.employeeSkill.skill,
        changes: []
      }
    }
    
    skillChanges[skillId].changes.push({
      date: evolution.changedAt,
      previousScore: evolution.previousScore,
      newScore: evolution.newScore,
      change: evolution.newScore - evolution.previousScore
    })
  }
  
  // Analyze each skill
  for (const [skillId, data] of Object.entries(skillChanges)) {
    const totalChange = data.changes.reduce((sum, c) => sum + c.change, 0)
    
    if (totalChange > 5) progression.improved++
    else if (totalChange < -5) progression.declined++
    else progression.stable++
    
    progression.avgImprovement += totalChange
  }
  
  progression.totalSkills = Object.keys(skillChanges).length
  progression.avgImprovement /= progression.totalSkills
  
  return progression
}
```

#### Predictive Analysis
```typescript
async predictSkillNeeds(department, months = 6) {
  // Historical activity patterns
  const historicalActivities = await this.getHistoricalActivities(
    department,
    months * 2
  )
  
  // Identify trends
  const trends = this.analyzeTrends(historicalActivities)
  
  // Project future needs
  const predictions = []
  
  for (const trend of trends) {
    const prediction = {
      skill: trend.skill,
      currentDemand: trend.currentDemand,
      projectedDemand: trend.currentDemand * trend.growthRate,
      currentSupply: await this.getCurrentSupply(department, trend.skill),
      projectedGap: 0,
      confidence: trend.confidence,
      recommendations: []
    }
    
    prediction.projectedGap = 
      prediction.projectedDemand - prediction.currentSupply
    
    if (prediction.projectedGap > 0) {
      prediction.recommendations = this.generateRecommendations(prediction)
    }
    
    predictions.push(prediction)
  }
  
  return predictions.sort((a, b) => b.projectedGap - a.projectedGap)
}
```

### API Endpoints

#### Overview & KPIs
- `GET /analytics/overview` - Dashboard overview
- `GET /analytics/kpis` - Key performance indicators
- `GET /analytics/summary/:department` - Department summary

#### Skills Analytics
- `GET /analytics/skills/coverage` - Skill coverage analysis
- `GET /analytics/skills/gaps` - Skill gap analysis
- `GET /analytics/skills/distribution` - Skill level distribution
- `GET /analytics/skills/trending` - Trending skills

#### Employee Analytics
- `GET /analytics/employees/:id/progression` - Employee progression
- `GET /analytics/employees/top-performers` - Top performers
- `GET /analytics/employees/development-needs` - Development needs

#### Department Analytics
- `GET /analytics/department/:id/stats` - Department statistics
- `GET /analytics/department/:id/comparison` - Compare departments
- `GET /analytics/department/:id/heatmap` - Skill heatmap

#### Predictive Analytics
- `GET /analytics/predictions/skill-needs` - Predict skill needs
- `GET /analytics/predictions/trends` - Skill trends
- `GET /analytics/predictions/recommendations` - AI recommendations

#### Reports
- `GET /analytics/reports/export` - Export analytics report
- `POST /analytics/reports/custom` - Generate custom report

## Frontend (React)

### Directory Structure
```
src/modules/analytics/
├── components/
│   ├── DashboardOverview.tsx
│   ├── KPICards.tsx
│   ├── SkillHeatmap.tsx
│   ├── GapAnalysisChart.tsx
│   ├── ProgressionTimeline.tsx
│   ├── DepartmentComparison.tsx
│   ├── PredictiveInsights.tsx
│   ├── TrendChart.tsx
│   ├── SkillDistribution.tsx
│   └── ReportGenerator.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── SkillAnalyticsPage.tsx
│   ├── DepartmentAnalyticsPage.tsx
│   └── PredictivePage.tsx
├── store/
│   └── analyticsSlice.ts
├── hooks/
│   └── useAnalytics.ts
├── services/
│   └── analyticsService.ts
└── types/
    └── analytics.types.ts
```

### Key Components

#### DashboardOverview.tsx
- KPI cards (total employees, skills, activities)
- Quick stats
- Recent trends
- Alerts and notifications

#### SkillHeatmap.tsx
- 2D heatmap (employees × skills)
- Color gradient by level
- Interactive tooltips
- Zoom and filter
- Export to image

#### GapAnalysisChart.tsx
- Bar chart showing gaps
- Priority indicators
- Drill-down capability
- Action buttons

#### ProgressionTimeline.tsx
- Line chart with multiple series
- Skill level changes over time
- Activity markers
- Comparison mode

#### PredictiveInsights.tsx
- Predicted skill needs
- Confidence indicators
- Recommended actions
- Timeline projections

#### DepartmentComparison.tsx
- Radar chart comparing departments
- Side-by-side metrics
- Ranking table
- Benchmark indicators

### Visualizations (Recharts/D3.js)

#### Skill Coverage Heatmap
```typescript
<ResponsiveContainer width="100%" height={600}>
  <ScatterChart>
    <XAxis dataKey="skill" />
    <YAxis dataKey="employee" />
    <ZAxis dataKey="level" range={[50, 400]} />
    <Tooltip content={<CustomTooltip />} />
    <Scatter data={heatmapData} fill="#8884d8" />
  </ScatterChart>
</ResponsiveContainer>
```

#### Progression Timeline
```typescript
<ResponsiveContainer width="100%" height={400}>
  <LineChart data={progressionData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    {skills.map(skill => (
      <Line 
        key={skill.id}
        type="monotone"
        dataKey={skill.name}
        stroke={skill.color}
      />
    ))}
  </LineChart>
</ResponsiveContainer>
```

#### Gap Analysis
```typescript
<ResponsiveContainer width="100%" height={400}>
  <BarChart data={gapData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="skill" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="required" fill="#8884d8" />
    <Bar dataKey="current" fill="#82ca9d" />
    <Bar dataKey="gap" fill="#ff7c7c" />
  </BarChart>
</ResponsiveContainer>
```

### State Management
```typescript
interface AnalyticsState {
  overview: DashboardOverview | null;
  skillCoverage: SkillCoverage[];
  gaps: SkillGap[];
  progression: ProgressionData[];
  predictions: Prediction[];
  loading: boolean;
  error: string | null;
  filters: {
    department: string[];
    dateRange: [Date, Date];
    skillType: string[];
  };
}
```

## Integration Points
- Aggregates data from all modules
- Real-time updates via WebSocket
- Export to PDF/Excel
- Scheduled reports via email
