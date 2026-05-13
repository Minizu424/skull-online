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

type BotPlayer = {
  id: string;
  name: string;
  position: "top" | "left" | "right";
  handCards: Card[];
  placedCards: RevealedCard[];
  winCount: number;
  passed: boolean;
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

  const createBotDeck = (botId: string): Card[] => [
    {
      id: `${botId}-rose-1`,
      type: "rose",
      label: "Rose",
    },
    {
      id: `${botId}-rose-2`,
      type: "rose",
      label: "Rose",
    },
    {
      id: `${botId}-skull-1`,
      type: "skull",
      label: "Skull",
    },
    {
      id: `${botId}-double-1`,
      type: "doubleRose",
      label: "W-Rose",
    },
  ];

  const [botPlayers, setBotPlayers] =
    useState<BotPlayer[]>([
      {
        id: "bot-top",
        name: "上プレイヤー",
        position: "top",
        handCards: createBotDeck("bot-top"),
        placedCards: [],
        winCount: 0,
        passed: false,
      },
      {
        id: "bot-left",
        name: "左プレイヤー",
        position: "left",
        handCards: createBotDeck("bot-left"),
        placedCards: [],
        winCount: 0,
        passed: false,
      },
      {
        id: "bot-right",
        name: "右プレイヤー",
        position: "right",
        handCards: createBotDeck("bot-right"),
        placedCards: [],
        winCount: 0,
        passed: false,
      },
    ]);

  const [successCount, setSuccessCount] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [message, setMessage] =
    useState("カードを1枚出してください");

  const selectedCard =
    handCards.find(
      (card) =>
        card.id === selectedCardId
    );

  const getRevealPoint = (card: RevealedCard) => {
    if (card.type === "doubleRose") {
      return 2;
    }

    if (card.type === "rose") {
      return 1;
    }

    return 0;
  };

  const handlePlaceCard = () => {
    if (!selectedCard) return;
    if (phase !== "placing") return;

    const myPlacedCard: RevealedCard = {
      ...selectedCard,
      revealed: false,
    };

    setPlacedCards([
      ...placedCards,
      myPlacedCard,
    ]);

    setHandCards(
      handCards.filter(
        (card) => card.id !== selectedCard.id
      )
    );

    setBotPlayers((prevBots) =>
      prevBots.map((bot) => {
        if (bot.handCards.length === 0) {
          return bot;
        }

        const randomIndex = Math.floor(
          Math.random() * bot.handCards.length
        );

        const selectedBotCard =
          bot.handCards[randomIndex];

        const botPlacedCard: RevealedCard = {
          ...selectedBotCard,
          id: crypto.randomUUID(),
          revealed: false,
        };

        return {
          ...bot,
          handCards: bot.handCards.filter(
            (_, index) => index !== randomIndex
          ),
          placedCards: [
            ...bot.placedCards,
            botPlacedCard,
          ],
        };
      })
    );

    setSelectedCardId(null);
    setMessage("Botがそれぞれカードを1枚出しました。宣言できます。");
  };

  const handleStartBidding = () => {
    if (placedCards.length === 0) {
      setMessage("先にカードを1枚出してください");
      return;
    }

    setPhase("bidding");

    setBotPlayers((prevBots) =>
      prevBots.map((bot) => ({
        ...bot,
        passed: true,
      }))
    );

    if (bid === 0) {
      setBid(1);
    }

    setMessage("あなたが宣言しました。Botは全員パスしました。");
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
    if (bid <= 0) return;

    const myCardsToReveal = placedCards.filter(
      (card) => !card.revealed
    );

    if (myCardsToReveal.length === 0) {
      setMessage("自分の場にカードがありません。");
      return;
    }

    setPhase("revealing");

    setPlacedCards((prev) =>
      prev.map((card) => ({
        ...card,
        revealed: true,
        isFlipping: false,
      }))
    );

    const hasSkull = myCardsToReveal.some(
      (card) => card.type === "skull"
    );

    if (hasSkull) {
      setMessage("自分の場にSkullがありました。失敗です。カードを1枚失います。");

      setTimeout(() => {
        resetRound(true);
      }, 1000);

      return;
    }

    const revealedRoseCount = myCardsToReveal.reduce(
      (sum, card) => sum + getRevealPoint(card),
      0
    );

    handleSuccessfulReveal(revealedRoseCount);
  };

  const handleRevealMycard = (cardId: string) => {
    if (phase !== "revealing") return;

    const targetCard = placedCards.find(
      (card) => card.id === cardId
    );

    if (!targetCard) return;

    setFlippingCard(targetCard);

    setPlacedCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              isFlipping: true,
            }
          : card
      )
    );

    setTimeout(() => {
      setPlacedCards((prev) =>
        prev.map((card) =>
          card.id === cardId
            ? {
                ...card,
                revealed: true,
                isFlipping: false,
              }
            : card
        )
      );

      handleRevealResult(targetCard);
    }, 800);

    setTimeout(() => {
      setFlippingCard(null);
    }, 1200);
  };  

  const handleRevealBotCard = (
    botId: string,
    cardId: string
  ) => {
    if (phase !== "revealing") return;

    const targetBot = botPlayers.find(
      (bot) => bot.id === botId
    );

    if (!targetBot) return;

    const targetCard = targetBot.placedCards.find(
      (card) => card.id === cardId
    );

    if (!targetCard) return;

    setFlippingCard(targetCard);

    setBotPlayers((prevBots) =>
      prevBots.map((bot) => {
        if (bot.id !== botId) return bot;

        return {
          ...bot,
          placedCards: bot.placedCards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  isFlipping: true,
                }
              : card
          ),
        };
      })
    );

    setTimeout(() => {
      setBotPlayers((prevBots) =>
        prevBots.map((bot) => {
          if (bot.id !== botId) return bot;

          return {
            ...bot,
            placedCards: bot.placedCards.map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    revealed: true,
                    isFlipping: false,
                  }
                : card
            ),
          };
        })
      );

      handleRevealResult(targetCard);
    }, 800);

    setTimeout(() => {
      setFlippingCard(null);
    }, 1200);
  };

  const handleSuccessfulReveal = (nextRevealedCount: number) => {
    setRevealedCount(nextRevealedCount);

    if (nextRevealedCount >= bid) {
      const nextSuccessCount = successCount + 1;
      setSuccessCount(nextSuccessCount);

      if (nextSuccessCount >= 2) {
        setMessage("2回成功しました。勝利です。");

        setTimeout(() => {
          onGoToResult();
        }, 1000);

        return;
      }

      setMessage(`成功！ 現在 ${nextSuccessCount} / 2 成功です。`);

      setTimeout(() => {
        resetRound(false);
      }, 1000);

      return;
    }
    setMessage(`${nextRevealedCount} / ${bid} ローズめくりました。残りをめくってください。`);
  };

  

  const handleRevealResult = (card: RevealedCard) => {
    if (card.type === "skull") {
      setMessage("Skullを引きました。カードを1枚失って次のラウンドへ。");

      setTimeout(() => {
        resetRound(true);
      }, 1000);

      return;
    }

    const nextRevealedCount =
      revealedCount + getRevealPoint(card);

    handleSuccessfulReveal(nextRevealedCount);
  };

  const [flippingCard, setFlippingCard] =
  useState<RevealedCard | null>(null);

  const removeRandomCard = (cards: Card[]) => {
    if (cards.length === 0) {
      return cards;
    }

    const randomIndex = Math.floor(Math.random() * cards.length);

    return cards.filter((_, index) => index !== randomIndex);
  };

  const resetRound = (shouldDiscardCard: boolean = false) => {
    setPhase("placing");
    setBid(0);
    setRevealedCount(0);
    setSelectedCardId(null);

    const returnedCards: Card[] = placedCards.map((card) => ({
      id: card.id,
      type: card.type,
      label: card.label,
    }));

    const nextHandCards = [
      ...handCards,
      ...returnedCards,
    ];

    setHandCards(
      shouldDiscardCard
        ? removeRandomCard(nextHandCards)
        : nextHandCards
    );

    setPlacedCards([]);

    setBotPlayers((prevBots) =>
      prevBots.map((bot) => ({
        ...bot,
        handCards: createBotDeck(bot.id),
        placedCards: [],
        passed: false,
      }))
    );

    setMessage("カードを1枚出してください");
  };
  
  return (
    <div className="playing-page">

      <main className="playing-board">

        <header className="playing-header">
          <h1>プレイ画面</h1>

          <div>Phase: {phase}</div>

          <div>Success: {successCount} / 2</div>

          <div>Timer: {timer}</div>
        </header>

        <div className="playing-message">
          {message}
        </div>

        {botPlayers.map((bot) => (
          <PlayerArea
            key={bot.id}
            position={bot.position}
            name={bot.name}
            handCount={bot.handCards.length}
            fieldCount={bot.placedCards.length}
            winCount={bot.winCount}
          />
        ))}

        <section className="bot-fields">
          {botPlayers.map((bot) => (
            <div
              key={bot.id}
              className={`bot-field bot-field--${bot.position}`}
            >
              <h2>{bot.name}の場</h2>

              <p>
                {bot.passed ? "PASS" : "WAIT"}
              </p>

              <div className="placed-card-stack">
                {bot.placedCards.map((card, index) => {
                  const topUnrevealedIndex =
                    bot.placedCards
                      .map((c) => c.revealed)
                      .lastIndexOf(false);

                  const canReveal =
                    index === topUnrevealedIndex;

                  return (
                    <button
                      key={card.id}
                      className={`placed-card ${
                        card.revealed ? "revealed" : ""
                      } ${
                        card.isFlipping ? "flipping" : ""
                      } ${
                        canReveal ? "can-reveal" : ""
                      }`}
                      onClick={() =>
                        handleRevealBotCard(bot.id, card.id)
                      }
                      disabled={
                        phase !== "revealing" ||
                        !canReveal ||
                        card.revealed ||
                        card.isFlipping
                      }
                    >
                      <span className="card-content">
                        {card.revealed ? card.label : "裏"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

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
                宣言する
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
          <div className="flip-overlay">

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