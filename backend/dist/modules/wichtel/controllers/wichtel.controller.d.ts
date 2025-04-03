import { WichtelService } from '../services/wichtel.service';
import { DrawingService } from '../services/drawing.service';
import { ScheduleService } from '../services/schedule.service';
import { ParticipantDetailsDto } from '../dto/participant-details.dto';
import { ParticipationDto, ParticipationResponseDto } from '../dto/participation.dto';
import { SettingsDto } from '../dto/settings.dto';
export declare class WichtelController {
    private readonly wichtelService;
    private readonly drawingService;
    private readonly scheduleService;
    constructor(wichtelService: WichtelService, drawingService: DrawingService, scheduleService: ScheduleService);
    getSettings(): Promise<SettingsDto>;
    getDrawResult(participantId: string): Promise<ParticipantDetailsDto>;
    getParticipation(participantId: string): Promise<ParticipationResponseDto>;
    updateParticipation(participantId: string, participationDto: ParticipationDto): Promise<void>;
    getParticipantDetails(participantId: string): Promise<ParticipantDetailsDto>;
    runDrawing(): Promise<{
        message: string;
        success: boolean;
    }>;
    getNextDrawingTime(): Promise<{
        drawingTime: string;
        iso8601: string;
        countdown: {
            days: number;
            hours: number;
            minutes: number;
        };
    }>;
    private formatDate;
}
