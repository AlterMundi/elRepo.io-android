import { actions } from "./actions";

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
    results: {},
    channelsInfo: {},
    posts: [],
    promiscuous: true,
    folders: [],
    downloading: [],
    alreadyDownloaded: [],
    files: [],
    fileInfo: {},
    peersStatus:  {}
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
        case 'PEERS_INFO_SUCCESS': {
            return {
                ...state,
                peers: action.payload
            }
        }
        case 'CHANGE_PEER_STATUS': {
            return {
                ...state,
                peersStatus: { ...state.peersStatus, ...{[action.payload.id]: action.payload.status}}
            }
        }
        case 'CHANGE_PEERS_STATUS': {
            return {
                ...state,
                peersStatus: action.payload.reduce((prev,act)=> ({...prev, [act.id]: act.status}), state.peersStatus)
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
                posts: [
                    ...state.posts,
                    ...action.payload.posts.filter(post => state.posts.map(x=>x.key).indexOf(post.key) === -1 )
                        //.map(normalizePost)
                        //.sort((a,b) => (a.mMeta.mPublishTs < b.mMeta.mPublishTs)? 1: -1 )
                    //...action.payload.posts
                     //.reduce((prev,act) => ({...prev,[act.mMeta.mMsgId]:act}), {})
                ]
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