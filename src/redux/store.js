import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import createHistory from 'history/createMemoryHistory';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import createSagaMiddleware from 'redux-saga';
import reducers from './reducers';
import rootSaga from './sagas';
import thunk from 'redux-thunk';
import logger from 'redux-logger'

const history = createHistory();
const sagaMiddleware = createSagaMiddleware();
const routeMiddleware = routerMiddleware(history);
const middlewares = [thunk, sagaMiddleware, routeMiddleware];

const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    }) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(...middlewares, logger),
);


const store = createStore(
  combineReducers({
    ...reducers,
    router: routerReducer
  }),
  enhancer
);
sagaMiddleware.run(rootSaga);
store.dispatch({type:'CONNECT'})
export { store, history };
