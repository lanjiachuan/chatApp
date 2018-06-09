import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfilePicModalPage } from './profilePicModal';

@NgModule({
  declarations: [ProfilePicModalPage],
  imports: [IonicPageModule.forChild(ProfilePicModalPage)],
})
export class ProfilePicModalModule {}