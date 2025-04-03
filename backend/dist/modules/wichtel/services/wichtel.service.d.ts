import { Model } from 'mongoose';
import { User } from '../entities/user.entity';
import { Assignment } from '../entities/assignment.entity';
import { Settings } from '../entities/settings.entity';
import { ParticipantDetailsDto } from '../dto/participant-details.dto';
import { ParticipationDto, ParticipationResponseDto } from '../dto/participation.dto';
import { SettingsDto } from '../dto/settings.dto';
import { MailService } from '../../mail/services/mail.service';
export declare class WichtelService {
    private userModel;
    private assignmentModel;
    private settingsModel;
    private mailService;
    private readonly logger;
    constructor(userModel: Model<User>, assignmentModel: Model<Assignment>, settingsModel: Model<Settings>, mailService: MailService);
    getSettings(): Promise<SettingsDto>;
    getParticipantDetails(participantId: string): Promise<ParticipantDetailsDto>;
    getDrawResult(participantId: string): Promise<ParticipantDetailsDto>;
    getParticipation(participantId: string): Promise<ParticipationResponseDto>;
    updateParticipation(participantId: string, participationDto: ParticipationDto): Promise<void>;
}
