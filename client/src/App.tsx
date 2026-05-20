import { useState, useEffect } from "react";
import { socket } from "./socket";
import { TitlePage } from "./pages/TitlePage";
import { LobbyPage } from "./pages/LobbyPage";
import { PlayingPage } from "./pages/PlayingPage";
import { ResultPage } from "./pages/ResultPage";
import titleBg from "./assets/back-title.png";
import "./App.css";
import { SoundProvider } from "./components/SoundProvider";

type Page =
  | "title"
  | "lobby"
  | "playing"
  | "result";

type PlayerColor =
  | "blue"
  | "green"
  | "purple"
  | "red";

type Player = {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  frameColor: PlayerColor;
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
  phase:
    | "placing"
    | "bidding"
    | "revealing"
    | "result";
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

  const [winnerName, setWinnerName] =
    useState("");

  const [winnerColor, setWinnerColor] =
    useState<PlayerColor>("blue");

  const shouldShowBackground =
    currentPage !== "playing";

  useEffect(() => {
    socket.on(
      "update_players",
      (updatedPlayers: Player[]) => {
        setPlayers(updatedPlayers);
      }
    );

    socket.on("game_started", () => {
      setWinnerName("");
      setWinnerColor("blue");
      setPlayingState(null);
      setCurrentPage("playing");
    });

    socket.on(
      "playing_state",
      (nextPlayingState: PlayingState) => {
        setPlayingState(nextPlayingState);
      }
    );

    socket.on(
      "playing_game_won",
      ({
        winnerId,
        winnerName,
      }: {
        winnerId: string;
        winnerName: string;
      }) => {
        const winner =
          players.find(
            (player) => player.id === winnerId
          );

        setWinnerName(winnerName);
        setWinnerColor(
          winner?.frameColor ?? "blue"
        );
        setCurrentPage("result");
      }
    );

    return () => {
      socket.off("update_players");
      socket.off("game_started");
      socket.off("playing_state");
      socket.off("playing_game_won");
    };
  }, [players]);

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

  const handleToggleReady = () => {
    socket.emit("toggle_ready", {
      roomId,
    });
  };

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
            onBackToLobby={() => {
              socket.emit("return_lobby", {
                roomId,
              });

              setPlayingState(null);
              setCurrentPage("lobby");
            }}
            onGoToResult={() =>
              setCurrentPage("result")
            }
            onGameWon={(name, color) => {
              setWinnerName(name);
              setWinnerColor(color);
              setCurrentPage("result");
            }}
          />
        )}

        {currentPage === "result" && (
          <ResultPage
            winnerName={
              winnerName || "不明なプレイヤー"
            }
            winnerColor={winnerColor}
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