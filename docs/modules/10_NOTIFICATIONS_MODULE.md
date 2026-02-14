# Module 10: Requests & Notifications Management

## Overview
Manages activity requests, approvals, and real-time notifications using WebSockets.

## Backend (NestJS)

### Directory Structure
```
src/modules/notifications/
├── dto/
│   ├── create-request.dto.ts
│   ├── approve-request.dto.ts
│   ├── notification.dto.ts
│   └── send-notification.dto.ts
├── entities/
│   ├── request.entity.ts
│   └── notification.entity.ts
├── templates/
│   ├── email-templates.ts
│   └── notification-templates.ts
├── notifications.gateway.ts
├── notifications.controller.ts
├── notifications.service.ts
├── requests.controller.ts
├── requests.service.ts
├── email.service.ts
└── notifications.module.ts
```

### Database Schema

#### Request
```typescript
Request {
  id: UUID (PK)
  activityId: UUID (FK to Activity, indexed)
  requestedBy: UUID (FK to User, indexed)
  requestType: enum (ACTIVITY_CREATION, PARTICIPANT_ADDITION, BUDGET_APPROVAL)
  status: enum (PENDING, APPROVED, REJECTED, CANCELLED)
  priority: enum (LOW, MEDIUM, HIGH, URGENT)
  title: string
  description: text
  justification: text
  requestedEmployees: UUID[] (nullable)
  estimatedBudget: number (nullable)
  notes: text (nullable)
  approvedBy: UUID (FK to User, nullable)
  approvedAt: DateTime (nullable)
  rejectionReason: text (nullable)
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Notification
```typescript
Notification {
  id: UUID (PK)
  userId: UUID (FK to User, indexed)
  type: enum (INVITATION, REMINDER, APPROVAL, UPDATE, ALERT, MESSAGE)
  category: enum (ACTIVITY, EVALUATION, SKILL, SYSTEM)
  title: string
  message: text
  link: string (nullable)
  metadata: JSON (nullable)
  isRead: boolean (default: false)
  readAt: DateTime (nullable)
  priority: enum (LOW, NORMAL, HIGH)
  expiresAt: DateTime (nullable)
  createdAt: DateTime
}
```

### WebSocket Gateway

```typescript
// notifications.gateway.ts
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications'
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;
  
  private userSockets = new Map<string, string>(); // userId -> socketId
  
  @SubscribeMessage('register')
  handleRegister(client: Socket, userId: string) {
    this.userSockets.set(userId, client.id);
    client.join(`user:${userId}`);
  }
  
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(client: Socket, notificationId: string) {
    await this.notificationsService.markAsRead(notificationId);
    return { success: true };
  }
  
  async sendToUser(userId: string, notification: Notification) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
  
  async sendToMultipleUsers(userIds: string[], notification: Notification) {
    for (const userId of userIds) {
      await this.sendToUser(userId, notification);
    }
  }
  
  async broadcast(notification: Notification) {
    this.server.emit('notification', notification);
  }
}
```

### Notification Service

```typescript
// notifications.service.ts
@Injectable()
export class NotificationsService {
  constructor(
    private readonly gateway: NotificationsGateway,
    private readonly emailService: EmailService
  ) {}
  
  async sendNotification(userId: string, notification: CreateNotificationDto) {
    // Save to database
    const saved = await this.notificationRepository.save({
      userId,
      ...notification
    });
    
    // Send via WebSocket
    await this.gateway.sendToUser(userId, saved);
    
    // Send email if high priority
    if (notification.priority === 'HIGH') {
      await this.emailService.sendNotificationEmail(userId, saved);
    }
    
    return saved;
  }
  
  async notifyActivityInvitation(activityId: string, employeeIds: string[]) {
    const activity = await this.activitiesService.findOne(activityId);
    
    for (const employeeId of employeeIds) {
      await this.sendNotification(employeeId, {
        type: 'INVITATION',
        category: 'ACTIVITY',
        title: `Invitation: ${activity.title}`,
        message: `You have been invited to participate in ${activity.title}`,
        link: `/activities/${activityId}`,
        priority: 'NORMAL'
      });
    }
  }
  
  async notifyRequestApproval(requestId: string) {
    const request = await this.requestsService.findOne(requestId);
    
    await this.sendNotification(request.requestedBy, {
      type: 'APPROVAL',
      category: 'ACTIVITY',
      title: 'Request Approved',
      message: `Your request "${request.title}" has been approved`,
      link: `/requests/${requestId}`,
      priority: 'HIGH'
    });
  }
  
  async sendReminders() {
    // Find activities starting soon
    const upcomingActivities = await this.activitiesService.findUpcoming(7);
    
    for (const activity of upcomingActivities) {
      const participants = await this.activityParticipantsService.find({
        activityId: activity.id,
        status: 'CONFIRMED'
      });
      
      for (const participant of participants) {
        await this.sendNotification(participant.employeeId, {
          type: 'REMINDER',
          category: 'ACTIVITY',
          title: `Reminder: ${activity.title}`,
          message: `${activity.title} starts in ${this.getDaysUntil(activity.startDate)} days`,
          link: `/activities/${activity.id}`,
          priority: 'NORMAL'
        });
      }
    }
  }
}
```

### Email Service

```typescript
// email.service.ts
@Injectable()
export class EmailService {
  constructor(private readonly mailer: MailerService) {}
  
  async sendNotificationEmail(userId: string, notification: Notification) {
    const user = await this.usersService.findOne(userId);
    
    await this.mailer.sendMail({
      to: user.email,
      subject: notification.title,
      template: 'notification',
      context: {
        userName: user.firstName,
        title: notification.title,
        message: notification.message,
        link: `${process.env.FRONTEND_URL}${notification.link}`,
        priority: notification.priority
      }
    });
  }
  
  async sendActivityInvitation(userId: string, activity: Activity) {
    const user = await this.usersService.findOne(userId);
    
    await this.mailer.sendMail({
      to: user.email,
      subject: `Invitation: ${activity.title}`,
      template: 'activity-invitation',
      context: {
        userName: user.firstName,
        activityTitle: activity.title,
        activityDescription: activity.description,
        startDate: activity.startDate,
        location: activity.location,
        acceptLink: `${process.env.FRONTEND_URL}/activities/${activity.id}/accept`,
        declineLink: `${process.env.FRONTEND_URL}/activities/${activity.id}/decline`
      }
    });
  }
}
```

### API Endpoints

#### Requests
- `POST /requests` - Create request
- `GET /requests` - List requests
- `GET /requests/:id` - Get request details
- `PATCH /requests/:id` - Update request
- `POST /requests/:id/approve` - Approve request
- `POST /requests/:id/reject` - Reject request
- `DELETE /requests/:id` - Cancel request

#### Notifications
- `GET /notifications` - Get user notifications
- `GET /notifications/unread` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `POST /notifications/test` - Send test notification

## Frontend (React)

### Directory Structure
```
src/modules/notifications/
├── components/
│   ├── NotificationBell.tsx
│   ├── NotificationList.tsx
│   ├── NotificationItem.tsx
│   ├── RequestForm.tsx
│   ├── RequestList.tsx
│   ├── RequestApproval.tsx
│   └── NotificationSettings.tsx
├── hooks/
│   ├── useWebSocket.ts
│   ├── useNotifications.ts
│   └── useRequests.ts
├── services/
│   ├── notificationService.ts
│   └── websocketService.ts
└── types/
    └── notification.types.ts
```

### WebSocket Hook

```typescript
// useWebSocket.ts
export const useWebSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (!user) return;
    
    const newSocket = io(`${API_URL}/notifications`, {
      auth: { token: getAccessToken() }
    });
    
    newSocket.on('connect', () => {
      newSocket.emit('register', user.id);
    });
    
    newSocket.on('notification', (notification: Notification) => {
      dispatch(addNotification(notification));
      
      // Show toast
      toast.info(notification.title, {
        description: notification.message
      });
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [user]);
  
  return socket;
};
```

### Key Components

#### NotificationBell.tsx
- Bell icon with badge
- Unread count
- Dropdown menu
- Real-time updates

#### NotificationList.tsx
- List of notifications
- Filter by type/category
- Mark as read
- Delete notifications
- Load more pagination

#### RequestForm.tsx
- Request type selector
- Activity selection
- Employee selection
- Justification text
- Priority selector

#### RequestApproval.tsx
- Request details
- Approve/reject buttons
- Rejection reason input
- Activity preview

## Integration Points
- Triggers on Activity invitations
- Triggers on Request status changes
- Triggers on Evaluation completion
- Triggers on Skill updates
- Email notifications for important events
