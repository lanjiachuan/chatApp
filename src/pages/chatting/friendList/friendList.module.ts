import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FriendListPage } from './friendList';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  declarations: [FriendListPage],
  imports: [IonicPageModule.forChild(FriendListPage),
    PipesModule
  ],
  exports: [
    FriendListPage
  ],
})
export class FriendListPageModule {}