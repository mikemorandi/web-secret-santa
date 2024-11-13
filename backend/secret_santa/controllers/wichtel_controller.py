from connexion.problem import problem
from connexion.exceptions import BadRequestProblem

import uuid
import pytz
from datetime import datetime, timezone, timedelta
from flask import jsonify, current_app as app

from .mail_controller import send_update


def has_lastmodified_tmstmp(db_obj) -> bool:
    return "lastModified" in db_obj and db_obj["lastModified"] is not None


def problem_404():
    return problem(
        title="NotFound",
        detail="The requested resource was not found on the server",
        status=404,
    )


def eval_or_404(input, eval):
    if input:
        return eval(input)
    else:
        return problem_404()


def get_settings():
    """Returns the drawing settings"""

    def format_settings(s):
        return jsonify({"retrySec": s["retry_sec"], "drawingTime": s["drawing_time"]})

    return eval_or_404(app.mongo.settings.find_one(), format_settings)


def get_participant_details(participant_id: uuid):
    """Returns the participant details"""

    def format_user(user):
        return jsonify({"firstName": user["firstName"], "lastName": user["lastName"]})

    return eval_or_404(
        app.mongo.users.find_one(
            {"id": str(participant_id)}, {"firstName": 1, "lastName": 1}
        ),
        format_user,
    )


def get_draw(participant_id: uuid):
    """Returns the draw results details"""

    if assignment := app.mongo.assignments.find_one({"donor": str(participant_id)}):

        def format_assignment(donee):
            return jsonify(
                {"firstName": donee["firstName"], "lastName": donee["lastName"]}
            )

        donee = app.mongo.users.find_one(
            {"id": assignment["donee"]}, {"firstName": 1, "lastName": 1}
        )

        return eval_or_404(donee, format_assignment)
    else:
        return problem_404()


def get_participation(participant_id: uuid):
    """Returns the participation status"""

    print(participant_id)
    user = app.mongo.users.find_one(
        {"id": str(participant_id)}, {"participation": 1, "lastModified": 1}
    )

    def format_participation(user):
        return {
            "participating": user["participation"],
            "modified": has_lastmodified_tmstmp(user),
        }

    return eval_or_404(user, format_participation)


def update_participation(body, participant_id: uuid):
    """Update a participation"""

    status_code = 500

    if "participating" in body:

        if last_update := app.mongo.users.find_one(
            {"id": str(participant_id)}, {"lastModified": 1}
        ):

            if has_lastmodified_tmstmp(last_update) and datetime.now(
                timezone.utc
            ) - pytz.UTC.localize(last_update["lastModified"]) <= timedelta(seconds=5):
                status_code = 429
            else:
                participating = body["participating"]
                update_result = app.mongo.users.update_one(
                    {
                        "id": str(participant_id),
                    },
                    {"$set": {"participation": participating}},
                )

                if update_result.modified_count == 1:
                    send_update(participant_id, participating)
                status_code = 204
        else:
            return problem_404()
    else:
        return BadRequestProblem("Malformed payload")

    update_result = app.mongo.users.update_one(
        {"id": str(participant_id)}, {"$currentDate": {"lastModified": True}}
    )

    return None, status_code
