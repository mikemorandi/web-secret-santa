
import connexion

from secret_santa import encoder
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_mail import Mail
from flask_apscheduler import APScheduler

import os
import logging
import logging.handlers
from sys import stdout
from datetime import datetime

from .services.drawing_service import draw_assignments

sematext_handler = logging.handlers.SysLogHandler(address=('logsene-syslog-receiver.eu.sematext.com', 514))
formater = logging.Formatter("7510fb74-d7ac-40e3-b2e3-a686135f0a63:%(message)s")
sematext_handler.setFormatter(formater)

handlers = [sematext_handler, logging.StreamHandler(stdout)]
logging.basicConfig(level=logging.INFO, handlers=handlers)

logger = logging.getLogger(__name__)

# Connexion
app = connexion.App(__name__, specification_dir='./openapi/')
app.app.json_encoder = encoder.JSONEncoder
app.add_api('openapi.yaml', arguments={'title': 'Wichtel API'}, pythonic_params=True)

# Mongo
print('Connecting to {:s}'.format(os.environ.get('MONGO_URI')))
app.app.config['MONGO_URI'] = os.environ.get('MONGO_URI')
cors = CORS(app.app, resources={r'/api/v1/*': {'origins': '*'}})
app.app.mongo = PyMongo(app.app)

def populate_db():
    if not app.app.mongo.db.settings.find_one():
        config = { "retry_sec" : 3, "drawing_time" : datetime(datetime.now().year, 12, 15, 12, 0, 0) }
        app.app.mongo.db.settings.insert_one(config)

populate_db()

# Mail
app.app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER')
app.app.config['MAIL_PORT'] = os.environ.get('MAIL_PORT')
app.app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS')
app.app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')
app.app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.app.config['PUBLIC_BASE_URL'] = os.environ.get('PUBLIC_BASE_URL')
app.app.mail = Mail(app.app)

#Scheduler
scheduler = APScheduler()
scheduler.init_app(app.app)

settings = app.app.mongo.db.settings.find_one({})
if settings:

    logger.info('Scheduling draw for {}'.format(settings['drawing_time']))

    @scheduler.task('date', run_date=settings['drawing_time'])
    #@scheduler.task('interval', seconds=4)
    def draw_assignments_job():
        with app.app.app_context():
            try:
                draw_assignments()
            except Exception as e:
                logging.error('The drawing failed: {:s}'.format(str(e)))

app.app.apscheduler.start()