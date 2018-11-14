import config from '../config';
import httpApi from '../httpApi';

const apiHttp = httpApi(config.api.url,config.api.port);

export const apiCall = (type, path, data, method) => apiHttp.send(
    'api', {
        type,
        payload: {
            path,
            data,
            method
        }
    }
)
window.apiCall = (path, data) => apiCall('api',path, data)