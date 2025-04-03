import { Document } from 'mongoose';
export declare class PreAssignment extends Document {
    donor: string;
    donee: string;
}
export declare const PreAssignmentSchema: import("mongoose").Schema<PreAssignment, import("mongoose").Model<PreAssignment, any, any, any, Document<unknown, any, PreAssignment> & PreAssignment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PreAssignment, Document<unknown, {}, import("mongoose").FlatRecord<PreAssignment>> & import("mongoose").FlatRecord<PreAssignment> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
