import { Model } from 'mongoose';
import { Settings } from '../../modules/wichtel/entities/settings.entity';
export declare class DatabaseInitService {
    private settingsModel;
    private readonly logger;
    constructor(settingsModel: Model<Settings>);
    initializeDatabase(): Promise<void>;
    private initializeSettings;
    private formatDate;
}
