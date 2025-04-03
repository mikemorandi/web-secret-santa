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
var DatabaseInitService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseInitService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const settings_entity_1 = require("../../modules/wichtel/entities/settings.entity");
let DatabaseInitService = DatabaseInitService_1 = class DatabaseInitService {
    constructor(settingsModel) {
        this.settingsModel = settingsModel;
        this.logger = new common_1.Logger(DatabaseInitService_1.name);
    }
    async initializeDatabase() {
        await this.initializeSettings();
    }
    async initializeSettings() {
        try {
            const settings = await this.settingsModel.findOne().exec();
            if (!settings) {
                this.logger.log('Initializing settings collection');
                const currentYear = new Date().getFullYear();
                const drawingTime = new Date(`${currentYear}-12-24T10:00:00.000Z`);
                const formattedDate = this.formatDate(drawingTime);
                const newSettings = await this.settingsModel.create({
                    retry_sec: 5,
                    drawing_time: drawingTime,
                    assignment_hint: "Bitte denk daran, dass das Wichtelgeschenk nicht mehr als 50.- kosten sollte.",
                });
                this.logger.log(`Settings initialized successfully with drawing time: ${formattedDate}`);
                this.logger.log(`Created settings document with ID: ${newSettings._id}`);
            }
            else {
                if (!settings.drawing_time || !(settings.drawing_time instanceof Date)) {
                    this.logger.warn('Settings exist but drawing_time is missing or invalid, fixing it');
                    const currentYear = new Date().getFullYear();
                    const drawingTime = new Date(`${currentYear}-12-24T10:00:00.000Z`);
                    await this.settingsModel.updateOne({ _id: settings._id }, { $set: { drawing_time: drawingTime } }).exec();
                    this.logger.log(`Drawing time updated to ${this.formatDate(drawingTime)}`);
                }
                else {
                    this.logger.log(`Settings already exist with drawing time: ${this.formatDate(settings.drawing_time)}`);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error initializing settings: ${error.message}`, error.stack);
        }
    }
    formatDate(date) {
        if (!date)
            return 'undefined';
        try {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${day}.${month}.${year} ${hours}:${minutes} (${date.toISOString()})`;
        }
        catch (error) {
            return `Error formatting date: ${error.message}`;
        }
    }
};
exports.DatabaseInitService = DatabaseInitService;
exports.DatabaseInitService = DatabaseInitService = DatabaseInitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(settings_entity_1.Settings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DatabaseInitService);
//# sourceMappingURL=db-init.js.map