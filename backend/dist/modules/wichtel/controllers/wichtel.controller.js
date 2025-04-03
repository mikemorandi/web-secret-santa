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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WichtelController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const wichtel_service_1 = require("../services/wichtel.service");
const drawing_service_1 = require("../services/drawing.service");
const schedule_service_1 = require("../services/schedule.service");
const participant_details_dto_1 = require("../dto/participant-details.dto");
const participation_dto_1 = require("../dto/participation.dto");
const settings_dto_1 = require("../dto/settings.dto");
let WichtelController = class WichtelController {
    constructor(wichtelService, drawingService, scheduleService) {
        this.wichtelService = wichtelService;
        this.drawingService = drawingService;
        this.scheduleService = scheduleService;
    }
    async getSettings() {
        const settings = await this.wichtelService.getSettings();
        return settings;
    }
    async getDrawResult(participantId) {
        try {
            return await this.wichtelService.getDrawResult(participantId);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.NotFoundException('No assignments for participant');
        }
    }
    async getParticipation(participantId) {
        return this.wichtelService.getParticipation(participantId);
    }
    async updateParticipation(participantId, participationDto) {
        await this.wichtelService.updateParticipation(participantId, participationDto);
    }
    async getParticipantDetails(participantId) {
        return this.wichtelService.getParticipantDetails(participantId);
    }
    async runDrawing() {
        const success = await this.drawingService.drawAssignments();
        if (success) {
            return {
                message: 'Drawing completed successfully',
                success: true
            };
        }
        else {
            return {
                message: 'Drawing could not be performed. Assignments may already exist or another drawing is in progress.',
                success: false
            };
        }
    }
    async getNextDrawingTime() {
        const settings = await this.wichtelService.getSettings();
        const drawingTime = new Date(settings.drawingTime);
        const now = new Date();
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
    formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
};
exports.WichtelController = WichtelController;
__decorate([
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get application settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OK', type: settings_dto_1.SettingsDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WichtelController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Get)('assignments/:participantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Returns the assignments of the participant' }),
    (0, swagger_1.ApiParam)({ name: 'participantId', description: 'ID of participant', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Participant status', type: participant_details_dto_1.ParticipantDetailsDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No assignments for participant' }),
    __param(0, (0, common_1.Param)('participantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WichtelController.prototype, "getDrawResult", null);
__decorate([
    (0, common_1.Get)('participations/:participantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Returns the participation status' }),
    (0, swagger_1.ApiParam)({ name: 'participantId', description: 'ID of participant', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Participant status', type: participation_dto_1.ParticipationResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Participant not found' }),
    __param(0, (0, common_1.Param)('participantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WichtelController.prototype, "getParticipation", null);
__decorate([
    (0, common_1.Put)('participations/:participantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a participation' }),
    (0, swagger_1.ApiParam)({ name: 'participantId', description: 'ID of participant', type: String }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Participant updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Participant not found' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many requests' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('participantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, participation_dto_1.ParticipationDto]),
    __metadata("design:returntype", Promise)
], WichtelController.prototype, "updateParticipation", null);
__decorate([
    (0, common_1.Get)('users/:participantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Returns the participant details' }),
    (0, swagger_1.ApiParam)({ name: 'participantId', description: 'ID of participant', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Participant status', type: participant_details_dto_1.ParticipantDetailsDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Participant not found' }),
    __param(0, (0, common_1.Param)('participantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WichtelController.prototype, "getParticipantDetails", null);
__decorate([
    (0, common_1.Post)('drawings/run'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually trigger the drawing process' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Drawing completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Drawing already exists or already in progress' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Drawing failed' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WichtelController.prototype, "runDrawing", null);
__decorate([
    (0, common_1.Get)('drawings/nextTime'),
    (0, swagger_1.ApiOperation)({ summary: 'Get information about the next scheduled drawing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Drawing time information' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WichtelController.prototype, "getNextDrawingTime", null);
exports.WichtelController = WichtelController = __decorate([
    (0, swagger_1.ApiTags)('wichtel'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [wichtel_service_1.WichtelService,
        drawing_service_1.DrawingService,
        schedule_service_1.ScheduleService])
], WichtelController);
//# sourceMappingURL=wichtel.controller.js.map