import { parse } from "path";
import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({
	port: 8080,
});

interface iRoom {
	sockets: WebSocket[];
}

export interface iData {
	type: "join-room" | "chat";
	room: string;
	message?: string;
}

const rooms: Record<string, iRoom> = {};

wss.on("connection", (ws) => {
	ws.on("error", console.error);

	ws.on("message", (data: string) => {
		const parsedData: iData = JSON.parse(data);
		const { type, room } = parsedData;
		console.log(parsedData);

		// joining the room
		if (type === "join-room") {
			if (!rooms[room]) {
				rooms[room] = {
					sockets: [],
				};
			}
			rooms[room].sockets.push(ws);
		}

		// exchange of messages
		if (type === "chat") {
			rooms[room]?.sockets.map((socket) => socket.send(data));
		}
	});
});
