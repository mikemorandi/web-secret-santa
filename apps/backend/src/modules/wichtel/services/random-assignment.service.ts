import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RandomAssignmentService {
  private readonly logger = new Logger(RandomAssignmentService.name);

  draw(
    candidates: string[],
    constraints: [string, string][] = [],
    preAssignments: [string, string][] = [],
  ): Record<string, string> | null {
    this.logger.log(`Drawing from ${candidates.length} participants`);

    const maxCyclesPerRun = 100;
    const maxRuns = 10;

    for (let run = 0; run < maxRuns; run++) {
      const assignments: Record<string, string> = {};
      
      // Apply pre-assignments
      if (preAssignments) {
        for (const assignment of preAssignments) {
          const [donor, donee] = assignment;
          
          if (!candidates.includes(donor)) {
            this.logger.error(`Pre-assigned user ${donor} is not among participants`);
            continue;
          }
          
          if (!candidates.includes(donee)) {
            this.logger.error(`Pre-assigned user ${donee} is not among participants`);
            continue;
          }
          
          if (donor in assignments) {
            this.logger.error(`Donor ${donor} already has an assignment`);
            continue;
          }
          
          assignments[donor] = donee;
        }
      }

      let cycle = 0;
      while (Object.keys(assignments).length !== candidates.length) {
        // Get donors who don't have an assignment yet
        const donorsToAssign = candidates.filter(
          (candidate) => !Object.keys(assignments).includes(candidate)
        );
        
        if (donorsToAssign.length === 0) break;
        
        // Randomly select a donor
        const donorIdx = Math.floor(Math.random() * donorsToAssign.length);
        const donorId = donorsToAssign[donorIdx];

        // Find available donees for this donor
        const constraintDonees = constraints
          ? new Set(
              constraints
                .filter((constraint) => constraint[0] === donorId)
                .map((constraint) => constraint[1])
            )
          : new Set();

        // Add reverse constraints
        if (constraints) {
          constraints
            .filter((constraint) => constraint[1] === donorId)
            .forEach((constraint) => constraintDonees.add(constraint[0]));
        }

        const doneesAlreadyAssigned = Object.values(assignments);
        const doneesToAssign = candidates.filter(
          (candidate) =>
            candidate !== donorId &&
            !doneesAlreadyAssigned.includes(candidate) &&
            !constraintDonees.has(candidate)
        );

        if (doneesToAssign.length > 0) {
          const doneeIdx = Math.floor(Math.random() * doneesToAssign.length);
          assignments[donorId] = doneesToAssign[doneeIdx];
        }

        if (cycle > maxCyclesPerRun + candidates.length) {
          break;
        }
        
        cycle++;
      }

      if (Object.keys(assignments).length === candidates.length) {
        this.logger.log(`Solution found in run #${run}`);
        return assignments;
      } else {
        this.logger.warn(`No solution found after ${cycle} cycles in run ${run}`);
      }
    }

    this.logger.error(`No solution found after ${maxRuns} runs`);
    return null;
  }
}