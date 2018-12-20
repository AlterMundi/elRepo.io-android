import { all, fork } from 'redux-saga/effects';
import { joinTiers } from './api/sagas/joinTier1';
import { user, search, contentMagnament, discoveryService } from './api/sagas';
import { peers } from './api/sagas/user.sagas'
import { channels } from './api/sagas/channels.saga'
import { files } from './api/sagas/files.saga'
export default function* rootSaga() {
    yield all([
    fork(user),
    fork(peers),
    fork(channels),
    fork(search),
    fork(joinTiers),
    fork(contentMagnament),
    fork(discoveryService),
    fork(files)
  ]);
}
