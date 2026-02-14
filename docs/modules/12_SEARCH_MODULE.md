# Module 12: Advanced Search & Filtering

## Overview
Provides powerful search and filtering capabilities with scenario simulation.

## Backend (NestJS)

### Directory Structure
```
src/modules/search/
├── dto/
│   ├── search-query.dto.ts
│   ├── filter-criteria.dto.ts
│   ├── simulation.dto.ts
│   └── saved-search.dto.ts
├── entities/
│   └── saved-search.entity.ts
├── builders/
│   ├── query-builder.ts
│   └── filter-builder.ts
├── search.controller.ts
├── search.service.ts
└── search.module.ts
```

### Query Builder
```typescript
class QueryBuilder {
  buildQuery(criteria: FilterCriteria) {
    const query = this.repository.createQueryBuilder('entity');
    
    // Apply filters
    if (criteria.skills) {
      query.andWhere('entity.skills @> :skills', { 
        skills: criteria.skills 
      });
    }
    
    if (criteria.department) {
      query.andWhere('entity.department IN (:...departments)', {
        departments: criteria.department
      });
    }
    
    if (criteria.experienceRange) {
      query.andWhere('entity.yearsOfExperience BETWEEN :min AND :max', {
        min: criteria.experienceRange.min,
        max: criteria.experienceRange.max
      });
    }
    
    return query;
  }
}
```

### API Endpoints
- `POST /search/employees` - Search employees
- `POST /search/activities` - Search activities
- `POST /search/skills` - Search skills
- `POST /search/simulate` - Simulate scenario
- `POST /search/save` - Save search
- `GET /search/saved` - Get saved searches

## Frontend (React)

### Directory Structure
```
src/modules/search/
├── components/
│   ├── AdvancedSearchBar.tsx
│   ├── FilterBuilder.tsx
│   ├── SearchResults.tsx
│   ├── SavedSearches.tsx
│   └── SimulationPanel.tsx
├── pages/
│   └── SearchPage.tsx
└── services/
    └── searchService.ts
```

### Key Components

#### FilterBuilder.tsx
- Dynamic filter creation
- AND/OR logic
- Nested conditions
- Visual query builder

#### SimulationPanel.tsx
- What-if scenarios
- Parameter adjustment
- Result preview
- Comparison mode

## Integration Points
- Searches across all modules
- Uses Elasticsearch (optional)
- Integrates with Analytics
