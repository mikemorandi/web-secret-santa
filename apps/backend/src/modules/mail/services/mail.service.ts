import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import * as pug from 'pug';
import * as path from 'path';
import { User } from '../../wichtel/entities/user.entity';
import { Settings } from '../../wichtel/entities/settings.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Settings.name) private settingsModel: Model<Settings>,
  ) {
    this.initializeTransporter();
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('✓ Mail server connection verified successfully');
    } catch (error) {
      this.logger.error('✗ Mail server connection failed:', error.message);
      this.logger.warn('Emails will fail to send. Please check your MAIL_* configuration.');
    }
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');

    // Port 465 uses implicit SSL, port 587 uses STARTTLS
    const secure = port === 465;

    this.logger.log(`Initializing mail transporter: ${host}:${port} (secure: ${secure})`);

    this.transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: user,
        pass: pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      logger: false,
      debug: false,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  private getRecipientAddress(email: string): string {
    const debugMailAddress = this.configService.get<string>('MAIL_DEBUG_MAIL_ADDRESS');
    return debugMailAddress || email;
  }

  private formatDate(date: Date): string {
    // Format as day.month.year hours:minutes (24h format, no timezone)
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  async sendUpdate(participantId: string, participating: boolean): Promise<void> {
    try {
      const user = await this.userModel.findOne(
        { id: participantId },
        { firstName: 1, email: 1 }
      ).exec();
      
      const settings = await this.settingsModel.findOne().exec();
      
      if (!user || !settings) {
        this.logger.error(`Query for participant ${participantId} failed`);
        return;
      }
      
      const subject = participating
        ? 'Du nimmst beim Wichteln teil'
        : 'Du nimmst beim Wichteln nicht teil';
      
      const recipient = this.getRecipientAddress(user.email);
      
      // Fix the template path to work in both development and production
      const templatePath = path.resolve(
        process.cwd(),
        process.env.NODE_ENV === 'production' ? 'dist' : 'src',
        'modules/mail/templates/update_mail.pug'
      );
      
      this.logger.log(`Using template path: ${templatePath}`);
      
      const html = pug.renderFile(templatePath, {
        firstName: user.firstName,
        participating,
        registerLink: `${this.configService.get<string>('PUBLIC_BASE_URL')}#/register/${participantId}`,
        drawTime: this.formatDate(settings.drawing_time),
      });
      
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: recipient,
        subject,
        text: subject,
        html,
      });
      
      this.logger.log(`Sent participation update mail to: ${recipient}, uuid=${participantId}`);
    } catch (error) {
      this.logger.error(`Could not send participation update mail to participant ${participantId}`, error.stack);
    }
  }

  async sendAssignment(donorId: string, doneeId: string): Promise<void> {
    try {
      const donor = await this.userModel.findOne(
        { id: donorId },
        { firstName: 1, email: 1 }
      ).exec();
      
      const donee = await this.userModel.findOne(
        { id: doneeId },
        { firstName: 1 }
      ).exec();
      
      // Add explicit projection to ensure we get assignment_hint
      const settings = await this.settingsModel.findOne({}, {
        retry_sec: 1,
        drawing_time: 1,
        assignment_hint: 1
      }).exec();
      
      if (!donor || !donee || !settings) {
        this.logger.error(`Query for donor ${donorId} or donee ${doneeId} failed or settings not found`);
        return;
      }
      
      const subject = 'Wichtel Auslosung';
      const recipient = this.getRecipientAddress(donor.email);
      
      // Fix the template path to work in both development and production
      const templatePath = path.resolve(
        process.cwd(),
        process.env.NODE_ENV === 'production' ? 'dist' : 'src',
        'modules/mail/templates/assignment_mail.pug'
      );
      
      this.logger.log(`Using template path: ${templatePath}`);
      
      // Prepare template variables
      const templateVars = {
        firstName: donor.firstName,
        doneeName: donee.firstName,
      };
      
      // Only include assignment hint if it exists in the database
      if (settings.assignment_hint) {
        templateVars['assignmentHint'] = settings.assignment_hint;
      } 
      const html = pug.renderFile(templatePath, templateVars);
      
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: recipient,
        subject,
        text: `Für dich wurde ${donee.firstName} ausgelost`,
        html,
      });
      
      this.logger.log(`Sent assignment mail to: ${recipient}, uuid=${donorId}`);
    } catch (error) {
      this.logger.error(`Could not send assignment mail to donor ${donorId}`, error.stack);
    }
  }
}