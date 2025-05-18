// models/professor.model.ts

import {User} from "./user.model";
import {Subject} from "./subject.model";

export interface Professor {
    id?: number;
    user?: User | null;
    subjects?: Subject[] | null;
}
