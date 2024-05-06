import random
import logging

logger = logging.getLogger(__name__)


class RandomAssignmentDrawing:

    def __init__(self, candidates, constraints=None, pre_assignments=None):
        self.candidates = candidates
        self.constraints = constraints
        self.pre_assignments = pre_assignments

        self.assignments = dict()

    def apply_preassignments(self):
        if self.pre_assignments:
            for assigment in self.pre_assignments:
                assert assigment[0] not in self.assignments
                self.assignments[assigment[0]] = assigment[1]

    def remaining_candidates(self):
        return [u_idx for u_idx in range(0,len(self.candidates)) if u_idx not in self.assignments.keys()]

    def available_donees(self, donor_idx):

        constraint_donees = {d[1] for d in self.constraints if d[0] == donor_idx} if self.constraints else set()
        constraint_donees.union({d[0] for d in self.constraints if d[1] == donor_idx})

        return [i for i in range(0,len(self.candidates)) if i != donor_idx and i not in self.assignments.values() and i not in constraint_donees]

    def draw(self):

        logger.info('Drawing from {}'.format(str(self.candidates)))

        max_cycles_per_run = 100
        max_runs = 10

        for seed in range(0, max_runs):

            self.assignments.clear()
            self.apply_preassignments()

            cycle = 0
            while len(self.assignments) != len(self.candidates):

                donors_to_assign = self.remaining_candidates()
                donor_idx = donors_to_assign[random.randint(0,len(donors_to_assign)-1)]

                donees_to_assign = self.available_donees(donor_idx)
                if donees_to_assign:
                    donee_tmp_idx = random.randint(0,len(donees_to_assign)-1)
                    self.assignments[donor_idx] = donees_to_assign[donee_tmp_idx]

                if cycle > max_cycles_per_run + len(self.candidates):
                    break
                cycle += 1

            if len(self.assignments) == len(self.candidates):
                logger.info('Solution found {}'.format(str(self.assignments)))
                return self.assignments
            else:
                logger.error('No solution found after {} cycles'.format(cycle))

        logger.error('No solution found after {} runs'.format(max_runs))
        return None

if __name__ == "__main__":

    logging.basicConfig(level=logging.INFO)

    candidates = ['Michael', 'Salome', 'Benjamin', 'Jiwon', 'Simeon', 'Jürg', 'Christine', 'Marc']
    constraints = [(0,1), (2,3), (6,7)]
    pre_assignments= [(7,5)]

    wichtel = RandomAssignmentDrawing(candidates=candidates,pre_assignments=pre_assignments, constraints=constraints)
    solution = wichtel.draw()
    
    if solution:
        for key, value in solution.items():
            print('{:s} -> {:s}'.format(candidates[key], candidates[value]))        