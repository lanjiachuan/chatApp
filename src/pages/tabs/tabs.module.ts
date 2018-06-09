import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TabsPage } from './tabs';
import { ChattingPageModule } from '../chatting/chatting/chatting.module';
import { FriendListPageModule } from '../chatting/friendList/friendList.module';

@NgModule({
  declarations: [TabsPage],
  imports: [IonicPageModule.forChild(TabsPage),ChattingPageModule,FriendListPageModule],
})
export class TabsPageModule {}