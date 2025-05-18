// models/student-group.model.ts
import { Student } from './student.model';
import { Subject } from './subject.model';

export interface Group {
    id?: number;
    name?: string;
    description?: string;
    students?: Student[];
    subjects?: Subject[];
}
