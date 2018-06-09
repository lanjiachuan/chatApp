import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChattingPage } from './chatting';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  declarations: [ChattingPage],
  imports: [IonicPageModule.forChild(ChattingPage),
    PipesModule],
    exports: [
      ChattingPage
    ],
})
export class ChattingPageModule {}