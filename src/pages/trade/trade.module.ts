import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TradePage } from './trade';

@NgModule({
  declarations: [
    TradePage,
  ],
  imports: [
    IonicPageModule.forChild(TradePage),
  ],
})
export class TradePageModule {}
