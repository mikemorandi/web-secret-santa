import connexion
import six

import uuid
import datetime
from datetime import timedelta

from secret_santa.models.participant_details import ParticipantDetails  # noqa: E501
from secret_santa.models.participation import Participation  # noqa: E501
from secret_santa import util

from flask import jsonify, abort, current_app as app

from .mail_controller import send_update

def get_settings():
    settings = app.mongo.db.settings.find_one_or_404({})
    return jsonify({ 'retrySec': settings['retry_sec'], 'drawingTime': settings['drawing_time']})

def get_participant_details(participant_id: uuid):  # noqa: E501
    """Returns the participant details"""

    user = app.mongo.db.users.find_one_or_404({'id': str(participant_id)}, {'firstName': 1, 'lastName': 1})
    return jsonify({ 'firstName': user['firstName'], 'lastName': user['lastName']})

def get_participation(participant_id: uuid):  # noqa: E501
    """Returns the participation status"""

    print(participant_id)
    user = app.mongo.db.users.find_one_or_404({'id': str(participant_id)}, {'participation': 1})
    return {'participating': user['participation']}


def update_participation(body, participant_id: uuid):  # noqa: E501
    """Update a participation"""

    if connexion.request.is_json:
        body = Participation.from_dict(connexion.request.get_json())  # noqa: E501

        if body.participating is not None:

            lastUpdate = app.mongo.db.users.find_one_or_404({'id': str(participant_id)}, {'lastModified': 1})

            if 'lastModified' in lastUpdate and datetime.datetime.utcnow() - lastUpdate['lastModified'] >= datetime.timedelta(seconds=5):
                update_result = app.mongo.db.users.update_one({'id': str(participant_id)}, {'$set': {'participation': body.participating}, '$currentDate': { "lastModified": True }})
                if update_result.matched_count  == 0:
                    return None, 404
                elif update_result.matched_count == 1:

                    send_update(participant_id, body.participating)

                    return None, 204
            else:
                return None, 429                    
   
        else:

            return None, 400
            
    return None ,500
