import { WebSocketServer, WebSocket as WSType } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface iRoom {
	sockets: WSType[];
}

export interface iData {
	type: "join-room" | "chat";
	room: string;
	message?: string;
}

const rooms: Record<string, iRoom> = {};

const relayerSocket = new WebSocket("ws://localhost:8081");

relayerSocket.onmessage = ({ data }) => {
	const parsedData: iData = JSON.parse(data.toString());
	const { room } = parsedData;

	// exchange of messages
	rooms[room]?.sockets.map((socket) => socket.send(data));
};

wss.on("connection", (ws) => {
	ws.on("error", console.error);

	ws.on("message", (data: string) => {
		const parsedData: iData = JSON.parse(data);
		const { type, room } = parsedData;

		// joining the room
		if (type === "join-room") {
			if (!rooms[room]) {
				rooms[room] = {
					sockets: [],
				};
			}
			rooms[room].sockets.push(ws);
		}

		// send message to the relayer
		if (type === "chat") {
			relayerSocket.send(data);
		}
	});
});
