import { useState, useEffect, useRef } from "react";
import { useSocket } from "./hooks/useSocket";
import { Home } from "./screens/Home";
import { Lobby } from "./screens/Lobby";
import { Selector } from "./screens/Selector";
import { Gameplay } from "./screens/Gameplay";
import { Winner } from "./screens/Winner";

export default function App() {
  const {
    connected,
    connecting,
    gameState,
    error,
    createRoom,
    joinRoom,
    setReady,
    submitAnswer,
    leaveRoom,
    socket,
  } = useSocket();

  const [selfId, setSelfId] = useState(null);
  const [ready, setReadyLocal] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const roomCodeRef = useRef(null);

  useEffect(() => {
    const s = socket.current;
    if (!s) return;
    const onConnect = () => setSelfId(s.id);
    s.on("connect", onConnect);
    if (s.connected) setSelfId(s.id);
    return () => s.off("connect", onConnect);
  }, [socket, connected]);

  useEffect(() => {
    if (gameState?.phase === "playing") {
      setAnswered(false);
    }
    if (gameState?.phase === "lobby") {
      setReadyLocal(false);
    }
  }, [gameState?.phase, gameState?.roundNumber]);

  const handleCreate = async (profile) => {
    setJoinError(null);
    const res = await createRoom(profile);
    if (res?.error) setJoinError(res.error);
    else roomCodeRef.current = res?.code;
  };

  const handleJoin = async (code, profile) => {
    setJoinError(null);
    const res = await joinRoom(code, profile);
    if (res?.error) setJoinError(res.error);
    else roomCodeRef.current = res?.code;
  };

  const handleReady = async (r) => {
    setReadyLocal(r);
    await setReady(r);
  };

  const handleAnswer = async (answer) => {
    setAnswered(true);
    await submitAnswer(answer);
  };

  const handleReturn = () => {
    leaveRoom();
    setReadyLocal(false);
    setAnswered(false);
    roomCodeRef.current = null;
  };

  if (!gameState) {
    return (
      <Home
        connected={connected}
        connecting={connecting}
        error={joinError || error}
        onCreate={handleCreate}
        onJoin={handleJoin}
      />
    );
  }

  const phase = gameState.phase;

  if (phase === "lobby") {
    return (
      <Lobby
        gameState={gameState}
        selfId={selfId}
        ready={ready}
        onReady={handleReady}
      />
    );
  }

  if (phase === "selecting" || phase === "round_end") {
    return <Selector gameState={gameState} selfId={selfId} />;
  }

  if (phase === "playing") {
    return (
      <Gameplay
        gameState={gameState}
        selfId={selfId}
        onAnswer={handleAnswer}
        answered={answered}
      />
    );
  }

  if (phase === "game_over") {
    return (
      <Winner gameState={gameState} selfId={selfId} onReturn={handleReturn} />
    );
  }

  return (
    <Home
      connected={connected}
      connecting={connecting}
      onCreate={handleCreate}
      onJoin={handleJoin}
    />
  );
}
