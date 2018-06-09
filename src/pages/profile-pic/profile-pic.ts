import { Component } from '@angular/core';
import { IonicPage, ActionSheetController, Platform } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import * as firebase from 'firebase';
import { AnonymousMessageIntoFileService } from '../../services/anonymousMessageIntoFile.service';
import { StoreDataService } from '../../services/storeDataService.service';

@IonicPage()
@Component({
  selector: 'page-profile-pic',
  templateUrl: 'profile-pic.html',
})
export class ProfilePicPage {

  myDetailObj : any = '';
  
  constructor(private anonymousMessageIntoFileService : AnonymousMessageIntoFileService,
    private camera : Camera, private storeDataService : StoreDataService,
    private actionSheetCtrl: ActionSheetController, private platform : Platform) {}

  ngOnInit() {
    this.myDetailObj = this.storeDataService.getMyDetailObj();
  } 

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePicPage');
  }
  
  uploadPic() {
    this.openActionSheet();
  }

  openActionSheet() {
    console.log('opening');
    let actionsheet = this.actionSheetCtrl.create({
        title:"Choose Album",
        buttons:[{
            text: 'Camera',
            icon: 'camera',
            handler: () => {
                console.log("Camera Clicked");
                this.takePicture(this.camera.PictureSourceType.CAMERA)
            }
        },{
            text: 'Gallery',
            icon: 'image',
            handler: ()=>{
                console.log("Gallery Clicked");
                this.takePicture(this.camera.PictureSourceType.SAVEDPHOTOALBUM)
            }
        }]
    });
    actionsheet.present();
   }
   takePicture(sourceType) {
    console.log('selected source type :- '+sourceType);
    const options: CameraOptions = {
        destinationType: this.camera.DestinationType.DATA_URL,
        sourceType: sourceType,
        targetWidth: 1000,
        targetHeight: 1000
    }
    this.platform.ready().then(() => {
      this.camera.getPicture(options).then((imageData) => {
        // imageData is a base64 encoded string
          var base64Image = "data:image/jpeg;base64," + imageData;
          //console.log(base64Image);
          const storageRef = firebase.storage().ref().child('ProfilePic/'+ this.myDetailObj.myRandomId);
          storageRef.putString(imageData, 'base64').then((snapshot)=> {
              console.log('Uploaded a base64 string!');
              //console.log(snapshot);
              storageRef.getDownloadURL().then(url => {
                  console.log(url);
                  var uploadedImageUrl = url;
                  firebase.database().ref('/usersProfilePic').orderByChild('myRandomId').equalTo(this.myDetailObj.myRandomId).once('value', (snapshot) => {
                      console.log('ChattngPage : usersProfilePic data fetched');
                      var usersProfilePicObj = snapshot.val();
                      if(usersProfilePicObj == null) {
                        console.log('ChattngPage : deviceTokenObject is null');
                        var usersProfilePicDB = firebase.database().ref('/usersProfilePic').push();
                        usersProfilePicDB.set({
                            profilePicUrl: uploadedImageUrl,
                            myRandomId: this.myDetailObj.myRandomId,
                        });
                      } else {
                          var keyTemp = '';
                          for(var key in usersProfilePicObj){
                            keyTemp = key;
                          }
                          firebase.database().ref("usersProfilePic/"+keyTemp).update({'profilePicUrl': uploadedImageUrl});
                      }
                      this.storeProfilePicInLocalFile(uploadedImageUrl,base64Image);
                    });
              });
          });
      }, (err) => {
          console.log(err);
      });
    });
  }
  storeProfilePicInLocalFile(uploadedImageUrl,base64Image) {
    this.myDetailObj.localProfilePicUrl = base64Image;
    this.anonymousMessageIntoFileService.updateMyprofilePic(uploadedImageUrl).subscribe((mydetailObj:any)=>{
      this.myDetailObj = mydetailObj
    });
  }

}
