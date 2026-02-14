# MongoDB Setup Guide

## Installation

### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

### Ubuntu/Debian
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Windows
Download and install from: https://www.mongodb.com/try/download/community

### Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:6
```

## Configuration

### Connection String
```
mongodb://localhost:27017/hr_skills_db
```

### With Authentication
```
mongodb://username:password@localhost:27017/hr_skills_db?authSource=admin
```

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster.mongodb.net/hr_skills_db?retryWrites=true&w=majority
```

## NestJS Integration

### Install Dependencies
```bash
npm install @nestjs/mongoose mongoose
npm install -D @types/mongoose
```

### App Module Configuration
```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

### Schema Definition Example
```typescript
// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ type: String, enum: ['HR', 'MANAGER', 'EMPLOYEE'], required: true })
  role: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes
UserSchema.index({ email: 1 });
```

### Module Registration
```typescript
// users.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### Service Implementation
```typescript
// users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
```

## Common Operations

### Populate (Join)
```typescript
// Get employee with user details
const employee = await this.employeeModel
  .findById(id)
  .populate('userId')
  .exec();

// Multiple populates
const employee = await this.employeeModel
  .findById(id)
  .populate('userId')
  .populate('managerId')
  .exec();
```

### Aggregation
```typescript
// Skill coverage by department
const coverage = await this.employeeModel.aggregate([
  {
    $lookup: {
      from: 'employeeskills',
      localField: '_id',
      foreignField: 'employeeId',
      as: 'skills'
    }
  },
  {
    $group: {
      _id: '$department',
      totalEmployees: { $sum: 1 },
      avgSkillCount: { $avg: { $size: '$skills' } }
    }
  },
  {
    $sort: { totalEmployees: -1 }
  }
]);
```

### Transactions
```typescript
async updateEmployeeSkill(employeeId: string, skillData: any) {
  const session = await this.connection.startSession();
  session.startTransaction();

  try {
    // Update employee skill
    const employeeSkill = await this.employeeSkillModel
      .findOneAndUpdate(
        { employeeId, skillId: skillData.skillId },
        { $set: skillData },
        { new: true, session }
      );

    // Create evolution record
    await this.skillEvolutionModel.create([{
      employeeSkillId: employeeSkill._id,
      previousLevel: skillData.previousLevel,
      newLevel: skillData.newLevel,
      changedAt: new Date()
    }], { session });

    await session.commitTransaction();
    return employeeSkill;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### Text Search
```typescript
// Create text index first
UserSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

// Search
const users = await this.userModel
  .find({ $text: { $search: 'john' } })
  .exec();
```

### Pagination
```typescript
async findAll(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    this.userModel
      .find()
      .skip(skip)
      .limit(limit)
      .exec(),
    this.userModel.countDocuments()
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

## Database Seeding

### Seed Script
```typescript
// seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const usersService = app.get(UsersService);
  
  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  await usersService.create({
    email: 'admin@example.com',
    password: hashedPassword,
    firstName: 'Admin',
    lastName: 'User',
    role: 'HR',
    isActive: true,
    emailVerified: true
  });

  console.log('Database seeded successfully');
  await app.close();
}

bootstrap();
```

### Run Seed
```bash
npm run seed
```

## Backup & Restore

### Backup
```bash
# Backup entire database
mongodump --uri="mongodb://localhost:27017/hr_skills_db" --out=/backup/

# Backup specific collection
mongodump --uri="mongodb://localhost:27017/hr_skills_db" --collection=users --out=/backup/
```

### Restore
```bash
# Restore entire database
mongorestore --uri="mongodb://localhost:27017/hr_skills_db" /backup/hr_skills_db/

# Restore specific collection
mongorestore --uri="mongodb://localhost:27017/hr_skills_db" --collection=users /backup/hr_skills_db/users.bson
```

## Performance Optimization

### Indexes
```typescript
// Compound index
EmployeeSchema.index({ department: 1, status: 1 });

// Text index
SkillSchema.index({ name: 'text', description: 'text' });

// Unique index
UserSchema.index({ email: 1 }, { unique: true });

// TTL index (auto-delete after time)
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
```

### Query Optimization
```typescript
// Use lean() for read-only queries (faster)
const users = await this.userModel.find().lean().exec();

// Select specific fields
const users = await this.userModel
  .find()
  .select('firstName lastName email')
  .exec();

// Use explain() to analyze queries
const explain = await this.userModel
  .find({ department: 'IT' })
  .explain('executionStats');
```

## Monitoring

### MongoDB Compass
GUI tool for MongoDB: https://www.mongodb.com/products/compass

### Mongoose Debug Mode
```typescript
// Enable in development
mongoose.set('debug', true);
```

### Connection Events
```typescript
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
```

## Production Considerations

### Connection Pooling
```typescript
MongooseModule.forRoot(uri, {
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
})
```

### Replica Set (High Availability)
```
mongodb://host1:27017,host2:27017,host3:27017/hr_skills_db?replicaSet=rs0
```

### MongoDB Atlas (Managed Service)
- Automatic backups
- Monitoring and alerts
- Scaling
- Security features

## Troubleshooting

### Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongosh mongodb://localhost:27017/hr_skills_db
```

### Performance Issues
```bash
# Check current operations
db.currentOp()

# Kill slow operation
db.killOp(opId)

# Check index usage
db.collection.getIndexes()
```

### Disk Space
```bash
# Check database size
db.stats()

# Compact collection
db.collection.compact()
```
