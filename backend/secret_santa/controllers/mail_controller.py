from flask_mail import Mail, Message
from flask import render_template, current_app as app
import uuid
import logging

logger = logging.getLogger(__name__)

def send_update(participant_id: uuid, participating: bool):

    user = app.mongo.db.users.find_one({'id': str(participant_id)}, {'firstName': 1, 'email': 1})
    settings = app.mongo.db.settings.find_one({})

    if user and settings:

        subject = "Du nimmst beim Wichteln teil" if participating else "Du nimmst beim Wichteln nicht teil"

        msg = Message(subject,
                        recipients=[user['email']])
        
        msg.body = subject
        msg.html = render_template('update_mail.html', 
                                    firstName=user['firstName'], 
                                    participating=participating, 
                                    registerLink='{:s}#/register/{:s}'.format(app.config['PUBLIC_BASE_URL'], str(participant_id) ), 
                                    drawTime=settings['drawing_time'])
        try:
            app.mail.send(msg)
            logger.error('Sent participation update mail to: {:s}, uuid={:s}'.format(user['email'], str(participant_id)))
        except:
            logger.error('Could not send participation update mail to: {:s}, uuid={:s}'.format(user['email'], str(participant_id)))
