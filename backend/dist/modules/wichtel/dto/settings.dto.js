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
exports.SettingsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class SettingsDto {
}
exports.SettingsDto = SettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], SettingsDto.prototype, "retrySec", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-24T00:00:00Z' }),
    __metadata("design:type", Date)
], SettingsDto.prototype, "drawingTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Bitte denk daran, dass das Wichtelgeschenk nicht mehr als 50.- kosten sollte.',
        description: 'Optional hint text shown in assignment emails. Only included if set in the database.'
    }),
    __metadata("design:type", String)
], SettingsDto.prototype, "assignmentHint", void 0);
//# sourceMappingURL=settings.dto.js.map