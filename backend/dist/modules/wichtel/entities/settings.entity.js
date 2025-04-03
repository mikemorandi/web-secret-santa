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
exports.SettingsSchema = exports.Settings = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
let Settings = class Settings extends mongoose_2.Document {
};
exports.Settings = Settings;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Settings.prototype, "retry_sec", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-24T00:00:00Z' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Settings.prototype, "drawing_time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Bitte denk daran, dass das Wichtelgeschenk nicht mehr als 50.- kosten sollte.',
        description: 'Optional hint text shown in assignment emails. Can be null/undefined.'
    }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Settings.prototype, "assignment_hint", void 0);
exports.Settings = Settings = __decorate([
    (0, mongoose_1.Schema)()
], Settings);
exports.SettingsSchema = mongoose_1.SchemaFactory.createForClass(Settings);
//# sourceMappingURL=settings.entity.js.map