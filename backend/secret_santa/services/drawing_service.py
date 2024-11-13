import logging
from typing import List, Tuple
from flask import current_app as app

from .random_assignment import RandomAssignmentDrawing
from ..controllers.mail_controller import send_assignment

logger = logging.getLogger(__name__)


def get_preassignments_indices() -> List[Tuple[int]]:
    pre_assignments = app.mongo.pre_assignments.find({})
    try:
        return [(i["donor"], i["donee"]) for i in pre_assignments]
    except:
        logger.error("An error occured during pre-assigment processing")
        return []


def get_constraint_indices(users) -> List[Tuple[int]]:
    """Returns a list of tuples with user indices which shall not be assigned to each other"""

    constraint_users = app.mongo.users.find(
        {"id": {"$in": users}, "participation": True, "exclusions": {"$ne": None}},
        {"id": 1, "exclusions": 1},
    )

    constrain_tuples = [
        [(u["id"], t) for t in u["exclusions"]]
        for u in constraint_users
        if "exclusions" in u
    ]

    return [item for sublist in constrain_tuples for item in sublist]


def draw_assignments():

    app.mongo.assignments.delete_many({})

    participants = {
        user["id"]: user
        for user in app.mongo.users.find(
            {"participation": True}, {"id": 1, "firstName": 1}
        )
    }

    user_ids = [id for id in participants.keys()]

    pre_assignments = get_preassignments_indices()
    constraints = get_constraint_indices(user_ids)

    random_drawer = RandomAssignmentDrawing(
        user_ids, constraints=constraints, pre_assignments=pre_assignments
    )
    assignments = random_drawer.draw()

    for donor, donee in assignments.items():
        app.mongo.assignments.insert_one({"donor": donor, "donee": donee})
        logger.info(
            f'{participants[donor]["firstName"]} -> {participants[donee]["firstName"]}'
        )
        send_assignment(participants[donor]["id"], participants[donee]["id"])
