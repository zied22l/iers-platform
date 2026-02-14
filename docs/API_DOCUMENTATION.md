# API Documentation Overview

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.your-domain.com/api
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  }
}
```

## API Endpoints Summary

### Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Users (`/users`)
- `GET /users` - List users
- `GET /users/:id` - Get user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `PATCH /users/:id/role` - Update role

### Employees (`/employees`)
- `POST /employees` - Create employee
- `GET /employees` - List employees
- `GET /employees/:id` - Get employee
- `PATCH /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee
- `GET /employees/:id/history` - Get history
- `POST /employees/import` - Bulk import

### Skills (`/skills`)
- `POST /skills` - Create skill
- `GET /skills` - List skills
- `GET /skills/:id` - Get skill
- `PATCH /skills/:id` - Update skill
- `DELETE /skills/:id` - Delete skill
- `POST /employees/:id/skills` - Assign skill
- `GET /employees/:id/skills` - Get employee skills

### Activities (`/activities`)
- `POST /activities` - Create activity
- `GET /activities` - List activities
- `GET /activities/:id` - Get activity
- `PATCH /activities/:id` - Update activity
- `DELETE /activities/:id` - Delete activity
- `POST /activities/:id/skills` - Add skill requirement
- `POST /activities/:id/invite` - Invite participant
- `GET /activities/:id/recommendations` - Get recommendations

### Scoring (`/scoring`)
- `POST /scoring/calculate` - Calculate score
- `POST /scoring/batch` - Batch scoring
- `GET /scoring/activity/:id/rankings` - Get rankings

### Optimization (`/optimization`)
- `POST /optimization/recommend` - Get recommendations
- `POST /optimization/simulate` - Simulate scenario

### AI Integration (`/ai`)
- `POST /ai/extract-skills` - Extract skills from text
- `POST /ai/match-employees` - AI-powered matching
- `POST /ai/feedback` - Submit feedback

### Evaluations (`/evaluations`)
- `POST /evaluations` - Create evaluation
- `GET /evaluations` - List evaluations
- `GET /evaluations/:id` - Get evaluation
- `GET /evaluations/activity/:id` - Get activity evaluations

### Analytics (`/analytics`)
- `GET /analytics/overview` - Dashboard overview
- `GET /analytics/skills/coverage` - Skill coverage
- `GET /analytics/skills/gaps` - Skill gaps
- `GET /analytics/predictions/skill-needs` - Predict needs

### Notifications (`/notifications`)
- `GET /notifications` - Get notifications
- `PATCH /notifications/:id/read` - Mark as read
- `DELETE /notifications/:id` - Delete notification

### Requests (`/requests`)
- `POST /requests` - Create request
- `GET /requests` - List requests
- `POST /requests/:id/approve` - Approve request
- `POST /requests/:id/reject` - Reject request

### Audit (`/audit`)
- `GET /audit/logs` - Get audit logs
- `GET /audit/entity/:type/:id` - Get entity logs
- `GET /audit/export` - Export logs

### Search (`/search`)
- `POST /search/employees` - Search employees
- `POST /search/activities` - Search activities
- `POST /search/simulate` - Simulate scenario

## Pagination

List endpoints support pagination:
```
GET /employees?page=1&limit=20
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Filtering

Most list endpoints support filtering:
```
GET /employees?department=IT&status=ACTIVE
GET /activities?type=TRAINING&status=OPEN
```

## Sorting

```
GET /employees?sortBy=lastName&order=asc
```

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user

## WebSocket Events

### Connection
```javascript
const socket = io('ws://localhost:3000/notifications', {
  auth: { token: accessToken }
});
```

### Events
- `notification` - New notification received
- `activity-update` - Activity status changed
- `evaluation-completed` - Evaluation submitted

## Error Codes

- `AUTH_001` - Invalid credentials
- `AUTH_002` - Token expired
- `AUTH_003` - Insufficient permissions
- `VAL_001` - Validation error
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict
- `SERVER_ERROR` - Internal server error

## Swagger Documentation

Interactive API documentation available at:
```
http://localhost:3000/api/docs
```
