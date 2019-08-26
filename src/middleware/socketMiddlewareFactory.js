const socketMiddlewareFactory = (sockets = []) => {
    const subscribers = { initialized: false };

    return store => {
        if(!subscribers.initialized) {
            sockets.forEach((socket) => {
                socket.on('fromSocketStore', (payload) => store.dispatch(payload));
            });
        }

        return next => action => {
            if (action.to) {
                const matched = sockets.find((socket) => socket.nsp === action.to);

                if (matched) {
                    return matched.emit('toSocketStore', action);
                }
            }

            next(action);
        };
    };
};

export default socketMiddlewareFactory;