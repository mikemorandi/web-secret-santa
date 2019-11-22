import connexion
import six

from secret_santa.models.participat_details import ParticipantDetails  # noqa: E501
from secret_santa.models.participation import Participation  # noqa: E501
from secret_santa import util


def get_participant_details(participant_id):  # noqa: E501
    """Returns the participat details

     # noqa: E501

    :param participant_id: ID of participant
    :type participant_id: 

    :rtype: ParticipantDetails
    """
    return 'do some magic!'


def get_participation(participant_id):  # noqa: E501
    """Returns the participation status

     # noqa: E501

    :param participant_id: ID of participant
    :type participant_id: 

    :rtype: Participation
    """
    return 'do some magic!'


def update_participation(body, participant_id):  # noqa: E501
    """Update a participation

     # noqa: E501

    :param body: Participation details
    :type body: dict | bytes
    :param participant_id: ID of participant
    :type participant_id: 

    :rtype: None
    """
    if connexion.request.is_json:
        body = Participation.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!'
