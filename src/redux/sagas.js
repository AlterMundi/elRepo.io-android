import { all, fork } from 'redux-saga/effects';
import { joinTiers } from './api/sagas/joinTier1';
import { user, channels, peers, search, contentMagnament, discoveryService } from './api/sagas';
export default function* rootSaga() {
  yield all([
    fork(user),
    fork(channels),
    fork(peers),
    fork(search),
    fork(joinTiers),
    fork(contentMagnament),
    fork(discoveryService)
  ]);
}
