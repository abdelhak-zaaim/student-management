// models/subject.model.ts

import {Professor} from "./professor.model";
import {Group} from "./group.model";

export interface Subject {
    id?: number;
    name?: string;
    description?: string;
    professors?: Professor[];
    studentGroups?: Group[];
}
