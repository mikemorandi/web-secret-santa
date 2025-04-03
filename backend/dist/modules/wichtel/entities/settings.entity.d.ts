import { Document } from 'mongoose';
export declare class Settings extends Document {
    retry_sec: number;
    drawing_time: Date;
    assignment_hint?: string;
}
export declare const SettingsSchema: import("mongoose").Schema<Settings, import("mongoose").Model<Settings, any, any, any, Document<unknown, any, Settings> & Settings & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Settings, Document<unknown, {}, import("mongoose").FlatRecord<Settings>> & import("mongoose").FlatRecord<Settings> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
