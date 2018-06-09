import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams, App } from 'ionic-angular';
import { AnonymousMessageIntoFileService } from '../../services/anonymousMessageIntoFile.service';
import { StoreDataService } from '../../services/storeDataService.service';

@IonicPage()
@Component({
  selector: 'profile-pic-modal-page',
  templateUrl: 'profilePicModal.html'
})
export class ProfilePicModalPage {
   
    chatToObj : any = {};
    chattingWindowPage: any = 'ChattingWindowPage';

    constructor(private app : App, private anonymousMessageIntoFileService : AnonymousMessageIntoFileService,
        private navParams: NavParams, private viewCtrl: ViewController, private storeDataService : StoreDataService){
        this.chatToObj = this.navParams.get('chatToObj');
    }
    closeModal() {
        this.viewCtrl.dismiss();
    }
    openChatWindow() {
        this.viewCtrl.dismiss();
        var myDetailObj = this.storeDataService.getMyDetailObj();
        this.app.getRootNav().push(this.chattingWindowPage, {
            chatToObj : this.chatToObj,
            myDetailObj : myDetailObj,
        });
    }
}