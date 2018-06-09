import { Component, ViewChild, NgZone } from '@angular/core';
import { SQLiteObject } from '@ionic-native/sqlite';
import { Network } from '@ionic-native/network';
import { ChatService } from '../../services/chat.service';
import { BroadcasterService } from '../../services/broadcaster.service';
import { NavParams, Platform, App, IonicPage, NavController, PopoverController, Slides, Content, Scroll } from 'ionic-angular';
import { LocalNotificationService } from '../../services/localNotifications.service';
import { AnonymousMessageIntoFileService } from '../../services/anonymousMessageIntoFile.service';
import { FileOperationService } from '../../services/fileOperation.service';
import { StoreDataService } from '../../services/storeDataService.service';
import * as firebase from 'firebase';
import { FCM } from '@ionic-native/fcm';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/take'; 
import { SettingPopoverPage } from '../popovers/settingPopover';
import { StatusBar } from '@ionic-native/status-bar';
import {style, state, animate, transition, trigger} from '@angular/core';
declare var MyCordovaPlugin:any;

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
  animations: [
    trigger('fadeInOut', [
      // state('void', style({transform:'scale(1)',  backgroundColor: '#eee'}) ),
      // state('*', style({transform: 'scale(1.1)', backgroundColor: '#cfd8dc'}) ),
      // transition('void => *', [
      //     animate('100ms ease-in')
      // ]),
      // transition('* => void', [
      //     animate('100ms ease-out')
      // ])
      transition(':enter', [   // :enter is alias to 'void => *'
        style({transform:'scale(0)'}),
        animate(200, style({transform:'scale(1)'})) 
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        style({transform:'scale(1)'}),
        animate(500, style({transform:'scale(0)'})) 
      ])
    ])
  ]
})
export class TabsPage {
  
  @ViewChild("contentRef") contentHandle: Content;
  @ViewChild(Slides) slides: Slides;
  @ViewChild(Scroll) scroll: Scroll;

  friendListgPage = 'FriendListPage';
  chattingPage = 'ChattingPage';
  myRandomId : any;
  sqlStorageDB : SQLiteObject;
  connection;
  messages : Array<any> = [];
  friendListgPageData : any = {};
  chattingPageData : any = {};
  deviceType : any; //1 for mobile , 2 for browser
  myDetailObj: any = {};
  ChattingWindowPage : any = 'ChattingWindowPage';
  selectedTab : any = 'chatbubbles';
  showHeaderBar : boolean = true;
  scrollTo : any;

  constructor(private zone : NgZone, private statusBar: StatusBar, 
    private storeDataService : StoreDataService,
    private popoverCtrl: PopoverController, private fileOperationService : FileOperationService,
    private angularFireDatabase: AngularFireDatabase, private navCtrl: NavController, 
    private platform: Platform, private localNotificationService: LocalNotificationService,
    private broadcasterService : BroadcasterService, 
    private chatService:ChatService, private navParams: NavParams,
    private anonymousMessageIntoFileService: AnonymousMessageIntoFileService,
    private fcm: FCM, private app: App, private network: Network) {

      console.log('TabsPage : constructor');
      platform.ready().then(() => {
        if(this.platform.is('core') || this.platform.is('mobileweb')) {
          //in Browser
            this.deviceType = 2;
        } else {
            //in App
            statusBar.backgroundColorByHexString('#f22c11');
            if (typeof MyCordovaPlugin != 'undefined') {
              MyCordovaPlugin.startService();
            }
            fcm.getToken().then(token => {
              console.log('token :- ' + token);
              this.putTokenToDB(token);
            });
            fcm.onNotification().subscribe(data => {
              var messageObject : any = JSON.parse(data.messageObj);
              console.log('onNotification');
              console.log(messageObject);
              if(data.wasTapped) {
                console.log(messageObject);
                console.log("Received in background");

              } else {
                               
                console.log("TabsPage : onNotification : Received in foreground");
                              
                  if(this.navCtrl.getActive().id != 'ChattingWindowPage') {
                    var chatToObj = {
                      chatToUserName : messageObject.messageArray[0].senderName,
                      chatToUserId : messageObject.messageArray[0].from
                    }
                    var tempMessageArray = [];
                    var chatttingFileName = messageObject.messageArray[0].from;
                    messageObject.messageArray.forEach(element => {
                      let copy = Object.assign({}, element);
                      tempMessageArray.push(this.createMessageObj(copy));
                    });
                    console.log(messageObject.messageArray);
                    console.log(chatttingFileName);
                    this.fileOperationService.readFile('ChattingApp',chatttingFileName+'.db.json').subscribe((chattingMessageObj:any) => {
                      if(chattingMessageObj && chattingMessageObj.chattingMessage && chattingMessageObj.chattingMessage.length>0) {
                        console.log('TabsPage : onNotification : concat array before length :- '+tempMessageArray.length);
                        console.log(chattingMessageObj.chattingMessage);
                        chattingMessageObj.chattingMessage.push(...tempMessageArray);
                        console.log('TabsPage : onNotification : concat array after length :- '+tempMessageArray.length);
                        console.log(chattingMessageObj.chattingMessage);
                      } else {
                        chattingMessageObj = {}
                        chattingMessageObj.chattingMessage = [];
                        chattingMessageObj.chattingMessage = tempMessageArray;
                      }
                      this.anonymousMessageIntoFileService.insertIntoChattingFile(chatttingFileName,chattingMessageObj.chattingMessage).subscribe(fileWritten=> {
                        console.log('TabsPage : onNotification :  getMyDetailObjFromLocalFile');
                        var myDetailObj = this.storeDataService.getMyDetailObj();
                        if(myDetailObj) {
                          console.log('TabsPage : getMyDetailFromLocalFile : fetched myDetailObj not null');
                          console.log(myDetailObj);
                          this.broadcasterService.broadcast('newMessage-chatting', messageObject.messageArray);
                          this.app.getRootNav().push(this.ChattingWindowPage, {
                            chatToObj : chatToObj,
                            myDetailObj : myDetailObj
                          });
                        } else {
                          console.log('TabsPage : getMyDetailFromLocalFile : fetched myDetailObj is null');
                        }
                        // this.anonymousMessageIntoFileService.getMyDetailObjFromLocalFile().subscribe((myDetailObj) => {
                        //   console.log('TabsPage : getMyDetailFromLocalFile : fetched');
                        //   if(myDetailObj) {
                        //     console.log('TabsPage : getMyDetailFromLocalFile : fetched myDetailObj not null');
                        //     this.broadcasterService.broadcast('newMessage-chatting', messageObject.messageArray);
                            
                        //     this.app.getRootNav().push(this.ChattingWindowPage, {
                        //       chatToObj : chatToObj,
                        //       myDetailObj : myDetailObj
                        //     });
                        //   } else {
                        //     console.log('TabsPage : getMyDetailFromLocalFile : fetched myDetailObj is null');
                        //   }
                        // });
                      });
                    });
                    //this.insertIntoFiles(messageObj);
                  } else {
                    this.broadcasterService.broadcast('newMessage-chattingWindow', messageObject.messageArray);
                  }

              };
            });
            
            fcm.onTokenRefresh().subscribe(token => {
              console.log('token :- ' + token);
              this.putTokenToDB(token);
            });
            // this.network.onDisconnect().subscribe(() => {
            //   console.log('TabsPage : constructor : network was disconnected :-(');
            //   console.log('TabsPage : constructor : call chatService : disconnectClient');
            //   this.chatService.disconnectClient();
            // });
            this.onLocalNotificationClick();
        }     
      });
    }

  ngOnInit() {
    console.log('TabsPage : ngOnInit : start');
    this.myRandomId = this.navParams.get('myRandomId');
    if(this.platform.is('core') || this.platform.is('mobileweb')) {
      //in Browser
        this.deviceType = 2;
    } else {
        //in App
        this.deviceType = 1;
        console.log('TabsPage : ngOnInit : call initiate-socket : myRandomId :- '+this.myRandomId);
        this.broadcasterService.broadcast('initiate-socket', this.myRandomId);
    }
    if(this.myRandomId) {
        this.friendListgPageData.myRandomId = this.myRandomId;
        this.chattingPageData.myRandomId = this.myRandomId;
        console.log('TabsPage : ngOnInit : call receiveMessgaes');
        this.receiveMessgaes();
    }
    console.log('TabsPage : ngOnInit : call getAllProfilePics');
    this.getAllProfilePics();
    console.log('TabsPage : ngOnInit : call getMyDetailObjFromLocalFile');
    this.getMyDetailFromLocalFile();
    document.addEventListener('pause', () => {
      console.log('TabsPage : ngOnInit : pause');
      var myDetailObj = this.storeDataService.getMyDetailObj();
      if(myDetailObj) {
        console.log('TabsPage : ngOnInit : pause : myDetailObj is not empty');
          firebase.database().ref("ChatActiveUsers/"+myDetailObj.key).update({isOnline: 0});
      } else {
        console.log('TabsPage : ngOnInit : pause : myDetailObj is empty');
      }
    });
    document.addEventListener('resume', () => {
      console.log('TabsPage : ngOnInit : resume');
      var myDetailObj = this.storeDataService.getMyDetailObj();
      if(myDetailObj) {
        console.log('TabsPage : ngOnInit : resume : myDetailObj is not empty');
        firebase.database().ref("ChatActiveUsers/"+myDetailObj.key).update({isOnline: 1});
      } else {
        console.log('TabsPage : ngOnInit : resume : myDetailObj is empty');
      }
    });

    console.log('TabsPage : ngOnInit : end');
  }
  ionViewDidLoad() {
    console.log("ionViewDidLoad");
  }
  ionViewDidEnter() {
    console.log("ionViewDidEnter");
    this.platform.ready().then(() => {
      this.statusBar.backgroundColorByHexString('#f22c11');
    })
  }
  ngAfterViewInit() {
    this.scroll.addScrollEventListener(this.scrollingFun.bind(this));
  } 
  putTokenToDB(token) {
    console.log('TabsPage : putTokenToDB : start');
    if(!this.myRandomId) {
      console.log('TabsPage : putTokenToDB : myRandomId is null');
      this.myRandomId = this.navParams.get('myRandomId');
    }
    firebase.database().ref('/ChatActiveUsers').orderByChild('myRandomId').equalTo(this.myRandomId).once('value', (snapshot) => {
      console.log('TabsPage : putTokenToDB : ChatActiveUsers data fetched');
      var chatActiveUsersObj = snapshot.val();
      if(chatActiveUsersObj == null) {
        console.log('TabsPage : putTokenToDB : deviceTokenObject is null');
      } else {
        var keyTemp = '';
        for(var key in chatActiveUsersObj){
          keyTemp = key;
        }
        firebase.database().ref("ChatActiveUsers/"+keyTemp).update({deviceToken: token});
        console.log('TabsPage : putTokenToDB : deviceTokenObject is not null');
      }
    });
    console.log('TabsPage : putTokenToDB : end');
  }
  receiveMessgaes() {
    console.log('TabsPage : receiveMessgaes : start');
    this.connection = this.chatService.getMessages(this.myRandomId).subscribe((messageObj: any) => {
      if(messageObj.messageAck) {
        return false;
      }
        console.log('TabsPage : receiveMessgaes : New message received');
        console.log(messageObj);
        if(this.platform.is('core') || this.platform.is('mobileweb')) {
          //in Browser
          this.deviceType = 2;
          this.broadcasterService.broadcast('newMessage-chattingWindow', messageObj);
        } else {
          //mobile
          let currentPage = this.navCtrl.getActive().id;
          console.log(currentPage);
          var chattingMessage = Object.assign({},messageObj);
          chattingMessage.chattingKey = messageObj.from;
          chattingMessage.chatToUserName = messageObj.senderName;
          chattingMessage.chatToUserId = messageObj.from;
          if (currentPage != 'ChattingWindowPage') {
            console.log('TabsPage : receiveMessgaes : currentPage : ' + currentPage);
            console.log('TabsPage : receiveMessgaes : call broadcasting newMessage');
            console.log('TabsPage : receiveMessgaes : call showLocalNotification');
            this.showLocalNotification(messageObj);
          } else {
            this.broadcasterService.broadcast('newMessage-chattingWindow', messageObj);
          }
          this.broadcasterService.broadcast('newMessage-chatting', chattingMessage);
        }
      });
    console.log('TabsPage : receiveMessgaes : end');
  }

  showLocalNotification(messageObj) {
    console.log('TabsPage : showLocalNotification : start');
    this.localNotificationService.triggerLocalNotification(messageObj).subscribe(element=>{
      if(element) {
        console.log('TabsPage : showLocalNotification : triggerLocalNotification : notification triggered');
        this.insertIntoFiles(messageObj);
      }
    });
    console.log('TabsPage : receiveMessgaes : showLocalNotification : end');
  }
  insertIntoFiles(messageObj) {
    console.log('TabsPage : insertIntoFiles : start');
    var messageObjTemp = this.createMessageObj(messageObj);
    this.storeDataService.setChattingWindowListObj(messageObjTemp,messageObjTemp.from).subscribe(()=>{
      console.log('TabsPage : insertIntoFiles : storeDataService.setChattingWindowListObj success');
      //this.broadcasterService.broadcast('newMessage-chatting', messageObj);
    })
    // this.anonymousMessageIntoFileService.insertIntoChattingFile(messageObj.from,messageObjTemp).subscribe(fileWritten=> {
    //   this.broadcasterService.broadcast('newMessage-chatting', messageObj);
    //   console.log('TabsPage : showLocalNotification : triggerLocalNotification : insertIntoChatUserFile : file written');
    // });
    console.log('TabsPage : insertIntoFiles : start');
  }
  createMessageObj(messageObj:any) {
    console.log('TabsPage : createMessageObj : start');
    messageObj.position = (messageObj.from == this.myDetailObj.myRandomId) ? 'right' : 'left';
    console.log(messageObj);
    console.log('TabsPage : createMessageObj : newMsg created');
    console.log('TabsPage : createMessageObj : end');
    return messageObj;
  }
  getMyDetailFromLocalFile() {
    console.log('TabsPage : getMyDetailFromLocalFile : start');
    if(this.platform.is('core') || this.platform.is('mobileweb')) {
        //in Browser
        this.deviceType = 2;
    } else {
        //in App
        console.log('TabsPage : getMyDetailFromLocalFile : fetch from file');
        // this.anonymousMessageIntoFileService.getMyDetailObjFromLocalFile().subscribe((myDetailObj) => {
        //   console.log('TabsPage : getMyDetailFromLocalFile : fetched');
        //   if(myDetailObj) {
        //     console.log('TabsPage : getMyDetailFromLocalFile : fetched myDetailObj not null');
        //       this.myDetailObj = myDetailObj;
        //       console.log(this.myDetailObj);
        //       console.log('TabsPage : ngOnInit : update ChatActiveUsers online to 1');
        //       firebase.database().ref("ChatActiveUsers/"+this.myDetailObj.key).update({isOnline: 1});
        //   } else {
        //     console.log('TabsPage : getMyDetailFromLocalFile : fetched myDetailObj is null');
        //   }
        // });
        var myDetailObj = this.storeDataService.getMyDetailObj();
        if(myDetailObj) {
            console.log('TabsPage : getMyDetailFromLocalFile : fetched myDetailObj not null');
            this.myDetailObj = myDetailObj;
            console.log(this.myDetailObj);
            console.log('TabsPage : ngOnInit : update ChatActiveUsers online to 1');
            firebase.database().ref("ChatActiveUsers/"+this.myDetailObj.key).update({isOnline: 1});
        } else {
          console.log('TabsPage : getMyDetailFromLocalFile : fetched myDetailObj is null');
        }
    }
    console.log('TabsPage : getMyDetailFromLocalFile : end');
  }
  onLocalNotificationClick() {
    console.log('TabsPage : onLocalNotificationClick : start');
    this.localNotificationService.onLocalNotificationClick().subscribe((messageObj:any)=>{
      console.log('TabsPage : onLocalNotificationClick : messageObj received');
      console.log(messageObj);
      if(messageObj.notificationArray.length>0) {
        var chatUpdateObjIndex : number;
        var firstObjctFrom = messageObj.notificationArray[0].from;
        messageObj.notificationArray.map((element, index) => {
            if(element.from != firstObjctFrom) {
                chatUpdateObjIndex = index
                return true;
            }
        }); 
        if(chatUpdateObjIndex>=0) {
          return;
        }
        var chatToObj = {
          chatToUserName : messageObj.notificationArray[0].senderName,
          chatToUserId : messageObj.notificationArray[0].from
        }
        this.app.getRootNav().push(this.ChattingWindowPage, {
          chatToObj : chatToObj,
          myDetailObj : this.myDetailObj
        });
      }
    });
    console.log('TabsPage : onLocalNotificationClick : end');
  } 
  getAllProfilePics() {
    console.log('TabsPage : getAllProfilePics : start');
    this.angularFireDatabase.list('/usersProfilePic', { preserveSnapshot: true})
    .subscribe(snapshots => {
        var profilePicsDBObj = {};
        if(snapshots != null) {
          snapshots.forEach((snapshot, index, array) => {      
              console.log('TabsPage : getAllProfilePics : snapshots');    
              var profilePicObj = snapshot.val();
              if(!profilePicObj.myRandomId || profilePicObj.myRandomId == this.myRandomId) {
                return;
              }
              profilePicsDBObj[profilePicObj.myRandomId] = {
                "profilePicUrl" : profilePicObj.profilePicUrl
              }
        });
        console.log('TabsPage : getAllProfilePics : call anonymousMessageIntoFileService : updateProfilePic');
        this.anonymousMessageIntoFileService.updateProfilePicService(profilePicsDBObj);
      }
    });
    console.log('TabsPage : getAllProfilePics : end');
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(SettingPopoverPage);
    popover.present({
      ev: myEvent
    });
  }
  slideChanged(slides) {
    let currentIndex = slides.getActiveIndex();
    console.log('Current index is', currentIndex);
    if(currentIndex == 0) {
      this.selectedTab = 'chatbubbles';
    } else if(currentIndex == 1) {
      this.selectedTab = 'contacts';
    }
  }
  changeSlide(slideIndex) {
    this.slides.slideTo(slideIndex, 500);
  }
  scrollingFun(e) {
    
    console.log('e.scrollTop :- ' + e.target.scrollTop);
    console.log('e.scrollTo :- ' + this.scrollTo);
    if(document) {
      if(!this.scrollTo) {
        console.log('!this.scrollTo');
        this.zone.run(() => {
          this.showHeaderBar = false;
          if(document.querySelector(".scroll-content")) {
            document.querySelector(".scroll-content")['style'].marginTop = 0;
            document.querySelector("#tabSlides")['style'].marginTop = 42+'px';
            document.querySelector(".tab-segment")['style'].zIndex = 11;
            document.querySelector(".tab-segment")['style'].position = 'fixed';
          }
        });
        //this.showHeaderBar = false;
      } else {
        if (this.scrollTo < e.target.scrollTop) {
          console.log('this.scrollTo < e.scrollTop');
          this.zone.run(() => {
            if(document.querySelector(".scroll-content")) {
              document.querySelector(".scroll-content")['style'].marginTop = 0;
              document.querySelector("#tabSlides")['style'].marginTop = 42+'px';
              document.querySelector(".tab-segment")['style'].zIndex = 11;
              document.querySelector(".tab-segment")['style'].position = 'fixed';
            }
            this.showHeaderBar = false;
          });
        } else {
          console.log('this.scrollTo < e.target.scrollTop');
          this.zone.run(() => {
            if(document.querySelector(".scroll-content")) {
              document.querySelector(".scroll-content")['style'].marginTop = 56+'px';
            }
            this.showHeaderBar = true;
            if(e.target.scrollTop <=0){
              document.querySelector(".tab-segment")['style'].position = 'initial';
              document.querySelector("#tabSlides")['style'].marginTop = 'auto';
              document.querySelector(".tab-segment")['style'].zIndex = 'initial';
              document.querySelector(".tab-segment")['style'].display = 'inline-flex';
            }
          });
  
        }
      }
      this.scrollTo = e.target.scrollTop;
    }
  }
}
