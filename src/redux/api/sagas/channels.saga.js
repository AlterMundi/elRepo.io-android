import { call, all, select, takeEvery, take, put, race } from 'redux-saga/effects';
import { apiCall } from '../../../helpers/apiWrapper'

const channelRefreshTime = 30000

const normalizePost = (post) => ({
    ...post,
    key: post.mMsgId,
    // mCount: post.mCount,
    // mFiles: post.mFiles,
    // mMsg: post.mMsg,
    // mMeta: {
    //     mMsgId: post.mMeta.mMsgId,
    //     mMsgName: post.mMeta.mMsgName,
    //     mPublishTs: post.mMeta.mPublishTs
    // },
    // //mThumbnail: post.mThumbnail || {mData: ""}
    // mThumbnail:  {mData: ""}
})

// wait :: Number -> Promise
const wait = ms => (
    new Promise(resolve => {
        setTimeout(() => resolve(), ms)
    })
);

const isUserChannels = userLocation =>channel => channel.mSubscribeFlags === 7 && channel.mGroupName === userLocation

function* reloadAllChannels() {
    let channels = []
    try {
        const actualChannelsState = yield select(state => state.Api.channels)
        const {payload}  = yield call(apiCall,'LOADCHANNELS','/rsGxsChannels/getChannelsSummaries');

        channels = payload.channels;
        channels = channels
            .filter(channel => channel.mGroupName.indexOf('_repo') !== -1)
            .sort((a,b) => (a.mLastPost < b.mLastPost)? 1: -1 )
        //Check if user have your own channel
        const user = yield select(state => state.Api.user)
        if(!channels || channels.length === 0) {
            yield put({type: 'CREATE_USER_CHANNEL'})
        }
        
        channels = channels
        //Filter if not have posts
        .filter(ch => ch.mLastPost !== 0)
        //Filter if mLastPost is the same   
        .filter(ch => {
            const lastTime = actualChannelsState
            .filter(aC => aC.mGroupId === ch.mGroupId)
            .reduce((p,a)=>a, {mPublishTs: 0})
            return lastTime.mPublishTs < ch.mPublishTs
        })
        console.log('AAAA',{actualChannelsState, channels})

        //Autosubscribe to elrepo.io users channels
        let a = 0;
        
        while(typeof channels !== 'undefined' && channels.length > a) {
            if(
                //And im not subscribed
                (channels[a].mSubscribeFlags === 8 ) &&
                //And not is my channel
                (channels[a].mGroupName !== user.mLocationName)
            ) {
                yield apiCall(null, '/rsGxsChannels/subscribeToChannel',{
                    channelId: channels[a].mGroupId,
                    subscribe: true
                })
            }
            let posts = yield call(apiCall,null,'/rsGxsChannels/getContentSummaries',{
                channelId: channels[a].mGroupId
            })
            let allChannelsPosts = []
                .concat(posts.summaries)
                .map(normalizePost)

            yield put({type: 'LOADCHANNEL_POSTS_SUCCESS', payload: { posts: allChannelsPosts }});
            yield call(wait,  Math.round(channelRefreshTime / 500))
            a++;
        } ;
        
        // const normalizedPosts = allChannelsPosts
        // //.reduce((prev,act) => prev.concat(act.summaries),[])
        //  .map(normalizePost)
        // .sort((a,b) => (a.mPublishTs < b.mPublishTs)? 1: -1 )
        // console.log(normalizedPosts)
        
        // Wait and run
    } 
    catch(e) {
        console.log('channels', e)
        //yield call(wait, 30500)
    }
}

function* channelMonitor() {

    while(true) {
        // Get channels id
        yield reloadAllChannels()
        yield call(wait, channelRefreshTime)
    }
}

function* reloadOwnChannels({type, payload}) {
    yield call(wait, 1500)
    try {
        const user = yield select(state => state.Api.user)
        const ownChannelPosts = yield call(apiCall,null,'/rsGxsChannels/getContentSummaries',{
            channelId: user
        });
        
        const normalizedPosts = ownChannelPosts.summaries
        .map(normalizePost)
        .sort((a,b) => (a.mPublishTs < b.mPublishTs)? 1: -1 )
        yield put({type: 'LOADCHANNEL_POSTS_SUCCESS', payload: { posts: normalizedPosts }});
    }
    catch(e) {
        console.warn('Error loading own channel',e)
    }
}

function* loadChannels () {
    yield call(apiCall,'LOADCHANNELS','/rsGxsChannels/getChannelsSummaries');
}

function* loadChannelsInfo ({type, payload}) {
    yield call(apiCall,'LOADCHANNEL_EXTRADATA','/rsGxsChannels/getChannelsInfo',{
        chanIds: payload.channels
    })
}

function* loadChannelsPost(action) {
    yield call(apiCall,'LOADCHANNEL_POSTS','/rsGxsChannels/getChannelsContent',{
        chanIds: action.payload.channels
    })
}

function* initUserChannel (action) {
    //Autosubcrive _repo channels
    var a = 0;
    const user = yield select(state => state.Api.user)
    if(action.payload.channels.length === 0) {
        //Create user channel if not exist
        yield put({type: 'CREATE_USER_CHANNEL'})
    }
    else {
        while(action.payload.channels.length > a) {
            if(
                //If is open repo channel
                (action.payload.channels[a].mGroupName.indexOf('_repo') !== -1) &&
                //And im not subscribed
                (action.payload.channels[a].mSubscribeFlags === 8 ) &&
                //And not is my channel
                (action.payload.channels[a].mGroupName !== user.mLocationName)
            ) {
                apiCall(null, '/rsGxsChannels/subscribeToChannel',{
                    channelId: action.payload.channels[a].mGroupId,
                    subscribe: true
                })
            }
            a++;
        }
    }
}

function* loadExtraData({type, payload}) {
    const result = yield call(apiCall,null, '/rsGxsChannels/getChannelContent', payload)
    if(result.retval === true && result.posts.length > 0) {
        yield put({type: 'LOAD_POST_EXTRA_SUCCESS', payload: result.posts[0]})
    }
}

const onlyRepoChannels = (channels=[])  => channels.filter(channel => channel.mGroupName.indexOf('_repo') !== -1)

function* checkExtraInfo({type, payload}) {

    const userLocation = yield select(state => state.Api.user.mLocationName)
    const channelsInfoIds = yield select(state => state.Api.channelsInfo.map(x => x.mMeta.mGroupId))
    
    //Get user channels and check extra data
    const userChannels = onlyRepoChannels(payload.channels)
        .filter(isUserChannels(userLocation))
        .map(channel => channel.mGroupId)
        .filter(groupId => channelsInfoIds.indexOf(groupId) === -1);

    if(userChannels.length > 0) {
        yield loadChannelsInfo({payload: { channels: userChannels}})
    }
  
}

export const channels = function*() {
    yield takeEvery('START_SYSTEM' , channelMonitor)
    yield takeEvery('LOAD_POST_EXTRA', loadExtraData),
    yield takeEvery(['RELOAD_OWN_CHANNEL'], reloadOwnChannels)
    yield takeEvery(['RELOAD_ALL_CHANNELS'], reloadAllChannels)
    //yield takeEvery('LOADCHANNELS', loadChannels)
    yield takeEvery('LOADCHANNELS_SUCCESS', checkExtraInfo)
    yield takeEvery('LOADCHANNEL_EXTRADATA',  loadChannelsInfo)
    //yield takeEvery('LOADCHANNEL_CONTENT', loadChannelsPost)
}
