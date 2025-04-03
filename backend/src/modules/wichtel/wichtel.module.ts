import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WichtelController } from './controllers/wichtel.controller';
import { WichtelService } from './services/wichtel.service';
import { DrawingService } from './services/drawing.service';
import { RandomAssignmentService } from './services/random-assignment.service';
import { ScheduleService } from './services/schedule.service';
import { User, UserSchema } from './entities/user.entity';
import { Assignment, AssignmentSchema } from './entities/assignment.entity';
import { PreAssignment, PreAssignmentSchema } from './entities/pre-assignment.entity';
import { Settings, SettingsSchema } from './entities/settings.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: PreAssignment.name, schema: PreAssignmentSchema },
      { name: Settings.name, schema: SettingsSchema },
    ]),
    MailModule,
  ],
  controllers: [WichtelController],
  providers: [
    WichtelService,
    DrawingService,
    RandomAssignmentService,
    ScheduleService,
  ],
  exports: [
    WichtelService,
    DrawingService,
    RandomAssignmentService,
    ScheduleService,
  ],
})
export class WichtelModule {}