# coding: utf-8

from __future__ import absolute_import

from flask import json

from secret_santa.models.participation import Participation
from secret_santa.test import BaseTestCase


class TestWichtelController(BaseTestCase):
    """WichtelController integration test stubs"""

    def test_get_participant_details(self):
        """Test case for get_participant_details

        Returns the participant details
        """
        response = self.client.open(
            '/api/v1/users/{participantId}'.format(
                participant_id='38400000-8cf0-11bd-b23e-10b96e4ef00d'),
            method='GET')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_get_participation(self):
        """Test case for get_participation

        Returns the participation status
        """
        response = self.client.open(
            '/api/v1/participations/{participantId}'.format(
                participant_id='38400000-8cf0-11bd-b23e-10b96e4ef00d'),
            method='GET')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_update_participation(self):
        """Test case for update_participation

        Update a participation
        """
        body = Participation()
        response = self.client.open(
            '/api/v1/participations/{participantId}'.format(
                participant_id='38400000-8cf0-11bd-b23e-10b96e4ef00d'),
            method='PUT',
            data=json.dumps(body),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    import unittest
    unittest.main()
