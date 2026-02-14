# Module 1: User Management

## Overview
Handles user authentication, authorization, and account management with role-based access control.

## Backend (NestJS)

### Directory Structure
```
src/modules/users/
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   ├── login.dto.ts
│   └── change-password.dto.ts
├── entities/
│   └── user.entity.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   ├── roles.guard.ts
│   └── local-auth.guard.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
├── users.controller.ts
├── users.service.ts
├── auth.controller.ts
├── auth.service.ts
└── users.module.ts
```

### Database Schema (Mongoose)
```typescript
// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  HR = 'HR',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ type: String, enum: UserRole, required: true })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  verificationToken?: string;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop()
  lastLogin?: Date;

  // timestamps: true adds createdAt and updatedAt automatically
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
```

### Key Features
- User CRUD operations
- JWT authentication with refresh tokens
- OAuth2/SSO integration (Google, Microsoft)
- Password hashing with bcrypt (salt rounds: 10)
- Email verification workflow
- Password reset functionality
- Role-based access control (RBAC)
- Session management

### API Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with credentials
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `POST /auth/verify-email` - Verify email address
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/oauth/google` - OAuth Google login
- `GET /auth/oauth/microsoft` - OAuth Microsoft login

#### User Management
- `GET /users` - List all users (HR only)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Soft delete user (HR only)
- `PATCH /users/:id/role` - Update user role (HR only)
- `PATCH /users/:id/activate` - Activate/deactivate user (HR only)

## Frontend (React)

### Directory Structure
```
src/modules/users/
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── UserList.tsx
│   ├── UserProfile.tsx
│   ├── RoleSelector.tsx
│   ├── PasswordReset.tsx
│   └── EmailVerification.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── UsersManagementPage.tsx
│   ├── ProfilePage.tsx
│   └── ForgotPasswordPage.tsx
├── store/
│   ├── userSlice.ts
│   └── authSlice.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useUsers.ts
│   └── usePermissions.ts
├── services/
│   └── userService.ts
└── types/
    └── user.types.ts
```

### Key Components

#### LoginForm.tsx
- Email/password inputs with validation
- Remember me checkbox
- OAuth buttons (Google, Microsoft)
- Link to forgot password
- Form error handling

#### UserList.tsx
- DataGrid with pagination
- Search and filter by role/status
- Bulk actions (activate/deactivate)
- Role assignment
- User deletion with confirmation

#### UserProfile.tsx
- Display user information
- Edit profile form
- Change password
- Avatar upload
- Activity history

### State Management (Redux)

#### authSlice.ts
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
```

#### userSlice.ts
```typescript
interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### Protected Routes
```typescript
<ProtectedRoute roles={['HR', 'MANAGER']}>
  <UsersManagementPage />
</ProtectedRoute>
```

## Security Considerations
- Password complexity requirements
- Rate limiting on login attempts
- JWT expiration (15 min access, 7 days refresh)
- HTTPS only
- CSRF protection
- XSS prevention
- SQL injection protection via ORM
