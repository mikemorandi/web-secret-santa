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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const schedule_1 = require("@nestjs/schedule");
const wichtel_module_1 = require("./modules/wichtel/wichtel.module");
const mail_module_1 = require("./modules/mail/mail.module");
const db_init_1 = require("./shared/utils/db-init");
const settings_entity_1 = require("./modules/wichtel/entities/settings.entity");
let AppModule = class AppModule {
    constructor(databaseInitService) {
        this.databaseInitService = databaseInitService;
    }
    async onModuleInit() {
        await this.databaseInitService.initializeDatabase();
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    uri: configService.get('MONGODB_URI'),
                }),
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: settings_entity_1.Settings.name, schema: settings_entity_1.SettingsSchema },
            ]),
            schedule_1.ScheduleModule.forRoot(),
            wichtel_module_1.WichtelModule,
            mail_module_1.MailModule,
        ],
        providers: [db_init_1.DatabaseInitService],
    }),
    __metadata("design:paramtypes", [db_init_1.DatabaseInitService])
], AppModule);
//# sourceMappingURL=app.module.js.map