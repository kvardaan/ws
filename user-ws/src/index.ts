import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({
	port: 8080,
});

interface iRoom {
	sockets: WebSocket[];
}

const rooms: Record<string, iRoom> = {};

const connection = (ws: WebSocket) => {
	ws.on("error", () => console.error);

	ws.on("message", (data: string) => {
		const parsedData = JSON.parse(data);
		const dataType = parsedData.type;
		const room = parsedData.room;
		const message = parsedData.text;
		console.log(parsedData);

		// joining the room
		if (dataType == "join-room") {
			if (!rooms[room]) {
				rooms[room] = {
					sockets: [],
				};
			}
			rooms[room].sockets.push(ws);
		}

		// exchange of messages
		if (dataType == "chat") {
			rooms[room]?.sockets.map((socket) => socket.send(message));
		}
	});
};

wss.on("connection", connection);
