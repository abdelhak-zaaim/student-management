// models/payment.model.ts

import {Student} from "./student.model";
import {PaymentStatus} from "./payment-status .enum";

export interface Payment {
    id?: number;
    amount?: number;
    status?: PaymentStatus;
    date?: Date;
    student?: Student | null;
}
