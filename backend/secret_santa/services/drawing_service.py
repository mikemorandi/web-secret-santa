import logging
from flask import current_app as app

from .random_assignment import RandomAssignmentDrawing
from ..controllers.mail_controller import send_assignment

logger = logging.getLogger(__name__)

def get_preassignments_indices(users):
    pre_assignments = app.mongo.db.pre_assignments.find({})
    try:
        return [( users.index(i['donor']), users.index(i['donee']) ) for i in pre_assignments]
    except:
        logger.error('An error occured during pre-assigment processing')
        return []

def get_constraint_indices(users):
    constraint_users = app.mongo.db.users.find({'participation': True, 'spouse':{'$ne': None}}, {'id': 1, 'spouse': 1, 'firstName': 1})
    try:
        return [( users.index(i['id']), users.index(i['spouse']) ) for i in constraint_users if i['spouse'] in users]
    except Exception as e:
        logger.error(e)
        return []

def draw_assignments():

    x = app.mongo.db.assignments.remove({})
    participants = list(app.mongo.db.users.find({'participation': True}, {'id': 1}))

    users = [u['id'] for u in participants]
    pre_assignments = get_preassignments_indices(users)
    constraints = get_constraint_indices(users)

    random_drawer = RandomAssignmentDrawing(users, constraints=constraints, pre_assignments=pre_assignments)
    assignments = random_drawer.draw()

    for donor, donee in assignments.items():
        if app.mongo.db.assignments.count({'donor': participants[donor]['id'], 'donee': participants[donee]['id']}) == 0:
            app.mongo.db.assignments.insert({'donor': participants[donor]['id'], 'donee': participants[donee]['id']})
        send_assignment(participants[donor]['id'], participants[donee]['id'])
