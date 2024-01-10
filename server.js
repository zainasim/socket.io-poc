import express from "express";
import http from "http"
import { Server  } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { formatMessage, getRoomMessageHistory, storeRoomMessage } from "./utils/messages.js";
import { userJoin, getCurrentUser, userLeave, getRoomUsers } from "./utils/users.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);
const io = new Server(server);

//set status folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Snappy Bot';

//Run when client connects
io.on('connection', (socket) => {
    //Join Room
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room)

        //Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to chatapp!'));

        const messageHistory = getRoomMessageHistory(user.room);
        socket.emit('messageHistory', messageHistory);

    
        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for 'typing' event
    socket.on('typing', ({ username, room }) => {
        socket.broadcast.to(room).emit('userTyping', { username });
    });
    
    //Listen for Chat Messages
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        storeRoomMessage(user.username, msg, user.room);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
        
    });
    
    //Runs when client disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
        }

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});