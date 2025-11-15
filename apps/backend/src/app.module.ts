import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { WichtelModule } from './modules/wichtel/wichtel.module';
import { MailModule } from './modules/mail/mail.module';
import { DatabaseInitService } from './shared/utils/db-init';
import { Settings, SettingsSchema } from './modules/wichtel/entities/settings.entity';

/**
 * Masks credentials in a MongoDB URI
 */
function maskMongoDBUri(uri: string): string {
  if (!uri) return 'undefined';
  
  try {
    const parsedUrl = new URL(uri);
    if (parsedUrl.username) {
      parsedUrl.username = '********';
      parsedUrl.password = '********';
      return parsedUrl.toString();
    }
    return uri;
  } catch (error) {
    return 'invalid-mongodb-uri';
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('MongooseModule');
        const uri = configService.get<string>('MONGODB_URI');
        
        if (!uri) {
          logger.error('MONGODB_URI environment variable is not defined');
          logger.error('Environment variables available: ' + 
            Object.keys(process.env)
              .filter(key => !key.includes('PASSWORD') && !key.includes('SECRET') && !key.includes('KEY'))
              .join(', ')
          );
          throw new Error('MONGODB_URI is not defined in environment variables');
        }
        
        logger.log(`Connecting to MongoDB: ${maskMongoDBUri(uri)}`);
        
        return {
          uri,
        };
      },
    }),
    MongooseModule.forFeature([
      { name: Settings.name, schema: SettingsSchema },
    ]),
    ScheduleModule.forRoot(),
    WichtelModule,
    MailModule,
  ],
  providers: [DatabaseInitService],
})
export class AppModule implements OnModuleInit {
  constructor(private databaseInitService: DatabaseInitService) {}

  async onModuleInit() {
    await this.databaseInitService.initializeDatabase();
  }
}