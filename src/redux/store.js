import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import reducers from './reducers';
import rootSaga from './sagas';
import thunk from 'redux-thunk';
import logger from 'redux-logger'

const sagaMiddleware = createSagaMiddleware();
const middlewares = [thunk, sagaMiddleware];

const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    }) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(...middlewares, logger),
  //applyMiddleware(...middlewares),
);


const store = createStore(
  combineReducers({
    ...reducers
  }),
  enhancer
);
sagaMiddleware.run(rootSaga);
store.dispatch({type:'START_SERVICE'})
export { store };
