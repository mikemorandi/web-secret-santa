import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { User } from '../../wichtel/entities/user.entity';
import { Settings } from '../../wichtel/entities/settings.entity';
export declare class MailService {
    private configService;
    private userModel;
    private settingsModel;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService, userModel: Model<User>, settingsModel: Model<Settings>);
    private initializeTransporter;
    private getRecipientAddress;
    private formatDate;
    sendUpdate(participantId: string, participating: boolean): Promise<void>;
    sendAssignment(donorId: string, doneeId: string): Promise<void>;
}
