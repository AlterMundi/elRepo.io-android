import { takeEvery, put } from 'redux-saga/effects'
import httpApi from '../../../httpApi';
import { apiCall } from '../../../helpers/apiWrapper';
import config from '../../../config';
import { store } from '../../store';

const apiHttp = httpApi(config.api.url,config.api.port);

export const joinTiers = function*() {
    yield takeEvery('JOIN_TIER', function*(action){
        console.log(action.payload.cert.replace(/\n/g,'\\n'))
        try {
            const result = yield fetch(action.payload.url+ '/rsPeers/acceptInvite', {
                body: JSON.stringify({
                    invite: action.payload.cert
                }),
                headers: {'content-type': 'application/json'},
                method: 'POST'
            }).then(res => res.json())

            yield put({type: 'JOIN_TIER_SUCCESS', payload: { result, url: action.payload.url }});
        } catch(e) {
            yield put({type: 'JOIN_TIER_FAILD', payload: { error: e, dataSend: action.payload.cert}});
        }
    });
    
    yield takeEvery (['JOIN_TIER_SUCCESS'], function*({type, payload = {}}){    
        try {
            const result = yield fetch(payload.url+'/rsPeers/GetRetroshareInvite', {
                body: JSON.stringify({}),
                headers: {'content-type': 'application/json'},
                method: 'POST'
            }).then(res => res.json())
            console.log({result})
            const acceptInvite = yield apiCall('ADD_TIER_ONE','/rsPeers/acceptInvite',{
                invite: result.retval
            })
            yield put({type: 'GET_TIER_INVITE_SUCCESS', payload: acceptInvite});
        } catch(e) {
            yield put({type: 'GET_TIER_INVITE_FAILD', payload: { error: e, dataSend: action.payload.cert}});
        }
    });
    
    yield takeEvery (['ADD_FRIEND'], function*({type, payload = {}}){
        try {
            const result = yield apiCall(type,'/rsPeers/acceptInvite',{
                invite: payload.cert
            })
        } catch(e) {
            console.warn('Wrong cert', e, payload)
        }
    })
}