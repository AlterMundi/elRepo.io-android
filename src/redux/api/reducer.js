import { actions } from "./actions";
import md5 from 'blueimp-md5';

const infoToObj = (channelsArray) => {
    return channelsArray
        .map(channelData => ({[channelData.mMeta.mGroupId]: channelData}))
        .reduce((prev, act) => ({...prev, ...act}),{})
    
}

const onlyRepoChannels = (channels=[])  => channels.filter(channel => channel.mGroupName.indexOf('_repo') !== -1)

const normalizePost = (post) => ({
    key: post.mMeta.mMsgId,
    mCount: post.mCount,
    mFiles: post.mFiles,
    mMsg: post.mMsg,
    mMeta: {
        mMsgId: post.mMeta.mMsgId,
        mMsgName: post.mMeta.mMsgName,
        mPublishTs: post.mMeta.mPublishTs
    },
    mThumbnail: post.mThumbnail || {mData: ""}
})

const initState = {
    login: false,
    password: "0000",
    runstate: null,
    channels: [],
    cert: null,
    search: null,
    results: [],
    channelsInfo: {},
    posts: [],
    promiscuous: true,
    folders: [],
    downloading: [],
    alreadyDownloaded: [],
    files: [],
    fileInfo: {},
    peersStatus:  {},
    status: 'Iniciando servicio'
}

export default function apiReducer(state = initState, action) {
    switch(action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                login: true,
                runstate: true,
                status: 'Todo listo! Arrancando...'
            }
        case 'CHECK_LOGIN_FAILD':
            return {
                ...state,
                status: 'Error al intentar iniciar el servicio'
            }
        case 'CHECK_LOGIN_SUCCESS':
            return {
                ...state,
                runstate: action.payload.retval
            }
        case 'CONNECT': 
            return {
                ...state,
                user: {},
                status: 'Conectando con el servicio'
            }
        case 'CREATE_ACCOUNT':
            return {
                ...state,
                status: 'Creando cuenta de usuario'
            }
        case 'CREATE_ACCOUNT_SUCCESS':
            return {
                ...state,
                status: 'Cuenta creada'
            }
        case 'LOGIN':
            return {
                ...state,
                status: 'Tratando de iniciar sesión'
            }
        case 'PEERS_INFO_SUCCESS': 
            return {
                ...state,
                peers: action.payload
            }
        case 'CHANGE_PEER_STATUS': 
            return {
                ...state,
                peersStatus: { ...state.peersStatus, ...{[action.payload.id]: action.payload.status}}
            }
        case 'CHANGE_PEERS_STATUS': 
            return {
                ...state,
                peersStatus: action.payload.reduce((prev,act)=> ({...prev, [act.id]: act.status}), state.peersStatus)
            }
        case 'QUERY_LOCATIONS_SUCCESS':
            return {
                ...state,
                user: action.payload.locations[0],
                status: 'Buscando cuentas en el sistema'
            }
        case 'REQUERY_LOCATIONS_SUCCESS': 
            return {
                ...state,
                user: action.payload.locations[0],
                status: 'Buscando cuentas en el sistema'    
            }
        case 'GET_IDENTITY_SUCCESS':
            return {
                ...state,
                identity: (action.payload.data.length > 0)? action.payload.data[0]: undefined
            }
        case 'LOADCHANNELS_SUCCESS': 
            return {
                ...state,
                channels: onlyRepoChannels(action.payload.channels || [])
            }
        case 'LOADCHANNEL_EXTRADATA_SUCCESS': 
            return {
                ...state,
                channelsInfo: {
                    ...state.channelsInfo,
                    ...infoToObj(action.payload.channelsInfo)
                }
        }    
        case 'GET_SELF_CERT_SUCCESS': 
            return {
                ...state,
                cert: action.payload.retval
            }
        case 'SEARCH_NEW':
            return {
                ...state,
                search: action.payload,
                results: []
            }
        case 'SEARCH_GET_RESULTS_SUCCESS':
            if(typeof action.payload.result === 'undefined') { return state };
            if(typeof action.payload.retval !== 'undefined') { return state };

            action.payload.result.key = md5(JSON.stringify(action.payload.result))
            return {
                ...state,
                results: [
                        ...state.results,
                        state.results.map(x=>x.key).indexOf(action.payload.result.key) === -1? {...action.payload.result}: undefined
                ].sort((a,b) => (a.mPublishTs < b.mPublishTs)? 1: -1 )
            }
        case 'LOADCHANNEL_POSTS_SUCCESS':
            return {
                ...state,
                posts: [
                    ...state.posts,
                    ...action.payload.posts.filter(post => state.posts.map(x=>x.key).indexOf(post.key) === -1 )
                        //.map(normalizePost)
                    //...action.payload.posts
                     //.reduce((prev,act) => ({...prev,[act.mMeta.mMsgId]:act}), {})
                ].sort((a,b) => (a.mPublishTs < b.mPublishTs)? 1: -1 )
            }

        case 'LOAD_POST_EXTRA_SUCCESS':
            return {
                ...state,
                posts: state.posts.map(post => 
                    post.key === action.payload.mMeta.mMsgId? {...post, ...action.payload}: post
                )
            }
        case 'USER_FOLDERS_SUCCESS':
            return {
                ...state,
                folders: action.payload.dirs
            }
        case 'LOAD_FILES_SUCCESS':
            return {
                ...state,
                files: action.payload.files || []
            }
        case actions.GET_FILE_INFO: 
            return {
                ...state,
                fileInfo: action.payload
            }
        case actions: GET_FILE_STATUS_SUCCESS:
            return {
                ...state,
                files: {
                    ...state.files,
                    [action.payload.info.hash]: action.payload.info
                }
            }
        case 'DOWNLOADING':
            return {
                ...state,
                downloading: action.payload
            }
        default:
            return state;
    }
}