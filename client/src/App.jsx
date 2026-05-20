import { useState, useEffect, useRef } from "react";
import { useSocket } from "./hooks/useSocket";
import { useSound } from "./hooks/useSound";
import { Home } from "./screens/Home";
import { Lobby } from "./screens/Lobby";
import { Selector } from "./screens/Selector";
import { Gameplay } from "./screens/Gameplay";
import { Winner } from "./screens/Winner";
import { TrapAnnouncer } from "./components/TrapAnnouncer";

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
  const { play: playSound } = useSound();

  const [selfId, setSelfId] = useState(null);
  const prevFeedRef = useRef(null);
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
    if (gameState?.phase === "game_over") {
      playSound("win");
    }
  }, [gameState?.phase, gameState?.roundNumber, gameState?.roundPayload?.subPhase, gameState?.roundEndsAt]);

  useEffect(() => {
    const feed = gameState?.combatFeed?.[0];
    if (!feed || feed.at === prevFeedRef.current) return;
    prevFeedRef.current = feed.at;
    if (feed.type === "trap") playSound("eliminate");
    else if (feed.type === "elimination") playSound("eliminate");
    else if (feed.type === "damage") playSound("damage");
  }, [gameState?.combatFeed, playSound]);

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
    if (r) playSound("ready");
    await setReady(r);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    playSound("select");
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
        onCopyCode={handleCopyCode}
      />
    );
  }

  if (phase === "selecting" || phase === "round_end") {
    const myTrap = gameState.trappedThisRound?.find((t) => t.playerId === selfId);
    return (
      <>
        <Selector gameState={gameState} selfId={selfId} />
        {phase === "round_end" && myTrap && (
          <TrapAnnouncer trap={myTrap} onSound={playSound} />
        )}
      </>
    );
  }

  if (phase === "playing") {
    return (
      <Gameplay
        gameState={gameState}
        selfId={selfId}
        onAnswer={handleAnswer}
        answered={answered}
        onSound={playSound}
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
