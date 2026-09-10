import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {once} from 'node:events';
import {WebSocket} from 'ws';
import {attachWebSocket,broadcastStockUpdate} from '../server/ws-hub.mjs';

test('real /ws client receives both stock update event formats',async()=>{
 const server=http.createServer();const hub=attachWebSocket(server);let client;
 try {
  server.listen(0,'127.0.0.1');await once(server,'listening');
  client=new WebSocket(`ws://127.0.0.1:${server.address().port}/ws`);
  const messages=[];client.on('message',value=>messages.push(JSON.parse(value)));
  await once(client,'open');
  const received=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('No stock sync')),3000);client.on('message',value=>{if(JSON.parse(value).type==='STOCK_SYNC'){clearTimeout(timer);resolve();}});});
  broadcastStockUpdate([{id:901,remainingStock:4,sku:'QA-WS'}],'POS');await received;
  assert.equal(messages.find(m=>m.type==='STOCK_MUTATION').payload.items[0].stock,4);
  assert.equal(messages.find(m=>m.type==='STOCK_SYNC').items[0].newStock,4);
 }finally{client?.terminate();for(const socket of hub.clients)socket.terminate();await new Promise(r=>hub.close(r));await new Promise(r=>server.close(r));}
});
