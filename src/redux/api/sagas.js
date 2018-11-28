import { call, select, takeEvery, take, put, race } from 'redux-saga/effects';
import actions from './actions';
import uuidv1 from 'uuid/v1';
import config from '../../config';
import httpApi from '../../httpApi';
import { store } from '../../redux/store';
import { apiCall } from '../../helpers/apiWrapper'
import { userDiscovery } from '../../helpers/userDiscovery';

const apiHttp = httpApi(config.api.url,config.api.port);

// wait :: Number -> Promise
const wait = ms => (
    new Promise(resolve => {
        setTimeout(() => resolve(), ms)
    })
);

export const user = function*() {
    
    yield takeEvery('LOGOUT', function*(){
        yield apiHttp.send('-socket', {
            type: 'LOGOUT',
            payload: {
                path: '/control/logout/'
            }
        })
    })

    yield takeEvery('CONNECT', function*(){
        yield apiCall('CHECK_LOGGIN', '/rsLoginHelper/isLoggedIn')
    })

    yield takeEvery(['CHECK_LOGGIN_SUCCESS','QUERY_LOCATIONS'], function*(){
        yield apiCall('QUERY_LOCATIONS','/rsLoginHelper/getLocations')
    })

    yield takeEvery('QUERY_LOCATIONS_SUCCESS', function*(action) {
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
    })

    yield takeEvery(actions.CREATE_ACCOUNT, function*({type, payload = {}   }){
        const username = payload.username || uuidv1() + '_repo';
        const password = payload.password? payload.password: yield select(state => state.Api.password)
        yield apiCall(
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
    })

    yield takeEvery(actions.CREATE_ACCOUNT_SUCCESS, function*(action){
        yield put({ type: 'QUERY_LOCATIONS'})
        //yield put({ type: 'CREATE_USER_CHANNEL'})
    })

    yield takeEvery(actions.LOGIN, function*({type, payload}) {
        const password = payload.password? payload.password: yield select(state => state.Api.password)
        yield apiCall(actions.LOGIN,'/rsLoginHelper/attemptLogin', {
            account: payload.mLocationId,
            password: password
        })
    });

    yield takeEvery(['START_SYSTEM','GET_SELF_CERT'], function*(){
        const userId = yield select(state => state.Api.user.mLocationId)
        yield apiCall('GET_SELF_CERT','/rsPeers/GetRetroshareInvite',{
            sslId: userId
        })
    })

    yield takeEvery('GET_SELF_CERT_SUCCESS', function*(action){
        const user = yield select(state => state.Api.user.mLocationName);
        const key = action.payload.retval;
        yield put({type: 'START_DISCOVERY', payload: {user, key}})
    })

    yield takeEvery([actions.LOGIN_SUCCESS], function*() {
        yield wait(1000) // Graceful wait
        yield put({type: 'START_SYSTEM'})
    });
}


export const channels = function*() {
    yield takeEvery('START_SYSTEM' , function*(){
        yield put({ type: 'LOADCHANNELS' })
        let chansIds = [];
        while(true) {
            const winner = yield race({
                stopped: take('LOADCHANNEL_CONTENT_STOP'),
                tick: call(wait, 10000)
            })

            if (!winner.stopped) {              
                chansIds = yield select(state => state.Api.channels.map(channel => channel.mGroupId));
                yield put({type: 'LOADCHANNEL_CONTENT', payload: {
                 channels: chansIds
                }})
                yield put({ type: 'LOADCHANNELS' })
            } else {
                break
            }
    }
})

    yield takeEvery('LOADCHANNELS', function*() {
        yield apiCall('LOADCHANNELS','/rsGxsChannels/getChannelsSummaries');
    })

    yield takeEvery('LOADCHANNEL_EXTRADATA', function*(action) {
        yield apiCall('LOADCHANNEL_EXTRADATA','/rsGxsChannels/getChannelsInfo',{
            chanIds: action.payload.channels
        })
    })
    
    yield takeEvery('LOADCHANNEL_CONTENT', function*(action) {
        yield apiCall('LOADCHANNEL_POSTS','/rsGxsChannels/getChannelsContent',{
            chanIds: action.payload.channels
        })
    })

    yield takeEvery('LOADCHANNELS_SUCCESS', function*(action){
        //Autosubcrive _repo channels
        var a = 0;
        const user = yield select(state => state.Api.user)
        if(action.payload.channels.length === 0) {
            //Create user channel if not exist
            yield put({type: 'CREATE_USER_CHANNEL'})
        }
        while(action.payload.channels.length > a) {
            if(
                //If is open repo channel
                (action.payload.channels[a].mGroupName.indexOf('_repo') !== -1) &&
                //And im not subscribed
                (action.payload.channels[a].mSubscribeFlags === 8 ) &&
                //And not is my channel
                (action.payload.channels[a].mGroupName !== user.mLocationName)
            ) {
                yield apiCall('CHANNEL_SUBSCRIVE', '/rsGxsChannels/subscribeToChannel',{
                    channelId: action.payload.channels[a].mGroupId,
                    subscribe: true
                })
            }
            a++;
        }
    })
}


export const peers = function*() {
    yield takeEvery(['START_SYSTEM'], function*(action){
        yield put({type: 'LOADPEERS'})
        while(true) {
            const winner = yield race({
                stopped: take('PEER_MONITOR_STOP'),
                tick: call(wait, 10000)
            })

            if (!winner.stopped) {
                yield put({type: 'LOADPEERS'})
            } else {
                break
            }
        }
    });

    yield takeEvery('LOADPEERS', function*() {
        yield apiCall('PEERS','/rsPeers/getFriendList')
    })

    yield takeEvery('PEERS_SUCCESS', function*(action){
        const sslIds = action.payload.sslIds || [];
        if(sslIds.length > 0) {
            let i = 0;
            while(i < sslIds.length){
                yield put({type: 'LOADPEER_INFO', payload: {id: sslIds[i]}});
                i++;
            }
        }
        return;
    })

    yield takeEvery('LOADPEER_INFO', function*(action){
        yield apiCall('LOADPEER_INFO','/rsPeers/getPeerDetails',{
            sslId: action.payload.id
        })
    })

   yield takeEvery('LOADPEER_INFO_SUCCESS', function*(action){
        const result = yield apiCall('PEER_STATUS','/rsPeers/isOnline',{
                    sslId: action.payload.det.id
        })
        yield put({type: 'CHANGE_PEER_STATUS', payload: { id: action.payload.det.id, status: result.retval}})
    })

    let joinTier = 0;
    yield takeEvery('PEERS_SUCCESS', function*(action){
        if(joinTier !== 0) return;
        joinTier = 1;
        //if (typeof action.payload.sslIds !== 'undefined' && action.payload.sslIds.length === 0){
        if(true){
            const api = yield select(state => state.Api)
            if (api.cert)
                yield put({
                    type: actions.JOIN_TIER,
                    payload: {
                        url: config.tiers1[0].url,
                        remote: true,
                        cert: api.cert,
                        user: api.user.mLocationName
                    }
                })
        }
    })
}

export const search = function*(){
    yield takeEvery('START_SYSTEM' , function*(){
    })

    let resultSocketsRemote = null;

    //START SEARCH  REMOTE
    yield takeEvery('SEARCH_NEW', function*(action) {
        const data = {
            matchString: action.payload
        };
        
        if(resultSocketsRemote !== null) {
            resultSocketsRemote.close();
            resultSocketsRemote = null;
        }

        resultSocketsRemote = yield apiHttp.send('stream', {
                type: 'SEARCH_NEW',
                payload: {
                    path: '/rsGxsChannels/turtleSearchRequest',
                    data
                }
            })

        resultSocketsRemote.addEventListener('message', (eventData) => {
            if(typeof eventData.data.retval === 'undefined')
                store.dispatch({type: 'SEARCH_GET_RESULTS_SUCCESS', payload: JSON.parse(eventData.data)})
        })
    })


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
        yield apiCall('USER_FOLDERS','/rsFiles/getSharedDirectories')
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
        yield apiCall('CREATE_USER_CHANNEL','/rsGxsChannels/createChannel',newGroupData)
    })


    yield takeEvery('CREATE_POST', function*(action){
        const user = yield select(state => state.Api.user);
        const channels = yield select(state => state.Api.channels);
        
        const mGroupId = channels.reduce((prev,channel) => 
            (channel.mGroupName === user.mLocationName)? channel.mGroupId: prev,'')
        
        yield apiCall('CREATE_POST', '/rsGxsChannels/createPost', {
            post: {
                mMeta: {
                    mGroupId: mGroupId,
                    mMsgName: action.payload.title
                },
                mMsg: action.payload.description,
                mFiles: (action.payload.files || []).map(file => ({
                    mName: file.fileName,
                    mSize: file.size,
                    mHash: file.hash
                }))
            }
        })
    })

    yield takeEvery('DOWNLOAD_FILE', function*({type, payload}){
        yield apiCall('DOWNLOAD_FILE', '/rsFiles/FileRequest', {
            fileName: payload.mName,
            hash: payload.mHash,
            size: payload.mSize
        })
    })

    yield takeEvery(actions.CHECK_FILE_STATUS, function*({type, payload}){
        apiCall(actions.CHECK_FILE_STATUS, '/rsFiles/FileDetails', { hintflags: 128, hash: payload.mHash})
    })

    yield takeEvery(actions.GET_FILE_INFO, function*({type, payload}){
        apiCall(actions.GET_FILE_INFO, '/rsFiles/alreadyHaveFile', { hash: payload.mHash})
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