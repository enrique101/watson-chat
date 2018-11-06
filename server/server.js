const path = require('path');
const http = require('http');
const cors = require('cors');
require('dotenv').config({ path: '.env' });
const express = require('express');
const socketIO = require('socket.io');
const { message } = require('./utils/watson');
const { isValidString } = require('./utils/validators');
const contextList = require('./utils/context');

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = socketIO(server);

io.on('connection', socket =>{
    socket.on('createMessage', async (data, fn) =>{
        if(isValidString(data.text)){
            const res = await message(socket.id,data.text);
            io.to(socket.id).emit('newMessage', res);
            fn();
        }
    });
    socket.on('disconnect', () => {
        delete contextList[socket.id];
    });
});

server.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
});
