// Máy chủ chuyển tin online cho Trúc Khê Tiên Duyên (Cloudflare Workers + Durable Objects).
// Nói cùng định dạng tin với Supabase Realtime mà game đang dùng: phx_join / phx_leave / broadcast / heartbeat.
// Mỗi người chơi giữ 1 kết nối; tin "broadcast" của một phòng được chuyển cho mọi người khác đang ở phòng đó.
// Dùng chế độ ngủ (hibernation) nên không tốn thời gian chạy khi không có tin.
export class Hub {
  constructor(state, env) { this.state = state; }
  async fetch(req) {
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('Truc Khe relay', { status: 200 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server);
    server.serializeAttachment({ rooms: [] });
    return new Response(null, { status: 101, webSocket: client });
  }
  webSocketMessage(ws, msg) {
    if (typeof msg !== 'string' || msg.length > 16000) return;
    let m; try { m = JSON.parse(msg); } catch (e) { return; }
    const t = m && m.topic;
    if (typeof t !== 'string' || t.length > 100) return;
    if (m.event === 'heartbeat') return;
    if (m.event === 'phx_join' || m.event === 'phx_leave') {
      const a = ws.deserializeAttachment() || { rooms: [] };
      const rooms = a.rooms.filter(r => r !== t);
      if (m.event === 'phx_join' && rooms.length < 30) rooms.push(t);
      ws.serializeAttachment({ rooms });
      return;
    }
    if (m.event !== 'broadcast') return;
    const out = JSON.stringify({ topic: t, event: 'broadcast', payload: m.payload });
    for (const o of this.state.getWebSockets()) {
      if (o === ws) continue;
      const a = o.deserializeAttachment();
      if (a && a.rooms && a.rooms.includes(t)) { try { o.send(out); } catch (e) {} }
    }
  }
  webSocketClose(ws) { try { ws.close(); } catch (e) {} }
  webSocketError(ws) { try { ws.close(); } catch (e) {} }
}
export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (u.pathname === '/ws') return env.HUB.get(env.HUB.idFromName('main')).fetch(req);
    return new Response('Truc Khe Tien Duyen relay: ok', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
};
