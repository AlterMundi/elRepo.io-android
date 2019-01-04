import { call , takeEvery, put } from 'redux-saga/effects';
import { apiCall } from '../../../helpers/apiWrapper'

import { NativeModules } from 'react-native'
import { store } from '../../store';
const { RetroShareIntent } = NativeModules;

    const checkApi = ()=> {
        console.log('Checking api...')
        try {
            apiCall(null,'/rsLoginHelper/isLoggedIn')
                .then((res)=> { store.dispatch({type: 'CONNECT'}) })
                .catch((e) => {
                    console.log('Api not found', e)
                    setTimeout(startSystem, 1000)
                });
        } catch (e ) {
            console.log('Api not found', e)
            setTimeout(startSystem, 1000)
        }
    }
      
    const startSystem = () => {
      console.log('starting api')
      RetroShareIntent.startService()
        .then(()=> {  setTimeout(checkApi,1000) })
        .catch(()=> setTimeout(startSystem, 1000))   
    }
    
    function* restartService() {
        try {
            yield RetroShareIntent.stopService()
            yield call(setTimeout,startSystem, 2000)
        }
        catch(e) {
            startSystem();
            console.log(e)
        }
    }

    export const service = function*() {
        yield takeEvery('START_SERVICE', restartService);
    }