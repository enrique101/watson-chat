const path = require('path');
const http = require('http');
const cors = require('cors');
require('dotenv').config({ path: '.env' });
const express = require('express');
const socketIO = require('socket.io');
const  bodyParser = require('body-parser');
const helmet = require('helmet');
const { sendEmail } = require('./utils/email');
const { message } = require('./utils/watson');
const { isValidString } = require('./utils/validators');
const contextList = require('./utils/context');

const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(helmet());

const router = express.Router();
app.use('/api', router);

const corsOpt = {
    origin: process.env.FRONTEND_URL,
    optionsSuccessStatus: 200
  }

router.route('/contact', cors(corsOpt))
    .post((req,res) => {
        "use strict"
        const emailRegex = new RegExp('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$');
        let { name, email, text } = req.body;
        let result = {};
        name = name.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
        email = email.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
        text = text.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if(email !== '' && emailRegex.test(email) && text !== '' && name !== ''){
            result = sendEmail(name, email, text).catch(e => {result = e;});
        }
        else{
            result = {
                error: "Invalid data",
            }
        }
        res.json(result);
    });


const server = http.createServer(app);

const io = socketIO(server);
io.origins(`${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}`);

io.on('connection', socket =>{
    "use strict"
    socket.on('createMessage', async (data, fn) =>{
        if(isValidString(data.text)){
            const res = await message(socket.id,data.text.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
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
