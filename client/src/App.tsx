import { useState } from "react";
import { TitlePage } from "./pages/TitlePage";
import { LobbyPage } from "./pages/LobbyPage";
import { PlayingPage } from "./pages/PlayingPage";

type Page = "title" | "lobby" |"playing";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("title");

  return (
    <>
      {currentPage === "title" && (
        <TitlePage
          onCreateRoom={() => setCurrentPage("lobby")}
        />
      )}

      {currentPage === "lobby" && (
        <LobbyPage
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