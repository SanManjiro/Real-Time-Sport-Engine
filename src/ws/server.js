import {WebSocket, WebSocketServer} from 'ws';
import {wsArcjet} from "../arcjet.js";
import arcjet from "@arcjet/node";
//Simple function for sending json
function sendJson(socket, json) {
    if(socket.readyState!==WebSocket.OPEN) return;
    socket.send(JSON.stringify(json));
}
//Allow sending payload for all websocket clients
export default function broadcast(wss, payload) {
    for (const client of wss.clients) {
        if(client.readyState!==WebSocket.OPEN) continue ;
        client.send(JSON.stringify(payload))
    }
}

//Here we connect websocket server to http server on the same port this will make easy deployment also only upgrades requests are listen by the websocket server the rest are listeen by http server
export function attachWebSocketServer(server){
    const wss = new WebSocketServer({
        noServer: true,
        path: '/ws',
        //maxPayload allows to limit the payload size
        maxPayload:1024*1024
    })

    server.on('upgrade', async (req, socket, head) => {
        const { pathname } = new URL(req.url, `http://${req.headers.host}`);

        if (pathname === '/ws') {
            if (wsArcjet) {
                try {
                    const decision = await wsArcjet.protect(req);
                    if (decision.isDenied()) {
                        const statusCode = decision.reason.isRateLimit() ? 429 : 403;
                        const statusMessage = decision.reason.isRateLimit() ? "Too Many Requests" : "Forbidden";
                        socket.write(`HTTP/1.1 ${statusCode} ${statusMessage}\r\nConnection: close\r\n\r\n`);
                        socket.destroy();
                        return;
                    }
                } catch (e) {
                    console.log('Ws security error during upgrade', e);
                    socket.write('HTTP/1.1 500 Internal Server Error\r\nConnection: close\r\n\r\n');
                    socket.destroy();
                    return;
                }
            }

            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit('connection', ws, req);
            });
        } else {
            socket.destroy();
        }
    });

    wss.on('connection', (socket, req)=>{
        socket.isActive= true;
        socket.on('pong',()=>{
            socket.isActive= true
        })

        sendJson(socket, {type:'welcome'})
        socket.on('error', console.error)
    })

    const interval = setInterval(() => {
        wss.clients.forEach((socket) => {
            if (socket.isActive === false) return socket.terminate();
            socket.isActive = false;
            socket.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(interval);
    });

    function broadcastMatchCreated(match){
        broadcast(wss, {type: "match_created", data:match})
    }
    return {broadcastMatchCreated}

}