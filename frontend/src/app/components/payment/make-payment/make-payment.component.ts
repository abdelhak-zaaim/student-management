import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Payment } from '../../../models/payment.model';
import { PaymentService } from '../payment.service';
import { Student } from '../../../models/student.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PaymentStatus } from '../../../models/payment-status .enum';

interface PaymentStatusOption {
  label: string;
  value: PaymentStatus;
}

@Component({
  selector: 'app-make-payment',
  templateUrl: './make-payment.component.html',
  styleUrls: ['./make-payment.component.scss']
})
export class MakePaymentComponent implements OnInit {
  payment: Payment = {
    amount: 0,
    status: PaymentStatus.PENDING,
    date: new Date(),
    student: null
  };

  students: any[] = []; // Will store student options with displayName property
  statuses: PaymentStatusOption[] = [];
  submitted = false;
  loading = false;

  constructor(
    private paymentService: PaymentService,
    private messageService: MessageService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    this.initializeStatusOptions();
  }

  /**
   * Initialize the payment status dropdown options
   */
  initializeStatusOptions(): void {
    this.statuses = [
      { label: 'Submitted', value: PaymentStatus.SUBMITED },
      { label: 'Pending', value: PaymentStatus.PENDING },
      { label: 'Accepted', value: PaymentStatus.ACCEPTED },
      { label: 'Refused', value: PaymentStatus.REFUSED }
    ];
  }

  /**
   * Load all students for the dropdown
   */
  loadStudents(): void {
    this.loading = true;

    // Make sure we're using the correct API URL for students
    const url = `${environment.apiBaseUrl}/students`;

    this.http.get<Student[]>(url, { observe: 'response' }).subscribe(
      response => {
        const loadedStudents = response.body || [];

        // Create dropdown options with displayName for each student
        this.students = loadedStudents.map(student => ({
          ...student,
          displayName: `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim()
        }));

        console.log('Loaded students for dropdown:', this.students);
        this.loading = false;
      },
      error => {
        console.error('Error loading students:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load students: ' + (error.message || error),
          life: 3000
        });
        this.loading = false;
      }
    );
  }

  /**
   * Validate required fields and make payment
   */
  makePayment(): void {
    this.submitted = true;

    // Validate required fields
    if (!this.payment.amount || !this.payment.status || !this.payment.date || !this.payment.student) {
      // Display validation messages (handled by the template)
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields',
        life: 3000
      });
      return;
    }

    this.loading = true;

    // Prepare payment for saving
    const paymentToSave: Payment = {
      amount: this.payment.amount,
      status: this.payment.status,
      date: this.payment.date,
      student: this.payment.student
    };

    // Create new payment
    this.paymentService.create(paymentToSave).subscribe(
      response => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Payment Created Successfully',
          life: 3000
        });

        // Reset form or navigate to list
        setTimeout(() => {
          this.router.navigate(['/payments/list']);
        }, 1500);
      },
      error => {
        this.loading = false;
        console.error('Error creating payment:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create payment: ' + (error.message || error),
          life: 3000
        });
      }
    );
  }

  /**
   * Reset the form fields
   */
  resetForm(): void {
    this.submitted = false;
    this.payment = {
      amount: 0,
      status: PaymentStatus.PENDING,
      date: new Date(),
      student: null
    };
  }

  /**
   * Cancel and return to the payment list
   */
  cancel(): void {
    this.router.navigate(['/payments/list']);
  }
}
