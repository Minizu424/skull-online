import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { TitlePage } from "./pages/TitlePage";
import { LobbyPage } from "./pages/LobbyPage";
import { PlayingPage } from "./pages/PlayingPage";
import { ResultPage } from "./pages/ResultPage";
import titleBg from "./assets/back-title.png";
import "./App.css";

// 接続先を最新のNetwork IPに設定
const socket = io("http://10.160.90.44:3001");

type Page = "title" | "lobby" | "playing" | "result";

type Player = {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  frameColor: "blue" | "green" | "purple" | "red";
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("title");
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);

  const shouldShowBackground = currentPage !== "playing";

  useEffect(() => {
    // プレイヤーリストの更新を受信
    socket.on("update_players", (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    });

    // 誰かが開始ボタンを押した時に全員の画面を切り替える
    socket.on("game_started", () => {
      setCurrentPage("playing");
    });

    return () => {
      socket.off("update_players");
      socket.off("game_started");
    };
  }, []);

  const handleJoinRoom = (id: string, name: string) => {
    setRoomId(id);
    setPlayerName(name);
    socket.emit("join_room", { roomId: id, playerName: name });
    setCurrentPage("lobby");
  };

  // Ready状態をサーバーに送る
  const handleToggleReady = () => {
    socket.emit("toggle_ready", { roomId });
  };

  // ゲーム開始をサーバーに送る（ホスト用）
  const handleStartGame = () => {
    socket.emit("start_game", { roomId });
  };

  return (
    <div
      className={shouldShowBackground ? "app app--with-bg" : "app"}
      style={
        shouldShowBackground
          ? { backgroundImage: `url(${titleBg})` }
          : undefined
      }
    >
      {currentPage === "title" && (
        <TitlePage
          onCreateRoom={handleJoinRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}

      {currentPage === "lobby" && (
        <LobbyPage
          roomId={roomId}
          playerName={playerName}
          players={players}
          onBackToTitle={() => window.location.reload()}
          onToggleReady={handleToggleReady}
          onStartGame={handleStartGame}
        />
      )}

      {currentPage === "playing" && (
        <PlayingPage
          onBackToLobby={() => setCurrentPage("lobby")}
          onGoToResult={() => setCurrentPage("result")}
        />
      )}

      {currentPage === "result" && (
        <ResultPage
          winnerName={playerName}
          onRematch={() => setCurrentPage("lobby")}
          onBackToTitle={() => setCurrentPage("title")}
        />
      )}
    </div>
  );
}