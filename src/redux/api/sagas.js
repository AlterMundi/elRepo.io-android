import { call, all, select, takeEvery, take, put, race } from 'redux-saga/effects';
import actions from './actions';
import uuidv1 from 'uuid/v1';
import config from '../../config';
import httpApi from '../../httpApi';
import { store } from '../../redux/store';
import { apiCall } from '../../helpers/apiWrapper'
import RNFS from 'react-native-fs';
import {userDiscovery } from '../../helpers/userDiscovery';
import { Navigation } from 'react-native-navigation';
import { PermissionsAndroid } from 'react-native';

 function* requestCameraPermission() {
  try {
    const granted = yield PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        'title': 'elRepo.io necesita permisos de almacenamiento',
        'message': 'Es requerido para poder realizar descargas ' +
                   'y compartir los archivos que tu quieras.'
      }
    )
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the storage")
    } else {
      console.log("Storage permission denied")
    }
  } catch (err) {
    console.warn(err)
  }
}

const apiHttp = httpApi(config.api.url,config.api.port);

// wait :: Number -> Promise
const wait = ms => (
    new Promise(resolve => {
        setTimeout(() => resolve(), ms)
    })
);

const isUserChannels = userLocation =>channel => channel.mSubscribeFlags === 7 && channel.mGroupName === userLocation

function connect(){
    apiCall('CHECK_LOGIN', '/rsLoginHelper/isLoggedIn');
}

function queryLocations(){
    apiCall('QUERY_LOCATIONS','/rsLoginHelper/getLocations')
}

function* loginOrCreate(action) {
    const isLogged = yield select(state => state.Api.runstate === true);
    //Si no hay cuentas crear una
    if(action.payload.locations.length === 0)
        yield put({type: actions.CREATE_ACCOUNT})
    //Si el sistema tiene cuentas y fugura sin login hago lopgin
    else if (isLogged === false)
        yield put({type: actions.LOGIN, payload: action.payload.locations[0]})
    //Sino simulo un login exitoso
    else
        yield put({type: actions.LOGIN_SUCCESS, payload: action.payload.locations[0]})
}

function* createAccount({type, payload = {}   }){
    const username = payload.username || uuidv1() + '_repo';
    const password = payload.password? payload.password: yield select(state => state.Api.password)
    yield call(apiCall,
        actions.CREATE_ACCOUNT,
        '/rsLoginHelper/createLocation',
        {
            location: {
                mPpgName: username,
                mLocationName: username
            },
            password: password,
            makeHidden: false,
            makeAutoTor: false
        }
    )
}

function* login({type, payload}) {
    const password = payload.password? payload.password: yield select(state => state.Api.password)
    yield call(apiCall,actions.LOGIN,'/rsLoginHelper/attemptLogin', {
        account: payload.mLocationId,
        password: password
    })
}

function* goHome() {
    yield new Promise((res,rej) => {
        Navigation.setRoot({
            root: {
                sideMenu: {
                    id: "SideMenu",
                    right: {
                        visible: false,
                        component: {
                            id: "DownloadStatus",
                            name: "elRepoIO.downloadStatus"
                        }
                      },
                    left: {
                      component: {
                          id: "Drawer",
                          name: "navigation.elRepoIO.drawer"
                      }
                    },
                    center: {
                        stack: {
                            id:'App',
                            children: [{
                                component: {
                                    name: "elRepoIO.home",
                                }
                            }]
                        }, 
                    }
                }
            }
        })
        requestCameraPermission()
        res();
    })
}

function* getCertificate(){
    const userId = yield select(state => state.Api.user.mLocationId)
    yield call(apiCall,'GET_SELF_CERT','/rsPeers/GetRetroshareInvite',{
        sslId: userId
    })
}

function* startDiscovery(action){
    const user = yield select(state => state.Api.user.mLocationName);
    const key = action.payload.retval;
    yield put({type: 'START_DISCOVERY', payload: {user, key}})
}

function* triggerStartSystem() {

    yield put({type: 'START_SYSTEM'})
}

export const user = function*() {    
    yield takeEvery('CONNECT', connect)
    yield takeEvery([   actions.CREATE_ACCOUNT_SUCCESS,'CHECK_LOGIN_SUCCESS','QUERY_LOCATIONS'], queryLocations) 
    yield takeEvery('QUERY_LOCATIONS_SUCCESS', loginOrCreate)
    yield takeEvery(actions.CREATE_ACCOUNT, createAccount)
    yield takeEvery(actions.LOGIN, login)
    yield takeEvery(['START_SYSTEM','GET_SELF_CERT'], getCertificate)
    yield takeEvery('GET_SELF_CERT_SUCCESS', startDiscovery)
    yield takeEvery([actions.LOGIN_SUCCESS], triggerStartSystem)
    yield takeEvery([actions.LOGIN_SUCCESS], goHome)
}

export const search = function*(){
    yield takeEvery('START_SYSTEM' , function*(){
    })

    // let resultSocketsRemote = null;

    // //START SEARCH  REMOTE
    // yield takeEvery('SEARCH_NEW', function*(action) {
    //     const data = {
    //         matchString: action.payload
    //     };
        
    //     if(resultSocketsRemote !== null) {
    //         resultSocketsRemote.close();
    //         resultSocketsRemote = null;
    //     }

    //     resultSocketsRemote = yield apiHttp.send('stream', {
    //             type: 'SEARCH_NEW',
    //             payload: {
    //                 path: '/rsGxsChannels/turtleSearchRequest',
    //                 data
    //             }
    //         })

    //     resultSocketsRemote.addEventListener('message', (eventData) => {
    //         if(typeof eventData.data.retval === 'undefined')
    //             store.dispatch({type: 'SEARCH_GET_RESULTS_SUCCESS', payload: JSON.parse(eventData.data)})
    //     })
    // })


    let resultSocketsLocal = null;
    //START SEARCH  REMOTE
    yield takeEvery('SEARCH_NEW', function*(action) {
        const data = {
            matchString: action.payload
        };
        
        if(resultSocketsLocal !== null) {
            resultSocketsLocal.close();
            resultSocketsLocal = null;
        }

        resultSocketsLocal = yield apiHttp.send('stream', {
                type: 'SEARCH_NEW',
                payload: {
                    path: '/rsGxsChannels/localSearchRequest',
                    data
                }
            })

        resultSocketsLocal.addEventListener('message', (eventData) => {
            if(typeof eventData.data.retval === 'undefined')
                store.dispatch({type: 'SEARCH_GET_RESULTS_SUCCESS', payload: JSON.parse(eventData.data)})
        })
    })
}



export const contentMagnament = function*() {
    
    yield takeEvery('START_SYSTEM', function*(){
        yield call(apiCall,'USER_FOLDERS','/rsFiles/getSharedDirectories')
        yield call(apiCall,null, '/rsFiles/ForceDirectoryCheck');
    })  

    yield takeEvery(['CREATE_USER_CHANNEL'],function*({action, payload={}}){
        console.log(action)
        const user = yield select(state => state.Api.user);
        const newGroupData = {
            channel: {
                mAutoDownload: true,
                mMeta: {
                    mGroupName: typeof payload.location !== 'undefined' ? payload.location.mLocationName: false || user.mLocationName,
                    mGroupFlags: 4,
                    mSignFlags: 520,
                }
            }
        };
        yield call(apiCall,'CREATE_USER_CHANNEL','/rsGxsChannels/createChannel',newGroupData)
    })

    yield takeEvery('UPDATE_USER_CHANNEL',function*({type, payload}){
        const userLocation = yield select(state=> state.Api.user.mLocationName)
        const userChannels = yield select(state => state.Api.channels.filter(isUserChannels(userLocation)))

        const groupsData = yield call(apiCall, null,'/rsGxsChannels/getChannelsInfo',{
            chanIds: userChannels.map(x => x.mGroupId)
        })

        const newGroupsData = groupsData.channelsInfo.map(group => ({
            channel: {
                ...group,
                mImage: {mData: payload.image || "" },
                mDescription:payload.name? payload.name: group.mDescription
            }
        }));

        //console.log('AAAAA',newGroupsData)
        yield all(newGroupsData.map(group => call(apiCall, 'UPDATE_USER_CHANNEL', '/rsGxsChannels/editChannel', group)));
    })


    yield takeEvery('CREATE_POST', function*(action){
        const user = yield select(state => state.Api.user);
        const channels = yield select(state => state.Api.channels);
        
        const mGroupId = channels.reduce((prev,channel) => 
            (channel.mGroupName === user.mLocationName)? channel.mGroupId: prev,'')
        
        yield call(apiCall,'CREATE_POST', '/rsGxsChannels/createPost', {
            post: {
                mMeta: {
                    mGroupId: mGroupId,
                    mMsgName: action.payload.title
                },
                mThumbnail: action.payload.image? {mData: action.payload.image}: undefined,
                mMsg: action.payload.description,
                mFiles: action.payload.files || []
            }
        })
        //Reindex shared files
        yield call(apiCall,null, '/rsFiles/ForceDirectoryCheck');
    })

    yield takeEvery('DOWNLOAD_FILE', function*({type, payload}){
        const path = yield select(state => state.Api.folders[0].filename)
        const request = {
            fileName: payload.mName,
            hash: payload.mHash,
            size: payload.mSize,
            flags: 64,
            destPath: path
        }
        console.log('file', request)
        yield call(apiCall,'DOWNLOAD_FILE', '/rsFiles/FileRequest', request)
    })

    yield takeEvery(actions.CHECK_FILE_STATUS, function*({type, payload}){
        //FiledDownloadChunk --> MEJOR!!!
        yield call(apiCall,actions.CHECK_FILE_STATUS, '/rsFiles/FileDetails', { hintflags: 128, hash: payload.mHash})
    })

    yield takeEvery(actions.GET_FILE_INFO, function*({type, payload}){
        yield call(apiCall,actions.GET_FILE_INFO, '/rsFiles/alreadyHaveFile', { hash: payload.mHash})
    })

    yield takeEvery([actions.DOWNLOAD_STATUS, 'DOWNLOAD_FILE_SUCCESS'], function*({type, payload}){
        yield call(apiCall,actions.DOWNLOAD_STATUS, '/rsFiles/FileDownloads')
    })

     yield takeEvery(actions.DOWNLOAD_STATUS_SUCCESS, function*({type, payload}) {
        try {
            const filesData = yield all(payload.hashs.map(hash => call(apiCall,null, '/rsFiles/FileDownloadChunksDetails', { hash })))
            const filesDetails=  yield all(payload.hashs.map(hash => call(apiCall,null, '/rsFiles/FileDetails', { hintflags: 16, hash})))
            const filesDataWhitHash = filesData.map((data, key)=> ({...data.info, ...filesDetails[key]}))
            console.log(filesDataWhitHash)
            yield put({type: 'DOWNLOADING', payload: filesDataWhitHash})
        } catch(e) {
            console.error(e)
        }
     });

    yield takeEvery('START_SYSTEM' , function*(){
        //yield put({ type: 'DOWNLOAD_STATUS' })
        yield put({type: 'ADD_FOLDER'})
        while(true) {
            const winner = yield race({
                stopped: take('DONWLOAD_STATUS_STOP'),
                tick: call(wait, 10000)
            })

            if (!winner.stopped) {              
                yield put({type: 'DOWNLOAD_STATUS'})
            } else {
                break
            }
        }
    });

    yield takeEvery('ADD_FOLDER', function*(){
        yield call(apiCall,'ADD_FOLDER', '/rsFiles/setSharedDirectories',{dirs: [{shareflags: 128, filename: RNFS.ExternalDirectoryPath, parent_groups: [], virtualname: 'elrepoio'}]})
    })

}

export const discoveryService = function*() {
     yield takeEvery('START_DISCOVERY',function*({type, payload}){
         try {
             const result = yield userDiscovery.startService(payload)
             console.log({discovery: result})
         } catch(e){
             console.log({discovery: e})
         }
     })

    let certs = [];
    yield takeEvery('USER_DISCOVERY_RESULT',function*({type, payload}){
        const state = yield select(state => state.Api.promiscuous)
        const key = payload.key.replace(" ","").replace(/\\n/g,'\n')
        if(state && certs.indexOf(payload.key) === -1) {
            yield put({type: 'ADD_FRIEND', payload: {cert: key}})
            //certs = [...certs, key]
        }
    })
}