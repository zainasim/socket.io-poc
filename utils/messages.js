import moment from "moment"

const roomMessageHistory = [];
const MAX_HISTORY_MESSAGES = 10;

export function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().format('h:mm a')
    }
}

export function storeRoomMessage(username, text, room) {
    const message = { username, text, room, time: moment().format('h:mm a') };
    roomMessageHistory.push(message);
    if(roomMessageHistory.length > MAX_HISTORY_MESSAGES) {
        roomMessageHistory.shift(); // Maintain only the last 10 messages
    }
}

export function getRoomMessageHistory(room) {
    return roomMessageHistory.filter(message => message.room === room);
}