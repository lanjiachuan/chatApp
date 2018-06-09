import { Component, OnInit, ViewChild, trigger, state, animate, style, transition } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { NavController, NavParams, IonicPage, Platform } from 'ionic-angular';
import { FileOperationService } from '../../../services/fileOperation.service';
import { LocalNotificationService } from '../../../services/localNotifications.service';
import { AnonymousMessageIntoFileService } from '../../../services/anonymousMessageIntoFile.service';
import { StoreDataService } from '../../../services/storeDataService.service';
import { BroadcasterService } from '../../../services/broadcaster.service';
import { Keyboard } from '@ionic-native/keyboard';
import * as firebase from 'firebase';
import { StatusBar } from '@ionic-native/status-bar';

@IonicPage()
@Component({
    selector: 'chatting-window-page',
    templateUrl: 'chattingWindow.html',
    animations: [
        trigger('flyInOut', [
          state('in', style({transform: 'translateX(0)'})),
          transition('void => *', [
            style({transform: 'translateX(-100%)'}),
            animate(100)
          ]),
          transition('* => void', [
            animate(100, style({transform: 'translateX(100%)'}))
          ])
        ])
      ]
})

export class ChattingWindowPage implements OnInit {
    
    messages = [];
    connection;
    myDetailObj : any;
    newMessage : any;
    chatToObj : any;
    //chattingListObj : any = {};
    anonymousUserMessages : any = [];
    deviceType:any;
    broadcasterServiceObj : any;
    @ViewChild('chattingWindow') chattingWindow;
    @ViewChild('messageInput') messageInput;

    constructor(private statusBar: StatusBar, private storeDataService : StoreDataService,
        private broadcasterService : BroadcasterService, private platform: Platform, 
        private fileOperationService: FileOperationService, 
        public navCtrl: NavController, public navParams: NavParams, 
        private chatService : ChatService, private localNotificationService: LocalNotificationService,
        private anonymousMessageIntoFileService: AnonymousMessageIntoFileService,
        private keyboard: Keyboard) {
            console.log('ChattingWindowPage : constructor');
            this.keyboard.onKeyboardShow().subscribe(()=>{
                this.chattingWindow.scrollToBottom(300);
            });
            platform.ready().then(() => {
                statusBar.backgroundColorByHexString('#6A1B9A');
            });
    }
    ngOnInit() {
        console.log('ChattingWindowPage : ngOnInit : start');
        this.chatToObj = this.navParams.get('chatToObj');
        console.log(this.chatToObj);
        console.log('ChattingWindowPage : ngOnInit : call getMyDetailFromLocalFile');
        this.getMyDetailFromLocalFile();
        console.log('ChattingWindowPage : ngOnInit : call getCurrentUserChats');
        this.getCurrentUserChats();
        console.log('ChattingWindowPage : ngOnInit : call registerBroadcastService');
        this.registerBroadcastService();
        console.log('ChattingWindowPage : ngOnInit : call updateOnlineStatus');
        this.updateOnlineStatus();
        console.log('ChattingWindowPage : ngOnInit : call setLocalProfilePicOnInit');
        this.setLocalProfilePicOnInit();
        console.log('ChattingWindowPage : ngOnInit : end');
    }
    //scrolls to bottom whenever the page has loaded
    ionViewDidEnter() {
        this.chattingWindow.scrollToBottom(300);//300ms animation speed
    }
    updateOnlineStatus() {
        console.log('ChattingWindowPage : updateOnlineStatus : start');
        firebase.database().ref('/ChatActiveUsers').orderByChild('myRandomId').equalTo(this.chatToObj.chatToUserId).on('value', (snapshot) => {
            console.log('ChattingWindowPage : updateOnlineStatus : ChatActiveUsers data fetched');
            //var chatActiveUsersObj = snapshot.val();
            if(snapshot.val() != null && this.navCtrl.getActive().id == 'ChattingWindowPage') {
              console.log('ChattingWindowPage : updateOnlineStatus : current page is ChattingWindowPage');
              var chatActiveUsersObj :any= {};
              for(var key in snapshot.val()){
                chatActiveUsersObj = snapshot.val()[key];
                this.chatToObj.isOnline = chatActiveUsersObj.isOnline;
                console.log('ChattingWindowPage : updateOnlineStatus : user status is :- '+this.chatToObj.isOnline);
              }
            } else {
                console.log('ChattingWindowPage : updateOnlineStatus : its not ChattingWindowPage');
                return;
            }
        });
        console.log('ChattingWindowPage : updateOnlineStatus : end');
    }
    setLocalProfilePicOnInit(){
        console.log('ChattingWindowPage : setLocalProfilePicOnInit : start');
        var localProfilePicObj = this.storeDataService.getProfilePicsFileStorage();
        if(localProfilePicObj && localProfilePicObj[this.chatToObj.chatToUserId]) {
            this.chatToObj.localProfilePicUrl = localProfilePicObj[this.chatToObj.chatToUserId].localProfilePicUrl;
        }
        console.log('ChattingWindowPage : setLocalProfilePicOnInit : end');
    }
    getMyDetailFromLocalFile() {
        console.log('ChattingWindowPage : getMyDetailFromLocalFile : start');
        var myDetailObjTemp = this.storeDataService.getMyDetailObj();
        if(myDetailObjTemp) {
            console.log('ChattingWindowPage : getMyDetailFromLocalFile : myDetailObjTemp not empty');
            this.myDetailObj = myDetailObjTemp;
            console.log(this.myDetailObj);
        } else {
            console.log('ChattingWindowPage : getMyDetailFromLocalFile : myDetailObjTemp is empty');
        }
        console.log('ChattingWindowPage : getMyDetailFromLocalFile : start');
    }
    updateProfilePic() {
        console.log('ChattingWindowPage : updateProfilePic : start');
        this.broadcasterService.on<string>('update-profilePic-chatting-window-page')
        .subscribe((profilePicsFileObj:any) => {
            console.log('ChattingWindowPage : updateProfilePic : subscribe data received');
            console.log(profilePicsFileObj);
            if(profilePicsFileObj[this.chatToObj.chatToUserId]) {
                this.chatToObj.localProfilePicUrl = profilePicsFileObj[this.chatToObj.chatToUserId].localProfilePicUrl;
            }
        });
        console.log('ChattingWindowPage : updateProfilePic : end');
    }
    
    // ngOnDestroy() {
    //     console.log('ChattingWindowPage : ngOnDestroy called');
    //     this.broadcasterServiceObj.unsubscribe();
    //     console.log('ChattingWindowPage : ngOnDestroy broadcasterService unsubscribe');
    // }

    registerBroadcastService() {
        console.log('ChattingWindowPage : registerBroadcastService : start');
        this.broadcasterServiceObj = this.broadcasterService.on<string>("newMessage-chattingWindow")
            .subscribe((messageObj:any) => {
                console.log('ChattingWindowPage : receiveMessages : getMessages message received');
                if(messageObj.from != this.chatToObj.chatToUserId) {
                    console.log('ChattingWindowPage : receiveMessages : getMessages : message from anonymous');
                    console.log('ChattingWindowPage : receiveMessages : getMessages : call showLocalNotification');
                    this.showLocalNotification(messageObj);
                    messageObj = this.createMessageObj(messageObj);
                    this.storeDataService.setChattingWindowListObj(messageObj,messageObj.from);
                    // console.log('ChattingWindowPage : receiveMessages : getMessages : call anonymousMessageIntoFileService : insertIntoChattingFile');
                    // this.anonymousMessageIntoFileService.insertIntoChattingFile(messageObj.from,messageObj).subscribe(fileWritten => {
                    //     console.log('ChattingWindowPage : receiveMessages : getMessages : anonymousMessageIntoFileService : insertIntoChattingFile fileWritten');
                    //     // messageObj.lastSenderId = messageObj.from;
                    //     // messageObj.senderName = messageObj.senderName;
                    //     // messageObj.chatToUserName = messageObj.senderName;
                    //     // messageObj.chatToUserId = messageObj.from;
                    //     // console.log('ChattingWindowPage : receiveMessages : getMessages : call anonymousMessageIntoFileService : insertIntoChattingFile : fileWritten call insertIntoChatUserFile');
                    //     // this.insertIntoChatUserFile(messageObj);
                    // });
                } else {
                    console.log('ChattingWindowPage : receiveMessages : getMessages : message from current chatToObj');
                    messageObj = this.createMessageObj(messageObj);
                    this.messages.push(messageObj);
                    this.storeDataService.setChattingWindowListObj(messageObj,messageObj.from);
                    this.scrollToBottom();
                    console.log('ChattingWindowPage : receiveMessages : getMessages : messages created');
                    // console.log('ChattingWindowPage : receiveMessages : getMessages : call anonymousMessageIntoFileService : insertIntoChattingFile');
                    // this.anonymousMessageIntoFileService.insertIntoChattingFile(messageObj.from,this.messages).subscribe(fileUpdated=>{
                    //     console.log('ChattingWindowPage : receiveMessages : getMessages : anonymousMessageIntoFileService : insertIntoChattingFile fileWritten');
                    //     // messageObj.lastSenderId = messageObj.from;
                    //     // messageObj.senderName = messageObj.senderName;
                    //     // messageObj.chatToUserName = messageObj.senderName;
                    //     // messageObj.chatToUserId = messageObj.from;
                    //     // console.log('ChattingWindowPage : receiveMessages : getMessages : call anonymousMessageIntoFileService : insertIntoChattingFile : fileWritten call insertIntoChatUserFile');
                    //     // this.insertIntoChatUserFile(messageObj);
                    // });   
                }
        });
    }
    getCurrentUserChats() {
        console.log('ChattingWindowPage : getCurrentUserChats : start');
        this.storeDataService.getChattingWindowListObjByFileName(this.chatToObj.chatToUserId).subscribe((returnValue:any) => {
            console.log('ChattingWindowPage : getCurrentUserChats : file read success');
            if(!returnValue) {
                console.log('ChattingWindowPage : getCurrentUserChats : not found returnValue :- '+returnValue);
            } else {
                console.log('ChattingWindowPage : getCurrentUserChats : found success returnValue :- '+returnValue);
                this.messages.push(...returnValue);
            }
        })
        // this.fileOperationService.readFile('ChattingApp',this.chatToObj.chatToUserId+'.db.json').subscribe((chattingListObjTemp:any) => {
        //     console.log('ChattingWindowPage : readFile :' + this.chatToObj.chatToUserId+'.db.json file read done');
        //     console.log(chattingListObjTemp);
        //     if(chattingListObjTemp) {
        //         chattingListObjTemp.chattingMessage.forEach(element => {
        //             this.messages.push(element);
        //         });
        //         this.scrollToBottom();
        //         console.log('ChattingWindowPage : readFile :' + this.chatToObj.chatToUserId+'.db.json file read done : createMessageObj done');
        //     } else {
        //         console.log('ChattingWindowPage : readFile :' + this.chatToObj.chatToUserId+'.db.json file read done empty data');
        //     }
        // });
        console.log('ChattingWindowPage : getCurrentUserChats : end');
    }

    // insertIntoChatUserFile(messageObj) {
    //     console.log('ChattingWindowPage : insertIntoChatUserFile : start');
    //     this.fileOperationService.readFile('ChattingApp','chatUsers.db.json').subscribe((chattingListObj)=>{
    //         if(!chattingListObj) {
    //             chattingListObj = {};
    //         }
    //         this.anonymousMessageIntoFileService.insertIntoChatUserFile(chattingListObj,messageObj).subscribe(fileWritten => {
    //             console.log('ChattingWindowPage : insertIntoChatUserFile : insertIntoChatUserFile : fileWritten');
    //             console.log(fileWritten);
    //             chattingListObj = fileWritten;
    //             this.broadcasterService.broadcast('newMessage-updateChattingListObj', chattingListObj);
    //         });
            
    //     });
    //     console.log('ChattingWindowPage : insertIntoChatUserFile : end');
    // }
    createMessageObj(messageObj:any) {
        console.log('ChattingWindowPage : createMessageObj : start');
        //messageObj.position = (messageObj.from == this.myDetailObj.myRandomId) ? 'right' : 'left';
        messageObj.position = (messageObj.from == '642097391') ? 'right' : 'left';
        console.log(messageObj);
        console.log('ChattingWindowPage : createMessageObj : newMsg created');
        console.log('ChattingWindowPage : createMessageObj : end');
        return messageObj;
    }
    sendMessage(newMessage) {
        console.log('ChattingWindowPage : sendMessage : start');
        this.messageInput.setFocus();
        var messageObj : any = {
            to : this.chatToObj.chatToUserId,
            //from : this.myDetailObj.myRandomId,
            from : '642097391',
            receiverName : this.chatToObj.chatToUserName,
            //senderName : this.myDetailObj.userName,
            senderName : 'vvv',
            sentTime : Date.now(),
            message : newMessage
        };
        this.chatService.sendMessage(messageObj);
        this.messages.push(this.createMessageObj(messageObj));
        this.newMessage = '';
        console.log(messageObj);
        console.log('ChattingWindowPage : sendMessage : call sendMessage');
        this.chatService.sendMessage(messageObj);
        var chattingPageMessage = Object.assign({},messageObj);
        chattingPageMessage.chattingKey = messageObj.to;
        chattingPageMessage.chatToUserName = this.chatToObj.chatToUserName;
        chattingPageMessage.chatToUserId = this.chatToObj.chatToUserId;
       
        this.scrollToBottom();
        if(this.platform.is('core') || this.platform.is('mobileweb')) {
            //in Browser
            this.deviceType = 2;
        } else {
            //in App
            this.deviceType = 1;
            this.storeDataService.setChattingWindowListObj(messageObj,messageObj.to).subscribe(()=>{
                console.log('ChattingWindowPage : sendMessage : storeDataService.setChattingWindowListObj success');
                this.broadcasterService.broadcast('newMessage-chatting', chattingPageMessage);
            })
        }
        // if(this.deviceType == 1) {
        //     console.log('ChattingWindowPage : sendMessage : call anonymousMessageIntoFileService.insertIntoChattingFile');
        //     this.anonymousMessageIntoFileService.insertIntoChattingFile(messageObj.to,this.messages).subscribe(fileUpdated=>{
        //         console.log('ChattingWindowPage : sendMessage : anonymousMessageIntoFileService.insertIntoChattingFile : file written');
        //         // messageObj.lastSenderId =  this.myDetailObj.myRandomId;
        //         // messageObj.senderName = this.myDetailObj.userName;
        //         // messageObj.chatToUserName = this.chatToObj.chatToUserName;
        //         // messageObj.chatToUserId = this.chatToObj.chatToUserId;
        //         // console.log('ChattingWindowPage : sendMessage : anonymousMessageIntoFileService.insertIntoChattingFile : file written : call insertIntoChatUserFile');
        //         // this.insertIntoChatUserFile(messageObj);
        //     });   
        // }
        console.log('ChattingWindowPage : sendMessage : end');
    }
    showLocalNotification(messageObj) {
        console.log('ChattingWindowPage : showLocalNotification : start');
        this.localNotificationService.triggerLocalNotification(messageObj).subscribe(element =>{
            console.log('ChattingWindowPage : showLocalNotification : triggerLocalNotification complete');
            console.log(element);
        });
        console.log('ChattingWindowPage : showLocalNotification : end');
    }
    scrollToBottom(){
        setTimeout(() => {
            this.chattingWindow.scrollToBottom(300);//300ms animation speed
        });
    }
}