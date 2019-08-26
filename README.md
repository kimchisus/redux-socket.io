Redux-Socket.io
-------------------

## Lovely State management with sockets
This is the official repository for @rykimchi/redux-socket.io. 

### Redux
Redux is an state management tool that is agnostic across multiple JS frameworks. While it's primary focus is on state
management, I personally think it's more about the actions and events. Redux works like an event emitter where you
dispatch actions in order to modify state. That action is passed to what's called a reducer and the reducer
transforms state according to the action and the action's payload. 

This is perfect with socket.io as all events are also actions. The same code can be used for both your front end
and backend to manipulate state and manage actions. It abstracts most of the work for you so you can just
code relatively normally with some differences.  

### Socket.IO
Socket.IO is the most popular JS library for websockets. While it's not purely websockets, as it does fall back to polling,
I personally find the library to contain everything that I could possibly need with websockets. Authentication,
middleware support, etc. It's lovely to use and setup.

## Getting Started

### Install
Run an `npm install @rykimchi/redux-socket.io` on your project.

### Setup your client middleware

```js
import { socketMiddlewareFactory } from '@rykimchi/redux-socket.io';

const socketConfig = {
    path: '/sockets'
};

const sockets = [
    io.connect('/rossGellar', socketConfig),
    io.connect('/theRock', socketConfig)
];

const reduxSocketIOMiddleware = socketMiddlewareFactory(sockets);

const reducers = combineReducers(reducersMap);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const enhancer = composeEnhancers(applyMiddleware(reduxSocketIOMiddleware));

export default createStore(reducers, enhancer);

```

### Setup your server middleware (node only)

```js
import app from './src/app';
import http from 'http';
import Logger from 'helpers/Logger';
import config from 'config';
import appReducer from 'reducers/app';
import { useStore } from '@rykimchi/redux-socket.io';

const { port } = config;

const server = http.createServer(app);
const socketsServer = server => {
    const sockets = io(server, {
        path: '/sockets',
        adapter: redis({
            host: 'redis',
            port: 6379
        })
    });
    
    const appStoreConfig = {
        getStore: (socket) => {
            return createStore(appReducer, { test: 'testtererer '});
        },
        saveStore: (state) => {
            console.log('state', state);
        },
    };
    
    const socket = sockets.of('/rossGellar');
    
    socket.use(useStore(appStoreConfig));

    return sockets;
};

socketsServer(server);

server.listen(port, () => {
    Logger.info(`Listening on ${port}`);
});


export default {
    server,
    sockets
};
```

That's literally all you have to do. Your dispatching and state is now handled by your socket connection. All you
have to do now is use redux normally and everything will be handled by the middleware. 

If you'd like to dispatch your action to the socket connection, all you have to do is dispatch your action
with the property `to`. This two field will indicate which namespaced socket connection the action should be going to.

If you'd like to persist data, implement the `saveStore` property as a function in your middleware configuration.

```js
{
    getStore: (socket) => {
        return db.getUserStore(socket.user);
    },
    saveStore: (store) => {
        db.saveStore(store);
    }
}
```

```js
    dispatch({ 
        type: 'rock bottom', 
        to: '/api',
        payload: {
            smell: "what I'm cooking?"
        }
    });
```