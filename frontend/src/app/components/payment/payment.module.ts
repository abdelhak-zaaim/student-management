import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListComponent } from './list/list.component';
import { MakePaymentComponent } from './make-payment/make-payment.component';
import { PaymentRoutingModule } from './payment-routing.module';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';

@NgModule({
  declarations: [ListComponent, MakePaymentComponent],
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    ToolbarModule,
    FileUploadModule,
    TableModule,
    PaginatorModule,
    DialogModule,
    RippleModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    PaymentRoutingModule,
    CalendarModule,
    InputNumberModule
  ],
  providers: [MessageService]
})
export class PaymentModule { }
