import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { User } from '../../wichtel/entities/user.entity';
import { Assignment } from '../../wichtel/entities/assignment.entity';
import { Settings } from '../../wichtel/entities/settings.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateSettingsDto } from '../dto/update-settings.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Assignment.name) private assignmentModel: Model<Assignment>,
    @InjectModel(Settings.name) private settingsModel: Model<Settings>,
  ) {}

  // User Management
  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userModel.findOne({ id }).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel({
      id: uuid(),
      ...createUserDto,
      participation: createUserDto.participation ?? false,
      exclusions: createUserDto.exclusions ?? [],
    });
    return newUser.save();
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findOne({ id }).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    Object.assign(user, updateUserDto);
    return user.save();
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Also remove any assignments involving this user
    await this.assignmentModel.deleteMany({
      $or: [{ donor: id }, { donee: id }],
    }).exec();

    // Remove this user from exclusions in other users
    await this.userModel.updateMany(
      { exclusions: id },
      { $pull: { exclusions: id } },
    ).exec();
  }

  // Settings Management
  async getSettings(): Promise<Settings> {
    const settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      throw new NotFoundException('Settings not found');
    }
    return settings;
  }

  async updateSettings(updateSettingsDto: UpdateSettingsDto): Promise<Settings> {
    const settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      throw new NotFoundException('Settings not found');
    }

    Object.assign(settings, updateSettingsDto);
    return settings.save();
  }

  // View Drawings
  async getAllAssignments(): Promise<Assignment[]> {
    return this.assignmentModel.find().exec();
  }

  async getAssignmentsWithDetails(): Promise<any[]> {
    const assignments = await this.assignmentModel.find().exec();
    const users = await this.userModel.find().exec();

    const userMap = new Map(users.map((u) => [u.id, u]));

    return assignments.map((assignment) => ({
      donor: {
        id: assignment.donor,
        firstName: userMap.get(assignment.donor)?.firstName,
        lastName: userMap.get(assignment.donor)?.lastName,
        email: userMap.get(assignment.donor)?.email,
      },
      donee: {
        id: assignment.donee,
        firstName: userMap.get(assignment.donee)?.firstName,
        lastName: userMap.get(assignment.donee)?.lastName,
        email: userMap.get(assignment.donee)?.email,
      },
    }));
  }

  async validatePasswordHash(passwordHash: string): Promise<boolean> {
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    return adminPasswordHash === passwordHash;
  }
}
