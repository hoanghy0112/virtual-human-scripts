const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const WebSocketHandler = require("./handlers/websocket");
const config = require("./config");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(express.json());

const handler = new WebSocketHandler();

// Serve index.html at /home route
app.get("/home", (req, res) => {
	res.sendFile(path.join(__dirname, "..", "index.html"));
});

// WebSocket connection handling
wss.on("connection", (ws, req) => {
	handler.onConnection(ws, req);

	ws.on("message", (message) => {
		handler.onMessage(ws, message);
	});

	ws.on("close", () => {
		handler.onDisconnection(ws);
	});
});

// REST API routes for sending messages
app.post("/api/rooms/:roomId/message", (req, res) => {
	const { roomId } = req.params;
	const { message } = req.body;

	if (!message) {
		return res.status(400).json({ error: "message is required" });
	}

	const room = handler.getRoom(roomId);
	if (!room) {
		return res.status(404).json({ error: "Room not found" });
	}

	const sent = handler.broadcastToRoom(roomId, {
		type: "room_message",
		data: {
			roomId,
			message,
			userId: "api",
			timestamp: new Date().toISOString(),
		},
	});

	res.json({
		success: true,
		message: "Message sent to room",
		roomId,
		recipientCount: sent,
		timestamp: new Date().toISOString(),
	});
});

// Get room information
app.get("/api/rooms/:roomId", (req, res) => {
	const { roomId } = req.params;
	const room = handler.getRoom(roomId);

	if (!room) {
		return res.status(404).json({ error: "Room not found" });
	}

	res.json({
		roomId,
		participantCount: room.participants.size,
		createdAt: room.createdAt,
		participants: Array.from(room.participants.values()).map((p) => ({
			userId: p.userId,
			joinedAt: p.joinedAt,
		})),
	});
});

// Get all rooms
app.get("/api/rooms", (req, res) => {
	const rooms = Array.from(handler.rooms.entries()).map(([roomId, room]) => ({
		roomId,
		participantCount: room.participants.size,
		createdAt: room.createdAt,
	}));

	res.json({
		rooms,
		totalRooms: rooms.length,
	});
});

server.listen(config.port, () => {
	console.log(`Server is running on http://localhost:${config.port}`);
	console.log(`WebSocket server is running on ws://localhost:${config.port}`);
});
