import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.entity';
import { Assignment } from '../entities/assignment.entity';
import { PreAssignment } from '../entities/pre-assignment.entity';
import { RandomAssignmentService } from './random-assignment.service';
import { MailService } from '../../mail/services/mail.service';

@Injectable()
export class DrawingService {
  private readonly logger = new Logger(DrawingService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Assignment.name) private assignmentModel: Model<Assignment>,
    @InjectModel(PreAssignment.name) private preAssignmentModel: Model<PreAssignment>,
    private randomAssignmentService: RandomAssignmentService,
    private mailService: MailService,
  ) {}

  private async getPreAssignments(): Promise<[string, string][]> {
    try {
      const preAssignments = await this.preAssignmentModel.find().exec();
      return preAssignments.map(pa => [pa.donor, pa.donee]);
    } catch (error) {
      this.logger.error('An error occurred during pre-assignment processing', error.stack);
      return [];
    }
  }

  private async getConstraintIndices(userIds: string[]): Promise<[string, string][]> {
    const constraintUsers = await this.userModel.find({
      id: { $in: userIds },
      participation: true,
      exclusions: { $ne: null },
    }).select('id exclusions').exec();

    const constraintTuples = constraintUsers
      .filter(user => user.exclusions && user.exclusions.length > 0)
      .flatMap(user => 
        user.exclusions.map(exclusion => [user.id, exclusion] as [string, string])
      );

    return constraintTuples;
  }

  // Add a lock mechanism to prevent concurrent drawings
  private static drawingInProgress = false;
  
  async drawAssignments(): Promise<boolean> {
    // Check if a drawing is already in progress
    if (DrawingService.drawingInProgress) {
      this.logger.warn('Drawing already in progress, skipping duplicate request');
      return false;
    }
    
    // Check if assignments already exist
    const existingAssignments = await this.assignmentModel.countDocuments().exec();
    if (existingAssignments > 0) {
      this.logger.warn(`Assignments already exist (${existingAssignments} found). Not running drawing again.`);
      return false;
    }
    
    try {
      // Set lock
      DrawingService.drawingInProgress = true;
      this.logger.log('Starting drawing process with lock acquired');
      
      // Clear previous assignments (should be empty, but just to be safe)
      await this.assignmentModel.deleteMany({}).exec();
  
      // Get participating users
      const users = await this.userModel.find(
        { participation: true },
        { id: 1, firstName: 1 }
      ).exec();
      
      const participants = Object.fromEntries(
        users.map(user => [user.id, user])
      );
      
      const userIds = Object.keys(participants);
      
      if (userIds.length === 0) {
        this.logger.warn('No participants found, skipping drawing');
        return false;
      }
  
      // Get pre-assignments and constraints
      const preAssignments = await this.getPreAssignments();
      const constraints = await this.getConstraintIndices(userIds);
  
      // Perform the drawing
      this.logger.log(`Running drawing for ${userIds.length} participants`);
      const assignments = this.randomAssignmentService.draw(
        userIds,
        constraints,
        preAssignments
      );
  
      if (!assignments) {
        this.logger.error('Drawing failed, no valid assignments found');
        return false;
      }
  
      // Save assignments and send emails
      this.logger.log(`Drawing successful, creating ${Object.keys(assignments).length} assignments`);
      for (const [donor, donee] of Object.entries(assignments)) {
        await this.assignmentModel.create({ donor, donee });
        
        this.logger.log(
          `Assignment: ${participants[donor].firstName} -> ${participants[donee].firstName}`
        );
        
        // Send assignment email
        await this.mailService.sendAssignment(donor, donee);
      }
      
      this.logger.log('Drawing process completed successfully');
      return true;
    } catch (error) {
      this.logger.error('Error during drawing process', error.stack);
      return false;
    } finally {
      DrawingService.drawingInProgress = false;
    }
  }
}