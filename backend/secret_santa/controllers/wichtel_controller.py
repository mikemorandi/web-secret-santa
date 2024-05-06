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

def get_draw(participant_id: uuid):  # noqa: E501
    """Returns the draw results details"""

    #TODO: mongo equivialent of join?
    assignment = app.mongo.db.assignments.find_one_or_404({'donor': str(participant_id)})
    donee = app.mongo.db.users.find_one_or_404({'id': assignment['donee']}, {'firstName': 1, 'lastName': 1})

    return jsonify({ 'firstName': donee['firstName'], 'lastName': donee['lastName']})

def has_lastmodified_tmstmp(db_obj) -> bool:
    return 'lastModified' in db_obj and db_obj['lastModified'] is not None

def get_participation(participant_id: uuid):  # noqa: E501
    """Returns the participation status"""

    print(participant_id)
    user = app.mongo.db.users.find_one_or_404({'id': str(participant_id)}, {'participation': 1, 'lastModified': 1})

    return {
        'participating': user['participation'],
        'modified': has_lastmodified_tmstmp(user)
        }

def update_participation(body, participant_id: uuid):  # noqa: E501
    """Update a participation"""

    status_code = 500

    if connexion.request.is_json:
        body = Participation.from_dict(connexion.request.get_json())  # noqa: E501

        if body.participating is not None:

            last_update = app.mongo.db.users.find_one_or_404({'id': str(participant_id)}, {'lastModified': 1})

            if has_lastmodified_tmstmp(last_update) and (datetime.datetime.utcnow() - last_update['lastModified'] <= datetime.timedelta(seconds=5)):
                status_code = 429
            else:

                update_result = app.mongo.db.users.update_one(
                    {'id': str(participant_id),}, 
                    {'$set': {'participation': body.participating}})

                if update_result.modified_count == 1:
                    send_update(participant_id, body.participating)

                status_code = 204
        else:
            status_code = 400

    update_result = app.mongo.db.users.update_one(
        {'id': str(participant_id)}, 
        {'$currentDate': { "lastModified": True }})
            
    return None, status_code
