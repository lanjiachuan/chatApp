import { Component, OnInit, NgZone, Input } from '@angular/core';
import { NavController, App, Platform, IonicPage, ModalController } from 'ionic-angular';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { SQLiteObject } from '@ionic-native/sqlite';
import { NavParams } from 'ionic-angular';
import { FileOperationService } from '../../../services/fileOperation.service';
import { BroadcasterService } from '../../../services/broadcaster.service';
import { StoreDataService } from '../../../services/storeDataService.service';

@IonicPage()
@Component({
    selector: 'friend-list-page',
    templateUrl: 'friendList.html'
})
export class FriendListPage implements OnInit{

    //chating
    @Input() myRandomIdTemp: String;
    accept : any;
    chatDBRef: any;
    myRandomId: any;
    activeUserDBList: FirebaseListObservable<any[]>;
    noActiveUsers : any; 
    myDetailObj: any = {};
    friendObj : any = {};
    chattingWindowPage: any = 'ChattingWindowPage';
    sqlStorageDB : SQLiteObject;
    messages : Array<any> = [];

    constructor(private storeDataService : StoreDataService,
        private fileOperationService: FileOperationService, 
        private navParams: NavParams, private app: App, private platform : Platform, 
        private db: AngularFireDatabase, private zone : NgZone, public navCtrl: NavController,
        private modalCtrl: ModalController, private broadcasterService : BroadcasterService) {
        console.log('FriendListPage : constructor');
        this.chatDBRef= firebase.database().ref('/ChatActiveUsers');
    }

    ngOnInit() {
        console.log('FriendListPage : ngOnInit : start');
        //this.myRandomId = this.navParams.get('myRandomId');
        this.myRandomId = this.myRandomIdTemp;
        if(this.myRandomId) {
            if(this.platform.is('core') || this.platform.is('mobileweb')) {
                //In Browser
                this.getAllActiveUsers();
                console.log('FriendListPage : ngOnInit : call onNewUserAdded');

            } else {
                //in App
                this.getMyDetailFromLocalFile();
                console.log('FriendListPage : ngOnInit : call getAllUserListFromLocalFile');
                this.getAllUserListFromLocalFile(); 
            }
        }   
        console.log('FriendListPage : ngOnInit : end');
    }
    updateProfilePic() {
        console.log('FriendListPage : updateProfilePic : start');
        this.broadcasterService.on<string>('update-profilePic-friendList')
        .subscribe((profilePicsFileObj:any) => {
            console.log('FriendListPage : updateProfilePic : subscribe received');
            console.log(profilePicsFileObj);
            this.updateProfilePics(profilePicsFileObj);
        });
        console.log('FriendListPage : updateProfilePic : end');
    }
    updateProfilePics(profilePicsFileObj) {
        this.zone.run(() => {
            if(Object.keys(this.friendObj).length >0 ){
                for (var key in this.friendObj) {
                    // skip loop if the property is from prototype
                    if (!this.friendObj.hasOwnProperty(key) || !profilePicsFileObj.hasOwnProperty(key)) continue;
                    this.friendObj[key].localProfilePicUrl = profilePicsFileObj[key].localProfilePicUrl;
                }
                this.storeDataService.setFriendListObj(this.friendObj).subscribe(()=>{
                    console.log('success');
                });
            }
            // this.storeDataService.setChattingListObj(this.chattingListObj);
            // if(this.friendObj && this.friendObj.friendList && this.friendObj.friendList.length > 0) {
            //     this.friendObj.friendList.forEach(element => {
            //         if(profilePicsFileObj) {
            //             if(profilePicsFileObj[element.myRandomId]) {
            //                 element.localProfilePicUrl = profilePicsFileObj[element.myRandomId].localProfilePicUrl;
            //             }
            //         }
            //     });
            // }
        });
    }
    onNewUserAdded() {
        console.log('FriendListPage : onNewUserAdded : start');
        firebase.database().ref('/ChatActiveUsers').limitToLast(1).on('child_added', (snapshot) => {
            if(this.myRandomId != snapshot.val().myRandomId) {
                console.log('FriendListPage : onNewUserAdded : firebase: child_added');
                console.log(snapshot.val());
                if(this.friendObj[snapshot.val().myRandomId] || this.myDetailObj.myRandomId == snapshot.val().myRandomId) {
                    console.log('FriendListPage : onNewUserAdded user already exist');
                } else {
                    console.log('FriendListPage : onNewUserAdded user not exist');
                    this.friendObj[snapshot.val().myRandomId] = snapshot.val();
                    this.friendObj = Object.assign({}, this.friendObj);
                    this.storeDataService.setFriendListObj(this.friendObj).subscribe(()=>{

                    })
                    // this.updateUserListInFile(snapshot.val());
                }
            }
        });
        console.log('FriendListPage : onNewUserAdded : end');
    }
    // updateUserListInFile(newUserObj:any) {
    //     console.log('FriendListPage : updateUserListInFile : start');
    //     console.log(newUserObj);

    //     // this.fileOperationService.readFile('ChattingApp','userList.db.json').subscribe((friendObj) => {
    //     //     if(friendObj) {
    //     //         if(!this.friendObj) {
    //     //             this.friendObj = friendObj;
    //     //         }
    //     //         var oldChild : number;
    //     //         this.friendObj.friendList.map((element, index) => {
    //     //             if(element.myRandomId == newUserObj.myRandomId) {
    //     //                 oldChild = index
    //     //                 return true;
    //     //             }
    //     //         });
    //     //         if(oldChild >= 0) {
    //     //             console.log('its old child : '+oldChild);
    //     //             return;
    //     //         } else {
    //     //             console.log('its new child : '+oldChild);
    //     //             this.friendObj.friendList.push(newUserObj);
    //     //         }
    //     //     } else {
    //     //         console.log('no friends found in file ');
    //     //         this.friendObj = {};
    //     //         this.friendObj.friendList = [];
    //     //         this.friendObj.friendList.push(newUserObj);
    //     //     }
    //     //     this.fileOperationService.writeExistingFile('ChattingApp','userList.db.json',this.friendObj).subscribe(fileCreated => {
    //     //         console.log('FriendListPage : updateUserListInFile : writeExistingFile : userList.db.json file wrritten success');
    //     //         console.log(fileCreated);
    //     //     });
    //     // });
    //     console.log('FriendListPage : updateUserListInFile : end');
    // }

    getAllUserListFromLocalFile() {
        console.log('FriendListPage : getAllUserListFromLocalFile : start');
        this.friendObj = Object.assign({}, this.storeDataService.getFriendListObj());
        console.log('FriendListPage : ngOnInit : call onNewUserAdded');
        this.onNewUserAdded(); 
        console.log('FriendListPage : ngOnInit : call updateProfilePic');
        this.updateProfilePic();
        // this.fileOperationService.readFile('ChattingApp','userList.db.json').subscribe((friendObj:any) => {
        //     console.log('FriendListPage : getAllUserListFromLocalFile : userList.db.json file read done');
        //     if(friendObj) {
        //         console.log('FriendListPage : getAllUserListFromLocalFile : userList.db.json not empty');
        //         this.friendObj = friendObj;
        //         var profilePicObjecTemp = this.storeDataService.getProfilePicsFileStorage();
        //         if(profilePicObjecTemp) {
        //             console.log('FriendListPage : getAllUserListFromLocalFile : profilePicObjecTemp is not null');
        //             this.updateProfilePics(this.storeDataService.getProfilePicsFileStorage());
        //         } else {
        //             console.log('FriendListPage : getAllUserListFromLocalFile : profilePicObjecTemp is null');
        //         }
        //     } else {
        //         console.log('FriendListPage : getAllUserListFromLocalFile : userList.db.json empty');
        //     }
        // });
        console.log('FriendListPage : getAllUserListFromLocalFile : end');
    }

    getAllActiveUsers() {
        console.log('FriendListPage : getAllActiveUsers : start');
        this.db.list('/ChatActiveUsers', { preserveSnapshot: true}).take(1)
        .subscribe(snapshots => {
          this.zone.run(() => {
            var friendObjTemp = {};
            // this.friendObj.friendList = [];
            if (snapshots.length == 1) {
                snapshots.forEach(snapshot => {
                    if(snapshot.val().myRandomId == this.myRandomId) {
                        console.log('myRandomId');
                        this.myDetailObj = snapshot.val();
                        this.myDetailObj.key = snapshot.key
                    }  
                 });
                 this.noActiveUsers = true;
            } else {
            var key;
             snapshots.forEach(snapshot => {
                if(snapshot.val().myRandomId != this.myRandomId) {
                    key = snapshot.key;              
                    console.log('getAllActiveUsers : snapshots');    
                    var userObj = snapshot.val();
                    userObj.key = key;
                    friendObjTemp[userObj.myRandomId] = userObj;
                    this.friendObj = Object.assign({}, friendObjTemp);
                    this.noActiveUsers = false;
                } else if ((snapshot.val().myRandomId == this.myRandomId)) {
                    console.log('myRandomId');
                    this.myDetailObj = snapshot.val();
                    this.myDetailObj.key = snapshot.key;
                }  
             });
            }
          });
          this.storeDataService.setFriendListObj(this.friendObj).subscribe(()=>{
            this.onNewUserAdded(); 
          });
        });
        console.log('FriendListPage : getAllActiveUsers : end');
     }

    openChatWindow(chatToObj) {
        console.log(chatToObj);
        console.log('FriendListPage : openChatWindow : start');
        console.log(this.myDetailObj);
        chatToObj.chatToUserId = chatToObj.myRandomId;
        chatToObj.chatToUserName = chatToObj.userName;
            this.app.getRootNav().push(this.chattingWindowPage, {
                chatToObj : chatToObj,
                myDetailObj : this.myDetailObj,
            });
            console.log('FriendListPage : openChatWindow : end');

    }
    getMyDetailFromLocalFile() {
        // this.anonymousMessageIntoFileService.getMyDetailObjFromLocalFile().subscribe((myDetailObj) => {
        //     if(myDetailObj) {
        //         this.myDetailObj = myDetailObj;
        //     }
        // });
        var myDetailObj = this.storeDataService.getMyDetailObj();
        if(myDetailObj) {
            this.myDetailObj = myDetailObj;
        }

    }   
    openModal(event,chatToObj) {
        event.stopPropagation();
        chatToObj.chatToUserId = chatToObj.myRandomId;
        chatToObj.chatToUserName = chatToObj.userName;
        let myModal = this.modalCtrl.create('ProfilePicModalPage',{chatToObj: chatToObj},{ enableBackdropDismiss: true });
        myModal.present();
    }
}