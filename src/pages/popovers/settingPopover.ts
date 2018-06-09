import { Component } from '@angular/core';
import { ViewController, App, NavParams} from 'ionic-angular';

@Component({
    templateUrl: 'settingPopover.html'
  })
export class SettingPopoverPage {

    ProfilePicPage = 'ProfilePicPage';
    constructor(public viewCtrl: ViewController, private app: App) {}

    close() {
      this.viewCtrl.dismiss();
    }
    openProfilePic() {
        this.viewCtrl.dismiss();
        this.app.getRootNav().push(this.ProfilePicPage);
    }
}