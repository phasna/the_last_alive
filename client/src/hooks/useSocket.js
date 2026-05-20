import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");

let sharedSocket = null;

function getSharedSocket() {
  if (!sharedSocket) {
    sharedSocket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 3000,
      reconnectionAttempts: Infinity,
      timeout: 10000,
    });
  }
  return sharedSocket;
}

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const socket = getSharedSocket();
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      setConnecting(false);
      setError(null);
    };

    const onDisconnect = () => {
      setConnected(false);
      setConnecting(true);
    };

    const onConnectError = () => {
      setConnected(false);
      setConnecting(true);
    };

    const onReconnectFailed = () => {
      setConnecting(false);
      setError("Serveur injoignable — lance npm run dev:server");
    };

    const onGameState = (state) => setGameState(state);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("reconnect_failed", onReconnectFailed);
    socket.on("game:state", onGameState);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("reconnect_failed", onReconnectFailed);
      socket.off("game:state", onGameState);
    };
  }, []);

  const emit = useCallback((event, data) => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      if (!socket?.connected) {
        resolve({ error: "Non connecté au serveur" });
        return;
      }
      socket.emit(event, data, (res) => resolve(res));
    });
  }, []);

  const createRoom = useCallback(
    (profile) => emit("room:create", profile),
    [emit]
  );
  const joinRoom = useCallback(
    (code, profile) => emit("room:join", { code, ...profile }),
    [emit]
  );
  const setReady = useCallback((ready) => emit("player:ready", { ready }), [emit]);
  const submitAnswer = useCallback(
    (answer) => emit("game:answer", { answer }),
    [emit]
  );
  const leaveRoom = useCallback(() => {
    socketRef.current?.emit("room:leave");
    setGameState(null);
  }, []);

  return {
    connected,
    connecting,
    gameState,
    error,
    createRoom,
    joinRoom,
    setReady,
    submitAnswer,
    leaveRoom,
    socket: socketRef,
  };
}
