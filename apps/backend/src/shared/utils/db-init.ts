import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from '../../modules/wichtel/entities/settings.entity';

@Injectable()
export class DatabaseInitService {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<Settings>,
  ) {}

  async initializeDatabase(): Promise<void> {
    await this.initializeSettings();
  }

  private async initializeSettings(): Promise<void> {
    try {
      // First check if settings exist
      const settings = await this.settingsModel.findOne().exec();
      
      if (!settings) {
        this.logger.log('Initializing settings collection');
        
        // Set default drawing time to Christmas Eve of current year
        const currentYear = new Date().getFullYear();
        const drawingTime = new Date(`${currentYear}-12-24T10:00:00.000Z`);
        
        // Format the date for logging
        const formattedDate = this.formatDate(drawingTime);
        
        // Create settings 
        const newSettings = await this.settingsModel.create({
          retry_sec: 5,
          drawing_time: drawingTime,
          assignment_hint: "Bitte denk daran, dass das Wichtelgeschenk nicht mehr als 50.- kosten sollte.",
        });
        
        this.logger.log(`Settings initialized successfully with drawing time: ${formattedDate}`);
        this.logger.log(`Created settings document with ID: ${newSettings._id}`);
      } else {
        // Check if drawing_time exists and is valid
        if (!settings.drawing_time || !(settings.drawing_time instanceof Date)) {
          this.logger.warn('Settings exist but drawing_time is missing or invalid, fixing it');
          
          // Set default drawing time to Christmas Eve of current year
          const currentYear = new Date().getFullYear();
          const drawingTime = new Date(`${currentYear}-12-24T10:00:00.000Z`);
          
          // Update the settings
          await this.settingsModel.updateOne(
            { _id: settings._id },
            { $set: { drawing_time: drawingTime } }
          ).exec();
          
          this.logger.log(`Drawing time updated to ${this.formatDate(drawingTime)}`);
        } else {
          this.logger.log(`Settings already exist with drawing time: ${this.formatDate(settings.drawing_time)}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error initializing settings: ${error.message}`, error.stack);
    }
  }
  
  private formatDate(date: Date): string {
    if (!date) return 'undefined';
    
    try {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}.${month}.${year} ${hours}:${minutes} (${date.toISOString()})`;
    } catch (error) {
      return `Error formatting date: ${error.message}`;
    }
  }
}