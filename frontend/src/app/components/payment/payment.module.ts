import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListComponent} from "./list/list.component";
import {UpdateComponent} from "./update/update.component";
import {PaymentComponent} from "./payment.component";
import {PaymentRoutingModule} from "./payment-routing.module";


@NgModule({
    declarations: [ListComponent, UpdateComponent, PaymentComponent],
    imports: [
        CommonModule,
        PaymentRoutingModule
    ]
})
export class PaymentModule {
}
