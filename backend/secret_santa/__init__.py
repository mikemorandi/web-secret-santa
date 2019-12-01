
import connexion

from secret_santa import encoder
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_mail import Mail
from flask_apscheduler import APScheduler

import logging
logging.basicConfig(level=logging.INFO)

# Connexion
app = connexion.App(__name__, specification_dir='./openapi/')
app.app.json_encoder = encoder.JSONEncoder
app.add_api('openapi.yaml', arguments={'title': 'Wichtel API'}, pythonic_params=True)

# Mongo
app.app.config['MONGO_URI'] = 'mongodb://localhost:27017/secretsanta'
cors = CORS(app.app, resources={r'/api/v1/*': {'origins': '*'}})
app.app.mongo = PyMongo(app.app)

# Mail
app.app.config['MAIL_SERVER'] = 'mail.server.net'
app.app.config['MAIL_PORT'] = '587'
app.app.config['MAIL_USE_TLS'] = True
app.app.config['MAIL_USERNAME'] = 'sender@domain.com'
app.app.config['MAIL_DEFAULT_SENDER'] = ('Secret Santa', app.app.config['MAIL_USERNAME'])
app.app.config['MAIL_PASSWORD'] = 'INSERTWPHERE'
app.app.config['PUBLIC_BASE_URL'] = 'http://localhost:8081'
app.app.mail = Mail(app.app)

#Scheduler
scheduler = APScheduler()
scheduler.init_app(app.app)

from .controllers.drawing_controller import RandomAssignmentDrawing
import uuid
import datetime

settings = app.app.mongo.db.settings.find_one({})
if settings:
    #@scheduler.task('date', run_date=settings['drawing_time'])
    @scheduler.task('interval', seconds=5)
    def draw_assignments_job():
        with app.app.app_context():

            try:
                drawing = RandomAssignmentDrawing()

                while True
                    if drawing.draw_assignments():
                        break;
            except:
                logging.error('The drawing failed')

app.app.apscheduler.start()