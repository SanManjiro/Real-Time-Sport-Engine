import {WebSocket, WebSocketServer} from 'ws';
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
    wss.on('connection', (socket)=>{
        sendJson(socket, {type:'welcome'})
        socket.on('error', console.error)
    })
    function broadcastMatchCreated(match){
        broadcast(wss, {type: "match_created", data:match})
    }
    return {broadcastMatchCreated}

}