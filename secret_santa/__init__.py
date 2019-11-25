
import connexion

from secret_santa import encoder
from flask_pymongo import PyMongo

app = connexion.App(__name__, specification_dir='./openapi/')
app.app.json_encoder = encoder.JSONEncoder
app.add_api('openapi.yaml', arguments={'title': 'Wichtel API'}, pythonic_params=True)

app.app.config["MONGO_URI"] = "mongodb://localhost:27017/secretsanta"
app.app.mongo = PyMongo(app.app)