Redux-Socket.io
-------------------

## Lovely State management with sockets
This is the official repository for redux-socket.io. 

### Redux
Redux is an state management too that is agnostic across multiple JS frameworks. While it's primary focus is on state
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
Run an `npm install redux-socket.io` on your project.

### Setup your client middleware

```js
import { createClientMiddleware } from 'redux-socket.io';

const socketConfig = {
    path: '/sockets'
};

const sockets = [
    {
        namespace: '/rossGellar',
        actions: [
            'whine',
            'divorce'
        ],
        connection: io.connect('/rossGellar', socketConfig)
    },
    {
        namespace: '/theRock',
        actions: [
            'cook',
            'rock bottom'
        ],
        connection: io.connect('/theRock', socketConfig)
    }
];

const reduxSocketIOMiddleware = createClientMiddleware(sockets);

const reducers = combineReducers(reducersMap);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const enhancer = composeEnhancers(applyMiddleware(reduxSocketsMiddleware));

export default createStore(reducers, enhancer);

```

### Setup your server middleware (node only)

```js
import app from './src/app';
import http from 'http';
import Logger from 'helpers/Logger';
import config from 'config';
import { createServerMiddleware } from 'redux-socket.io';

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
    
    const socketsConfig = [
        {
            namespace: '/rossGellar',
            actions: [
                'whine',
                'divorce'
            ],
            connection: sockets.of('/rossGellar'),
            reducer: (state = {}, action) => {
                switch(action.type) {
                    case 'whine':
                        return {
                            ...state,
                            message: 'waaaaahhhhhhhhhh',
                            length: action.length
                        };
                    default:
                        return state;
                }
            }
        },
        {
            namespace: '/theRock',
            actions: [
                'cook',
                'rock bottom'
            ],
            connection: sockets.of('/theRock')
        }
    ];
    
    sockets.use(createServerMiddleware(socketsConfig));

    return sockets;
};

server.listen(port, () => {
    Logger.info(`Listening on ${port}`);
});

socketsServer();

export default {
    server,
    sockets
};
```

That's it! Now your redux store will automatically emit the events you've registered in the middleware to your
socket connection instead. Your server will be listening to these events and emit them all automatically to everyone on
the connection including the person who emitted it. 

```js
    dispatch({ 
        type: 'rock bottom', 
        payload: {
            smell: "what I'm cooking?"
        }
    });
```