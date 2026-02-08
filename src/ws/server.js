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
        server,
        path: '/ws',
        //maxPayload allows to limit the payload size
        maxPayload:1024*1024
    })
    wss.on('connection', async (socket, req)=>{
        if(wsArcjet){
            try {
                const decision=await wsArcjet.protect(req);
                if(decision.isDenied()){
                    const code =decision.reason.isRateLimit()? 1013 : 1008;
                    const reason=decision.reason.isRateLimit()?"Rate limit exceeded": "Access denied"
                    socket.close(code,reason);
                    return;
                }
            }catch (e) {
                console.log('Ws connection error', e);
                socket.close(1011, 'Server security error')
                return;

            }
        }
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