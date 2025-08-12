# WebSocket Room Server

This project implements a WebSocket server with room functionality using Node.js and Express. It allows real-time communication between clients in organized rooms.

## Features

-  **Room Management**: Create and join rooms dynamically
-  **Real-time Messaging**: Send messages to all users in a room
-  **REST API**: HTTP endpoints for room operations
-  **Client Management**: Automatic cleanup when clients disconnect
-  **WebSocket Events**: Join/leave notifications and message broadcasting

## Project Structure

```
virtual-human-scripts
├── src
│   ├── server.js          # Main server with Express and WebSocket
│   ├── handlers
│   │   └── websocket.js   # WebSocket connection and room management
│   ├── utils
│   │   └── index.js       # Utility functions
│   └── config
│       └── index.js       # Configuration settings
├── package.json           # NPM configuration file
├── client-test.html       # Test client for WebSocket functionality
└── README.md              # Project documentation
```

## Installation

```bash
npm install
```

## Usage

### Start the Server

```bash
npm start
# or for development with auto-restart
npm run dev
```

The server will start on port 3000 (or PORT environment variable).

## API Endpoints

### REST API

-  `POST /api/rooms/:roomId/join` - Prepare to join a room

   ```json
   {
   	"userId": "user123"
   }
   ```

-  `POST /api/rooms/:roomId/broadcast` - Send message to all users in room

   ```json
   {
   	"message": "Hello everyone!",
   	"userId": "user123"
   }
   ```

-  `GET /api/rooms/:roomId` - Get room information

### WebSocket Messages

Connect to `ws://localhost:3000` and send JSON messages:

#### Join a Room

```json
{
	"type": "join_room",
	"roomId": "room1",
	"userId": "user123"
}
```

#### Send Message to Room

```json
{
	"type": "room_message",
	"roomId": "room1",
	"message": "Hello everyone!",
	"userId": "user123"
}
```

#### Leave a Room

```json
{
	"type": "leave_room",
	"roomId": "room1"
}
```

## WebSocket Events

The server sends these event types:

-  `connected` - Client connected successfully
-  `joined_room` - Successfully joined a room
-  `left_room` - Successfully left a room
-  `user_joined` - Another user joined the room
-  `user_left` - Another user left the room
-  `room_message` - Message from another user in the room
-  `error` - Error message

## Testing

Open `client-test.html` in your browser to test the WebSocket functionality with a simple UI.

## Configuration

Edit `src/config/index.js` to change server settings:

```javascript
module.exports = {
	port: process.env.PORT || 3000,
	environment: process.env.NODE_ENV || "development",
};
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd virtual-human-scripts
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the WebSocket server, run the following command:

```
node src/server.js
```

The server will listen for incoming WebSocket connections on the specified port.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.
