import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Settings } from '../entities/settings.entity';
import { DrawingService } from './drawing.service';
import { TimezoneUtil } from '../../../shared/utils/timezone.util';

@Injectable()
export class ScheduleService implements OnModuleInit {
  private readonly logger = new Logger(ScheduleService.name);
  private static cronJobRunning = false;

  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<Settings>,
    private drawingService: DrawingService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * Create the cron job programmatically on module initialization
   */
  onModuleInit() {
    // Log the scheduled drawing time immediately
    this.logScheduledDrawingTime();

    // Create a cron job that runs every minute
    const job = new CronJob('0 * * * * *', () => {
      this.checkDrawingTime().catch(error => {
        this.logger.error('Error in cron job', error.stack);
      });
    });

    // Register the job with a unique name
    this.schedulerRegistry.addCronJob('checkDrawingTime', job);
    
    // Start the job
    job.start();
    
    this.logger.log('Drawing check scheduled for every minute');
  }

  /**
   * Log when the automatic drawing will take place
   */
  async logScheduledDrawingTime(): Promise<void> {
    try {
      // Fetch settings with explicit projection to ensure we get drawing_time and timezone
      const settings = await this.settingsModel.findOne({}, {
        drawing_time: 1,
        retry_sec: 1,
        timezone: 1
      }).exec();

      if (!settings) {
        this.logger.warn('No settings document found in the database');
        return;
      }

      if (!settings.drawing_time) {
        this.logger.warn('Settings exist but drawing_time is not set');

        // Try to fix it - set to December 1st at 12:00 (noon)
        const currentYear = new Date().getFullYear();
        const newDrawingTime = new Date(`${currentYear}-12-01T12:00:00.000Z`);

        await this.settingsModel.updateOne(
          { _id: settings._id },
          { $set: { drawing_time: newDrawingTime } }
        ).exec();

        this.logger.log(`Automatically fixed drawing time to: ${this.formatDate(newDrawingTime, settings.timezone)}`);
        return;
      }

      const drawingTime = new Date(settings.drawing_time);
      const now = new Date();
      const timezone = settings.timezone || 'UTC';

      // Format the drawing time in a readable format
      const formattedDrawingTime = this.formatDate(drawingTime, timezone);
      
      // Calculate time difference
      const timeDiff = drawingTime.getTime() - now.getTime();
      
      if (timeDiff < 0) {
        this.logger.log(`Automatic drawing was scheduled for ${formattedDrawingTime}, which is in the past`);
      } else {
        // Calculate days, hours, minutes
        const days = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
        const hours = Math.floor((timeDiff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((timeDiff % (60 * 60 * 1000)) / (60 * 1000));
        
        this.logger.log(`Automatic drawing is scheduled for ${formattedDrawingTime}`);
        this.logger.log(`Time until drawing: ${days} days, ${hours} hours, ${minutes} minutes`);
      }
    } catch (error) {
      this.logger.error('Error checking drawing time', error.stack);
    }
  }

  /**
   * Format a date in the configured timezone
   */
  private formatDate(date: Date, timezone: string = 'UTC'): string {
    return TimezoneUtil.formatDate(date, timezone);
  }

  /**
   * Called when drawing time is updated via admin panel
   * Logs the new scheduled time immediately
   */
  async onDrawingTimeUpdated(): Promise<void> {
    this.logger.log('Drawing time was updated, refreshing schedule information...');
    await this.logScheduledDrawingTime();
  }

  /**
   * Check if it's time for the drawing
   * This function is called by the cron job every minute
   */
  async checkDrawingTime(): Promise<void> {
    // Prevent multiple executions
    if (ScheduleService.cronJobRunning) {
      this.logger.debug('Another check is already running, skipping this execution');
      return;
    }
    
    // Set the flag to true to prevent concurrent executions
    ScheduleService.cronJobRunning = true;
    
    try {      
      const settings = await this.settingsModel.findOne().exec();
      
      if (!settings || !settings.drawing_time) {
        this.logger.warn('No drawing time set in settings, skipping draw check');
        return;
      }

      const drawingTime = new Date(settings.drawing_time);
      const now = new Date();
      
      // Log time until drawing (only every 15 minutes to avoid log spam)
      if (now.getMinutes() % 15 === 0) {
        await this.logScheduledDrawingTime();
      }
      
      // Calculate time difference in minutes for more precise comparison
      const diffMs = now.getTime() - drawingTime.getTime();
      const diffMinutes = Math.floor(diffMs / (60 * 1000));
      
      // Check if it's time to draw (now is after or equal to drawing time)
      // We allow a small window of +/- 1 minute to handle edge cases
      if (diffMinutes >= -1) {
        this.logger.log('It is time for the automatic drawing!');
        this.logger.log(`Time difference is ${diffMinutes} minutes from scheduled time`);
        
        // Check if assignments already exist
        const success = await this.drawingService.drawAssignments();
        
        if (success) {
          this.logger.log('Drawing completed successfully');

          // Update drawing time to December 1st of next year at 12:00 (noon)
          const nextYear = new Date().getFullYear() + 1;
          const newDrawingTime = new Date(`${nextYear}-12-01T12:00:00.000Z`);
          const timezone = settings.timezone || 'UTC';

          await this.settingsModel.updateOne(
            {},
            { $set: { drawing_time: newDrawingTime } }
          ).exec();

          this.logger.log(`Updated drawing time to next year: ${this.formatDate(newDrawingTime, timezone)}`);
        } else {
          this.logger.log('Drawing was not performed (it might have already been done)');
        }
      }
    } catch (error) {
      this.logger.error('Error in drawing scheduler', error.stack);
    } finally {
      // Release the lock so future executions can run
      ScheduleService.cronJobRunning = false;
    }
  }
}