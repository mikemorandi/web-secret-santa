from connexion import FlaskApp
from flask_mail import Mail
from flask_apscheduler import APScheduler
from pymongo import MongoClient
from dotenv import load_dotenv
from .services.drawing_service import draw_assignments
from datetime import datetime, timedelta
import os
import certifi
import logging

load_dotenv()

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# API
app = FlaskApp(__name__, specification_dir="./openapi/")
app.add_api("openapi.yaml", arguments={"title": "Wichtel API"}, pythonic_params=True)

# DB
connection_string = (
    os.getenv("MONGO_URI")
    .replace("{USER}", os.getenv("MONGO_USER"))
    .replace("{PWD}", os.getenv("MONGO_PWD"))
)

logger.info(print(os.getenv("MONGO_URI")))

app.app.mongo_client = MongoClient(connection_string, tlsCAFile=certifi.where())
app.app.mongo = app.app.mongo_client.secretsanta

# Mail
app.app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
app.app.config["MAIL_PORT"] = os.getenv("MAIL_PORT")
app.app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS")
app.app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER")
app.app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
app.app.config["PUBLIC_BASE_URL"] = os.getenv("PUBLIC_BASE_URL")
app.app.config["MAIL_DEBUG_MAIL_ADRESS"] = os.getenv("MAIL_DEBUG_MAIL_ADRESS")
app.app.mail = Mail(app.app)

if app.app.config["MAIL_DEBUG_MAIL_ADRESS"]:
    logger.info(f'Mail debugging enabled: {app.app.config["MAIL_DEBUG_MAIL_ADRESS"] }')

# Scheduler
scheduler = APScheduler()
scheduler.init_app(app.app)

settings = app.app.mongo.settings.find_one()
if settings:

    logger.info("Scheduling draw for {}".format(settings["drawing_time"]))

    @scheduler.task("date", run_date=settings["drawing_time"])
    # @scheduler.task("date", run_date=(datetime.now() + timedelta(seconds=5)))
    def draw_assignments_job():
        with app.app.app_context():
            try:
                draw_assignments()
            except Exception as e:
                logging.error("The drawing failed: {:s}".format(str(e)))


scheduler.start()
