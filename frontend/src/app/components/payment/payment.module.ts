import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListComponent} from "./list/list.component";
import {UpdateComponent} from "./update/update.component";
import {PaymentComponent} from "./payment.component";


@NgModule({
    declarations: [ListComponent, UpdateComponent, PaymentComponent],
    imports: [
        CommonModule
    ]
})
export class PaymentModule {
}
