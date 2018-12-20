import { store } from '../redux/store';
import EventSource from './events';
import Base64 from '../helpers/base64';

const api = (url, port) => {
    const apiHttp = (path, data, method, headers) => fetch(url+':'+port+path, { headers, method , body: data? JSON.stringify(data): undefined}   )
                //.then(result => { console.log(result); return result;})
                .then(result => result.json())

    return  {
        send: (version, request) =>  {
            const dispatchAction = typeof request.type !== 'undefined' && request.type !== null ? true: false;
            if(version === 'api') {
                
                let headers = new Headers()
                //Add auth headers
                const {Api} = store.getState();
                if (Api && Api.login === true) {
                    headers.set('Authorization', 'Basic ' + Base64.btoa(Api.user.mLocationId + ":" + Api.password))
                }

                return apiHttp(request.payload.path, request.payload.data, request.payload.method || 'POST', headers)
                    .then((data) =>{
                        if(typeof data.error === "undefined")
                            return dispatchAction? store.dispatch({type:request.type+'_SUCCESS', payload: data }): Promise.resolve(data)
                        else
                            return dispatchAction? store.dispatch({type:request.type+'_FAILD', payload: data.error }): Promise.resolve(data)
                    })
                    .catch((e)=> {
                        dispatchAction? store.dispatch({type:request.type+'_FAILD', payload: e }): console.warn(e)
                    })
            }
            else if(version === 'stream') {
                const {Api} = store.getState();
                const evtSource = new EventSource(url+':'+port+request.payload.path, {
                    data: request.payload.data,
                    headers: {
                        'Authorization': 'Basic ' + Base64.btoa(Api.user.mLocationId + ":" + Api.password)
                    }
                });
                return Promise.resolve(evtSource);
            }
        }
    };
};


export default api;