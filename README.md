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
    
    sockets.of('/rossGellar', useStore(appStoreConfig));

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

That's it! Now your endpoint is hooked up to your socket's redux store instead of your local. 
You have all the tools available to handle fetching and persisting the data. 
The socket connection is passed to your getStore config so if you have any auth middleware
that mutates the socket object, you can use them here. It is ultimately up to you on where you 
want to get this data for the initialState. Whether from Redis, or mySQL.


```js
    dispatch({ 
        type: 'rock bottom', 
        to: '/api',
        payload: {
            smell: "what I'm cooking?"
        }
    });
```