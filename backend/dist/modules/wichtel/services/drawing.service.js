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
var DrawingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_entity_1 = require("../entities/user.entity");
const assignment_entity_1 = require("../entities/assignment.entity");
const pre_assignment_entity_1 = require("../entities/pre-assignment.entity");
const random_assignment_service_1 = require("./random-assignment.service");
const mail_service_1 = require("../../mail/services/mail.service");
let DrawingService = DrawingService_1 = class DrawingService {
    constructor(userModel, assignmentModel, preAssignmentModel, randomAssignmentService, mailService) {
        this.userModel = userModel;
        this.assignmentModel = assignmentModel;
        this.preAssignmentModel = preAssignmentModel;
        this.randomAssignmentService = randomAssignmentService;
        this.mailService = mailService;
        this.logger = new common_1.Logger(DrawingService_1.name);
    }
    async getPreAssignments() {
        try {
            const preAssignments = await this.preAssignmentModel.find().exec();
            return preAssignments.map(pa => [pa.donor, pa.donee]);
        }
        catch (error) {
            this.logger.error('An error occurred during pre-assignment processing', error.stack);
            return [];
        }
    }
    async getConstraintIndices(userIds) {
        const constraintUsers = await this.userModel.find({
            id: { $in: userIds },
            participation: true,
            exclusions: { $ne: null },
        }).select('id exclusions').exec();
        const constraintTuples = constraintUsers
            .filter(user => user.exclusions && user.exclusions.length > 0)
            .flatMap(user => user.exclusions.map(exclusion => [user.id, exclusion]));
        return constraintTuples;
    }
    async drawAssignments() {
        if (DrawingService_1.drawingInProgress) {
            this.logger.warn('Drawing already in progress, skipping duplicate request');
            return false;
        }
        const existingAssignments = await this.assignmentModel.countDocuments().exec();
        if (existingAssignments > 0) {
            this.logger.warn(`Assignments already exist (${existingAssignments} found). Not running drawing again.`);
            return false;
        }
        try {
            DrawingService_1.drawingInProgress = true;
            this.logger.log('Starting drawing process with lock acquired');
            await this.assignmentModel.deleteMany({}).exec();
            const users = await this.userModel.find({ participation: true }, { id: 1, firstName: 1 }).exec();
            const participants = Object.fromEntries(users.map(user => [user.id, user]));
            const userIds = Object.keys(participants);
            if (userIds.length === 0) {
                this.logger.warn('No participants found, skipping drawing');
                return false;
            }
            const preAssignments = await this.getPreAssignments();
            const constraints = await this.getConstraintIndices(userIds);
            this.logger.log(`Running drawing for ${userIds.length} participants`);
            const assignments = this.randomAssignmentService.draw(userIds, constraints, preAssignments);
            if (!assignments) {
                this.logger.error('Drawing failed, no valid assignments found');
                return false;
            }
            this.logger.log(`Drawing successful, creating ${Object.keys(assignments).length} assignments`);
            for (const [donor, donee] of Object.entries(assignments)) {
                await this.assignmentModel.create({ donor, donee });
                this.logger.log(`Assignment: ${participants[donor].firstName} -> ${participants[donee].firstName}`);
                await this.mailService.sendAssignment(donor, donee);
            }
            this.logger.log('Drawing process completed successfully');
            return true;
        }
        catch (error) {
            this.logger.error('Error during drawing process', error.stack);
            return false;
        }
        finally {
            DrawingService_1.drawingInProgress = false;
        }
    }
};
exports.DrawingService = DrawingService;
DrawingService.drawingInProgress = false;
exports.DrawingService = DrawingService = DrawingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(assignment_entity_1.Assignment.name)),
    __param(2, (0, mongoose_1.InjectModel)(pre_assignment_entity_1.PreAssignment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        random_assignment_service_1.RandomAssignmentService,
        mail_service_1.MailService])
], DrawingService);
//# sourceMappingURL=drawing.service.js.map