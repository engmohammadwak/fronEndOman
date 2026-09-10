import { WebSocketServer, WebSocket } from 'ws';

const clients = new Set();
let wss = null;

export function attachWebSocket(server) {
  if (wss) return wss;
  wss = new WebSocketServer({ server, path: '/ws' });
  wss.on('connection', (socket) => {
    clients.add(socket);
    socket.send(JSON.stringify({ type: 'CONNECTED', payload: { ok: true }, timestamp: new Date().toISOString() }));
    socket.on('close', () => clients.delete(socket));
    socket.on('error', () => clients.delete(socket));
  });
  return wss;
}

/** Alias matching the POS integration guide. */
export function initWsHub(server) {
  return attachWebSocket(server);
}

export function broadcast(type, payload) {
  const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      try { client.send(message); } catch { /* ignore broken sockets */ }
    }
  }
  return clients.size;
}

/**
 * Broadcast stock changes in both STOCK_SYNC (guide shape) and STOCK_MUTATION (dashboard shape).
 * items: [{ id, remainingStock|remaining_stock|stock, sku, barcode? }]
 */
export function broadcastStockUpdate(items, channel = 'POS') {
  const normalized = (items || []).map((item) => ({
    id: item.id,
    productId: item.id,
    stock: Number(item.remainingStock ?? item.remaining_stock ?? item.stock ?? 0),
    newStock: Number(item.remainingStock ?? item.remaining_stock ?? item.stock ?? 0),
    remainingStock: Number(item.remainingStock ?? item.remaining_stock ?? item.stock ?? 0),
    sku: item.sku,
    barcode: item.barcode
  }));

  broadcast('STOCK_MUTATION', { channel, items: normalized });

  const syncPayload = JSON.stringify({
    type: 'STOCK_SYNC',
    channel,
    timestamp: new Date().toISOString(),
    items: normalized.map((item) => ({
      productId: item.productId,
      newStock: item.newStock,
      sku: item.sku
    }))
  });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      try { client.send(syncPayload); } catch { /* ignore */ }
    }
  }
  return clients.size;
}

export function clientCount() {
  return clients.size;
}
