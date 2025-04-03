"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WichtelModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const schedule_1 = require("@nestjs/schedule");
const wichtel_controller_1 = require("./controllers/wichtel.controller");
const wichtel_service_1 = require("./services/wichtel.service");
const drawing_service_1 = require("./services/drawing.service");
const random_assignment_service_1 = require("./services/random-assignment.service");
const schedule_service_1 = require("./services/schedule.service");
const user_entity_1 = require("./entities/user.entity");
const assignment_entity_1 = require("./entities/assignment.entity");
const pre_assignment_entity_1 = require("./entities/pre-assignment.entity");
const settings_entity_1 = require("./entities/settings.entity");
const mail_module_1 = require("../mail/mail.module");
let WichtelModule = class WichtelModule {
};
exports.WichtelModule = WichtelModule;
exports.WichtelModule = WichtelModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_entity_1.User.name, schema: user_entity_1.UserSchema },
                { name: assignment_entity_1.Assignment.name, schema: assignment_entity_1.AssignmentSchema },
                { name: pre_assignment_entity_1.PreAssignment.name, schema: pre_assignment_entity_1.PreAssignmentSchema },
                { name: settings_entity_1.Settings.name, schema: settings_entity_1.SettingsSchema },
            ]),
            schedule_1.ScheduleModule.forRoot(),
            mail_module_1.MailModule,
        ],
        controllers: [wichtel_controller_1.WichtelController],
        providers: [
            wichtel_service_1.WichtelService,
            drawing_service_1.DrawingService,
            random_assignment_service_1.RandomAssignmentService,
            schedule_service_1.ScheduleService,
        ],
        exports: [
            wichtel_service_1.WichtelService,
            drawing_service_1.DrawingService,
            random_assignment_service_1.RandomAssignmentService,
            schedule_service_1.ScheduleService,
        ],
    })
], WichtelModule);
//# sourceMappingURL=wichtel.module.js.map