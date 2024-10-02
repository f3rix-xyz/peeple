import http from "http";
import type { IncomingMessage, ServerResponse } from "http";
import WebSocket, { RawData, WebSocketServer } from "ws";

interface RoomClient extends WebSocket {
  roomId?: string;
}

interface Message {
  type: "join" | "message";
  payload: string;
}

const rooms: Map<string, Set<RoomClient>> = new Map();

const handleJoin = (ws: RoomClient, roomId: string) => {
  if (ws.roomId) handleDisconnect(ws);

  ws.roomId = roomId;

  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  rooms.get(roomId)?.add(ws);
  console.log(`Client joined room: ${roomId}`);
};

const handleMessage = (ws: RoomClient, message: string, isBinary: boolean) => {
  if (!ws.roomId) throw new Error("client not in a room");

  const clientRoom = rooms.get(ws.roomId);
  if (clientRoom) {
    clientRoom.forEach((client: RoomClient) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "message", payload: message }), {
          binary: isBinary,
        });
      }
    });
  }
};

const handleDisconnect = (ws: RoomClient) => {
  if (ws.roomId) {
    const clientRoom = rooms.get(ws.roomId);
    if (clientRoom) {
      clientRoom.delete(ws);
      if (clientRoom.size === 0) rooms.delete(ws.roomId);
    }
    console.log(`Client disconnected from room: ${ws.roomId}`);
    ws.roomId = undefined;
  }
};

const port: number = 8080;
const server = http.createServer(
  (
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage> & { req: IncomingMessage },
  ) => {
    res.end("hello world");
  },
);

const wss = new WebSocketServer({ server });

wss.on("connection", (ws: RoomClient) => {
  console.log("client connected");
  ws.on("error", (): never => {
    throw new Error("wss error");
  });

  ws.on("message", (data: RawData, isBinary: boolean) => {
    try {
      const message: Message = JSON.parse(data.toString());
      switch (message.type) {
        case "join":
          handleJoin(ws, message.payload);
          break;
        case "message":
          handleMessage(ws, message.payload, isBinary);
          break;
        default:
          console.error("unknown message type");
          break;
      }
    } catch (err) {
      console.error(err);
    }
  });
  ws.on("close", () => {
    console.log("client disconnected");
    handleDisconnect(ws);
  });
});

server.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
