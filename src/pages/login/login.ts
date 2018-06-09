import { Component, ViewChild } from '@angular/core';
import { NavController, Platform, IonicPage, ModalController } from 'ionic-angular';
import * as firebase from 'firebase';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { FileOperationService } from '../../services/fileOperation.service';
import { StoreDataService } from '../../services/storeDataService.service';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/take';
import {Observable} from 'rxjs/Rx';
declare var MyCordovaPlugin:any;
import { Device } from '@ionic-native/device';

@IonicPage()
@Component({
  selector: 'login-page',
  templateUrl: 'login.html'
})
export class LoginPage {

    chatDBRef:any;
    myRandomId:any;
    tabsPage : any = 'TabsPage';
    //tabsPage : any = 'SwipeTabsPage';
    sqlStorageDB : SQLiteObject;
    deviceType : any; //1 for mobile , 2 for browser
    activeUserDBList: FirebaseListObservable<any[]>;
    @ViewChild('loginInput') loginInput;

    constructor(private storeDataService : StoreDataService, private device: Device, 
        private angularFireDatabase: AngularFireDatabase, private modalCtrl: ModalController, 
        private fileOperationService: FileOperationService, 
        private sqlite: SQLite, public navCtrl: NavController, private platform: Platform) {
        this.chatDBRef= firebase.database().ref('/ChatActiveUsers');
    }
    ngOnInit() {
        console.log('LoginPage : ngOnInit')
        if(this.platform.is('core') || this.platform.is('mobileweb')) {
            //in Browser
            console.log('login');
            this.deviceType = 2;
           
        } else {
            //in App
            this.deviceType = 1;
        }
        if(this.deviceType == 1) {
            //mobile
            this.mobileDBInit();
        }
    }
    ionViewDidLoad() {
        console.log("ionViewDidLoad");
        this.loginInput.setFocus();
    }
    ionViewDidEnter() {
        console.log("ionViewDidEnter");
        if(this.deviceType == 1) {
            //mobile
            console.log(this.device.manufacturer);
            var deviceName = this.device.manufacturer.toLowerCase();
            if(deviceName == "xiaomi" || deviceName == "oppo" || deviceName == "vivo") {
                this.checkIfAutotartRequired();
            } 
        }
    }
    mobileDBInit() {
        console.log('LoginPage: mobileDBInit: START');
        this.sqlite.create({
            name: 'myChatDetail',
            location: 'default'
        })
        .then((db: SQLiteObject) => {
            console.log('LoginPage: mobileDBInit: Created');
            this.sqlStorageDB = db;      
        })
        .catch(e => {
            console.log(e)
        });
      }
    startChat(myName) {
        console.log('LoginPage: StartChat : start');
        this.myRandomId = Math.random().toString().slice(2,11);
        if(this.deviceType == 1) {
            //in App
            this.insertInTable();
        } else if(this.deviceType == 2) {
            //in Browser
            sessionStorage.setItem('myRandomId', this.myRandomId);
        }
        var chatDBPush = this.chatDBRef.push();
        chatDBPush.set({
            userName: myName,
            myRandomId: this.myRandomId,
            isOnline: 1
        });
        this.getAllActiveUsers();
        if(this.deviceType == 2) {
            this.navCtrl.setRoot(this.tabsPage,{
                myRandomId : this.myRandomId
            });
        }
        console.log('LoginPage: StartChat : end');
    }
    insertInTable() {
        console.log('LoginPage: insertInTable : Start');
        let q = "INSERT INTO myChatTableTest (myRandomId) VALUES (?)";
        var myRandomId = [this.myRandomId];
        this.sqlStorageDB.executeSql(q, myRandomId).then((data) => {
            // alert('success');
            console.log('LoginPage: insertInTable : success');
        }, (e) => {
            console.log(JSON.stringify(e));
            console.log("LoginPage: insertInTable : Error :  " + JSON.stringify(e));
        });
        console.log('LoginPage: insertInTable : end');
    }
    deleteTable() {
        this.sqlStorageDB.executeSql("DROP TABLE IF EXISTS myChatTableTest",[]).then((data)=>{
            console.log("deleted",data); // never gets printed
        },(error) =>{
            console.log("error deleted",error.err); // never gets printed
        });
    }
    insertUserListInFile(userList:any) {
        console.log('LoginPage: InsertUserListInFile : START');
        console.log(userList);
        // var friendObj = {
        //     friendList : userList.friendList
        // }
        this.fileOperationService.createDir('ChattingApp', true).subscribe(dirCreated => {
            if(dirCreated) {
                console.log('dirCreated');
                this.fileOperationService.writeFile('ChattingApp','userList.db.json',userList.friendListObj,true).subscribe(fileCreated => {
                    console.log('LoginPage : insertUserListInFile:  writeFile : userList.db.json');
                    this.fileOperationService.writeFile('ChattingApp','myDetail.db.json',userList.myDetailObj,true).subscribe(fileCreated => {
                        console.log('LoginPage : insertUserListInFile:  writeFile : myDetail.db.json');
                        console.log('LoginPage: InsertUserListInFile : End');
                        this.storeDataService.setFriendListObj(userList.friendListObj).subscribe(()=>{
                            this.storeDataService.setMyDetailObj(userList.myDetailObj).subscribe(()=>{
                                if (typeof MyCordovaPlugin != 'undefined') {
                                    MyCordovaPlugin.startService();
                                    this.navCtrl.setRoot(this.tabsPage,{
                                        myRandomId : this.myRandomId
                                    });
                                }
                            })
                        });
                    });
                });
            }
          });
        }
        getAllActiveUsers() {
          console.log('LoginPage: GetAllActiveUsers : start');
          this.angularFireDatabase.list('/ChatActiveUsers', { preserveSnapshot: true}).take(1)
          .subscribe(snapshots => {
            console.log('LoginPage: GetAllActiveUsers : data received');
              var friendListObj = {};
              var myDetailObj : any = {};
              if (snapshots.length == 1) {
                  snapshots.forEach(snapshot => {
                      if(snapshot.val().myRandomId == this.myRandomId) {
                          console.log('myRandomId');
                          myDetailObj = snapshot.val();
                          myDetailObj.key = snapshot.key
                      }  
                   });
              } else {
              var key;
               snapshots.forEach(snapshot => {
                  if(snapshot.val().myRandomId != this.myRandomId) {
                      key = snapshot.key;              
                      console.log('getAllActiveUsers : snapshots');    
                      var userObj = snapshot.val();
                      userObj.key = key;
                      friendListObj[userObj.myRandomId] = userObj;
                    //   friendList.push(userObj);
                  } else if ((snapshot.val().myRandomId == this.myRandomId)) {
                      console.log('myRandomId');
                      myDetailObj = snapshot.val();
                      myDetailObj.key = snapshot.key;
                  }  
               });
              }
              var userList = {
                  friendListObj : friendListObj,
                  myDetailObj : myDetailObj
              }
              console.log('LoginPage: call  insertUserListInFile');
              this.insertUserListInFile(userList);
          });
          console.log('LoginPage: GetAllActiveUsers : end');
       }
       checkIfAutotartRequired() {
        console.log('MyApp: In checkIfAutotartRequired');
        this.sqlStorageDB.executeSql("SELECT * FROM autoStart", []).then((data) => {
            var items = [];
            var autoStartRequired = false;
            console.log('select *');
            if(data.rows.length > 0) {
                for(var i = 0; i < data.rows.length; i++) {
                    items.push(data.rows.item(i));
                }
                var autoStart = items[0].autoStart;
                if(autoStart == 'true') {
                  console.log('MyApp: In checkIfAutotartRequired : autoStart not required');
                  autoStartRequired = false;
                } else {
                  autoStartRequired = true;
                }
            } else {
              autoStartRequired = true;
            }
            if(autoStartRequired) {
              console.log('MyApp: In checkIfAutotartRequired : autoStart is required');
              this.openModal();
            }
        }, (e) => {
            this.openModal();
            console.log("Errot: " + JSON.stringify(e));
        });
      };
      openModal() {
        let myModal = this.modalCtrl.create('AutoStartModalPage');
        myModal.present();
      }
}
