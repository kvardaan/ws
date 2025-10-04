import { describe, it, expect } from "vitest";

const BACKEND_URL_1 = "ws://localhost:8080";
const BACKEND_URL_2 = "ws://localhost:8082";

describe("Chat Application", { timeout: 10000 }, () => {
	it("Message from Room 1 reaches another participant in the smae room", async () => {
		const ws1 = new WebSocket(BACKEND_URL_1);
		const ws2 = new WebSocket(BACKEND_URL_2);

		// to make sure that both sockets are connected
		// before procedding to further execution
		await new Promise<void>((resolve) => {
			let count = 0;
			const checkConnection = () => {
				count = count + 1;
				if (count === 2) resolve();
			};

			ws1.onopen = checkConnection;
			ws2.onopen = checkConnection;
		});

		// join both in the same roon
		const joinRoomPayload = JSON.stringify({ type: "join-room", room: "room1" });

		ws1.send(joinRoomPayload);
		ws2.send(joinRoomPayload);

		// check the logic
		const messagePayload = JSON.stringify({ type: "chat", room: "room1", message: "Hello Room 1!" });

		await new Promise<void>((resolve, reject) => {
			ws2.onmessage = ({ data }) => {
				const parsedData = JSON.parse(data);
				expect(parsedData.type === "chat");
				expect(parsedData.message === "Hello Room 1!");
				resolve();
			};

			// send after listener is attached
			ws1.send(messagePayload);
		});
	});
});
