import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { User, UserSchema } from '../wichtel/entities/user.entity';
import { Assignment, AssignmentSchema } from '../wichtel/entities/assignment.entity';
import { Settings, SettingsSchema } from '../wichtel/entities/settings.entity';
import { WichtelModule } from '../wichtel/wichtel.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Settings.name, schema: SettingsSchema },
    ]),
    WichtelModule,
    MailModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
