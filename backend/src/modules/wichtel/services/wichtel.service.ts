import { Injectable, NotFoundException, Logger, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.entity';
import { Assignment } from '../entities/assignment.entity';
import { Settings } from '../entities/settings.entity';
import { ParticipantDetailsDto } from '../dto/participant-details.dto';
import { ParticipationDto, ParticipationResponseDto } from '../dto/participation.dto';
import { SettingsDto } from '../dto/settings.dto';
import { MailService } from '../../mail/services/mail.service';

@Injectable()
export class WichtelService {
  private readonly logger = new Logger(WichtelService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Assignment.name) private assignmentModel: Model<Assignment>,
    @InjectModel(Settings.name) private settingsModel: Model<Settings>,
    private mailService: MailService,
  ) {}

  async getSettings(): Promise<SettingsDto> {
    const settings = await this.settingsModel.findOne({}, {
      retry_sec: 1,
      drawing_time: 1,
      assignment_hint: 1
    }).exec();
    
    if (!settings) {
      throw new NotFoundException('Settings not found');
    }
    
    const response: SettingsDto = {
      retrySec: settings.retry_sec,
      drawingTime: settings.drawing_time,
    };
  
  
    if (settings.assignment_hint) {
      response.assignmentHint = settings.assignment_hint;  
    } 
    
    return response;
  }

  async getParticipantDetails(participantId: string): Promise<ParticipantDetailsDto> {
    const user = await this.userModel.findOne(
      { id: participantId },
      { firstName: 1, lastName: 1 }
    ).exec();
    
    if (!user) {
      throw new NotFoundException('Participant not found');
    }
    
    return {
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async getDrawResult(participantId: string): Promise<ParticipantDetailsDto> {
    const assignment = await this.assignmentModel.findOne(
      { donor: participantId }
    ).exec();
    
    if (!assignment) {
      throw new NotFoundException('No assignment found for participant');
    }
    
    const donee = await this.userModel.findOne(
      { id: assignment.donee },
      { firstName: 1, lastName: 1 }
    ).exec();
    
    if (!donee) {
      throw new NotFoundException('Assigned recipient not found');
    }
    
    return {
      firstName: donee.firstName,
      lastName: donee.lastName,
    };
  }

  async getParticipation(participantId: string): Promise<ParticipationResponseDto> {
    const user = await this.userModel.findOne(
      { id: participantId },
      { participation: 1, lastModified: 1 }
    ).exec();
    
    if (!user) {
      throw new NotFoundException('Participant not found');
    }
    
    return {
      participating: user.participation,
      modified: !!user.lastModified,
    };
  }

  async updateParticipation(
    participantId: string,
    participationDto: ParticipationDto
  ): Promise<void> {
    const user = await this.userModel.findOne(
      { id: participantId },
      { participation: 1, lastModified: 1 }
    ).exec();
    
    if (!user) {
      throw new NotFoundException('Participant not found');
    }
    
    // Check for rate limiting (prevent updates within 5 seconds)
    if (
      user.lastModified &&
      Date.now() - user.lastModified.getTime() <= 5000
    ) {
      throw new HttpException('Too many requests, please wait before updating again', HttpStatus.TOO_MANY_REQUESTS);
    }
    
    const statusChanged = user.participation !== participationDto.participating;    
    this.logger.log(`Updating participation for user ${participantId}: ${user.participation} -> ${participationDto.participating}, changed: ${statusChanged}`);
    
    await this.userModel.updateOne(
      { id: participantId },
      { 
        $set: { participation: participationDto.participating },
        $currentDate: { lastModified: true }
      }
    ).exec();
    
    if (statusChanged) {
      this.logger.log(`Sending status update email to user ${participantId} (status changed)`);
      await this.mailService.sendUpdate(
        participantId,
        participationDto.participating
      );
    } else {
      this.logger.log(`Not sending email to user ${participantId} (status unchanged)`);
    }
  }
}