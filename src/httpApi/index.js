import { store } from '../redux/store';
//require('event-source-polyfill/src/eventsource')

const api = (url, port) => {
    const apiHttp = (path, data, method, headers) => 
        new Promise((res, rej) =>{
            fetch(url+':'+port+path, { headers, method , body: data? JSON.stringify(data): undefined}   )
                .then(result => { console.log(result); return result;})
                .then(result => res(result.json()))
                .catch(err => res({error : err}))
        });

    return  {
        send: (version, request) => new Promise((res, rej) => {
            if(version === 'api') {
                
                let headers = new Headers()
                //Add auth headers
                const {Api} = store.getState();
                if (Api && Api.login === true) {
                    headers.set('Authorization', 'Basic ' + btoa(Api.user.mLocationId + ":" + Api.password))
                }

                return apiHttp(request.payload.path, request.payload.data, request.payload.method || 'POST', headers)
                    .then((data) =>{
                        console.log('request',data)
                        if(typeof data.error === "undefined")
                            store.dispatch({type:request.type+'_SUCCESS', payload: data })
                        else
                            store.dispatch({type:request.type+'_FAILD', payload: data.error });    
                        res(data)
                    })
                    .catch((e)=> {
                        console.log('errror', e)
                        store.dispatch({type:request.type+'_FAILD', payload: e });
                        rej(e)
                    })
            }
            else if(version === 'stream') {
                const {Api} = store.getState();
                const evtSource = fetch(url+':'+port+request.payload.path, {
                    data: request.payload.data,
                    headers: {
                        'Authorization': 'Basic ' + btoa(Api.user.mLocationId + ":" + Api.password)
                    }
                });
                res(evtSource);
            }
        })
    };
};


export default api;