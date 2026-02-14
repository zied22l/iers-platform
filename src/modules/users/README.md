# Users Module

Complete user management module with authentication, authorization, and role-based access control.

## Directory Structure

```
src/modules/users/
├── dto/
│   ├── create-user.dto.ts       # DTO for user creation
│   ├── update-user.dto.ts       # DTO for user updates
│   ├── login.dto.ts             # DTO for login
│   └── change-password.dto.ts   # DTO for password change
├── entities/
│   └── user.entity.ts           # User schema (Mongoose)
├── guards/
│   ├── jwt-auth.guard.ts        # JWT authentication guard
│   ├── roles.guard.ts           # Role-based authorization guard
│   └── local-auth.guard.ts      # Local strategy guard
├── strategies/
│   ├── jwt.strategy.ts          # JWT strategy
│   └── local.strategy.ts        # Local authentication strategy
├── decorators/
│   └── roles.decorator.ts       # Roles decorator for RBAC
├── users.controller.ts          # User CRUD endpoints
├── users.service.ts             # User business logic
├── auth.controller.ts           # Authentication endpoints
├── auth.service.ts              # Authentication logic
└── users.module.ts              # Module configuration
```

## User Schema

### Fields
- `name`: Full name of the user
- `matricule`: Employee registration number (unique)
- `telephone`: Phone number
- `email`: Email address (unique, indexed)
- `password`: Encrypted password (bcrypt)
- `date_embauche`: Hiring date
- `departement_id`: Reference to department (ObjectId)
- `manager_id`: Reference to manager (ObjectId)
- `status`: User status (default: 'active')
- `en_ligne`: Online status (boolean)
- `role`: User role (HR, MANAGER, EMPLOYEE)
- `isActive`: Account active status
- `emailVerified`: Email verification status
- `verificationToken`: Email verification token
- `resetPasswordToken`: Password reset token
- `resetPasswordExpires`: Password reset expiration
- `lastLogin`: Last login timestamp
- `createdAt`: Auto-generated timestamp
- `updatedAt`: Auto-generated timestamp

### Indexes
- email (unique)
- matricule (unique)
- role
- departement_id
- manager_id


