import { takeEvery, put } from 'redux-saga/effects'
import httpApi from '../../../httpApi';
import config from '../../../config';

const apiHttp = httpApi(config.api.url,config.api.port);

export const joinTiers = function*() {
    yield takeEvery('JOIN_TIER', function*(action){
        
        try {
            const result = yield fetch(action.payload.url, {
                body: {
                    invite: action.payload.cert,
                },
                headers: {'content-type': 'application/json'},
                method: 'POST'
            }).then(res => res.json())

            yield put({type: 'JOIN_TIER_SUCCESS', payload: result });
        } catch(e) {
            yield put({type: 'JOIN_TIER_FAILD', payload: { error: e, dataSend: action.payload.cert }});
        }
    });
    
    yield takeEvery (['JOIN_TIER_SUCCESS','ADD_FRIEND'], function*({type, payload = {}}){
        try {
            yield  apiHttp.send('api', {
                type: type,
                payload: {
                    path: '/rsPeers/acceptInvite',
                    data: {
                        invite: payload.cert || config.tiers1[0].credential
                    }
                }
            })
        } catch(e) {
            console.warn('Wrong cert', e, payload)
        }
    })
}