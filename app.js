const express = require('express');
const app = express();
const socketio = require('socket.io');
const http = require('http');
const path = require('path');

const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io connection
io.on('connection', (socket) => {
    console.log("Client connected:", socket.id);

    socket.on('location', (data) => {
        console.log("Location data received:", data);

        // Attach socket ID so others know whose location it is
        const payload = { ...data, id: socket.id };

        // Send to all other clients including the sender (if needed)
        io.emit('location', payload);
    });

    socket.on('disconnect', () => {
        console.log("Client disconnected:", socket.id);

        // Let all clients know this user disconnected
        io.emit('disconnected', { id: socket.id });
    });
});


app.get('/', (req, res) => {
    res.render("index");
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
