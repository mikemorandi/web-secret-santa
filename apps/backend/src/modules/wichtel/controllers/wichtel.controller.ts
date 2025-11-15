import { Controller, Get, Put, Post, Param, Body, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { WichtelService } from '../services/wichtel.service';
import { DrawingService } from '../services/drawing.service';
import { ScheduleService } from '../services/schedule.service';
import { ParticipantDetailsDto } from '../dto/participant-details.dto';
import { ParticipationDto, ParticipationResponseDto } from '../dto/participation.dto';
import { SettingsDto } from '../dto/settings.dto';

@ApiTags('secret-santa')
@Controller()
export class WichtelController {
  constructor(
    private readonly wichtelService: WichtelService,
    private readonly drawingService: DrawingService,
    private readonly scheduleService: ScheduleService,
  ) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get application settings' })
  @ApiResponse({ status: 200, description: 'OK', type: SettingsDto })
  async getSettings(): Promise<SettingsDto> {
    const settings = await this.wichtelService.getSettings();
    return settings;
  }

  @Get('assignments/:participantId')
  @ApiOperation({ summary: 'Returns the assignments of the participant' })
  @ApiParam({ name: 'participantId', description: 'ID of participant', type: String })
  @ApiResponse({ status: 200, description: 'Participant status', type: ParticipantDetailsDto })
  @ApiResponse({ status: 404, description: 'No assignments for participant' })
  async getDrawResult(@Param('participantId') participantId: string): Promise<ParticipantDetailsDto> {
    try {
      return await this.wichtelService.getDrawResult(participantId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('No assignments for participant');
    }
  }

  @Get('participations/:participantId')
  @ApiOperation({ summary: 'Returns the participation status' })
  @ApiParam({ name: 'participantId', description: 'ID of participant', type: String })
  @ApiResponse({ status: 200, description: 'Participant status', type: ParticipationResponseDto })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  async getParticipation(@Param('participantId') participantId: string): Promise<ParticipationResponseDto> {
    return this.wichtelService.getParticipation(participantId);
  }

  @Put('participations/:participantId')
  @ApiOperation({ summary: 'Update a participation' })
  @ApiParam({ name: 'participantId', description: 'ID of participant', type: String })
  @ApiResponse({ status: 204, description: 'Participant updated' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateParticipation(
    @Param('participantId') participantId: string,
    @Body() participationDto: ParticipationDto,
  ): Promise<void> {
    await this.wichtelService.updateParticipation(participantId, participationDto);
  }

  @Get('users/:participantId')
  @ApiOperation({ summary: 'Returns the participant details' })
  @ApiParam({ name: 'participantId', description: 'ID of participant', type: String })
  @ApiResponse({ status: 200, description: 'Participant status', type: ParticipantDetailsDto })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  async getParticipantDetails(@Param('participantId') participantId: string): Promise<ParticipantDetailsDto> {
    return this.wichtelService.getParticipantDetails(participantId);
  }
  
  @Post('drawings/run')
  @ApiOperation({ summary: 'Manually trigger the drawing process' })
  @ApiResponse({ status: 200, description: 'Drawing completed successfully' })
  @ApiResponse({ status: 400, description: 'Drawing already exists or already in progress' })
  @ApiResponse({ status: 500, description: 'Drawing failed' })
  async runDrawing(): Promise<{ message: string; success: boolean }> {
    const success = await this.drawingService.drawAssignments();
    
    if (success) {
      return { 
        message: 'Drawing completed successfully',
        success: true
      };
    } else {
      return { 
        message: 'Drawing could not be performed. Assignments may already exist or another drawing is in progress.',
        success: false 
      };
    }
  }
  
  @Get('drawings/nextTime')
  @ApiOperation({ summary: 'Get information about the next scheduled drawing' })
  @ApiResponse({ status: 200, description: 'Drawing time information' })
  async getNextDrawingTime(): Promise<{ 
    drawingTime: string; 
    iso8601: string;
    countdown: {
      days: number;
      hours: number;
      minutes: number;
    }
  }> {
    const settings = await this.wichtelService.getSettings();
    const drawingTime = new Date(settings.drawingTime);
    const now = new Date();
    
    // Calculate time difference
    const timeDiff = drawingTime.getTime() - now.getTime();
    const days = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeDiff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((timeDiff % (60 * 60 * 1000)) / (60 * 1000));
    
    return {
      drawingTime: this.formatDate(drawingTime),
      iso8601: drawingTime.toISOString(),
      countdown: {
        days,
        hours,
        minutes
      }
    };
  }
  
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }
}