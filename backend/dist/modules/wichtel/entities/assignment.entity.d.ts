import { Document } from 'mongoose';
export declare class Assignment extends Document {
    donor: string;
    donee: string;
}
export declare const AssignmentSchema: import("mongoose").Schema<Assignment, import("mongoose").Model<Assignment, any, any, any, Document<unknown, any, Assignment> & Assignment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Assignment, Document<unknown, {}, import("mongoose").FlatRecord<Assignment>> & import("mongoose").FlatRecord<Assignment> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
