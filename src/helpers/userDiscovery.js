import { store } from '../redux/store';
import { Handshake }  from 'react-native-handshake';
import { NSD } from 'react-native-nsd';
import { DeviceEventEmitter } from 'react-native';
import { NativeModules } from 'react-native';


export const userDiscovery = {
    startService: ({user, key})=> new Promise((res,rej) => {
        
        if(typeof user === 'undefined' || typeof key === 'undefined'){
            rej({error: 'no_user_data'})
        }else{
            
            DeviceEventEmitter.addListener('handshakeServerStarted', function(e){
                res({status: 'running'});
                console.log(e.port);
                NSD.discover();
                setTimeout(()=>NSD.register(e.port), 2000);
              });
               
              DeviceEventEmitter.addListener('peerPubKeyReceived', function(e){
                console.log("JS: peer public key received");
                 store.dispatch({type: 'USER_DISCOVERY_RESULT',payload: {key: e.key}})
              });

              DeviceEventEmitter.addListener('serviceResolved', function(e){
                console.log("JS: service resolved");
                console.log(e.name, e.host, e.port); 
                Handshake.receiveKey(e.host, e.port);
              });

              Handshake.startServer(key.replace(/\n/g, "\\n"));
              
               
            // try {
            //     ipcRenderer.on('discovery-result',(event, result)=>{
            //         store.dispatch({type: 'USER_DISCOVERY_RESULT',payload: result})
            //     })
            //     ipcRenderer.send('discovery-start',{user, key});
            //     res({status: 'ok'})
            // } catch (e) {
            //     rej({status: 'error', error: e})
            // }
        }
    })
}