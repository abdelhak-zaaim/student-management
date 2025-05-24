import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Payment } from '../../../models/payment.model';
import { PaymentService } from '../payment.service';
import { Student } from '../../../models/student.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PaymentStatus } from '../../../models/payment-status .enum';
import { PdfGeneratorService } from '../../../services/pdf-generator.service';

// Define an interface that extends Student with displayName
interface StudentWithDisplayName extends Student {
  displayName: string;
}

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

  students: StudentWithDisplayName[] = []; // Using the extended interface
  statuses: PaymentStatusOption[] = [];
  submitted = false;
  loading = false;

  // Receipt related properties
  createdPayment: Payment | null = null;
  receiptDialog = false;
  isLoading = false;

  constructor(
    private paymentService: PaymentService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private pdfGenerator: PdfGeneratorService
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    this.initializeStatusOptions();
    this.checkForPreselectedStudent();
  }

  /**
   * Check if a student ID was passed in the URL query params
   */
  checkForPreselectedStudent(): void {
    this.route.queryParams.subscribe(params => {
      if (params['studentId']) {
        // We need to load the student details first
        const studentId = params['studentId'];
        const url = `${environment.apiBaseUrl}/students/${studentId}`;

        this.http.get<Student>(url, { observe: 'response' }).subscribe(
          response => {
            if (response.body) {
              const student = response.body;
              // Create a display name but don't add it to the student object directly
              const displayName = `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim();

              // Find the student with displayName in our loaded students array
              const studentWithDisplay = this.students.find(s => s.id === student.id);

              if (studentWithDisplay) {
                // If found in our array, use that one
                this.payment.student = studentWithDisplay;
              } else {
                // Otherwise, use the fetched student (without displayName)
                this.payment.student = student;
              }
            }
          },
          error => {
            console.error('Error fetching preselected student:', error);
          }
        );
      }
    });
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

        // Create dropdown options with displayName property
        this.students = loadedStudents.map(student => {
          const displayName = `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim();
          return {
            ...student,
            displayName
          } as StudentWithDisplayName;
        });

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

        // Store the created payment for receipt
        this.createdPayment = response.body;

        // Show receipt dialog
        this.receiptDialog = true;
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
   * Generate and download receipt as PDF
   */
  downloadReceipt(): void {
    if (!this.createdPayment) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No payment data available for receipt generation',
        life: 3000
      });
      return;
    }

    try {
      // Generate the PDF document
      const doc = this.pdfGenerator.generatePaymentReceipt(this.createdPayment);

      // Generate a suitable filename
      let filename = `payment-receipt`;
      if (this.createdPayment.id) filename += `-${this.createdPayment.id}`;
      if (this.createdPayment.student?.user) {
        const studentName = `${this.createdPayment.student.user.lastName || ''}-${this.createdPayment.student.user.firstName || ''}`.trim();
        if (studentName) filename += `-${studentName}`;
      }
      filename += '.pdf';

      // Download the PDF
      this.pdfGenerator.downloadPdf(doc, filename);

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Receipt downloaded successfully!',
        life: 3000
      });
    } catch (error) {
      console.error('Error generating receipt:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to generate receipt PDF',
        life: 3000
      });
    }
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
