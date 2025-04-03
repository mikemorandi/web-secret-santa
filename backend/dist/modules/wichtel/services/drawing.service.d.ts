import { Model } from 'mongoose';
import { User } from '../entities/user.entity';
import { Assignment } from '../entities/assignment.entity';
import { PreAssignment } from '../entities/pre-assignment.entity';
import { RandomAssignmentService } from './random-assignment.service';
import { MailService } from '../../mail/services/mail.service';
export declare class DrawingService {
    private userModel;
    private assignmentModel;
    private preAssignmentModel;
    private randomAssignmentService;
    private mailService;
    private readonly logger;
    constructor(userModel: Model<User>, assignmentModel: Model<Assignment>, preAssignmentModel: Model<PreAssignment>, randomAssignmentService: RandomAssignmentService, mailService: MailService);
    private getPreAssignments;
    private getConstraintIndices;
    private static drawingInProgress;
    drawAssignments(): Promise<boolean>;
}
