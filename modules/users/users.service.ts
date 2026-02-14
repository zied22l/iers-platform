import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      $or: [{ email: createUserDto.email }, { matricule: createUserDto.matricule }],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or matricule already exists');
    }

    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(currentUserId?: string, currentUserRole?: string): Promise<User[]> {
    // If no user context provided, return all users (for backward compatibility)
    if (!currentUserId || !currentUserRole) {
      return this.userModel.find().select('-password').exec();
    }

    // HR can see all users
    if (currentUserRole === 'HR') {
      return this.userModel.find().select('-password').exec();
    }

    // Manager can see employees and other managers (but not HR)
    if (currentUserRole === 'MANAGER') {
      return this.userModel
        .find()
        .where('role')
        .in(['EMPLOYEE', 'MANAGER'])
        .select('-password')
        .exec();
    }

    // Employee can only see their own profile
    if (currentUserRole === 'EMPLOYEE') {
      return this.userModel
        .findById(currentUserId)
        .select('-password')
        .exec()
        .then(user => user ? [user] : []);
    }

    return [];
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByMatricule(matricule: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ matricule }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async remove(id: string): Promise<User> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateRole(id: string, role: string): Promise<User> {
    return this.update(id, { role } as UpdateUserDto);
  }

  async toggleActive(id: string, isActive: boolean): Promise<User> {
    return this.update(id, { isActive });
  }
}
