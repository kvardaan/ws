import WebSocket = require("ws");

const wss = new WebSocket.WebSocketServer({ port: 8081 });

const servers: WebSocket[] = [];

wss.on("connection", (ws) => {
	servers.push(ws);

	ws.on("error", console.error);

	ws.on("message", (data) => {
		servers.filter((socket) => socket !== ws).map((socket) => socket.send(data));
	});
});
