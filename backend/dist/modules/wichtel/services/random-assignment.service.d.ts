export declare class RandomAssignmentService {
    private readonly logger;
    draw(candidates: string[], constraints?: [string, string][], preAssignments?: [string, string][]): Record<string, string> | null;
}
