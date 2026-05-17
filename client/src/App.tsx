import { useState, useEffect } from "react";
import { socket } from "./socket";
import { TitlePage } from "./pages/TitlePage";
import { LobbyPage } from "./pages/LobbyPage";
import { PlayingPage } from "./pages/PlayingPage";
import { ResultPage } from "./pages/ResultPage";
import titleBg from "./assets/back-title.png";
import "./App.css";
import { SoundProvider } from "./components/SoundProvider";

type Page = "title" | "lobby" | "playing" | "result";

type Player = {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  frameColor: "blue" | "green" | "purple" | "red";
};

type CardType =
  | "rose"
  | "skull"
  | "doubleRose";

type Card = {
  id: string;
  type: CardType;
  label: string;
};

type RevealedCard = Card & {
  revealed: boolean;
  isFlipping?: boolean;
};

type PlayingPlayer = {
  id: string;
  name: string;
  handCards: Card[];
  placedCards: RevealedCard[];
  winCount: number;
  passed: boolean;
};

type PlayingState = {
  phase: "placing" | "bidding" | "revealing" | "result";
  message: string;

  currentTurnPlayerId: string;
  turnOrder: string[];

  bid: number;
  highestBidderId: string | null;
  revealedRoseCount?: number;

  players: PlayingPlayer[];
};

export default function App() {
  const [currentPage, setCurrentPage] =
    useState<Page>("title");

  const [playerName, setPlayerName] =
    useState("");

  const [roomId, setRoomId] =
    useState("");

  const [players, setPlayers] =
    useState<Player[]>([]);

  const [playingState, setPlayingState] =
    useState<PlayingState | null>(null);

  // 優勝者の名前を保存する
  const [winnerName, setWinnerName] =
    useState("");

  const shouldShowBackground =
    currentPage !== "playing";

  useEffect(() => {
    // プレイヤーリストの更新を受信
    socket.on(
      "update_players",
      (updatedPlayers: Player[]) => {
        setPlayers(updatedPlayers);
      }
    );

    // 誰かが開始ボタンを押した時に全員の画面を切り替える
    socket.on("game_started", () => {
      setWinnerName("");
      setPlayingState(null);
      setCurrentPage("playing");
    });

    // プレイ中の状態を受信
    socket.on(
      "playing_state",
      (nextPlayingState: PlayingState) => {
        setPlayingState(nextPlayingState);
      }
    );

    // 優勝者が決まった時に全員の画面をリザルトへ移動する
    socket.on(
      "playing_game_won",
      ({
        winnerId,
        winnerName,
      }: {
        winnerId: string;
        winnerName: string;
      }) => {
        console.log("game won:", {
          winnerId,
          winnerName,
        });

        setWinnerName(winnerName);
        setCurrentPage("result");
      }
    );

    return () => {
      socket.off("update_players");
      socket.off("game_started");
      socket.off("playing_state");
      socket.off("playing_game_won");
    };
  }, []);

  const handleJoinRoom = (
    id: string,
    name: string
  ) => {
    setRoomId(id);
    setPlayerName(name);

    socket.emit("join_room", {
      roomId: id,
      playerName: name,
    });

    setCurrentPage("lobby");
  };

  // Ready状態をサーバーに送る
  const handleToggleReady = () => {
    socket.emit("toggle_ready", {
      roomId,
    });
  };

  // ゲーム開始をサーバーに送る
  const handleStartGame = () => {
    socket.emit("start_game", {
      roomId,
    });
  };

  return (
    <SoundProvider>
      <div
        className={
          shouldShowBackground
            ? "app app--with-bg"
            : "app"
        }
        style={
          shouldShowBackground
            ? {
                backgroundImage: `url(${titleBg})`,
              }
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
            onBackToTitle={() =>
              window.location.reload()
            }
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
          />
        )}

        {currentPage === "playing" && (
          <PlayingPage
            socket={socket}
            roomId={roomId}
            playerName={playerName}
            players={players}
            playingState={playingState}
            onBackToLobby={() =>
              setCurrentPage("lobby")
            }
            onGoToResult={() =>
              setCurrentPage("result")
            }
            onGameWon={(name) => {
              setWinnerName(name);
              setCurrentPage("result");
            }}
          />
        )}

        {currentPage === "result" && (
          <ResultPage
            winnerName={
              winnerName || "不明なプレイヤー"
            }
            onRematch={() =>
              setCurrentPage("lobby")
            }
            onBackToTitle={() =>
              setCurrentPage("title")
            }
          />
        )}
      </div>
    </SoundProvider>
  );
}