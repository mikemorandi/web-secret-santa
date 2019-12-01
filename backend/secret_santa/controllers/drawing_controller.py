import logging
import random

from flask import current_app as app

logger = logging.getLogger(__name__)

class RandomAssignmentDrawing:

    def __init__(self):  

        self.SEED = random.seed(); #TODO use seed from random.org
        self.PERSONS = ['Michael', 'Salome', 'Benjamin', 'Jiwon', 'Matteo', 'Christine', 'Marc', 'Freddy', 'Agnes', 'Jürg']
        self.CONSTRAINTS = [(0, 1), (2, 3), (5, 6), (7, 8)] #Couples shall not make gifts to each other
        self.PRE_ASSIGNMENTS = []

        self.used_idx = set()
        self.mappings = [None]*len(self.PERSONS)

    def assign(self, donor, donee):
        self.used_idx.add(donee)
        self.mappings[donor] = donee

    def constraint_violated(self, i, j):
        return (i, j) in self.CONSTRAINTS or (j, i) in self.CONSTRAINTS or i == j

    def draw_assignments(self):

        for pre in self.PRE_ASSIGNMENTS:
            assign(pre[0], pre[1])

        random.seed(self.SEED)
        for i in range(0,len(self.PERSONS)):
            
            loops = 0
            if self.mappings[i] is None:

                rn = random.randint(0, len(self.PERSONS)-1)
                while rn in self.used_idx or self.constraint_violated(i, rn):
                    rn = random.randint(0, len(self.PERSONS)-1)

                    loops +=1
                    if loops > 100:
                        logger.error("No Solution within 100 cycles, giving up")
                        return False

                self.assign(i, rn)

        if len(set(self.mappings)) is not len(self.mappings):
            logger.error("Mapping mismatch")
            return False

        for i in range(0, len(self.PERSONS)):
            logger.info("%s --> %s " % (self.PERSONS[i], self.PERSONS[self.mappings[i]]))

        return True