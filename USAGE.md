# WebSocket Room Server - Usage Examples

## Overview

This server provides two main ways to interact with rooms:

1. **REST API** - Send messages to rooms via HTTP POST
2. **WebSocket** - Join rooms and listen for real-time messages

## REST API Usage

### Send Message to Room

```bash
# Send a message to room "general"
curl -X POST http://localhost:3000/api/rooms/general/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello everyone!",
    "userId": "alice"
  }'
```

Response:

```json
{
	"success": true,
	"message": "Message sent to room",
	"roomId": "general",
	"recipientCount": 3,
	"timestamp": "2025-08-12T10:30:00.000Z"
}
```

### Get Room Information

```bash
# Get room details
curl http://localhost:3000/api/rooms/general
```

Response:

```json
{
	"roomId": "general",
	"participantCount": 3,
	"createdAt": "2025-08-12T10:25:00.000Z",
	"participants": [
		{
			"userId": "alice",
			"joinedAt": "2025-08-12T10:25:30.000Z"
		},
		{
			"userId": "bob",
			"joinedAt": "2025-08-12T10:26:15.000Z"
		}
	]
}
```

### List All Rooms

```bash
# Get all active rooms
curl http://localhost:3000/api/rooms
```

## WebSocket Usage

### Connect and Join Room

```javascript
// Connect to WebSocket
const ws = new WebSocket("ws://localhost:3000");

ws.onopen = function () {
	console.log("Connected to server");

	// Join a room
	ws.send(
		JSON.stringify({
			type: "join_room",
			roomId: "general",
			userId: "alice",
		})
	);
};

// Listen for messages
ws.onmessage = function (event) {
	const data = JSON.parse(event.data);

	switch (data.type) {
		case "connected":
			console.log("Client ID:", data.data.clientId);
			break;

		case "joined_room":
			console.log("Joined room:", data.data.roomId);
			console.log("Participants:", data.data.participantCount);
			break;

		case "room_message":
			console.log("Message from", data.data.userId + ":", data.data.message);
			break;

		case "user_joined":
			console.log(data.data.userId, "joined the room");
			break;

		case "user_left":
			console.log(data.data.userId, "left the room");
			break;
	}
};
```

### Leave Room

```javascript
// Leave a room
ws.send(
	JSON.stringify({
		type: "leave_room",
		roomId: "general",
	})
);
```

## Complete Example Workflow

1. **User A** connects via WebSocket and joins room "general"
2. **User B** connects via WebSocket and joins room "general"
3. **External System** sends message to room "general" via REST API
4. **Both Users A & B** receive the message via WebSocket

### User A (WebSocket Client):

```javascript
const ws = new WebSocket("ws://localhost:3000");
ws.onopen = () => {
	ws.send(
		JSON.stringify({
			type: "join_room",
			roomId: "general",
			userId: "alice",
		})
	);
};
```

### User B (WebSocket Client):

```javascript
const ws = new WebSocket("ws://localhost:3000");
ws.onopen = () => {
	ws.send(
		JSON.stringify({
			type: "join_room",
			roomId: "general",
			userId: "bob",
		})
	);
};
```

### External System (REST API):

```bash
curl -X POST http://localhost:3000/api/rooms/general/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Welcome to the general room!",
    "userId": "system"
  }'
```

### Result:

Both Alice and Bob will receive:

```json
{
	"type": "room_message",
	"data": {
		"roomId": "general",
		"message": "Welcome to the general room!",
		"userId": "system",
		"timestamp": "2025-08-12T10:30:00.000Z"
	}
}
```

## Error Handling

### REST API Errors

-  **400 Bad Request**: Missing required fields (message, userId)
-  **404 Not Found**: Room doesn't exist
-  **500 Internal Server Error**: Server error

### WebSocket Errors

WebSocket clients receive error messages:

```json
{
	"type": "error",
	"data": {
		"message": "Room ID is required"
	}
}
```

## Testing

Use the included `client-test.html` file to test WebSocket functionality with a web interface.
