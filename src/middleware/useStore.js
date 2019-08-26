const useStore = (config) => {
    const { getStore, saveStore } = config;

    return (socket, next) => {
        socket.on('toSocketStore', async ({to, ...response}) => {
            if(saveStore) {
                const store = await getStore(socket);
                const newState = store.dispatch(response);
                await saveStore(newState);
            }

            console.log('response', response);

            socket.emit('fromSocketStore', response);
        });

        next();
    };
};

export default useStore;