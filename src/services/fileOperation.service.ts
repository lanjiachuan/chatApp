import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FileOperationService {

    constructor(private file: File) { }
    
    createDir(dirName, replaceIfExist) {
        console.log('FileOperationService : createDir : dirName : '+dirName+' replaceIfExist : '+replaceIfExist);
        let observable = new Observable(observer => {
            this.file.createDir(this.file.externalRootDirectory, dirName, replaceIfExist).then(
                (files) => {
                    console.log('FileOperationService : createDir : file Created');
                    observer.next(true); 
                }
            ).catch(
                (err) => {
                    console.log('FileOperationService : createDir : file not Created');
                    console.log(err);
                    observer.next(false); 
                }
            );
        });
        return observable;
    }
    writeFile(dirName, fileName,data,replaceIfExist) {
        console.log('FileOperationService : writeFile : dirName: '+dirName +' fileName: '+fileName+' data:'+data+' replaceIfExist :'+replaceIfExist);
        let observable = new Observable(observer => {
            data = JSON.stringify(data);
            console.log(data);
            this.file.writeFile(this.file.externalRootDirectory+'/'+dirName, fileName, data,{replace: replaceIfExist})
            .then((success) => {     
                console.log('FileOperationService : writeFile : file written success');
                console.log(success);
                observer.next(true);
            })
            .catch((err) => {
                console.log('FileOperationService : writeFile : file not written : file name :- '+fileName);
                console.error(err);
                observer.next(false); 
            });
        });
        return observable;
    }
    writeExistingFile(dirName, fileName, data:any){
        console.log('FileOperationService : writeExistingFile : dirName: '+dirName+' fileName: '+fileName+' data: '+data);
        let observable = new Observable(observer => {
            data = JSON.stringify(data);
            console.log(data);
            this.file.writeExistingFile(this.file.externalRootDirectory+'/'+dirName, fileName, data)
            .then((success) => {      
                console.log('FileOperationService : writeExistingFile : writeExistingFile success');
                console.log(success);
                observer.next(true); 
            })
            .catch((err) => {
                console.log('FileOperationService : writeExistingFile : writeExistingFile failed :- '+fileName);
                console.error(err);
                observer.next(false); 
            });
        });
        return observable;
    }
    readFile(dirName, fileName) {
        console.log('FileOperationService : readFile: dirName: '+dirName+' fileName: '+fileName);
        let observable = new Observable(observer => {
            this.file.readAsText(this.file.externalRootDirectory+'/'+dirName, fileName)
            .then((data) => {      
                console.log(data);
                if(data) {
                    console.log('FileOperationService : readFile: success');
                    observer.next(JSON.parse(data));  
                } else {
                    console.log('FileOperationService : readFile: failed :- '+fileName);
                    observer.next(false);  
                }
            })
            .catch((err) => {
                console.log('FileOperationService : readFile: failed :- '+fileName);
                console.error(err);
                observer.next(false); 
            });
        });
        return observable;
    }
    checkFile(dirName,fileName) {
        console.log('FileOperationService : checkFile: dirName: '+dirName+' fileName: '+fileName);
        console.log(this.file.externalRootDirectory+''+dirName+' file name: '+fileName);
        let observable = new Observable(observer => {
            this.file.checkFile(this.file.externalRootDirectory+'/'+dirName, fileName)
            .then((success) => {      
                console.log('FileOperationService : checkFile: success');
                console.log(success);
                observer.next(true); 
            })
            .catch((err) => {
                console.log('FileOperationService : checkFile: failed :- '+fileName);
                console.error(err);
                observer.next(false); 
            });
        });
        return observable;
    }
    removeFile(dirName,fileName) {
        console.log('FileOperationService : removeFile: dirName: '+dirName+' fileName: '+fileName);
        console.log(this.file.externalRootDirectory+''+dirName+' file name: '+fileName);
        let observable = new Observable(observer => {
            this.file.removeFile(this.file.externalRootDirectory+'/'+dirName, fileName)
            .then((success) => {      
                console.log('FileOperationService : removeFile: success');
                console.log(success);
                observer.next(true); 
            })
            .catch((err) => {
                console.log('FileOperationService : removeFile: failed :- '+fileName);
                console.error(err);
                observer.next(false); 
            });
        });
        return observable;
    }
}