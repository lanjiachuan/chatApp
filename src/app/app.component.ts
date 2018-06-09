import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { StoreDataService } from '../services/storeDataService.service';
declare var MyCordovaPlugin:any;


@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  connection;
  sqlStorageDB : SQLiteObject;
  myRandomId : any;
  tabsPage : any = 'TabsPage';

  constructor(private sqlite: SQLite,private platform: Platform, 
    private statusBar: StatusBar, private splashScreen: SplashScreen, 
    private storeDataService:StoreDataService) {
    platform.ready().then(() => {

      splashScreen.hide();

      if(this.platform.is('core') || this.platform.is('mobileweb')) {
        //in Browser
        console.log('In Browser');
        this.myRandomId  = sessionStorage.getItem('myRandomId');
        if(this.myRandomId) {
          this.nav.setRoot(this.tabsPage,{
            myRandomId : this.myRandomId
          });
        } else {
          this.nav.setRoot('LoginPage',{
            myRandomId : this.myRandomId
          });
        }
      } else {
        //in App
        if (typeof MyCordovaPlugin != 'undefined') {
            // MyCordovaPlugin.getDate((result:any)=>{
            // });
            // MyCordovaPlugin.echo('hhh');
            // MyCordovaPlugin.changeStatusBar((result:any)=>{
            //   alert(result);
            // });
            // MyCordovaPlugin.getMessages((result:any)=>{
            //   alert('getMessages');
            //   var messageObject : any = JSON.parse(result);
            //   console.log(result);
            // });
        }
        console.log('MyApp: In App');
        this.mobileDBInit();  
      } 
    });
  }

  ngOnInit() {
      console.log('MyApp : ngOnInit');
  }
  mobileDBInit() {
    console.log('MyApp: In mobileDBInit');
    this.sqlite.create({
        name: 'myChatDetail',
        location: 'default'
    })
    .then((db: SQLiteObject) => {
        console.log('mobileDBInit');
        this.sqlStorageDB = db;     
        var createTableString = 'create table if not EXISTS myChatTableTest(myRandomId VARCHAR(32))' 
        this.createTable(createTableString);
        this.getMyDetailFormTable();
    })
    .catch(e => {
        console.log(e)
    });
  }
  getMyDetailFormTable() {
    console.log('MyApp: In getMyDetailFormTable');
    this.sqlStorageDB.executeSql("SELECT * FROM myChatTableTest", []).then((data) => {
        var items = [];
        console.log('select *');
        if(data.rows.length > 0) {
            for(var i = 0; i < data.rows.length; i++) {
                items.push(data.rows.item(i));
            }
            this.myRandomId = items[0].myRandomId;
            if(this.myRandomId) {
              this.fetchAllDataFromLocalFiles();
            } else {
              this.pushToPage(null,'LoginPage');
            }
        } else {
            this.pushToPage(null,'LoginPage');
            console.log('myRandomId not exist');
        }
    }, (e) => {

        console.log("Errot: " + JSON.stringify(e));
    });
  };
  pushToPage(myRandomId,pageName) { 
    this.nav.setRoot(pageName,{
      myRandomId : myRandomId
    });
  };

  fetchAllDataFromLocalFiles() {
    this.platform.ready().then(() => { 
      console.log('MyApp : call storeDataService.setMyDetailObj');
      this.storeDataService.setMyDetailObj(false).subscribe(()=>{
        console.log('MyApp : call storeDataService.setProfilePicsFileStorage');
        this.storeDataService.setProfilePicsFileStorage(false).subscribe(()=>{
          console.log('MyApp : call storeDataService.setFriendListObj');
          this.storeDataService.setFriendListObj(false).subscribe(()=>{
            console.log('MyApp : call storeDataService.setChattingListObj');
            this.storeDataService.setChattingListObj(false).subscribe(()=>{
              this.pushToPage(this.myRandomId,this.tabsPage);
            });
          });
        });
      });

    });
  }
  createTable(createTableString) {
    console.log('MyApp: In createTable');
    this.sqlStorageDB.executeSql(createTableString, {})
    .then(() => {
        console.log('Executed SQL')
    })
    .catch(e => {
        console.log(e)
    }); 
  }

}
