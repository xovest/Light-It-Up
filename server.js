const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the frontend files from the 'public' directory
app.use(express.static('public'));

const lobbies = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Host creates a lobby
    socket.on('createLobby', (settings) => {
        // Generate a random 5-character room code
        const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
        
        lobbies[roomId] = {
            host: socket.id,
            players: {},
            settings: settings
        };
        
        lobbies[roomId].players[socket.id] = { ready: false, score: 0 };
        socket.join(roomId);
        socket.emit('lobbyCreated', roomId);
    });

    // Friend joins via link
    socket.on('joinLobby', (roomId) => {
        if (lobbies[roomId] && Object.keys(lobbies[roomId].players).length < 2) {
            lobbies[roomId].players[socket.id] = { ready: false, score: 0 };
            socket.join(roomId);
            
            // Send lobby state to both players
            io.to(roomId).emit('lobbyUpdate', {
                players: Object.keys(lobbies[roomId].players).length,
                settings: lobbies[roomId].settings
            });
        } else {
            socket.emit('error', 'Lobby is full or does not exist.');
        }
    });

    // Players toggle their "Ready" status
    socket.on('toggleReady', (roomId) => {
        if (lobbies[roomId] && lobbies[roomId].players[socket.id]) {
            lobbies[roomId].players[socket.id].ready = !lobbies[roomId].players[socket.id].ready;
            
            const players = Object.values(lobbies[roomId].players);
            io.to(roomId).emit('readyUpdate', players.map(p => p.ready));

            // If 2 players are in and both are ready, start the game
            if (players.length === 2 && players.every(p => p.ready)) {
                io.to(roomId).emit('startGame');
            }
        }
    });

    // Receive score updates and broadcast to opponent
    socket.on('updateScore', ({ roomId, score, timer }) => {
        if (lobbies[roomId]) {
            lobbies[roomId].players[socket.id].score = score;
            // Send this player's score to the other player
            socket.to(roomId).emit('opponentProgress', { score, timer });
        }
    });

    // Declare a winner
    socket.on('gameOver', ({ roomId, score }) => {
        if (lobbies[roomId]) {
            socket.to(roomId).emit('matchEnded', { opponentScore: score, winnerId: socket.id });
        }
    });

    socket.on('disconnect', () => {
        // Cleanup if a player drops out
        for (const roomId in lobbies) {
            if (lobbies[roomId].players[socket.id]) {
                delete lobbies[roomId].players[socket.id];
                io.to(roomId).emit('error', 'Opponent disconnected.');
                if (Object.keys(lobbies[roomId].players).length === 0) delete lobbies[roomId];
            }
        }
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

