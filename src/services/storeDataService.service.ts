import { Injectable } from '@angular/core';
import { FileOperationService } from '../services/fileOperation.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class StoreDataService {
    
    profilePicsFileStorage : any = {};
    myDetailObj : any = {};
    friendListObj : any = {};
    chattingListObj : any = {};
    chattingWindowListObj : any = {};

    constructor(private fileOperationService: FileOperationService){}

    setProfilePicsFileStorage(profilePicsFileStorage) {
        let observable = new Observable(observer => {
            console.log('StoreDataService : setProfilePicsFileStorage : start');
            if(!profilePicsFileStorage) {
                console.log('StoreDataService : setProfilePicsFileStorage : profilePicsFileStorage is empty');
                this.fileOperationService.readFile('ChattingApp','profilePics.db.json').
                subscribe((profilePicsFileStorage: any) => {
                    console.log('StoreDataService : setProfilePicsFileStorage : profilePicsFileStorage fetched');
                    if(profilePicsFileStorage) {
                        console.log('StoreDataService : setProfilePicsFileStorage : profilePicsFileStorage is not empty');
                        this.profilePicsFileStorage = profilePicsFileStorage;
                        observer.next(true);
                    } else {
                        observer.next(false);
                        console.log('StoreDataService : setProfilePicsFileStorage : profilePicsFileStorage is empty');
                    }
                }); 
            } else {
                console.log('StoreDataService : setProfilePicsFileStorage : myDetailObj is not empty');
                observer.next(true);
                this.profilePicsFileStorage = profilePicsFileStorage;
            }
        });
        console.log('StoreDataService : setProfilePicsFileStorage : end');
        return observable;
    }

    getProfilePicsFileStorage() {
        console.log('StoreDataService : getProfilePicsFileStorage : start');
        if(Object.keys(this.profilePicsFileStorage).length == 0){
            console.log('StoreDataService : getProfilePicsFileStorage : profilePicsFileStorage is empty fetch from file');
            this.fileOperationService.readFile('ChattingApp','profilePics.db.json').
            subscribe((profilePicsFileStorage: any) => {
                console.log('StoreDataService : getProfilePicsFileStorage : profilePicsFileStorage fetched');
                if(!profilePicsFileStorage) {
                    console.log('StoreDataService : getProfilePicsFileStorage : profilePicsFileStorage is empty');
                    return false;
                }
                console.log('StoreDataService : getProfilePicsFileStorage : profilePicsFileStorage is not empty');
                this.setProfilePicsFileStorage(profilePicsFileStorage);
                return profilePicsFileStorage;
            }); 
        } else {
            console.log('StoreDataService : getProfilePicsFileStorage : profilePicsFileStorage is not empty');
            console.log(this.profilePicsFileStorage);
            return this.profilePicsFileStorage;
        }
        console.log('StoreDataService : getProfilePicsFileStorage : end');
    }

    setMyDetailObj(myDetailObj) {
        let observable = new Observable(observer => {
            console.log('StoreDataService : setMyDetailObj : start');
            if(!myDetailObj) {
                console.log('StoreDataService : setMyDetailObj : myDetailObj is empty');
                this.fileOperationService.readFile('ChattingApp','myDetail.db.json').
                subscribe((myDetailObjTemp: any) => {
                    console.log('StoreDataService : setMyDetailObj : myDetailObjTemp fetched');
                    if(myDetailObjTemp) {
                        console.log('StoreDataService : setMyDetailObj : myDetailObjTemp is not empty');
                        this.myDetailObj = myDetailObjTemp;
                        observer.next(true);
                    } else {
                        observer.next(false);
                        console.log('StoreDataService : setMyDetailObj : myDetailObjTemp is empty');
                    }
                }); 
            } else {
                console.log('StoreDataService : setMyDetailObj : myDetailObj is not empty');
                this.myDetailObj = myDetailObj;
                observer.next(true);
            }
            console.log('StoreDataService : setMyDetailObj : end');
        });
        return observable
    }

    getMyDetailObj() {
        console.log('StoreDataService : getMyDetailObj : start');
        if(Object.keys(this.myDetailObj).length == 0){
            console.log('StoreDataService : getMyDetailObj : myDetailObj is empty fetch from file');
            this.fileOperationService.readFile('ChattingApp','myDetail.db.json').
            subscribe((myDetailObjTemp: any) => {
                console.log('StoreDataService : getMyDetailObj : myDetailObjTemp fetched');
                if(!myDetailObjTemp) {
                    console.log('StoreDataService : getMyDetailObj : myDetailObjTemp is empty');
                    return false;
                }
                console.log('StoreDataService : getMyDetailObj : myDetailObjTemp is not empty');
                console.log(myDetailObjTemp);
                this.setMyDetailObj(myDetailObjTemp);
                return myDetailObjTemp;
            }); 
        } else {
            console.log('StoreDataService : getMyDetailObj : myDetailObj is not empty');
            console.log(this.myDetailObj);
            return this.myDetailObj;
        }
        console.log('StoreDataService : getMyDetailObj : end');
    }

    setFriendListObj(friendListObj) {
        let observable = new Observable(observer => {
            console.log('StoreDataService : setFriendListObj : start');
            if(!friendListObj) {
                console.log('StoreDataService : setFriendListObj : friendListObj is empty');
                this.fileOperationService.readFile('ChattingApp','userList.db.json').
                subscribe((friendListObjTemp: any) => {
                    console.log('StoreDataService : setFriendListObj : friendListObjTemp fetched');
                    if(friendListObjTemp) {
                        console.log('StoreDataService : setFriendListObj : friendListObjTemp is not empty');
                        if(friendListObjTemp[this.myDetailObj.myRandomId]){
                            delete friendListObjTemp[this.myDetailObj.myRandomId]; 
                        }
                        this.friendListObj = friendListObjTemp;
                        observer.next(true);
                    } else {
                        observer.next(false);
                        console.log('StoreDataService : setFriendListObj : friendListObjTemp is not empty');
                    }
                }); 
            } else {
                console.log('StoreDataService : setFriendListObj : friendListObj is not empty');
                this.friendListObj = friendListObj;
                this.fileOperationService.writeFile('ChattingApp','userList.db.json',friendListObj,true).subscribe(fileWritten => {
                    console.log('StoreDataService : setFriendListObj userList.db.json writeFile success');
                    observer.next(true);
                });
            }
            console.log('StoreDataService : setFriendListObj : end');
        });
        return observable;
    }
    getFriendListObj() {
        console.log('StoreDataService : getFriendListObj : start');
        if(Object.keys(this.friendListObj).length == 0){
            console.log('StoreDataService : getFriendListObj : friendListObj is empty fetch from file');
            this.fileOperationService.readFile('ChattingApp','userList.db.json').
            subscribe((friendListObjTemp: any) => {
                console.log('StoreDataService : getFriendListObj : friendListObjTemp fetched');
                if(!friendListObjTemp) {
                    console.log('StoreDataService : getFriendListObj : friendListObjTemp is empty');
                    return false;
                }
                console.log('StoreDataService : getFriendListObj : friendListObjTemp is not empty');
                console.log(friendListObjTemp);
                this.setFriendListObj(friendListObjTemp);
                return friendListObjTemp;
            }); 
        } else {
            console.log('StoreDataService : getFriendListObj : friendListObj is not empty');
            console.log(this.friendListObj);
            return this.friendListObj;
        }
        console.log('StoreDataService : getFriendListObj : end');
    }

    setChattingListObj(chattingListObj) {
        let observable = new Observable(observer => {
            console.log('StoreDataService : setChattingListObj : start');
            if(!chattingListObj) {
                console.log('StoreDataService : setChattingListObj : chattingListObj is empty');
                this.fileOperationService.readFile('ChattingApp','chatUsers.db.json').
                subscribe((chattingListObjTemp: any) => {
                    console.log('StoreDataService : setChattingListObj : chattingListObjTemp fetched');
                    if(chattingListObjTemp) {
                        console.log('StoreDataService : setChattingListObj : chattingListObjTemp is not empty');
                        observer.next(true);
                        this.chattingListObj = chattingListObjTemp;
                    } else {
                        observer.next(false);
                        console.log('StoreDataService : setChattingListObj : chattingListObjTemp is not empty');
                    }
                }); 
            } else {
                console.log('StoreDataService : setChattingListObj : chattingListObj is not empty');
                this.fileOperationService.writeFile('ChattingApp','chatUsers.db.json',chattingListObj,true).subscribe(fileWritten => {
                    console.log('StoreDataService : setChattingListObj chatUsers.db.json writeFile success');
                    observer.next(true);
                });
            }
            console.log('StoreDataService : setChattingListObj : end');
        });
        return observable;
    }
    getChattingListObj() {
        console.log('StoreDataService : getChattingListObj : start');
        if(Object.keys(this.chattingListObj).length == 0){
            console.log('StoreDataService : getChattingListObj : chattingListObj is empty fetch from file');
            this.fileOperationService.readFile('ChattingApp','chatUsers.db.json').
            subscribe((chattingListObjTemp: any) => {
                console.log('StoreDataService : getChattingListObj : chattingListObjTemp fetched');
                if(!chattingListObjTemp) {
                    console.log('StoreDataService : getChattingListObj : chattingListObjTemp is empty');
                    return false;
                }
                console.log('StoreDataService : getChattingListObj : chattingListObjTemp is not empty');
                console.log(chattingListObjTemp);
                this.setFriendListObj(chattingListObjTemp);
                return chattingListObjTemp;
            }); 
        } else {
            console.log('StoreDataService : getChattingListObj : chattingListObj is not empty');
            console.log(this.chattingListObj);
            return this.chattingListObj;
        }
        console.log('StoreDataService : getChattingListObj : end');
    }
    formatChattingListObj(messageObj) {
        console.log('ChattingPage : formatChattingListObj : start');
        var messageObjTemp : any = {};
        messageObjTemp.lastSenderId = messageObj.from;
        messageObjTemp.senderName = messageObj.senderName;
        messageObjTemp.chatToUserName = messageObj.chatToUserName;
        messageObjTemp.chatToUserId = messageObj.chatToUserId;
        messageObjTemp.lastMessage = messageObj.message;
        messageObjTemp.lastMessageDate = messageObj.sentTime,
        console.log('ChattingPage : formatChattingListObj : end');
        console.log(messageObjTemp);
        return messageObjTemp;
    }
    setChattingWindowListObj(messageObj,fileName) {
        let observable = new Observable(observer => {
            console.log('StoreDataService : setChattingWindowListObj : start');
            if(messageObj) {
                if(this.chattingWindowListObj[fileName] && this.chattingWindowListObj[fileName].messageList && this.chattingWindowListObj[fileName].messageList.length>0) {
                    console.log('StoreDataService : setChattingWindowListObj : chattingWindowListObj is not empty found mesage list for fileName :- '+fileName);
                    this.chattingWindowListObj[fileName].messageList.push(messageObj);
                    console.log(this.chattingWindowListObj[fileName]);
                } else {
                    console.log('StoreDataService : setChattingWindowListObj : chattingWindowListObj is empty not found mesage list for fileName :- '+fileName);
                    var messageList = [];
                    messageList.push(messageObj);
                    this.chattingWindowListObj[fileName] = {
                        messageList : messageList
                    }
                    console.log(this.chattingWindowListObj[fileName]);
                }
                console.log('StoreDataService : setChattingWindowListObj : messageObj is not empty');
                this.fileOperationService.writeFile('ChattingApp',fileName+'.db.json',this.chattingWindowListObj[fileName],true).subscribe(fileWritten => {
                    console.log('StoreDataService : setChattingWindowListObj '+fileName+'.db.json writeFile success');
                    observer.next(true);
                });
            } else {
                console.log('StoreDataService : setChattingWindowListObj : messageObj is empty');
                observer.next(false);
            }
            console.log('StoreDataService : setChattingWindowListObj : end');
        });
        return observable;
    }
    getChattingWindowListObjByFileName(fileName) {
        let observable = new Observable(observer => {
            console.log('StoreDataService : getChattingWindowListObj : start');
            if(this.chattingWindowListObj[fileName] && this.chattingWindowListObj[fileName].messageList.length > 0){
                console.log('StoreDataService : getChattingWindowListObj : chattingWindowListObj is not empty');
                console.log(this.chattingWindowListObj);
                observer.next(this.chattingWindowListObj[fileName].messageList);
            } else {
                console.log('StoreDataService : getChattingWindowListObj : chattingWindowListObj is empty fetch from file');
                this.fileOperationService.readFile('ChattingApp',+fileName+'.db.json').
                subscribe((messagesListObj: any) => {
                    console.log('StoreDataService : getChattingWindowListObj : chattingWindowList fetched');
                    if(!messagesListObj && messagesListObj.messageList && messagesListObj.messageList.length <= 0) {
                        console.log('StoreDataService : getChattingWindowListObj : chattingWindowList is empty');
                        observer.next(false);
                    }
                    console.log('StoreDataService : getChattingWindowListObj : chattingWindowList is not empty');
                    console.log(messagesListObj);
                    this.chattingWindowListObj[fileName] = messagesListObj;
                    observer.next(this.chattingWindowListObj[fileName].messageList);
                }); 
            }
            console.log('StoreDataService : getChattingWindowListObj : end');
        });
        return observable;
    }
}