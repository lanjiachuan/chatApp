import { Component, OnInit, NgZone, Input } from '@angular/core';
import { NavController, App, Platform, IonicPage, ActionSheetController, ModalController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { BroadcasterService } from '../../../services/broadcaster.service';
import { FileOperationService } from '../../../services/fileOperation.service';
import { AnonymousMessageIntoFileService } from '../../../services/anonymousMessageIntoFile.service';
import { StoreDataService } from '../../../services/storeDataService.service';
import { Camera, CameraOptions } from '@ionic-native/camera';

@IonicPage()
@Component({
    selector: 'chatting-page',
    templateUrl: 'chatting.html'
})
export class ChattingPage implements OnInit{

    //chating
    @Input() myRandomIdTemp: String;
    myRandomId: any;
    myDetailObj: any = {};
    chattingWindowPage: any = 'ChattingWindowPage';
    chattingListObj: any = {};
    chattingListIsEmpty : boolean = true;

    constructor(private storeDataService : StoreDataService,
        private zone: NgZone, private anonymousMessageIntoFileService: AnonymousMessageIntoFileService, 
        private fileOperationService: FileOperationService, private broadcasterService : BroadcasterService,
        private navParams: NavParams, private app: App, private platform : Platform, 
        public navCtrl: NavController, public modalCtrl: ModalController) {
            this.zone = zone;
        }

    ngOnInit() {
        console.log('ChattingPage : ngOnInit : start');
        //this.myRandomId = this.navParams.get('myRandomId');
        this.myRandomId = this.myRandomIdTemp;
        this.getMyDetailFromLocalFile();
        if(this.platform.is('core') || this.platform.is('mobileweb')) {
            //In Browser
            console.log('browser');
        } else {
            //in App
            console.log('ChattingPage : ngOnInit : call getAllChatsUser');
            this.getAllChatsUser();
        };
        console.log('ChattingPage : ngOnInit : end');
    }
    // updateChattingListObj() {
    //     console.log('ChattingPage : updateChattingListObj : start');
    //     this.broadcasterService.on<string>("newMessage-updateChattingListObj")
    //     .subscribe((messageObj:any) => {
    //         console.log('ChattingPage : updateChattingListObj : ChattingPage : updateChattingListObj received');
    //         var messageObjFormated = this.storeDataService.formatChattingListObj(messageObj);
    //         this.chattingListObj[messageObj.from] = Object.assign({}, messageObjFormated);
    //         this.chattingListIsEmpty = false;
    //         var profilePicObjTemp = this.storeDataService.getProfilePicsFileStorage();
    //         if(profilePicObjTemp) {
    //             this.updateProfilePicInChattingObj(profilePicObjTemp);
    //         }
    //         this.storeDataService.setChattingListObj(this.chattingListObj).subscribe(()=>{
    //             console.log('ChattingPage : updateChattingListObj : storeDataService.setChattingListObj success');
    //         })
    //     });
    //     console.log('ChattingPage : updateChattingListObj : end');
    // }
    updateProfilePicListner() {
        console.log('ChattingPage : updateProfilePic : start');
        this.broadcasterService.on<string>('update-profilePic-chatting')
        .subscribe((profilePicsFileObj:any) => {
            console.log('ChattingPage : updateProfilePic : subscribe data received');
            console.log(profilePicsFileObj);
            this.updateProfilePicInChattingObj(profilePicsFileObj);
            console.log(this.chattingListObj);
        });
        console.log('ChattingPage : updateProfilePic : end');
    }
    getAllChatsUser() {
        console.log('ChattingPage : getAllChatsUser : start');
        var chattingListObjTemp = this.storeDataService.getChattingListObj();
        if(chattingListObjTemp) { 
            console.log('ChattingPage : getAllChatsUser : chattingListObj is not empty');
            this.chattingListIsEmpty = false;
            this.chattingListObj = Object.assign({}, chattingListObjTemp);
            var profilePicObjecTemp = this.storeDataService.getProfilePicsFileStorage();
            if(profilePicObjecTemp) {
                console.log('ChattingPage : getAllChatsUser : profilePicObjecTemp is not null');
                this.updateProfilePicInChattingObj(profilePicObjecTemp);
            } else {
                console.log('ChattingPage : getAllChatsUser : profilePicObjecTemp is null');
            }
        } else {
            this.chattingListIsEmpty = true;
            console.log('ChattingPage : getAllChatsUser : chattingListObj is empty');
        }
        //this.updateChattingListObj();
        this.updateProfilePicListner();
        this.registerBroadcastService();
        // this.fileOperationService.readFile('ChattingApp','chatUsers.db.json').subscribe((chattingObj:any) => {
        //     console.log('ChattingPage : getAllChatsUser : readFile : chatUsers.db.json complete');
        //     console.log(chattingObj);
        //     if(chattingObj) {
        //         this.chattingListObj = chattingObj;
        //         console.log('ChattingPage : getAllChatsUser : readFile : chatUsers.db.json complete : user is found');
        //         this.chattingListIsEmpty = false;
        //         var profilePicObjecTemp = this.storeDataService.getProfilePicsFileStorage();
        //         if(profilePicObjecTemp) {
        //             console.log('ChattingPage : getAllChatsUser : profilePicObjecTemp is not null');
        //             this.updateProfilePicInChattingObj(this.storeDataService.getProfilePicsFileStorage());
        //         } else {
        //             console.log('ChattingPage : getAllChatsUser : profilePicObjecTemp is null');
        //         }
        //     } else {
        //         console.log('ChattingPage : getAllChatsUser : readFile : chatUsers.db.json complete : no user found');
        //         this.chattingListIsEmpty = true;
        //     }
            
        // });
        console.log('ChattingPage : getAllChatsUser : end');
    }
    updateProfilePicInChattingObj(profilePicsFileObj) {
        this.zone.run(() => {
            if(Object.keys(this.chattingListObj).length >0 ){
                console.log('ChattingPage updateProfilePicInChattingObj chattingListObj is not empty');
                for (var key in this.chattingListObj) {
                    // skip loop if the property is from prototype
                    if (!this.chattingListObj.hasOwnProperty(key) || !profilePicsFileObj.hasOwnProperty(key)) continue;
                    this.chattingListObj[key].localProfilePicUrl = profilePicsFileObj[key].localProfilePicUrl;
                }
                this.storeDataService.setChattingListObj(this.chattingListObj).subscribe(()=>{
                    console.log('ChattingPage : updateProfilePicInChattingObj : storeDataService.setChattingListObj success');
                });
            } else {
                console.log('ChattingPage updateProfilePicInChattingObj chattingListObj is empty');
            }
            // this.chattingListObj.chatting.forEach(element => {
            //     if(profilePicsFileObj) {
            //         if(profilePicsFileObj[element.chatToUserId]) {
            //             element.localProfilePicUrl = profilePicsFileObj[element.chatToUserId].localProfilePicUrl;
            //         }
            //     }
            // });
        });   
    }
    registerBroadcastService() {
        console.log('ChattingPage : registerBroadcastService : start');
        this.broadcasterService.on<string>("newMessage-chatting")
            .subscribe((message:any) => {
                console.log('ChattingPage : registerBroadcastService : newMessage received');
                console.log(message);
                this.chattingListIsEmpty = false;
                var chattingListObjTemp = Object.assign({}, this.chattingListObj);
                var messageTemp : any = {};
                var isProfileUpdatRequired = false;
                if(message instanceof Array) {
                    console.log('ChattingPage : registerBroadcastService message is array');
                    message.forEach(element => {
                        messageTemp = this.storeDataService.formatChattingListObj(element);
                        chattingListObjTemp[element.chattingKey] = messageTemp;
                        this.chattingListObj = Object.assign({}, chattingListObjTemp);
                        if(!chattingListObjTemp[element.chattingKey].localProfilePicUrl) {
                            isProfileUpdatRequired = true;
                        }
                    });
                } else {
                    messageTemp = this.storeDataService.formatChattingListObj(message);
                    chattingListObjTemp[message.chattingKey] = messageTemp;
                    this.chattingListObj = Object.assign({}, chattingListObjTemp);
                    if(!chattingListObjTemp[message.chattingKey].localProfilePicUrl) {
                        isProfileUpdatRequired = true;
                    }
                }
                if(isProfileUpdatRequired) {
                    var profilePicObjTemp = this.storeDataService.getProfilePicsFileStorage();
                    if(profilePicObjTemp) {
                        this.updateProfilePicInChattingObj(profilePicObjTemp);
                    }
                }
                this.storeDataService.setChattingListObj(this.chattingListObj).subscribe(()=>{
                    console.log('ChattingPage : registerBroadcastService : storeDataService.setChattingListObj success');
                });
        });
    };
    openChatWindow(chatToObj) {
        console.log('ChattingPage : openChatWindow : start');
        console.log(this.myDetailObj);
        this.app.getRootNav().push(this.chattingWindowPage, {
            chatToObj : chatToObj,
            myDetailObj : this.myDetailObj,
        });
        console.log('ChattingPage : openChatWindow : end');
     }
    getMyDetailFromLocalFile() {
        var myDetailObj = this.storeDataService.getMyDetailObj();
        if(myDetailObj) {
            this.myDetailObj = this.storeDataService.getMyDetailObj();
        }
     }   
    openModal(event,chatToObj) {
        event.stopPropagation();
        let myModal = this.modalCtrl.create('ProfilePicModalPage',{chatToObj: chatToObj},{ enableBackdropDismiss: true });
        myModal.present();
    }

}