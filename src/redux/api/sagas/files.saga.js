import { call, all, select, takeEvery, take, put, race } from 'redux-saga/effects';
import { apiCall } from '../../../helpers/apiWrapper'
import actions from '../actions'

function* loadFiles({type, payload}) {
    try {
        yield call(apiCall,null, '/rsFiles/ForceDirectoryCheck');
        const root  = yield call(apiCall,null,'/rsFiles/requestDirDetails', { handle: 0 })
        const sharedFolder = yield call(apiCall,null,'/rsFiles/requestDirDetails', { handle: root.details.children[0].handle })
        const sharedFiles = yield call(apiCall,null,'/rsFiles/requestDirDetails', { handle: sharedFolder.details.children[0].handle })
        const files = sharedFiles.details.children.map(x => {x.path = `${sharedFiles.details.path}/${x.name}`; return x; })
        yield put({type: 'LOAD_FILES_SUCCESS', payload: { files }})
    }
    catch(e) {
        console.log('loadFiles',files)
    }
}

function* cancelDownload({ type, payload}) {
    try {
        const result = yield call(apiCall,null, '/rsFiles/FileCancel', { hash: payload.hash })
        if (result.retval === true && payload.reload === true) {
            yield put({ type: actions.DOWNLOAD_STATUS })
        }
    }
    catch(e){
        console.log('cancelDownloads', e)
    }
}

export function*files(){ 
    yield takeEvery('LOAD_FILES', loadFiles)
    yield takeEvery('CANCEL_DOWNLOAD', cancelDownload)
}