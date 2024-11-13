from flask_mail import Mail, Message
from flask import render_template, current_app as app
import uuid
import logging

logger = logging.getLogger(__name__)


def get_recipient_address(email: str) -> str:
    debug_mailaddress = app.config["MAIL_DEBUG_MAIL_ADRESS"]
    return debug_mailaddress if debug_mailaddress else email


def send_update(participant_id: uuid, participating: bool):

    user = app.mongo.users.find_one(
        {"id": str(participant_id)}, {"firstName": 1, "email": 1}
    )
    settings = app.mongo.settings.find_one()

    if user and settings:

        subject = (
            "Du nimmst beim Wichteln teil"
            if participating
            else "Du nimmst beim Wichteln nicht teil"
        )
        recipient = get_recipient_address(user["email"])

        msg = Message(subject, recipients=[recipient])

        msg.body = subject
        msg.html = render_template(
            "update_mail.html",
            firstName=user["firstName"],
            participating=participating,
            registerLink="{:s}#/register/{:s}".format(
                app.config["PUBLIC_BASE_URL"], str(participant_id)
            ),
            drawTime=settings["drawing_time"],
        )
        try:
            app.mail.send(msg)
            logger.info(
                "Sent participation update mail to: {:s}, uuid={:s}".format(
                    user["email"], str(participant_id)
                )
            )
        except Exception as e:
            print(e)
            logger.info(
                "Could not send participation update mail to: {:s}, uuid={:s}".format(
                    user["email"], str(participant_id)
                )
            )
    else:
        logger.error("query for participant {:s} failed".format(str(participant_id)))


def send_assignment(donor_id: uuid, donee_id: uuid):

    donor = app.mongo.users.find_one(
        {"id": str(donor_id)}, {"firstName": 1, "email": 1}
    )
    donee = app.mongo.users.find_one({"id": str(donee_id)}, {"firstName": 1})

    if donor and donee:

        subject = "Wichtel Auslosung"
        recipient = get_recipient_address(donor["email"])

        msg = Message(subject, recipients=[recipient])

        msg.body = "Für dich wurde {:s} ausgelost".format(donee["firstName"])
        msg.html = render_template(
            "assignment_mail.html",
            firstName=donor["firstName"],
            doneeName=donee["firstName"],
        )
        try:
            app.mail.send(msg)
            logger.info(
                f"Sent assignment update mail to: {recipient}, uuid={str(donor_id)}"
            )
        except:
            logger.info(
                f"Could not send assignment update mail to: {recipient}, uuid={str(donor_id)}"
            )
