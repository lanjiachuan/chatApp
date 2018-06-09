import { NgModule, ErrorHandler, enableProdMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SettingPopoverPage } from '../pages/popovers/settingPopover';

/*services*/
import { ChatService }  from '../services/chat.service';
import { BroadcasterService } from '../services/broadcaster.service';
import  { FileOperationService } from '../services/fileOperation.service';
import { LocalNotificationService } from '../services/localNotifications.service';
import { AnonymousMessageIntoFileService } from '../services/anonymousMessageIntoFile.service';
import { StoreDataService } from '../services/storeDataService.service';

/*native*/
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { File } from '@ionic-native/file';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { FCM } from '@ionic-native/fcm';
import { Network } from '@ionic-native/network';
import { Keyboard } from '@ionic-native/keyboard';
import { Camera } from '@ionic-native/camera';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Device } from '@ionic-native/device';

/*firebase*/
import { AngularFireModule } from 'angularfire2';
import { FirebaseConfig } from './../environments/firebase.config';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import * as firebase from 'firebase';

firebase.initializeApp(FirebaseConfig);

/*sql lite*/
import { SQLite } from '@ionic-native/sqlite';

enableProdMode();

@NgModule({
  declarations: [
    MyApp,
    SettingPopoverPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(FirebaseConfig),
    AngularFireDatabaseModule,
    BrowserAnimationsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SettingPopoverPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ChatService,
    SQLite,
    BroadcasterService,
    LocalNotifications,
    File,
    AndroidPermissions,
    FCM,
    Network,
    Keyboard,
    Camera,
    FileTransfer,
    FileOperationService,
    LocalNotificationService,
    StoreDataService,
    AnonymousMessageIntoFileService,
    Device,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
