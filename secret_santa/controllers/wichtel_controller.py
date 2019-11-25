import connexion
import six

import uuid

from secret_santa.models.participant_details import ParticipantDetails  # noqa: E501
from secret_santa.models.participation import Participation  # noqa: E501
from secret_santa import util

from flask import jsonify, abort, current_app as app

def get_participant_details(participant_id: uuid):  # noqa: E501
    """Returns the participant details"""

    user = app.mongo.db.users.find_one_or_404({'id': str(participant_id)})
    return jsonify({ 'firstName': user['firstName'], 'lastName': user['lastName']})

def get_participation(participant_id: uuid):  # noqa: E501
    """Returns the participation status"""

    print(participant_id)
    user = app.mongo.db.users.find_one_or_404({'id': str(participant_id)})
    print(user)
    return {'participating': user['participation']}


def update_participation(body, participant_id: uuid):  # noqa: E501
    """Update a participation"""

    if connexion.request.is_json:
        body = Participation.from_dict(connexion.request.get_json())  # noqa: E501

        if body.participating is not None:

            update_result = app.mongo.db.users.update_one({'id': str(participant_id)}, {'$set': {'participation': body.participating}})
            
            if update_result.matched_count  == 0:
                return None, 404
            elif update_result.matched_count == 1:
                return None, 200
        else:

            return None, 400
            
    return None ,500
