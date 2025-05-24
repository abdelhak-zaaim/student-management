import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ListComponent } from "./list/list.component";
import { MakePaymentComponent } from "./make-payment/make-payment.component";

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'list', component: ListComponent },
        { path: 'add', component: MakePaymentComponent },
        { path: '', redirectTo: 'list', pathMatch: 'full' }
    ])],
    exports: [RouterModule]
})
export class PaymentRoutingModule { }
