import { Component } from '@angular/core';
import { IonicPage, Platform, ViewController} from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

declare var MyCordovaPlugin:any;

@IonicPage()
@Component({
  selector: 'auto-start-modal-page',
  templateUrl: 'autoStartModal.html'
})
export class AutoStartModalPage {
    
    sqlStorageDB : SQLiteObject;

    constructor(private sqlite: SQLite, private platform: Platform, 
        private viewCtrl: ViewController) {
        
    }
    ngOnInit() {
        this.mobileDBInit();
    }

    callAutoStartCordova() {
        this.updateAutoStartStatus();
        this.platform.ready().then(() => {
            if (typeof MyCordovaPlugin != 'undefined') {
                this.viewCtrl.dismiss();
                MyCordovaPlugin.autoStartApp((result:any)=>{
                    console.log('autoStartApp : OK');
                });
            }
        })
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
    updateAutoStartStatus() {
        console.log('LoginPage: insertInTable : Start');
        var createTableString = 'create table if not EXISTS autoStart(autoStart VARCHAR(32))' 
        this.sqlStorageDB.executeSql(createTableString, {})
        .then(() => {
            console.log('Executed SQL');
            let q = "INSERT INTO autoStart (autoStart) VALUES (?)";
            var autoStart = ['true'];
            this.sqlStorageDB.executeSql(q, autoStart).then((data) => {
                // alert('success');
                console.log('LoginPage: insertInTable : success');
            }, (e) => {
                console.log(JSON.stringify(e));
                console.log("LoginPage: insertInTable : Error :  " + JSON.stringify(e));
            });
        })
        .catch(e => {
            console.log(e)
        }); 
        console.log('LoginPage: insertInTable : end');
      };
}