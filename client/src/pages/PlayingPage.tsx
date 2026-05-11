import { useState } from "react";
import { Button } from "../components/Button";
import "../styles/PlayingPage.css";

type PlayingPageProps = {
  onBackToLobby: () => void;
};

type GamePhase = "placing" | "bidding" | "revealing" | "result";

type Card = {
  id: string;
  type: "rose" | "skull" | "doubleRose";
  label: string;
};

export function PlayingPage({ onBackToLobby }: PlayingPageProps) {
  const [phase] = useState<GamePhase>("placing");
  const [bid] = useState(0);
  const [timer] = useState(30);

  const handCards: Card[] = [
    { id: "1", type: "rose", label: "Rose" },
    { id: "2", type: "rose", label: "Rose" },
    { id: "3", type: "skull", label: "Skull" },
    { id: "4", type: "doubleRose", label: "W-Rose" },
  ];

  return (
    <div className="playing-page">
      <header className="playing-header">
        <h1>プレイ画面</h1>
        <div>Phase: {phase}</div>
        <div>Timer: {timer}</div>
      </header>

      <main className="playing-board">
        <section className="player-area top-player">
          <h2>上プレイヤー</h2>
          <p>手札: 4 / 場札: 0</p>
          <p>勝利数: 🌹 0</p>
        </section>

        <section className="player-area left-player">
          <h2>左プレイヤー</h2>
          <p>手札: 4 / 場札: 0</p>
          <p>勝利数: 🌹 0</p>
        </section>

        <section className="center-field">
          <h2>中央の場</h2>
          <p>BID: {bid}</p>
        </section>

        <section className="player-area right-player">
          <h2>右プレイヤー</h2>
          <p>手札: 4 / 場札: 0</p>
          <p>勝利数: 🌹 0</p>
        </section>

        <section className="my-field">
          <h2>自分の場</h2>
          <p>伏せカード: 0</p>
        </section>
      </main>

      <section className="hand-area">
        {handCards.map((card) => (
          <button className="card-button" key={card.id}>
            {card.label}
          </button>
        ))}
      </section>

      <footer className="action-area">
        <Button disabled={phase !== "placing"}>カードを出す</Button>
        <Button disabled={phase === "revealing"}>宣言する</Button>
        <Button disabled={phase !== "bidding"}>パスする</Button>
        <Button onClick={onBackToLobby}>ロビーへ戻る</Button>
      </footer>
    </div>
  );
}