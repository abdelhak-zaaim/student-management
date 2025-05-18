// models/student.model.ts
import {User} from "./user.model";
import {Payment} from "./payment.model";
import {Group} from "./group.model";

export interface Student {
    id?: number;
    user?: User | null;
    payments?: Payment[];
    studentGroup?: Group | null;
    phone?: string | null;
}
