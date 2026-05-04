import { useState } from "react";
import { TitlePage } from "./pages/TitlePage";
import { LobbyPage } from "./pages/LobbyPage";

type Page = "title" | "lobby";

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
        />
      )}
    </>
  );
}