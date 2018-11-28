import { actions } from "./actions";

const infoToObj = (channelsArray) => {
    return channelsArray
        .map(channelData => ({[channelData.mMeta.mGroupId]: channelData}))
        .reduce((prev, act) => ({...prev, ...act}),{})
    
}

const onlyRepoChannels = (channels=[])  => channels.filter(channel => channel.mGroupName.indexOf('_repo') !== -1)

const initState = {
    login: false,
    password: "0000",
    runstate: null,
    channels: [],
    cert: null,
    search: null,
    results: {},
    channelsInfo: {},
    posts: {},
    promiscuous: true,
    folder: {},
    downloading: [],
    alreadyDownloaded: [],
    files: {},
    fileInfo: {}
}

export default function apiReducer(state = initState, action) {
    switch(action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                login: true,
                runstate: true
            }
        case 'CHECK_LOGGIN_SUCCESS':
            return {
                ...state,
                runstate: action.payload.retval
            }
        case 'QUERY_LOCATIONS': {
            return {
                ...state,
                user: {}
            }
        }
        case 'PEERS_SUCCESS': {
            return {
                ...state,
                peers: (typeof action.payload.sslIds !== 'undefined' && action.payload.sslIds.length > 0)? action.payload.sslIds.map(x => ({id: x })): []
            }
        }
        case 'LOADPEER_INFO_SUCCESS': {
            return {
                ...state,
                peers: state.peers.map(peer => {
                    return (peer.id === action.payload.det.id)? action.payload.det: peer;
                })
            }
        }
        case 'CHANGE_PEER_STATUS': {
            return {
                ...state,
                peers: state.peers.map(peer => {
                    return (peer.id === action.payload.id)? {...peer, status: action.payload.status}: peer;
                })
            }
        }
        case 'QUERY_LOCATIONS_SUCCESS':
            return {
                ...state,
                user: action.payload.locations[0],
            }
        case 'REQUERY_LOCATIONS_SUCCESS': 
            return {
                ...state,
                user: action.payload.locations[0]
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
        case 'LOADCHANNEL_EXTRADATA_SUCCESS': {
            return {
                ...state,
                channelsInfo: {
                    ...state.channelsInfo,
                    ...infoToObj(action.payload.channelsInfo)
                }
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
                results:{}
            }
        case 'SEARCH_GET_RESULTS_SUCCESS':
            if(typeof action.payload.result === 'undefined') { return state };
            return {
                ...state,
                results: {
                    ...state.results,
                    [action.payload.result.mGroupId]: action.payload.result
                }
            }
        case 'LOADCHANNEL_POSTS_SUCCESS':
            return {
                ...state,
                posts: {
                    ...state.posts,
                    ...action.payload.posts
                        .reduce((prev,act) => ({...prev,[act.mMeta.mMsgId]:act}), {})
                }
            }
        case 'USER_FOLDERS_SUCCESS':
            return {
                ...state,
                folder: action.payload.dirs
                    .filter(folder => folder.virtualname === 'Downloads')
                    .reduce((prev,act) => act, {})
            }
        case actions.CHECK_FILE_STATUS_SUCCESS:
            return {
                ...state,
                files: {
                    ...state.files,
                    [action.payload.info.hash]: action.payload.info
                }
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
        default:
            return state;
    }
}