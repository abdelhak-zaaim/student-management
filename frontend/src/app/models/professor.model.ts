// models/professor.model.ts

import {User} from "./user.model";
import {Subject} from "./subject.model";
import {Group} from "./group.model";

export interface CourseAssignment {
    id?: number;
    studentGroup: Group;
    subject: Subject;
}

export interface Professor {
    id?: number;
    user?: User | null;
    subjects?: Subject[] | null;
    courseAssignments?: CourseAssignment[];
}
