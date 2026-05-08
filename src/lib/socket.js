import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';

export const socket = io(SOCKET_URL, {
  autoConnect: false
});

export const connectSocket = (token) => {
  socket.auth = { token };
  socket.connect();
};

export const joinBookingChat = (bookingId) => {
  socket.emit('join_booking', bookingId);
};

export const sendMessage = (bookingId, senderId, receiverId, message) => {
  socket.emit('send_message', { bookingId, senderId, receiverId, message });
};

export const disconnectSocket = () => {
  socket.disconnect();
};