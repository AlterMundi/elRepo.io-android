import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import RNGRP from 'react-native-get-real-path'
 const uuid = require('uuid/v4');

export const fileUploader = {
    openDialog: ()=> new Promise((res,rej) => {
        DocumentPicker.show({
            filetype: [DocumentPickerUtil.allFiles()],
          },(error,data) => {
            // Android
            RNGRP.getRealPathFromURI(data.uri).then(filePath =>
                RNFS.hash(filePath, 'sha1')
                    .then(hash => {
                        res({
                            uri: filePath,
                            type: data.type, // mime type
                            mName: data.fileName,
                            mSize: data.fileSize,
                            mHash: hash
                        });
                    })
                    .catch(e => console.log('aaaaaa', e))
            );
          })
    }),
    shareFiles: (files = [], destination) => new Promise((res,rej)=>{
        const uploads = new Promise.all(
            files.map(file => RNFS.copyFile(file.uri, destination+'/'+file.mName))
        ).then(res).catch(rej)
    })
};