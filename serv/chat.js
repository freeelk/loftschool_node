const clients = {};

module.exports = (io) => {
    io.sockets.on('connection', function(socket) {
        clients[socket.id] = {username:socket.handshake.headers.username, id:socket.id};
        socket.emit('all users', clients);
        socket.broadcast.emit('new user', clients[socket.id]);

        socket.on('chat message', (data, destId) => {
            socket.broadcast.to(destId).json.emit('chat message', data, socket.id);
        });

        socket.on('disconnect', (data) => {
            delete clients[socket.id];
            socket.broadcast.emit('delete user', socket.id);
            console.log(clients);
        });

    })
}





