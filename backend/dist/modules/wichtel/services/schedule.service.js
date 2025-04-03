"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ScheduleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const schedule_1 = require("@nestjs/schedule");
const cron_1 = require("cron");
const settings_entity_1 = require("../entities/settings.entity");
const drawing_service_1 = require("./drawing.service");
let ScheduleService = ScheduleService_1 = class ScheduleService {
    constructor(settingsModel, drawingService, schedulerRegistry) {
        this.settingsModel = settingsModel;
        this.drawingService = drawingService;
        this.schedulerRegistry = schedulerRegistry;
        this.logger = new common_1.Logger(ScheduleService_1.name);
    }
    onModuleInit() {
        this.logScheduledDrawingTime();
        const job = new cron_1.CronJob('0 * * * * *', () => {
            this.checkDrawingTime().catch(error => {
                this.logger.error('Error in cron job', error.stack);
            });
        });
        this.schedulerRegistry.addCronJob('checkDrawingTime', job);
        job.start();
        this.logger.log('Drawing check scheduled for every minute');
    }
    async logScheduledDrawingTime() {
        try {
            const settings = await this.settingsModel.findOne({}, {
                drawing_time: 1,
                retry_sec: 1
            }).exec();
            if (!settings) {
                this.logger.warn('No settings document found in the database');
                return;
            }
            if (!settings.drawing_time) {
                this.logger.warn('Settings exist but drawing_time is not set');
                const currentYear = new Date().getFullYear();
                const newDrawingTime = new Date(`${currentYear}-12-24T10:00:00.000Z`);
                await this.settingsModel.updateOne({ _id: settings._id }, { $set: { drawing_time: newDrawingTime } }).exec();
                this.logger.log(`Automatically fixed drawing time to: ${this.formatDate(newDrawingTime)}`);
                return;
            }
            const drawingTime = new Date(settings.drawing_time);
            const now = new Date();
            const formattedDrawingTime = this.formatDate(drawingTime);
            const timeDiff = drawingTime.getTime() - now.getTime();
            if (timeDiff < 0) {
                this.logger.log(`Automatic drawing was scheduled for ${formattedDrawingTime}, which is in the past`);
            }
            else {
                const days = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
                const hours = Math.floor((timeDiff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                const minutes = Math.floor((timeDiff % (60 * 60 * 1000)) / (60 * 1000));
                this.logger.log(`Automatic drawing is scheduled for ${formattedDrawingTime}`);
                this.logger.log(`Time until drawing: ${days} days, ${hours} hours, ${minutes} minutes`);
            }
        }
        catch (error) {
            this.logger.error('Error checking drawing time', error.stack);
        }
    }
    formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
    async checkDrawingTime() {
        if (ScheduleService_1.cronJobRunning) {
            this.logger.debug('Another check is already running, skipping this execution');
            return;
        }
        ScheduleService_1.cronJobRunning = true;
        try {
            const settings = await this.settingsModel.findOne().exec();
            if (!settings || !settings.drawing_time) {
                this.logger.warn('No drawing time set in settings, skipping draw check');
                return;
            }
            const drawingTime = new Date(settings.drawing_time);
            const now = new Date();
            if (now.getMinutes() % 15 === 0) {
                await this.logScheduledDrawingTime();
            }
            const diffMs = now.getTime() - drawingTime.getTime();
            const diffMinutes = Math.floor(diffMs / (60 * 1000));
            if (diffMinutes >= -1) {
                this.logger.log('It is time for the automatic drawing!');
                this.logger.log(`Time difference is ${diffMinutes} minutes from scheduled time`);
                const success = await this.drawingService.drawAssignments();
                if (success) {
                    this.logger.log('Drawing completed successfully');
                    const nextYear = drawingTime.getFullYear() + 1;
                    const newDrawingTime = new Date(drawingTime);
                    newDrawingTime.setFullYear(nextYear);
                    await this.settingsModel.updateOne({}, { $set: { drawing_time: newDrawingTime } }).exec();
                    this.logger.log(`Updated drawing time to next year: ${this.formatDate(newDrawingTime)}`);
                }
                else {
                    this.logger.log('Drawing was not performed (it might have already been done)');
                }
            }
        }
        catch (error) {
            this.logger.error('Error in drawing scheduler', error.stack);
        }
        finally {
            ScheduleService_1.cronJobRunning = false;
        }
    }
};
exports.ScheduleService = ScheduleService;
ScheduleService.cronJobRunning = false;
exports.ScheduleService = ScheduleService = ScheduleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(settings_entity_1.Settings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        drawing_service_1.DrawingService,
        schedule_1.SchedulerRegistry])
], ScheduleService);
//# sourceMappingURL=schedule.service.js.map