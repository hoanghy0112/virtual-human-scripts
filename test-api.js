#!/usr/bin/env node

// Simple test script to demonstrate REST API functionality
const http = require("http");

const makeRequest = (method, path, data = null) => {
	return new Promise((resolve, reject) => {
		const options = {
			hostname: "localhost",
			port: 3000,
			path: path,
			method: method,
			headers: {
				"Content-Type": "application/json",
			},
		};

		const req = http.request(options, (res) => {
			let body = "";
			res.on("data", (chunk) => (body += chunk));
			res.on("end", () => {
				try {
					const result = JSON.parse(body);
					resolve({ status: res.statusCode, data: result });
				} catch (e) {
					resolve({ status: res.statusCode, data: body });
				}
			});
		});

		req.on("error", reject);

		if (data) {
			req.write(JSON.stringify(data));
		}

		req.end();
	});
};

async function testAPI() {
	console.log("🚀 Testing WebSocket Room Server API\n");

	try {
		// Test 1: Send message to a room (will create room if not exists)
		console.log('📤 Test 1: Sending message to room "test-room"');
		const messageResult = await makeRequest(
			"POST",
			"/api/rooms/test-room/message",
			{
				message: "Hello from REST API!",
				userId: "test-user",
			}
		);
		console.log("Status:", messageResult.status);
		console.log("Response:", JSON.stringify(messageResult.data, null, 2));
		console.log("");

		// Test 2: Get room information
		console.log("📋 Test 2: Getting room information");
		const roomResult = await makeRequest("GET", "/api/rooms/test-room");
		console.log("Status:", roomResult.status);
		console.log("Response:", JSON.stringify(roomResult.data, null, 2));
		console.log("");

		// Test 3: Get all rooms
		console.log("📋 Test 3: Getting all rooms");
		const allRoomsResult = await makeRequest("GET", "/api/rooms");
		console.log("Status:", allRoomsResult.status);
		console.log("Response:", JSON.stringify(allRoomsResult.data, null, 2));
		console.log("");

		// Test 4: Send another message
		console.log("📤 Test 4: Sending another message");
		const message2Result = await makeRequest(
			"POST",
			"/api/rooms/test-room/message",
			{
				message: "This is the second message!",
				userId: "another-user",
			}
		);
		console.log("Status:", message2Result.status);
		console.log("Response:", JSON.stringify(message2Result.data, null, 2));
		console.log("");

		// Test 5: Try to get a non-existent room
		console.log("❌ Test 5: Getting non-existent room");
		const nonExistentResult = await makeRequest(
			"GET",
			"/api/rooms/non-existent"
		);
		console.log("Status:", nonExistentResult.status);
		console.log("Response:", JSON.stringify(nonExistentResult.data, null, 2));
		console.log("");

		console.log("✅ All tests completed!");
		console.log(
			"\n💡 To test WebSocket functionality, open client-test.html in your browser"
		);
	} catch (error) {
		console.error("❌ Test failed:", error.message);
	}
}

// Run tests if this file is executed directly
if (require.main === module) {
	testAPI();
}

module.exports = { testAPI, makeRequest };
