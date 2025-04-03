import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { WichtelModule } from './modules/wichtel/wichtel.module';
import { MailModule } from './modules/mail/mail.module';
import { DatabaseInitService } from './shared/utils/db-init';
import { Settings, SettingsSchema } from './modules/wichtel/entities/settings.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
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