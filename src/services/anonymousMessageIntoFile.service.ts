import { Injectable } from '@angular/core';
import { FileOperationService } from '../services/fileOperation.service';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { BroadcasterService } from './broadcaster.service';
import {Observable} from 'rxjs/Observable';
import { StoreDataService } from '../services/storeDataService.service';

@Injectable()
export class AnonymousMessageIntoFileService {
    
    fileTransfer: FileTransferObject = this.transfer.create();
    myDetailObj : any = {};

    constructor(private broadcasterService : BroadcasterService,
        private fileOperationService: FileOperationService, 
        private file: File, private transfer: FileTransfer,
        private storeDataService : StoreDataService) {
            console.log('AnonymousMessageIntoFileService constructor');
    }
    // setMyDetailObj(myProfilePicObj) {
    //     this.myDetailObj = myProfilePicObj;
    // }
    // getMyDetailObj() {
    //     if(Object.keys(this.myDetailObj).length <= 0) {
    //         return false;
    //     }
    //     return this.myDetailObj;
    // }
    insertIntoChattingFile(fileInitialName, data) {
        console.log('AnonymousMessageIntoFileService : insertIntoChattingFile : start : fileInitialName: '+fileInitialName+' data: '+data);  
        console.log(data);
        let observable = new Observable(observer => {
                if(data instanceof Array) {
                    console.log('AnonymousMessageIntoFileService : insertIntoChattingFile :'+fileInitialName+'.db.json data is array');

                    var chattingMessageObjTemp = {}
                    chattingMessageObjTemp = {
                        chattingMessage : data
                    }
                    this.fileOperationService.writeFile('ChattingApp',fileInitialName+'.db.json',chattingMessageObjTemp,true).subscribe(fileWritten => {
                        console.log('AnonymousMessageIntoFileService : insertIntoChattingFile :'+fileInitialName+'.db.json fileWritten');
                        observer.next(true);
                    });
                } else {
                    console.log('AnonymousMessageIntoFileService : insertIntoChattingFile :'+fileInitialName+'.db.json data is object');
                    this.fileOperationService.readFile('ChattingApp',fileInitialName+'.db.json').subscribe((chattingMessageObj:any) => {
                        console.log('AnonymousMessageIntoFileService : insertIntoChattingFile : readFile '+fileInitialName+'.db.json done');
                        if(chattingMessageObj) {
                            console.log('AnonymousMessageIntoFileService : insertIntoChattingFile : readFile '+fileInitialName+'.db.json not empty');
                            console.log(chattingMessageObj);
                            chattingMessageObj.chattingMessage.push(data);
                            this.fileOperationService.writeFile('ChattingApp',fileInitialName+'.db.json',chattingMessageObj,true).subscribe(fileWritten => {
                                console.log('AnonymousMessageIntoFileService : insertIntoChattingFile :'+fileInitialName+'.db.json writeExistingFile fileWritten');
                                observer.next(true);
                            });
                        } else {
                            console.log(chattingMessageObj);
                            console.log('AnonymousMessageIntoFileService : insertIntoChattingFile : readFile '+fileInitialName+'.db.json empty');
                            var chattingMessageObjTemp = {}
                            var chattingMessageArray = [];
                            chattingMessageArray.push(data);
                            chattingMessageObjTemp = {
                                chattingMessage : chattingMessageArray
                            }
                            console.log(chattingMessageObjTemp);
                            this.fileOperationService.writeFile('ChattingApp',fileInitialName+'.db.json',chattingMessageObjTemp,true).subscribe(fileWritten => {
                                console.log('AnonymousMessageIntoFileService : insertIntoChattingFile :'+fileInitialName+'.db.json writeExistingFile fileWritten');
                                observer.next(true);
                            });
                        }
                    });
                    
                }
        });
        return observable;
    }

    insertIntoChatUserFile(chattingListObj, messageObj) {
        console.log('AnonymousMessageIntoFileService : insertIntoChatUserFile : start : chatUsers.db.json data: '+messageObj);  
        console.log(messageObj);
        console.log(chattingListObj);
        let observable = new Observable(observer => {
            console.log(chattingListObj);
            console.log(messageObj);
            if(!chattingListObj.chatting) {
                console.log('AnonymousMessageIntoFileService : insertIntoChatUserFile : chattingListObj is null');
                this.fileOperationService.readFile('ChattingApp','chatUsers.db.json').subscribe((chattingMessageObj:any) => {
                    if(!chattingMessageObj) {
                        console.log('AnonymousMessageIntoFileService : insertIntoChatUserFile : chattingMessageObj is null');
                        chattingMessageObj = {};
                    }
                    console.log(chattingMessageObj);
                    if(messageObj instanceof Array) {
                        console.log('AnonymousMessageIntoFileService : insertIntoChatUserFile : messageObj is array');
                        messageObj.forEach(element => {
                            console.log('AnonymousMessageIntoFileService : insertIntoChatUserFile : inside messageObj for');
                            console.log(chattingMessageObj);
                            chattingMessageObj = this.createChattingListObj(chattingMessageObj, element);
                        });
                    } else {
                        console.log('AnonymousMessageIntoFileService : insertIntoChatUserFile : messageObj is not array');
                        var chattingMessageObj = this.createChattingListObj(chattingMessageObj, messageObj);
                    }
                    console.log(chattingMessageObj);
                    console.log('AnonymousMessageIntoFileService : insertIntoChatUserFile : start : chatUsers.db.json checkFile file exist data is array');  
                    this.fileOperationService.writeFile('ChattingApp','chatUsers.db.json',chattingMessageObj,true).subscribe(fileWritten => {
                        console.log('AnonymousMessageIntoFileService : insertIntoChatUserFile : start : chatUsers.db.json checkFile file writeExistingFile success');
                        observer.next(chattingMessageObj);
                    });
                }); 
            } else {
                console.log('AnonymousMessageIntoFileService : insertIntoChatUserFile : chattingListObj is not null');
                var chattingListObjTemp = this.createChattingListObj(chattingListObj, messageObj);
                console.log('AnonymousMessageIntoFileService : insertIntoChatUserFile : start : chatUsers.db.json checkFile file exist data is array');  
                this.fileOperationService.writeFile('ChattingApp','chatUsers.db.json',chattingListObjTemp,true).subscribe(fileWritten => {
                    console.log('AnonymousMessageIntoFileService : insertIntoChatUserFile : start : chatUsers.db.json checkFile file writeExistingFile success');
                    observer.next(chattingListObjTemp);
                });
            }

        });
        return observable;
    }
    // getMyDetailObjFromLocalFile() {
    //     console.log('AnonymousMessageIntoFileService : getMyDetailObjFromLocalFile : start');
    //     let observable = new Observable(observer => {
    //         this.fileOperationService.readFile('ChattingApp','myDetail.db.json').subscribe((myDetailObj:any) => {
    //             console.log('AnonymousMessageIntoFileService : getMyDetailObjFromLocalFile : myDetail.db.json file read complete');
    //             if(myDetailObj) {
    //                 console.log(myDetailObj);
    //                 this.setMyDetailObj(myDetailObj);
    //                 observer.next(myDetailObj);
    //             } else {
    //                 observer.next(false);
    //             }
    //         });
    //         console.log('AnonymousMessageIntoFileService : getMyDetailObjFromLocalFile : end');
    //       });
    //     return observable;
    // }
    createChattingListObj(chattingListObj, messageObj) {
        console.log(chattingListObj);
        console.log(messageObj);
        console.log(chattingListObj)
        console.log('AnonymousMessageIntoFileService : createChattingListObj : start');
        var chatObj = {};
        if(!chattingListObj.chatting) {
                console.log('AnonymousMessageIntoFileService : createChattingListObj : chattingListObj empty');
                chatObj = {
                    senderName : messageObj.senderName,
                    lastMessage : messageObj.message,
                    lastMessageDate : messageObj.sentTime,
                    lastSenderId : messageObj.lastSenderId,
                    chatToUserName  : messageObj.chatToUserName,
                    chatToUserId : messageObj.chatToUserId
                }
                chattingListObj = {};
                chattingListObj.chatting = [];
                chattingListObj.chatting.push(chatObj);
        } else {
            console.log('AnonymousMessageIntoFileService : createChattingListObj : chattingListObj not empty');
            var chatUpdateObjIndex : number;
            chattingListObj.chatting.map((element, index) => {
                if(element.chatToUserId == messageObj.chatToUserId) {
                    chatUpdateObjIndex = index
                    return true;
                }
            }); 
            if(chatUpdateObjIndex >= 0) {
                console.log('AnonymousMessageIntoFileService : createChattingListObj : chatUpdateObjIndex not empty');
                chattingListObj.chatting[chatUpdateObjIndex].lastMessage = messageObj.message;
                chattingListObj.chatting[chatUpdateObjIndex].lastSenderId = messageObj.lastSenderId;
                chattingListObj.chatting[chatUpdateObjIndex].lastMessageDate = messageObj.sentTime;
            } else {
                console.log('AnonymousMessageIntoFileService : createChattingListObj : chatUpdateObjIndex empty');
                chatObj = {
                    senderName : messageObj.senderName,
                    lastMessage : messageObj.message,
                    lastMessageDate : messageObj.sentTime,
                    lastSenderId : messageObj.lastSenderId,
                    chatToUserName  : messageObj.chatToUserName,
                    chatToUserId : messageObj.chatToUserId
                };
                chattingListObj.chatting.push(chatObj);
                console.log('AnonymousMessageIntoFileService : createChattingListObj : chattingListObj created');
            }
        }
        console.log('AnonymousMessageIntoFileService : createChattingListObj : end');
        return chattingListObj;
    }
    updateProfilePicService(profilePicsDBObj) {
            console.log('AnonymousMessageIntoFileService : updateProfilePic start');
            console.log(profilePicsDBObj);
            var profilePicObjectTemp = this.storeDataService.getProfilePicsFileStorage();
            if(!profilePicObjectTemp) {
                console.log('profilePicObjectTemp is empty fetching from local file');
                this.processProfilePic(profilePicsDBObj, false);
            } else {
                console.log('profilePicObjectTemp is no empty');
                this.processProfilePic(profilePicsDBObj, profilePicObjectTemp);
            }

    }
    processProfilePic(profilePicsDBObj, profilePicsFileObj) {
        var isDownloadRequired = false;
        var downloadKeys = [];
        if(profilePicsFileObj) { 
            console.log('AnonymousMessageIntoFileService : updateProfilePic read file profilePicsObj is not null');
            for (var key in profilePicsDBObj) {
                console.log('for start : key :- '+key);
                if (!profilePicsFileObj.hasOwnProperty(key)) {
                    console.log('AnonymousMessageIntoFileService: updateProfilePic : new entry');
                    profilePicsFileObj[key] = {
                        "profilePicUrl" : profilePicsDBObj[key].profilePicUrl,
                    }
                    isDownloadRequired = true;
                    downloadKeys.push(key);
                    console.log("AnonymousMessageIntoFileService: updateProfilePic : isDownloadRequired:-"+isDownloadRequired);
                    continue;
                }
                console.log('AnonymousMessageIntoFileService: updateProfilePic : not new');
                if(profilePicsDBObj[key].profilePicUrl != profilePicsFileObj[key].profilePicUrl) {
                    console.log('AnonymousMessageIntoFileService: updateProfilePic : profilePicUrl not matching');
                    profilePicsFileObj[key].profilePicUrl = profilePicsDBObj[key].profilePicUrl;
                    isDownloadRequired = true;
                    downloadKeys.push(key);
                    console.log("AnonymousMessageIntoFileService: updateProfilePic : isDownloadRequired:-"+isDownloadRequired);
                }
            }
            console.log('for complete');
        } else {
            isDownloadRequired = true;
            profilePicsFileObj = profilePicsDBObj;
            console.log(profilePicsFileObj);
            downloadKeys = Object.keys(profilePicsDBObj);
            console.log('AnonymousMessageIntoFileService : updateProfilePic read file profilePicsObj is null create new file');
        }
        if(isDownloadRequired) {
            var tempKeys = downloadKeys;
            downloadKeys.forEach((key) => {
                console.log('for start : key :- '+key);
                if(!profilePicsFileObj[key].profilePicName) {
                    profilePicsFileObj[key].profilePicName = 'null';
                }
                this.downloadImage(key,profilePicsFileObj[key].profilePicUrl,profilePicsFileObj[key].profilePicName).subscribe((profilePicsObj:any) => {
                    console.log('donwload complete');
                    profilePicsFileObj[profilePicsObj.key].localProfilePicUrl = profilePicsObj.localProfilePicUrl;
                    profilePicsFileObj[profilePicsObj.key].profilePicName = profilePicsObj.profilePicName;
                    console.log('donwload complete : remove from array key:- '+profilePicsObj.key);
                    var index = tempKeys.indexOf(profilePicsObj.key);
                    if (index > -1) {
                        console.log('donwload complete : index :- '+index);
                        tempKeys.splice(index, 1);
                        console.log(tempKeys);
                    }
                    if(tempKeys.length <= 0) {
                        this.storeDataService.setProfilePicsFileStorage(profilePicsFileObj).subscribe(()=>{
                            console.log(profilePicsFileObj);
                            console.log('AnonymousMessageIntoFileService : updateProfilePic : write file profilePics for key :- '+profilePicsObj.key);
                            this.fileOperationService.writeFile('ChattingApp','profilePics.db.json',profilePicsFileObj,true).subscribe(fileWritten => {
                                console.log('AnonymousMessageIntoFileService : updateProfilePic : start : profilePics.db.json writeFile success');
                                this.broadcasterService.broadcast('update-profilePic-chatting', profilePicsFileObj);
                                this.broadcasterService.broadcast('update-profilePic-friendList', profilePicsFileObj);
                                this.broadcasterService.broadcast('update-profilePic-chatting-window-page', profilePicsFileObj);
                            });    
                        });
                    }
                });
            });
        } else {
            console.log('download not required  isDownloadRequired :- '+isDownloadRequired);
        }
    }
    downloadImage(key,profilePicUrl,profilePicName) {
        console.log('AnonymousMessageIntoFileService : downloadImage : start : key-'+key+'profilePicName :- '+profilePicName);
            let observable = new Observable(observer => {
                this.fileOperationService.removeFile('ChattingApp/ProfilePics',profilePicName+'.png').subscribe((fileRemoved) => {
                    let currentTimeStamp =new Date().getTime();
                    let profilePicName = key + currentTimeStamp;
                    this.fileTransfer.download(profilePicUrl, this.file.externalRootDirectory+'ChattingApp/ProfilePics/' + profilePicName+'.png')
                    .then((entry) => {
                      console.log('AnonymousMessageIntoFileService : downloadImage : download complete: ' + entry.toURL());
                      console.log("AnonymousMessageIntoFileService : downloadImage : key :- "+key);
                      var returnObj = {
                          key : key,
                          localProfilePicUrl : entry.toURL(),
                          profilePicName : profilePicName
                      }
                      observer.next(returnObj);
                    }, (error) => {
                      // handle error
                      console.log('AnonymousMessageIntoFileService : downloadImage : error');
                      console.log(error);
                    });
                  });
                });
              console.log('AnonymousMessageIntoFileService : downloadImage : end');
        return observable;
      }
      updateMyprofilePic(uploadedImageUrl) {
        console.log('AnonymousMessageIntoFileService updateMyprofilePic : start');
        let observable = new Observable(observer => {
            var mydetailObj = this.storeDataService.getMyDetailObj();
            if(mydetailObj) {
                if(!mydetailObj.profilePicName) {
                    mydetailObj.profilePicName = 'null';
                }
                this.downloadImage(mydetailObj.myRandomId,uploadedImageUrl,mydetailObj.profilePicName).subscribe((returnObj:any)=>{
                    mydetailObj.localProfilePicUrl = returnObj.localProfilePicUrl;
                    this.storeDataService.setMyDetailObj(mydetailObj).subscribe(()=>{
                        this.fileOperationService.writeFile('ChattingApp','myDetail.db.json',mydetailObj,true).subscribe(fileCreated => {
                            console.log('AnonymousMessageIntoFileService : updateMyprofilePic:  writeFile : myDetail.db.json');
                            console.log('AnonymousMessageIntoFileService: updateMyprofilePic : End');
                            observer.next(mydetailObj);
                        });
                    });
                });
            } else {
                console.log('AnonymousMessageIntoFileService : updateMyprofilePic : mydetail is null');
            }
            console.log('AnonymousMessageIntoFileService updateMyprofilePic : end');
        });
        return observable;
      }
      insertNotificationMessages(messageObj) {
        console.log('AnonymousMessageIntoFileService insertNotificationMessages : start');

        console.log('AnonymousMessageIntoFileService insertNotificationMessages : end');
      }
}