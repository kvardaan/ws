import { describe, it, expect } from "vitest";

const BACKEND_URL = process.env.BACKEND_URL ?? "ws://localhost:8080";

describe("Chat Application", { timeout: 10000 }, () => {
	it("Message from Room 1 reaches another participant in the smae room", async () => {
		const ws1 = new WebSocket(BACKEND_URL);
		const ws2 = new WebSocket(BACKEND_URL);

		// to make sure that both sockets are connected
		// before procedding to further execution
		await new Promise<void>((resolve, reject) => {
			let count = 0;
			const checkConnection = () => {
				count += 1;
				if (count === 2) resolve();
			};

			ws1.onopen = checkConnection;
			ws2.onopen = checkConnection;

			ws1.onerror = ws2.onerror = (error) => reject(error);
		});

		// join both in the same roon
		const joinRoomPayload = JSON.stringify({ type: "join-room", room: "room1" });
		ws1.send(joinRoomPayload);
		ws2.send(joinRoomPayload);

		// check the logic
		const messagePayload = { type: "chat", room: "room1", text: "Hello Room 1!" };

		const received = await new Promise<string>((resolve, reject) => {
			ws2.onmessage = (event) => {
				resolve(event.data.toString());
			};
			ws2.onerror = reject;

			// send after listener is attached
			ws1.send(JSON.stringify(messagePayload));
		});

		expect(received).toContain("Hello Room 1!");
	});
});
