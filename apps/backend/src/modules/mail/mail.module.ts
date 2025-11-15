import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../wichtel/entities/user.entity';
import { Settings, SettingsSchema } from '../wichtel/entities/settings.entity';
import { MailService } from './services/mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Settings.name, schema: SettingsSchema },
    ]),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}