import { call, all, select, takeEvery, take, put, race } from 'redux-saga/effects';
import { apiCall } from '../../../helpers/apiWrapper'


function* loadFiles({type, payload}) {
    try {
        const root  = yield call(apiCall,null,'/rsFiles/requestDirDetails', { handle: 0 })
        const sharedFolder = yield call(apiCall,null,'/rsFiles/requestDirDetails', { handle: root.details.children[0].handle })
        const sharedFiles = yield call(apiCall,null,'/rsFiles/requestDirDetails', { handle: sharedFolder.details.children[0].handle })
        console.log({root, sharedFiles, sharedFolder})
        const files = sharedFiles.details.children.map(x => {x.path = `${sharedFiles.details.path}/${x.name}`; return x; })
        yield put({type: 'LOAD_FILES_SUCCESS', payload: { files }})
    }
    catch(e) {
        console.log('loadFiles',files)
    }
}

export function*files(){ 
    yield takeEvery('LOAD_FILES', loadFiles)
}