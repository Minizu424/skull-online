import { useState } from "react";
import { ActionButtons } from "../components/ActionButtons";
import { HandArea } from "../components/HandArea";
import { PlayerArea } from "../components/PlayerArea";
import "../styles/PlayingPage.css";

type PlayingPageProps = {
  onBackToLobby: () => void;
  onGoToResult: () => void;
};

type GamePhase =
  | "placing"
  | "bidding"
  | "revealing"
  | "result";

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

export function PlayingPage({
  onBackToLobby,
  onGoToResult,
}: PlayingPageProps) {
  const [phase, setPhase] =
    useState<GamePhase>("placing");

  const [bid, setBid] =
    useState(0);

  const [timer] =
    useState(30);

  const [selectedCardId, setSelectedCardId] =
    useState<string | null>(null);

  const [handCards, setHandCards] =
    useState<Card[]>([
      { id: "1", type: "rose", label: "Rose" },
      { id: "2", type: "rose", label: "Rose" },
      { id: "3", type: "skull", label: "Skull" },
      {
        id: "4",
        type: "doubleRose",
        label: "W-Rose",
      },
    ]);

  const [placedCards, setPlacedCards] =
    useState<RevealedCard[]>([]);

  const [opponentCards, setOpponentCards] =
    useState<RevealedCard[]>([
      {
        id: "op1",
        type: "rose",
        label: "Rose",
        revealed: false,
      },
      {
        id: "op2",
        type: "skull",
        label: "Skull",
        revealed: false,
      },
      {
        id: "op3",
        type: "rose",
        label: "Rose",
        revealed: false,
      },
    ]);

  const selectedCard =
    handCards.find(
      (card) =>
        card.id === selectedCardId
    );

  const handlePlaceCard = () => {
    if (!selectedCard) return;
    if (phase !== "placing") return;

    setPlacedCards([
      ...placedCards,
      {
        ...selectedCard,
        revealed: false,
      }
    ]);

    setHandCards(
      handCards.filter(
        (card) =>
          card.id !== selectedCard.id
      )
    );

    setSelectedCardId(null);
  };

  const handleStartBidding = () => {
    setPhase("bidding");

    if (bid === 0) {
      setBid(1);
    }
  };

  const handleBidDown = () => {
    if (bid <= 1) return;

    setBid(bid - 1);
  };

  const handleBidUp = () => {
    if (bid >= 16) return;

    setBid(bid + 1);
  };

  const handleStartReveal = () => {
    setPhase("revealing");
  };

  const handleRevealMycard = (
    cardId: string
  ) => {
    if (phase != "revealing") return;

    const targetCard =
      placedCards.find(
        (card) => card.id === cardId
      );
    
    if(!targetCard) return;

    setFlippingCard(targetCard);

    setPlacedCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ?{
            ...card,
            isFlipping: true,
           }
          :card
      )
    );

    setTimeout(() => {
      setPlacedCards((prev) =>
        prev.map((card) =>
          card.id === cardId
            ?{
              ...card,
              revealed:true,
              isFlipping: false,
            }
            : card
        )
      );
    },1500);

    setTimeout(() => {
      setFlippingCard(null);
    },2300);
  };
  

  const handleRevealOpponentCard = (
    cardId: string
  ) => {
    if (phase !== "revealing") return;

    setOpponentCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              revealed: true,
            }
          : card
      )
    );
  };

  const [flippingCard, setFlippingCard] =
  useState<RevealedCard | null>(null);

  return (
    <div className="playing-page">
      <main className="playing-board">
        <header className="playing-header">
          <h1>プレイ画面</h1>

          <div>Phase: {phase}</div>

          <div>Timer: {timer}</div>
        </header>

        <PlayerArea
          position="top"
          name="上プレイヤー"
          handCount={4}
          fieldCount={opponentCards.length}
          winCount={0}
        />

        <section className="opponent-field">
          <h2>相手の場</h2>

          <div className="placed-card-stack">
            {opponentCards.map((card) => (
              <button
                key={card.id}
                className="placed-card"
                onClick={() =>
                  handleRevealOpponentCard(card.id)
                }
              >
                {card.revealed
                  ? card.label
                  : "裏"}
              </button>
            ))}
          </div>
        </section>

        <PlayerArea
          position="left"
          name="左プレイヤー"
          handCount={4}
          fieldCount={0}
          winCount={0}
        />

        <PlayerArea
          position="right"
          name="右プレイヤー"
          handCount={4}
          fieldCount={0}
          winCount={0}
        />

        <section className="my-field">
          <h2>自分の場</h2>

          <p>
            伏せカード: {placedCards.length}
          </p>

          <p>BID: {bid}</p>

          {phase === "bidding" && (
            <div className="bid-controls">
              <button onClick={handleBidDown}>
                -
              </button>

              <span>{bid}</span>

              <button onClick={handleBidUp}>
                +
              </button>

              <button onClick={handleStartReveal}>
                めくる
              </button>
            </div>
          )}

          <div className="placed-card-stack">
            {placedCards.map((card, index) => {
              const topUnrevealedIndex =
                placedCards
                  .map((c) => c.revealed)
                  .lastIndexOf(false);
            
              const canReveal =
                index === topUnrevealedIndex;
            
              return (
                <button
                  key={card.id}
                  className={`placed-card ${
                    card.revealed
                      ? "revealed"
                      : ""
                  } ${
                    card.isFlipping
                      ? "flipping"
                      : ""
                  } ${
                    canReveal
                      ? "can-reveal"
                      : ""
                  }`}
                  onClick={() =>
                    handleRevealMycard(card.id)
                  }
                  disabled={
                    phase !== "revealing" ||
                    !canReveal ||
                    card.revealed ||
                    card.isFlipping
                  }
                >
                  <span className="card-content">
                    {card.revealed
                      ? card.label
                      : "裏"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <HandArea
          handCards={handCards}
          selectedCardId={selectedCardId}
          onSelectCard={setSelectedCardId}
        />

        <ActionButtons
          phase={phase}
          selectedCardId={selectedCardId}
          onPlaceCard={handlePlaceCard}
          onStartBidding={handleStartBidding}
          onBackToLobby={onBackToLobby}
        />
        <div className="dev-buttons">

          <button
            onClick={onGoToResult}
          >
            勝利扱い
          </button>

        </div>

        {flippingCard && (
          <div className="flip-ovrelay">

            <div className="flip-card">

              <div className="flip-card-inner">
                
                <div className="flip-card-front">
                  裏
                </div>

                <div className="flip-card-back">
                  {flippingCard.label}
                </div>

              </div> 

          </div>
        
        </div>
        )}  
      </main>
    </div>
  );
}