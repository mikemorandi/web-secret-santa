
import connexion

from secret_santa import encoder
from flask_pymongo import PyMongo
from flask_cors import CORS

app = connexion.App(__name__, specification_dir='./openapi/')
app.app.json_encoder = encoder.JSONEncoder
app.add_api('openapi.yaml', arguments={'title': 'Wichtel API'}, pythonic_params=True)

app.app.config["MONGO_URI"] = "mongodb://localhost:27017/secretsanta"
cors = CORS(app.app, resources={r"/api/v1/*": {"origins": "*"}})
app.app.mongo = PyMongo(app.app)