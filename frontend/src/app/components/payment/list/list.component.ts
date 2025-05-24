import { Component, OnInit } from '@angular/core';
import { Payment } from '../../../models/payment.model';
import { PaymentService } from '../payment.service';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Student } from '../../../models/student.model';
import { StudentService } from '../../student/student.service';
import { PaymentStatus } from '../../../models/payment-status .enum';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

interface PaymentStatusOption {
  label: string;
  value: PaymentStatus;
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  payments: Payment[] | null = null;
  payment: Payment = { amount: 0, status: PaymentStatus.PENDING, date: new Date() };
  selectedPayments: Payment[] = [];

  students: any[] = []; // Will store student options with displayName property
  statuses: PaymentStatusOption[] = [];

  paymentDialog = false;
  deletePaymentDialog = false;
  deletePaymentsDialog = false;
  submitted = false;
  cols: any[] = [];

  constructor(
    private paymentService: PaymentService,
    private studentService: StudentService,
    private messageService: MessageService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadPayments();
    this.loadStudents();
    this.initializeStatusOptions();

    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'amount', header: 'Amount' },
      { field: 'status', header: 'Status' },
      { field: 'date', header: 'Date' },
      { field: 'student.user.firstName', header: 'Student' }
    ];
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
   * Load all payments from the server
   */
  loadPayments(): void {
    console.log("Loading payments...");

    // Make sure we're using the correct API URL
    if (!this.paymentService['resourceUrl'].includes(environment.apiBaseUrl)) {
      console.log('Adjusting payment service URL');
      this.paymentService['resourceUrl'] = `${environment.apiBaseUrl}/payments`;
    }

    this.paymentService.findAll().subscribe(
      response => {
        this.payments = response.body || [];
        console.log('Loaded payments:', this.payments);
      },
      error => {
        console.error('Error loading payments:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load payments: ' + (error.message || error),
          life: 3000
        });
      }
    );
  }

  /**
   * Load all students for the dropdown
   */
  loadStudents(): void {
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
      },
      error => {
        console.error('Error loading students:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load students: ' + (error.message || error),
          life: 3000
        });
      }
    );
  }

  /**
   * Initialize a new payment
   */
  openNew(): void {
    this.payment = {
      amount: 0,
      status: PaymentStatus.PENDING,
      date: new Date(),
      student: null
    };
    this.submitted = false;
    this.paymentDialog = true;
  }

  /**
   * Edit an existing payment
   */
  editPayment(payment: Payment): void {
    // Create a deep copy of the payment to avoid modifying the original
    this.payment = {
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      date: payment.date ? new Date(payment.date) : new Date(),
      student: payment.student
    };
    this.paymentDialog = true;
  }

  /**
   * Delete a single payment
   */
  deletePayment(payment: Payment): void {
    this.deletePaymentDialog = true;
    this.payment = { ...payment };
  }

  /**
   * Confirm and execute deletion of a payment
   */
  confirmDelete(): void {
    this.deletePaymentDialog = false;

    if (this.payment.id) {
      this.paymentService.delete(this.payment.id).subscribe(
        () => {
          // Remove from local array after successful deletion
          this.payments = this.payments!.filter(val => val.id !== this.payment.id);

          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Payment Deleted',
            life: 3000
          });

          // Reset current payment
          this.payment = { amount: 0, status: PaymentStatus.PENDING, date: new Date() };
        },
        error => {
          console.error('Error deleting payment:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete payment: ' + (error.message || error),
            life: 3000
          });
        }
      );
    }
  }

  /**
   * Open dialog to delete multiple payments
   */
  deleteSelectedPayments(): void {
    this.deletePaymentsDialog = true;
  }

  /**
   * Confirm and execute deletion of multiple payments
   */
  confirmDeleteSelected(): void {
    this.deletePaymentsDialog = false;

    // Use Promise.all to handle multiple deletion requests
    const deletePromises: Promise<any>[] = [];

    this.selectedPayments.forEach(payment => {
      if (payment.id) {
        const deletePromise = new Promise<void>((resolve, reject) => {
          this.paymentService.delete(payment.id!).subscribe(
            () => resolve(),
            error => reject(error)
          );
        });
        deletePromises.push(deletePromise);
      }
    });

    // Wait for all deletion operations to complete
    Promise.all(deletePromises)
      .then(() => {
        // Remove all deleted payments from the local array
        this.payments = this.payments!.filter(
          payment => !this.selectedPayments.some(selected => selected.id === payment.id)
        );

        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Payments Deleted',
          life: 3000
        });

        // Clear selection
        this.selectedPayments = [];
      })
      .catch(error => {
        console.error('Error deleting payments:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete payments: ' + (error.message || error),
          life: 3000
        });
      });
  }

  /**
   * Close the payment dialog
   */
  hideDialog(): void {
    this.paymentDialog = false;
    this.submitted = false;
  }

  /**
   * Save the payment (create or update)
   */
  savePayment(): void {
    this.submitted = true;

    // Validate required fields
    if (!this.payment.amount || !this.payment.status || !this.payment.date || !this.payment.student) {
      // Display validation messages (handled by the template)
      return;
    }

    // Prepare payment for saving
    const paymentToSave: Payment = {
      id: this.payment.id,
      amount: this.payment.amount,
      status: this.payment.status,
      date: this.payment.date,
      student: this.payment.student
    };

    if (paymentToSave.id) {
      // Update existing payment
      this.paymentService.update(paymentToSave).subscribe(
        response => {
          const updatedPayment = response.body || paymentToSave;

          // Update in local array
          const index = this.findIndexById(paymentToSave.id!);
          if (index !== -1 && this.payments) {
            this.payments[index] = updatedPayment;
          } else {
            this.loadPayments(); // Reload if not found
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Payment Updated',
            life: 3000
          });

          this.paymentDialog = false;
          this.payment = { amount: 0, status: PaymentStatus.PENDING, date: new Date() };
        },
        error => {
          console.error('Error updating payment:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update payment: ' + (error.message || error),
            life: 3000
          });
        }
      );
    } else {
      // Create new payment
      this.paymentService.create(paymentToSave).subscribe(
        response => {
          const newPayment = response.body || paymentToSave;

          // Add to local array
          if (this.payments) {
            this.payments.push(newPayment);
          } else {
            this.loadPayments(); // Reload if array not initialized
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Payment Created',
            life: 3000
          });

          this.paymentDialog = false;
          this.payment = { amount: 0, status: PaymentStatus.PENDING, date: new Date() };
        },
        error => {
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
  }

  /**
   * Find a payment's index by ID
   */
  findIndexById(id: number): number {
    if (!this.payments) return -1;
    return this.payments.findIndex(payment => payment.id === id);
  }

  /**
   * Handle global filter input events
   */
  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
