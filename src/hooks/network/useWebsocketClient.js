import { useWebSocket } from '@vueuse/core';

export function useWebsocketClient(url, options = {}) {
  const { autoReconnect = true, heartbeatInterval = 1000, heartbeatMessage = JSON.stringify('ping') } = options;

  // 存储生命周期回调函数
  const lifecycleHandlers = { open: [], close: [], error: [] };
  // 存储待发送的消息队列
  const sendQueue = [];
  // 存储消息处理函数
  const messageHandlers = [];

  // 创建 WebSocket 实例
  const socketInstance = useWebSocket(url, {
    autoReconnect,
    // heartbeat: { interval: heartbeatInterval, message: heartbeatMessage },
    onConnected: ws => {
      console.log('[WebSocket] 连接成功', ws);
      lifecycleHandlers.open.forEach(handler => handler(ws)); // 执行所有注册的 onConnected 回调
      // 连接成功后发送队列中的消息
      while (sendQueue.length) {
        socketInstance.send(sendQueue.shift());
      }
    },
    onMessage: (ws, event) => {
      const val = event.data;
      try {
        let msg = JSON.parse(val);
        // 执行所有已注册的消息处理函数
        messageHandlers.forEach(handler => handler(ws, msg));
      } catch {
        console.warn('[WebSocket] 收到非 JSON 消息:', val);
      }
    },
    onDisconnected: (ws, event) => {
      lifecycleHandlers.close.forEach(handler => handler(ws, event)); // 执行所有注册的 onDisconnected 回调
    },
    onError: (ws, event) => {
      lifecycleHandlers.error.forEach(handler => handler(ws, event)); // 执行所有注册的 onError 回调
      console.error('[WebSocket] ERROR:', ws, event);
    },
  });

  // 获取当前 WebSocket 状态
  const status = socketInstance.status;

  return {
    socketInstance,
    status,
    onMessage(handler) {
      // 注册消息处理函数
      messageHandlers.push(handler);
    },
    send(data) {
      try {
        const msg = JSON.stringify(data);
        // 如果 WebSocket 未打开，则将消息加入队列
        if (socketInstance.status.value !== 'OPEN') {
          sendQueue.push(msg);
          return;
        }
        // WebSocket 状态为打开时直接发送消息
        socketInstance.send(msg);
      } catch (error) {
        console.error('[WebSocket] 发送消息失败:', error);
      }
    },
    close() {
      socketInstance.close();
    },
    onConnected(handler) {
      lifecycleHandlers.open.push(handler);
    },
    onDisconnected(handler) {
      lifecycleHandlers.close.push(handler);
    },
    onError(handler) {
      lifecycleHandlers.error.push(handler);
    },
  };
}
