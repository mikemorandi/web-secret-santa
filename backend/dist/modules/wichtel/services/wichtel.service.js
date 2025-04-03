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
var WichtelService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WichtelService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_entity_1 = require("../entities/user.entity");
const assignment_entity_1 = require("../entities/assignment.entity");
const settings_entity_1 = require("../entities/settings.entity");
const mail_service_1 = require("../../mail/services/mail.service");
let WichtelService = WichtelService_1 = class WichtelService {
    constructor(userModel, assignmentModel, settingsModel, mailService) {
        this.userModel = userModel;
        this.assignmentModel = assignmentModel;
        this.settingsModel = settingsModel;
        this.mailService = mailService;
        this.logger = new common_1.Logger(WichtelService_1.name);
    }
    async getSettings() {
        const settings = await this.settingsModel.findOne({}, {
            retry_sec: 1,
            drawing_time: 1,
            assignment_hint: 1
        }).exec();
        if (!settings) {
            throw new common_1.NotFoundException('Settings not found');
        }
        const response = {
            retrySec: settings.retry_sec,
            drawingTime: settings.drawing_time,
        };
        if (settings.assignment_hint) {
            response.assignmentHint = settings.assignment_hint;
        }
        return response;
    }
    async getParticipantDetails(participantId) {
        const user = await this.userModel.findOne({ id: participantId }, { firstName: 1, lastName: 1 }).exec();
        if (!user) {
            throw new common_1.NotFoundException('Participant not found');
        }
        return {
            firstName: user.firstName,
            lastName: user.lastName,
        };
    }
    async getDrawResult(participantId) {
        const assignment = await this.assignmentModel.findOne({ donor: participantId }).exec();
        if (!assignment) {
            throw new common_1.NotFoundException('No assignment found for participant');
        }
        const donee = await this.userModel.findOne({ id: assignment.donee }, { firstName: 1, lastName: 1 }).exec();
        if (!donee) {
            throw new common_1.NotFoundException('Assigned recipient not found');
        }
        return {
            firstName: donee.firstName,
            lastName: donee.lastName,
        };
    }
    async getParticipation(participantId) {
        const user = await this.userModel.findOne({ id: participantId }, { participation: 1, lastModified: 1 }).exec();
        if (!user) {
            throw new common_1.NotFoundException('Participant not found');
        }
        return {
            participating: user.participation,
            modified: !!user.lastModified,
        };
    }
    async updateParticipation(participantId, participationDto) {
        const user = await this.userModel.findOne({ id: participantId }, { participation: 1, lastModified: 1 }).exec();
        if (!user) {
            throw new common_1.NotFoundException('Participant not found');
        }
        if (user.lastModified &&
            Date.now() - user.lastModified.getTime() <= 5000) {
            throw new common_1.BadRequestException('Too many requests, please wait before updating again');
        }
        const statusChanged = user.participation !== participationDto.participating;
        this.logger.log(`Updating participation for user ${participantId}: ${user.participation} -> ${participationDto.participating}, changed: ${statusChanged}`);
        await this.userModel.updateOne({ id: participantId }, {
            $set: { participation: participationDto.participating },
            $currentDate: { lastModified: true }
        }).exec();
        if (statusChanged) {
            this.logger.log(`Sending status update email to user ${participantId} (status changed)`);
            await this.mailService.sendUpdate(participantId, participationDto.participating);
        }
        else {
            this.logger.log(`Not sending email to user ${participantId} (status unchanged)`);
        }
    }
};
exports.WichtelService = WichtelService;
exports.WichtelService = WichtelService = WichtelService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(assignment_entity_1.Assignment.name)),
    __param(2, (0, mongoose_1.InjectModel)(settings_entity_1.Settings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mail_service_1.MailService])
], WichtelService);
//# sourceMappingURL=wichtel.service.js.map