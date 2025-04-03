import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Settings } from '../entities/settings.entity';
import { DrawingService } from './drawing.service';
export declare class ScheduleService implements OnModuleInit {
    private settingsModel;
    private drawingService;
    private schedulerRegistry;
    private readonly logger;
    private static cronJobRunning;
    constructor(settingsModel: Model<Settings>, drawingService: DrawingService, schedulerRegistry: SchedulerRegistry);
    onModuleInit(): void;
    logScheduledDrawingTime(): Promise<void>;
    private formatDate;
    checkDrawingTime(): Promise<void>;
}
