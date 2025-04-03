import { OnModuleInit } from '@nestjs/common';
import { DatabaseInitService } from './shared/utils/db-init';
export declare class AppModule implements OnModuleInit {
    private databaseInitService;
    constructor(databaseInitService: DatabaseInitService);
    onModuleInit(): Promise<void>;
}
