import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Platform } from 'ionic-angular';
import { BroadcasterService } from './broadcaster.service';
import * as io from 'socket.io-client';

@Injectable()
export class ChatService {
    url = 'https://enigmatic-thicket-65445.herokuapp.com'
    testUrl = 'http://localhost:3000/'
    private socket;

    constructor(private platform: Platform, private broadcasterService: BroadcasterService) { 
      console.log('ChatService constructor');
      console.log(this.socket);
      if(!this.socket) {
        console.log('ChatService : constructor : socket is null create new');
        if(this.platform.is('core') || this.platform.is('mobileweb')) {
          //in Browser
          var myRandomId = sessionStorage.getItem('myRandomId');
          console.log('myRandomId :- ' + myRandomId);
          console.log('ChatService : constructor : call createSocketConnection');
          this.createSocketConnection(myRandomId);
        } else {
            //in App
            broadcasterService.on<string>('initiate-socket')
            .subscribe((myRandomId:any) => {
              console.log('ChatService : constructor : initiate-socket received myRandomId :- '+myRandomId);
              console.log('ChatService : constructor : call createSocketConnection');
              this.createSocketConnection(myRandomId);
            });
        }
       // this.emitFailed();
       // this.disconnect();
      }
    }

    createSocketConnection(myRandomId) {
      console.log('ChatService : createSocketConnection : start');
      this.socket = io(this.url, {query: 'myRandomId='+myRandomId});
      console.log('ChatService constructor : this.socket created');
      console.log('ChatService : createSocketConnection : end');
    }

    sendMessage(message){
        console.log('ChatService : sendMessage : message sent');
        this.socket.emit('send-message', message);    
    }
      
    getMessages(myRandomId) {
      console.log('ChatService : getMessages : start');
      let observable = new Observable(observer => {
        this.socket.on(myRandomId, (data) => {
          console.log('ChatService : getMessages : message received');
          console.log(data);
          // if(data == 'message-received') {
          //   console.log('hurreey');
          //   data = {};
          //   data.messageAck = true;
          // } else {
          //   this.socket.emit('message-received', data); 
          // }
          
          observer.next(data); 
        });
        // this.socket.on("220072255", (data) => {
        //   console.log('ChatService : getMessages : message received');
        //   console.log(data);
        //   //alert(data);
        //   observer.next(data); 
        // });
        // return () => {
        //   this.socket.disconnect();
        // };  
      })     
      console.log('ChatService : getMessages : end');
      return observable;
    }
    disconnectClient() {
      console.log('ChatService : disconnectClient : start');
      this.socket.disconnect();
      console.log('ChatService : disconnectClient : end');
    }
    // disconnect() {
    //   this.socket.on('disconnect', function() {
    //     console.log('socket disconnect');
    //     // Do stuff (probably some jQuery)
    //   });
    // }  
    // emitFailed() {
    //   this.socket.on('error', function (message) { 
    //     alert( 'error in transport: ' + message );
    //   });
    // }
}