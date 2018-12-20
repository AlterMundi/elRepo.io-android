export const actions = {    
    SEND_REQUEST: 'SEND_REQUEST',
    CONNECT: 'CONNECT',
    CONNECT_SUCCESS: 'CONNECT_SUCCESS',
    CREATE_ACCOUNT: 'CREATE_ACCOUNT',
    CREATE_ACCOUNT_SUCCESS: 'CREATE_ACCOUNT_SUCCESS',
    CREATE_ACCOUNT_FAILD: 'CREATE_ACCOUNT_FAILD',
    LOGIN: 'LOGIN',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILD: 'LOGIN_FAILD',
    LISTEN_PASSWORD: 'LISTEN_PASSWORD',
    LISTEN_PASSWORD_SUCCESS: 'LISTEN_PASSWORD_SUCCESS',
    LISTEN_PASSWORD_FAILD: 'LISTEN_PASSWORD_FAILD',
    JOIN_TIER: 'JOIN_TIER',
    JOIN_TIER_SUCCESS: 'JOIN_TIER_SUCCESS',
    JOIN_TIER_FAILD: 'JOIN_TIER_FAILD',
    CREATE_POST: 'CREATE_POST',
    CREATE_POST_FAILD: 'CREATE_POST_FAILD',
    CREATE_POST_SUCCESS: 'CREATE_POST_SUCCESS',
    SEARCH_GET_RESULTS: 'SEARCH_GET_RESULTS',
    CHECK_FILE_STATUS: 'CHECK_FILE_STATUS',
    CHECK_FILE_STATUS_SUCCESS: 'CHECK_FILE_STATUS_SUCCESS',
    CHECK_FILE_STATUS_FAILD: 'CHECK_FILE_STATUS_FAILD',
    GET_FILE_INFO: 'GET_FILE_INFO',
    GET_FILE_INFO_SUCCESS: 'GET_FILE_INFO_SUCCESS',
    GET_FILE_INFO_FAILD: 'GET_FILE_INFO_FAILD',
    DOWNLOAD_STATUS: 'DOWNLOAD_STATUS',
    DOWNLOAD_STATUS_SUCCESS: 'DOWNLOAD_STATUS_SUCCESS',
    DOWNLOAD_STATUS_FAILD: 'DOWNLOAD_STATUS_FAILD',

    updateSearchResults: ( id ) => (dispatch) => {
        dispatch({
        type: actions.SEARCH_GET_RESULTS,
        payload: id
    })},

    updateChannels: () => dispatch => dispatch({
        type: 'LOADCHANNELS'
    }),

    sendRequest: ({ type, payload }) => (dispatch) => dispatch({
        type: actions.SEND_REQUEST,
        payload: {
            type,
            payload: {
                path: payload.path,
                data: payload.data,
            }
        }
    }),

    checkUser: (payload) => (dispatch, getState) => {
        if(typeof getState().Api.user === 'undefined') {
            dispatch({
                type: 'QUERY_LOCATIONS',
                payload: {
                    afterLogin: true
                }
            })
        }
    },

    loadExtraData:(channelId) => (dispatch) => {
        dispatch({
            type: 'LOADCHANNEL_EXTRADATA',
            payload: {
                channels: [channelId]
            }
        })
    },

    loadPostData:(post) => (dispatch) => {
        dispatch({
            type: 'LOAD_POST_EXTRA',
            payload: {
                channelId: post.mGroupId,
                contentsIds: [post.mMsgId]
            }
        })
    },

    loadChannelContent:(channelId) => (dispatch) => {
        dispatch({
            type: 'LOADCHANNEL_CONTENT',
            payload: {
                channels: [channelId]
            }
        })
    },

    joinTier1: (payload) => (dispatch, getState) => {
        dispatch({
            type: actions.JOIN_TIER,
            payload: {
                url: payload.url,
                remote: payload.remote || false,
                cert: (!payload.remote)? payload.cert: getState().Api.cert,
                user: (!payload.remote  )? payload.user: getState().Api.user.name
            }
        })
    },

    newSearch: (payload) => dispatch => {
        dispatch({type: 'SEARCH_NEW', payload})
    },

    createPost: (payload) => dispatch => {
        dispatch({type: actions.CREATE_POST, payload})
    },

    download: (mFile) => dispatch => {
        dispatch({type: 'DOWNLOAD_FILE', payload: mFile })
    },

    checkDownloadStatus: (mFile) => (dispatch, getState) => {
        getState().Api.alreadyDownloaded.indexOf(mFile.mHash) !== -1
            ? false
            : dispatch({ type: actions.CHECK_FILE_STATUS, payload: mFile })
    },

    getFileInfo: (mFile) => dispatch => {
        dispatch({type: actions.GET_FILE_INFO, payload: mFile})
    }
}

export default actions