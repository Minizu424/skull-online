import { useState } from "react";
import { TitlePage } from "./pages/TitlePage";
import { LobbyPage } from "./pages/LobbyPage";
import { PlayingPage } from "./pages/PlayingPage";

type Page = "title" | "lobby" |"playing";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("title");
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  return (
    <>
      {currentPage === "title" && (
        <TitlePage
          onCreateRoom={(newRoomId, name) => {
            setRoomId(newRoomId);

            setPlayerName(name);

            setCurrentPage("lobby");
          }}
        />
      )}

      {currentPage === "lobby" && (
        <LobbyPage
          roomId={roomId}
          playerName={playerName}
          onBackToTitle={() => setCurrentPage("title")}
          onStartGame={() => setCurrentPage("playing")}
        />
      )}
      {currentPage === "playing" && (
         <PlayingPage
          onBackToLobby={() => setCurrentPage("lobby")}
          />
      )}
    </>
  );
}