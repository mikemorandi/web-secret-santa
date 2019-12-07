
import connexion

from secret_santa import encoder
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_mail import Mail
from flask_apscheduler import APScheduler

import logging
import logging.handlers
from sys import stdout

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
app.app.config['MONGO_URI'] = 'mongodb://mongodb:27017/secretsanta'
cors = CORS(app.app, resources={r'/api/v1/*': {'origins': '*'}})
app.app.mongo = PyMongo(app.app)

# Mail

app.app.config['MAIL_SERVER'] = 'mail.gmx.net'  
app.app.config['MAIL_PORT'] = '587'
app.app.config['MAIL_USE_TLS'] = True
app.app.config['MAIL_USERNAME'] = 'morandi-wichteln@gmx.ch'
app.app.config['MAIL_DEFAULT_SENDER'] = ('Weihnachts Wichtel', app.app.config['MAIL_USERNAME'])
app.app.config['MAIL_PASSWORD'] = 'LqzicvCl6M4KzR0Adu2b'
app.app.config['PUBLIC_BASE_URL'] = 'http://wichteln.morandi.org'
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