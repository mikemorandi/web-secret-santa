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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const nodemailer = require("nodemailer");
const pug = require("pug");
const path = require("path");
const user_entity_1 = require("../../wichtel/entities/user.entity");
const settings_entity_1 = require("../../wichtel/entities/settings.entity");
let MailService = MailService_1 = class MailService {
    constructor(configService, userModel, settingsModel) {
        this.configService = configService;
        this.userModel = userModel;
        this.settingsModel = settingsModel;
        this.logger = new common_1.Logger(MailService_1.name);
        this.initializeTransporter();
    }
    initializeTransporter() {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('MAIL_HOST'),
            port: this.configService.get('MAIL_PORT'),
            secure: false,
            auth: {
                user: this.configService.get('MAIL_USER'),
                pass: this.configService.get('MAIL_PASSWORD'),
            },
        });
    }
    getRecipientAddress(email) {
        const debugMailAddress = this.configService.get('MAIL_DEBUG_MAIL_ADDRESS');
        return debugMailAddress || email;
    }
    formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
    async sendUpdate(participantId, participating) {
        try {
            const user = await this.userModel.findOne({ id: participantId }, { firstName: 1, email: 1 }).exec();
            const settings = await this.settingsModel.findOne().exec();
            if (!user || !settings) {
                this.logger.error(`Query for participant ${participantId} failed`);
                return;
            }
            const subject = participating
                ? 'Du nimmst beim Wichteln teil'
                : 'Du nimmst beim Wichteln nicht teil';
            const recipient = this.getRecipientAddress(user.email);
            const templatePath = path.resolve(process.cwd(), process.env.NODE_ENV === 'production' ? 'dist' : 'src', 'modules/mail/templates/update_mail.pug');
            this.logger.log(`Using template path: ${templatePath}`);
            const html = pug.renderFile(templatePath, {
                firstName: user.firstName,
                participating,
                registerLink: `${this.configService.get('PUBLIC_BASE_URL')}#/register/${participantId}`,
                drawTime: this.formatDate(settings.drawing_time),
            });
            await this.transporter.sendMail({
                from: this.configService.get('MAIL_FROM'),
                to: recipient,
                subject,
                text: subject,
                html,
            });
            this.logger.log(`Sent participation update mail to: ${recipient}, uuid=${participantId}`);
        }
        catch (error) {
            this.logger.error(`Could not send participation update mail to participant ${participantId}`, error.stack);
        }
    }
    async sendAssignment(donorId, doneeId) {
        try {
            const donor = await this.userModel.findOne({ id: donorId }, { firstName: 1, email: 1 }).exec();
            const donee = await this.userModel.findOne({ id: doneeId }, { firstName: 1 }).exec();
            const settings = await this.settingsModel.findOne({}, {
                retry_sec: 1,
                drawing_time: 1,
                assignment_hint: 1
            }).exec();
            if (!donor || !donee || !settings) {
                this.logger.error(`Query for donor ${donorId} or donee ${doneeId} failed or settings not found`);
                return;
            }
            const subject = 'Wichtel Auslosung';
            const recipient = this.getRecipientAddress(donor.email);
            const templatePath = path.resolve(process.cwd(), process.env.NODE_ENV === 'production' ? 'dist' : 'src', 'modules/mail/templates/assignment_mail.pug');
            this.logger.log(`Using template path: ${templatePath}`);
            const templateVars = {
                firstName: donor.firstName,
                doneeName: donee.firstName,
            };
            if (settings.assignment_hint) {
                templateVars['assignmentHint'] = settings.assignment_hint;
            }
            const html = pug.renderFile(templatePath, templateVars);
            await this.transporter.sendMail({
                from: this.configService.get('MAIL_FROM'),
                to: recipient,
                subject,
                text: `Für dich wurde ${donee.firstName} ausgelost`,
                html,
            });
            this.logger.log(`Sent assignment mail to: ${recipient}, uuid=${donorId}`);
        }
        catch (error) {
            this.logger.error(`Could not send assignment mail to donor ${donorId}`, error.stack);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(settings_entity_1.Settings.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mongoose_2.Model,
        mongoose_2.Model])
], MailService);
//# sourceMappingURL=mail.service.js.map