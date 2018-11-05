const path = require('path');
const http = require('http');
require('dotenv').config({ path: '.env' });
const express = require('express');
const socketIO = require('socket.io');
const { message } = require('./utils/watson');
const { isValidString } = require('./utils/validators');
const { Users } = require('./utils/users');

const { generateMessage, generateLocationMessage } = require('./utils/message');

const port = process.env.PORT || 3000;

const app = express();

const server = http.createServer(app);

const io = socketIO(server);

const users = new Users();

app.use('/', express.static(path.join(__dirname, '../public')));

io.on('connection', socket =>{
    socket.on('join',({ name, room }, fn)=>{
        if(!isValidString(name) || !isValidString(room)){
            return fn('Invalid data');
        }
        socket.join(room);
        users.add(socket.id, name, room);

        io.to(room).emit('updateUserList', users.getUsersByRoom(room));

        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat!'));
        socket.broadcast.to(room).emit('newMessage', generateMessage('Admin', `${name} has joined!`));
        fn();
    });

    socket.on('createMessage', async (data, fn) =>{
        const { name, room } = users.get(socket.id);
        if(name && isValidString(data.text)){
            io.to(room).emit('newMessage',generateMessage(name, data.text));
            const res = await message(socket.id,data.text);
            io.to(room).emit('newMessage',generateMessage('Kiki', res));
        }
        fn('this is from server');
    });

    socket.on('createLocationMessage', coords =>{
        const { name, room } = users.get(socket.id);
        io.to(room).emit('newLocationMessage',generateLocationMessage(name, coords.latitude, coords.longitude));
    });

    socket.on('disconnect', () => {
        const { room, name } = users.get(socket.id);
        users.remove(socket.id);
        if(room){
            io.to(room).emit('updateUserList',users.getUsersByRoom(room));
            io.to(room).emit('newMessage', generateMessage('Admin', `${name} has left!`));
        }
    });
});

server.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
});
