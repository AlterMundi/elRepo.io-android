import { call, all, select, take, takeEvery, put } from 'redux-saga/effects';
import actions from '../actions';
import config from '../../../config';
import { apiCall } from '../../../helpers/apiWrapper'

// wait :: Number -> Promise
const wait = ms => (
    new Promise(resolve => {
        setTimeout(() => resolve(), ms)
    })
);

function* loadPeers() {
    while(true){
        
        //Get peers sslIds
        const peersList = yield call(apiCall,null,'/rsPeers/getFriendList');
        
        //Add peers info
        if(typeof peersList !== 'undefined' && typeof peersList.sslIds !== 'undefined') {
            const peersInfo = yield all(
                peersList.sslIds.map(sslId => call(apiCall,null,'/rsPeers/getPeerDetails',{ sslId }))
            );
            yield put({type: 'PEERS_INFO_SUCCESS', payload: peersInfo.map(x => x.det)})
        }
        //Wait 60 seconds  and re-run
        yield call (wait, 60000)
    }
}

function* getPeersStatus({action, payload}){
    //Attach peers status
    const peersStatus = yield all(payload.map(peer => call(apiCall,null,'/rsPeers/isOnline',{
        sslId: peer.id
    })))
    yield put({
        type: 'CHANGE_PEERS_STATUS',
        payload: peersStatus.map((result,key)=> ({ id: payload[key].id, status: result.retval }))
    })
}

var joinTier = 0;
function* checkTiers(action){
    if(joinTier !== 0) return;
    joinTier = 1;
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

export const peers = function*() {
    yield takeEvery(['START_SYSTEM','LOADPEERS'], loadPeers)
    yield takeEvery('PEERS_INFO_SUCCESS', getPeersStatus)
    yield takeEvery('PEERS_INFO_SUCCESS', checkTiers)
}
