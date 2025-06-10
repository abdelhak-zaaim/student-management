import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Payment } from '../models/payment.model';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {
  constructor(private datePipe: DatePipe) {}

  /**
   * Generate a PDF receipt for a payment
   * @param payment Payment data to include in the receipt
   * @returns The generated PDF document
   */
  generatePaymentReceipt(payment: Payment): jsPDF {
    // Create a new PDF document
    const doc = new jsPDF();

    // Format date for display
    const formattedDate = payment.date ? this.datePipe.transform(payment.date, 'MMM dd, yyyy hh:mm a') : 'N/A';

    // Set document properties
    doc.setProperties({
      title: `Receipt - Payment #${payment.id || 'New'}`,
      subject: 'Payment Receipt',
      author: 'BEGENIUS',
      creator: 'BEGENIUS'
    });

    // Add company/school logo header
    doc.setFontSize(22);
    doc.setTextColor(44, 98, 168); // Primary blue color
    doc.text('BEGENIUS', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    // Receipt title
    doc.setFontSize(18);
    doc.setTextColor(68, 68, 68);
    doc.text('PAYMENT RECEIPT', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

    // Add a horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, 35, doc.internal.pageSize.getWidth() - 15, 35);

    // Receipt details section
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);

    // Payment details column
    let y = 50;
    doc.text('Receipt Details:', 15, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Receipt #: ${payment.id || 'Pending'}`, 15, y);
    y += 6;
    doc.text(`Date: ${formattedDate}`, 15, y);
    y += 6;
    doc.text(`Status: ${payment.status || 'Pending'}`, 15, y);

    // Student details column
    y = 50;
    doc.setFontSize(12);
    doc.text('Student Information:', doc.internal.pageSize.getWidth() - 15, y, { align: 'right' });
    y += 8;
    doc.setFontSize(10);

    // Check if student data exists
    if (payment.student && payment.student.user) {
      const studentName = `${payment.student.user.firstName || ''} ${payment.student.user.lastName || ''}`.trim();
      doc.text(`Name: ${studentName || 'N/A'}`, doc.internal.pageSize.getWidth() - 15, y, { align: 'right' });
      y += 6;
      doc.text(`Group: ${payment.student.studentGroup?.name || 'N/A'}`, doc.internal.pageSize.getWidth() - 15, y, { align: 'right' });
      y += 6;
      doc.text(`ID: ${payment.student.id || 'N/A'}`, doc.internal.pageSize.getWidth() - 15, y, { align: 'right' });
    } else {
      doc.text('Student: Not specified', doc.internal.pageSize.getWidth() - 15, y, { align: 'right' });
    }

    // Add payment line items table
    autoTable(doc, {
      startY: 90,
      head: [['Description', 'Amount']],
      body: [
        ['Tuition Payment', payment.amount ? `${payment.amount.toFixed(2)} MAD` : '0.00 MAD']
      ],
      foot: [
        ['Total', payment.amount ? `${payment.amount.toFixed(2)} MAD` : '0.00 MAD']
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [44, 98, 168],
        textColor: 255
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [44, 98, 168],
        fontStyle: 'bold'
      }
    });

    // Add footer with terms
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text('Thank you for your payment!', doc.internal.pageSize.getWidth() / 2, finalY, { align: 'center' });
    doc.setFontSize(8);
    doc.text('This is an electronically generated receipt and does not require a signature.',
             doc.internal.pageSize.getWidth() / 2, finalY + 5, { align: 'center' });

    // Add a timestamp footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const generatedDate = this.datePipe.transform(new Date(), 'MMM dd, yyyy hh:mm:ss a') || new Date().toString();
    doc.text(`Generated on: ${generatedDate}`,
             doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    return doc;
  }

  /**
   * Save the PDF document with the given filename
   * @param doc PDF document to save
   * @param filename Name to use for the downloaded file
   */
  downloadPdf(doc: jsPDF, filename: string): void {
    doc.save(filename);
  }
}
