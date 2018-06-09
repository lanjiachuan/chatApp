import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { LocalNotifications } from '@ionic-native/local-notifications';

@Injectable()
export class LocalNotificationService {

    constructor(private localNotifications: LocalNotifications) { }
    
    triggerLocalNotification(messageObj) {
        console.log('LocalNotificationService : triggerLocalNotification start');
        let observable = new Observable(observer => {
           // this.localNotifications.cancelAll();
            this.getAllTriggeredLocalNotifications().subscribe((notificationList:any) => {
                var notificationObject :any = {};
                if(notificationList && notificationList.length > 0) {
                    console.log(notificationList);
                    notificationList.forEach(element => {
                        if(element.id == messageObj.from) {
                            notificationObject = JSON.parse(element.data);
                            messageObj.size = notificationObject.notificationArray.length;
                            messageObj.size = messageObj.size+1;
                        }
                    });
                    if(notificationObject.notificationArray && messageObj.size > 1) {
                        messageObj.customText = messageObj.size +" new messages";
                        notificationObject.notificationArray.push(messageObj);
                    } else {
                        notificationObject.notificationArray = [];
                        notificationObject.notificationArray.push(messageObj);
                    }
                } else {
                    notificationObject.notificationArray = [];
                    notificationObject.notificationArray.push(messageObj);
                }
                this.localNotifications.schedule({
                  id: messageObj.from,
                  text: messageObj.customText ? messageObj.customText : messageObj.message,
                  title: messageObj.senderName,
                  data: notificationObject
                });
                observer.next(true); 
            });

        });
        console.log('LocalNotificationService : triggerLocalNotification end');
        return observable;
    }
    
    onLocalNotificationClick() {
        console.log('LocalNotificationService : onLocalNotificationClick : start');
        let observable = new Observable(observer => {
            this.localNotifications.on('click', (notification, state) =>{
                console.log('LocalNotificationService : onLocalNotificationClick : clicked');
                console.log(notification);
                console.log(state);
                let eventData = JSON.parse(notification.data);
                console.log(eventData);
                observer.next(eventData); 
            });
        });
        console.log('LocalNotificationService : onLocalNotificationClick : start');
        return observable;
    }

    getAllTriggeredLocalNotifications() {
        console.log('LocalNotificationService : getAllTriggeredLocalNotifications start');
        let observable = new Observable(observer => {
            this.localNotifications.getAllTriggered().then((notificationList:any) =>{
                if(notificationList && notificationList.length>0) {
                    console.log(notificationList);
                    observer.next(notificationList); 
                } else {
                    observer.next(false);
                }
            });

        });
        console.log('LocalNotificationService : getAllTriggeredLocalNotifications end');
        return observable;
       
    }
}