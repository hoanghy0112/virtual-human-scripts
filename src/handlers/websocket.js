class WebSocketHandler {
	constructor() {
		this.rooms = new Map();
		this.clients = new Map();
	}

	onConnection(ws, req) {
		const clientId = this.generateClientId();
		this.clients.set(ws, { id: clientId, rooms: new Set() });

		console.log(`Client ${clientId} connected`);

		// Send welcome message
		this.sendToClient(ws, {
			type: "connected",
			data: { clientId },
		});
	}

	onMessage(ws, message) {
		try {
			const data = JSON.parse(message);
			const client = this.clients.get(ws);

			if (!client) return;

			switch (data.type) {
				case "join_room":
					this.handleJoinRoom(ws, data.roomId, data.userId);
					break;
				case "leave_room":
					this.handleLeaveRoom(ws, data.roomId);
					break;
				case "room_message":
					this.handleRoomMessage(ws, data);
					break;
				default:
					console.log("Unknown message type:", data.type);
			}
		} catch (error) {
			console.error("Error parsing message:", error);
			this.sendToClient(ws, {
				type: "error",
				data: { message: "Invalid message format" },
			});
		}
	}

	onDisconnection(ws) {
		const client = this.clients.get(ws);
		if (client) {
			// Remove client from all rooms
			client.rooms.forEach((roomId) => {
				this.removeClientFromRoom(ws, roomId);
			});

			this.clients.delete(ws);
			console.log(`Client ${client.id} disconnected`);
		}
	}

	handleJoinRoom(ws, roomId, userId) {
		if (!roomId) {
			this.sendToClient(ws, {
				type: "error",
				data: { message: "Room ID is required" },
			});
			return;
		}

		const client = this.clients.get(ws);
		const room = this.createOrGetRoom(roomId);

		// Add client to room
		room.participants.set(ws, {
			userId: userId || client.id,
			joinedAt: new Date(),
		});
		client.rooms.add(roomId);

		console.log(`Client ${client.id} joined room ${roomId}`);

		// Notify client
		this.sendToClient(ws, {
			type: "joined_room",
			data: {
				roomId,
				participantCount: room.participants.size,
				userId: userId || client.id,
			},
		});

		// Notify other participants
		this.broadcastToRoom(
			roomId,
			{
				type: "user_joined",
				data: {
					userId: userId || client.id,
					participantCount: room.participants.size,
				},
			},
			ws
		);
	}

	handleLeaveRoom(ws, roomId) {
		this.removeClientFromRoom(ws, roomId);
	}

	handleRoomMessage(ws, data) {
		const { roomId, message, userId } = data;

		if (!roomId || !message) {
			this.sendToClient(ws, {
				type: "error",
				data: { message: "Room ID and message are required" },
			});
			return;
		}

		const room = this.rooms.get(roomId);
		if (!room || !room.participants.has(ws)) {
			this.sendToClient(ws, {
				type: "error",
				data: { message: "You are not in this room" },
			});
			return;
		}

		// Broadcast message to all participants in the room
		this.broadcastToRoom(roomId, {
			type: "room_message",
			data: {
				roomId,
				message,
				userId: userId || this.clients.get(ws).id,
				timestamp: new Date().toISOString(),
			},
		});
	}

	createOrGetRoom(roomId) {
		if (!this.rooms.has(roomId)) {
			this.rooms.set(roomId, {
				id: roomId,
				participants: new Map(),
				createdAt: new Date().toISOString(),
			});
			console.log(`Room ${roomId} created`);
		}
		return this.rooms.get(roomId);
	}

	getRoom(roomId) {
		return this.rooms.get(roomId);
	}

	removeClientFromRoom(ws, roomId) {
		const room = this.rooms.get(roomId);
		const client = this.clients.get(ws);

		if (room && client) {
			const participant = room.participants.get(ws);
			room.participants.delete(ws);
			client.rooms.delete(roomId);

			console.log(`Client ${client.id} left room ${roomId}`);

			// Notify client
			this.sendToClient(ws, {
				type: "left_room",
				data: { roomId },
			});

			// Notify other participants
			if (participant) {
				this.broadcastToRoom(
					roomId,
					{
						type: "user_left",
						data: {
							userId: participant.userId,
							participantCount: room.participants.size,
						},
					},
					ws
				);
			}

			// Clean up empty room
			if (room.participants.size === 0) {
				this.rooms.delete(roomId);
				console.log(`Room ${roomId} deleted (empty)`);
			}
		}
	}

	broadcastToRoom(roomId, message, excludeWs = null) {
		const room = this.rooms.get(roomId);
		if (!room) return 0;

		let count = 0;
		room.participants.forEach((participant, ws) => {
			if (ws !== excludeWs && ws.readyState === ws.OPEN) {
				this.sendToClient(ws, message);
				count++;
			}
		});
		return count;
	}

	sendToClient(ws, message) {
		if (ws.readyState === ws.OPEN) {
			ws.send(JSON.stringify(message));
		}
	}

	generateClientId() {
		return "client_" + Math.random().toString(36).substr(2, 9);
	}
}

module.exports = WebSocketHandler;
