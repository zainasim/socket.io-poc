const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


//Get username and Room from URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

//join the ChatRoom
socket.emit('joinRoom', { username, room });

//Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// Listen for message history from the server and display it
socket.on('messageHistory', (history) => {
    // Display message history for the room
    history.forEach((message) => {
        outputMessage(message);
    });
});

//Message from Server
socket.on('message', (message) => {
    outputMessage(message);

    //Scroll Dwon
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Listen for 'userTyping' event to show typing indicator
socket.on('userTyping', ({ username }) => {
    const typingIndicator = document.getElementById('typing-indicator');

    // Update UI to show the user is typing
    typingIndicator.textContent = `${username} is typing...`;

    // You might want to clear the typing indicator after a certain time period
    setTimeout(() => {
        typingIndicator.textContent = ''; // Clear the typing indicator after some time
    }, 3000); // Clear after 3 seconds (adjust as needed)
});


chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    //Get message Text
    const msg = e.target.elements.msg.value;

    //emit message to server
    socket.emit('chatMessage', msg);

    //Clear Input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//Output Message History
// function outputMessageHistory(message) {
//     const div = document.createElement('div');
//     div.classList.add('message');
//     div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
//     <p class="text">
//         ${message.text}
//     </p>`;
//     document.querySelector('.chat-messages').appendChild(div);
// }

//Output Message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//Add Room Name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

//Add Users to DOM
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}

const sendTypingStatus = () => {
    socket.emit('typing', { username, room });
};

const inputField = document.getElementById('msg');

inputField.addEventListener('input', () => {
    sendTypingStatus();
});
