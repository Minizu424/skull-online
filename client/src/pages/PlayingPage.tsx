import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { ActionButtons } from "../components/ActionButtons";
import { HandArea } from "../components/HandArea";
import { PlayerArea } from "../components/PlayerArea";
import "../styles/PlayingPage.css";

type OnlinePlayer = {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  frameColor: "blue" | "green" | "purple" | "red";
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

type PlayingPlayer = {
  id: string;
  name: string;
  handCards: Card[];
  placedCards: RevealedCard[];
  winCount: number;
  passed: boolean;
};

type PlayingState = {
  phase: GamePhase;
  message: string;

  currentTurnPlayerId: string;
  turnOrder: string[];

  bid: number;
  highestBidderId: string | null;

  revealedRoseCount?: number;

  players: PlayingPlayer[];
};

type PlayingPageProps = {
  socket: Socket;
  roomId: string;
  playerName: string;
  players: OnlinePlayer[];
  playingState: PlayingState | null;
  onBackToLobby: () => void;
  onGoToResult: () => void;
  onGameWon: (winnerName: string) => void;
};

const onlinePlayerPositions: Array<"top" | "left" | "right"> = [
  "left",
  "top",
  "right",
];

export function PlayingPage({
  socket,
  roomId,
  playerName,
  players,
  playingState,
  onBackToLobby,
  onGoToResult,
  onGameWon,
}: PlayingPageProps) {
  const [phase, setPhase] =
    useState<GamePhase>("placing");

  const [bid, setBid] =
    useState(1);

  const [isChoosingBid, setIsChoosingBid] =
    useState(false);

  const [timer, setTimer] =
    useState(30);

  useEffect(() => {
  if (timer <= 0) {
    setMessage("時間切れ！");
    return;
  }

  const interval = setInterval(() => {
    setTimer((prev) => prev - 1);
  }, 1000);

  return () =>
    clearInterval(interval);

}, [timer]);

  const [selectedCardId, setSelectedCardId] =
    useState<string | null>(null);

  const [handCards, setHandCards] =
    useState<Card[]>([
      {
        id: "1",
        type: "rose",
        label: "Rose",
      },
      {
        id: "2",
        type: "rose",
        label: "Rose",
      },
      {
        id: "3",
        type: "skull",
        label: "Skull",
      },
      {
        id: "4",
        type: "doubleRose",
        label: "W-Rose",
      },
    ]);

  const [placedCards, setPlacedCards] =
    useState<RevealedCard[]>([]);

  

  const [message, setMessage] =
    useState("カードを1枚出してください");

  const [flippingCard, setFlippingCard] =
    useState<RevealedCard | null>(null);

  const myPlayingPlayer =
    playingState?.players.find(
      (player) => player.id === socket.id
    ) ??
    playingState?.players.find(
      (player) => player.name === playerName
    );

  const myPlayerId =
    myPlayingPlayer?.id ?? socket.id;

  const orderedPlayers =
    playingState?.players ?? [];

  const myIndex =
    orderedPlayers.findIndex(
      (player) => player.id === myPlayerId
    );

  const otherPlayingPlayers =
    myIndex === -1
      ? []
      : [
          ...orderedPlayers.slice(myIndex + 1),
          ...orderedPlayers.slice(0, myIndex),
        ];

  const displayHandCards =
    myPlayingPlayer?.handCards ?? handCards;

  const displayPlacedCards =
    myPlayingPlayer?.placedCards ?? placedCards;

  const totalPlacedCardCount =
    playingState?.players.reduce(
      (sum, player) =>
        sum + player.placedCards.length,
      0
    ) ?? placedCards.length;

  const displayPhase =
    playingState?.phase ?? phase;

  const displayMessage =
    playingState?.message ?? message;

  const displayBid =
    playingState?.bid ?? bid;

  const displayRevealedCount =
    playingState?.revealedRoseCount ?? 0;

  const displayMyWinCount =
    myPlayingPlayer?.winCount ?? 0;

  const minBid =
    displayBid + 1;

  const isMyTurn =
    playingState
      ? playingState.currentTurnPlayerId === myPlayerId
      : true;

  const currentTurnPlayer =
    playingState?.players.find(
      (player) =>
        player.id === playingState.currentTurnPlayerId
    );

  const selectedCard =
    displayHandCards.find(
      (card) => card.id === selectedCardId
    );

  useEffect(() => {
    if (timer <= 0) {
      setMessage("時間切れ！");
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (displayPhase !== "placing") {
      setIsChoosingBid(false);
    }
  }, [displayPhase]);

  useEffect(() => {
    const handleRevealStarted = ({
      card,
    }: {
      targetPlayerId: string;
      card: RevealedCard;
    }) => {
      setFlippingCard(card);

      setTimeout(() => {
        setFlippingCard(null);
      }, 4800);
    };

    socket.on(
      "playing_card_reveal_started",
      handleRevealStarted
    );

    return () => {
      socket.off(
        "playing_card_reveal_started",
        handleRevealStarted
      );
    };
  }, [socket]);

  useEffect(() => {
    const handleGameWon = ({
      winnerId,
      winnerName,
    }: {
      winnerId: string;
      winnerName?: string;
    }) => {
      const winner =
        playingState?.players.find(
          (player) => player.id === winnerId
        );

      const fixedWinnerName =
        winnerName ??
        winner?.name ??
        "不明なプレイヤー";

      setMessage(
        `${fixedWinnerName} が優勝しました！`
      );

      setTimeout(() => {
        onGameWon(fixedWinnerName);
      }, 1000);
    };

    socket.on("playing_game_won", handleGameWon);

    return () => {
      socket.off("playing_game_won", handleGameWon);
    };
  }, [socket, playingState?.players, onGameWon]);

  

  const handlePlaceCard = () => {
    if (!selectedCard) return;
    if (displayPhase !== "placing") return;

    if (playingState) {
      if (!isMyTurn) {
        setMessage("今はあなたのターンではありません");
        return;
      }

      socket.emit("playing_place_card", {
        roomId,
        cardId: selectedCard.id,
      });

      setSelectedCardId(null);
      setIsChoosingBid(false);
      return;
    }

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

    setSelectedCardId(null);
    setIsChoosingBid(false);
    setMessage("カードを1枚出しました。宣言できます。");
  };

  const handleStartBidding = () => {
    if (displayPlacedCards.length === 0) {
      setMessage("先にカードを1枚出してください");
      return;
    }

    if (totalPlacedCardCount === 0) {
      setMessage("場にカードがありません");
      return;
    }

    if (playingState && !isMyTurn) {
      setMessage("今はあなたのターンではありません");
      return;
    }

    setBid(minBid);
    setIsChoosingBid(true);
  };

  const handleConfirmBid = () => {
    if (!isChoosingBid) return;

    const fixedBid =
      Math.max(bid, minBid);

    if (fixedBid > 16) {
      setMessage("宣言数は16までです");
      return;
    }

    if (playingState) {
      if (!isMyTurn) {
        setMessage("今はあなたのターンではありません");
        return;
      }

      socket.emit("playing_start_bidding", {
        roomId,
        bid: fixedBid,
      });

      setIsChoosingBid(false);
      return;
    }

    setPhase("bidding");
    setBid(fixedBid);
    setMessage(`あなたが ${fixedBid} 枚で宣言しました。`);
    setIsChoosingBid(false);
  };

  const handlePass = () => {
    if (displayPhase !== "bidding") return;

    if (playingState) {
      if (!isMyTurn) {
        setMessage("今はあなたのターンではありません");
        return;
      }

      socket.emit("playing_pass", {
        roomId,
      });

      return;
    }

    setMessage("パスしました");
  };

  const handleBidDown = () => {
    if (bid <= minBid) return;

    setBid(bid - 1);
  };

  const handleBidUp = () => {
    if (bid >= 16) return;

    setBid(bid + 1);
  };

  const handleRevealMycard = (cardId: string) => {
    if (displayPhase !== "revealing") return;
    if (!isMyTurn) return;
    if (!myPlayingPlayer) return;

    const targetCard =
      displayPlacedCards.find(
        (card) => card.id === cardId
      );

    if (!targetCard) return;
    if (targetCard.revealed) return;

    socket.emit("playing_reveal_card", {
      roomId,
      targetPlayerId: myPlayingPlayer.id,
      cardId,
    });
  };

  const handleRevealOtherCard = (
    playerId: string,
    cardId: string
  ) => {
    if (displayPhase !== "revealing") return;
    if (!isMyTurn) return;

    const targetPlayer =
      otherPlayingPlayers.find(
        (player) => player.id === playerId
      );

    if (!targetPlayer) return;

    const targetCard =
      targetPlayer.placedCards.find(
        (card) => card.id === cardId
      );

    if (!targetCard) return;
    if (targetCard.revealed) return;

    socket.emit("playing_reveal_card", {
      roomId,
      targetPlayerId: playerId,
      cardId,
    });
  };

  

  
  

  

  return (
    <div className="playing-page">
      <main className="playing-board">
        <header className="playing-header">
          <div>Room: {roomId}</div>

          <div>You: {playerName}</div>

          <div>Players: {players.length}</div>

          <div>
            Turn:{" "}
            {isMyTurn
              ? "あなた"
              : currentTurnPlayer?.name ?? "不明"}
          </div>

          <div>Phase: {displayPhase}</div>

          <div>宣言数: {displayBid}</div>

          <div>
            めくったRose: {displayRevealedCount} / {displayBid}
          </div>

          <div>
            勝ち点: {displayMyWinCount} / 2
          </div>

          <div>Timer: {timer}</div>
        </header>

        <div className="playing-message">
          {displayMessage}
        </div>

        {otherPlayingPlayers.map((player, index) => (
          <PlayerArea
            key={player.id}
            position={onlinePlayerPositions[index]}
            name={player.name}
            handCount={player.handCards.length}
            fieldCount={player.placedCards.length}
            winCount={player.winCount}
          />
        ))}

        <section className="my-field">
          <div className="field-info">
            <p>
              伏せカード: {totalPlacedCardCount}
            </p>

            <p>
              宣言数: {isChoosingBid ? bid : displayBid}
            </p>
          </div>

          {isChoosingBid && isMyTurn && (
            <div className="bid-controls">
              <button
                onClick={handleBidDown}
                disabled={bid <= minBid}
              >
                -
              </button>

              <span>{bid}</span>

              <button
                onClick={handleBidUp}
                disabled={bid >= 16}
              >
                +
              </button>

              <button onClick={handleConfirmBid}>
                この枚数で宣言
              </button>
            </div>
          )}

          <div className="table-card-area">
            {otherPlayingPlayers.map(
              (player, playerIndex) => {
                const position =
                  onlinePlayerPositions[playerIndex];

                return (
                  <div
                    key={player.id}
                    className={`bot-card-stack bot-card-stack--${position}`}
                  >
                    {player.placedCards.map(
                      (card, cardIndex) => {
                        const topUnrevealedIndex =
                          player.placedCards
                            .map((c) => c.revealed)
                            .lastIndexOf(false);

                        const canReveal =
                          cardIndex ===
                          topUnrevealedIndex;

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
                              handleRevealOtherCard(
                                player.id,
                                card.id
                              )
                            }
                            disabled={
                              displayPhase !==
                                "revealing" ||
                              !isMyTurn ||
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
                      }
                    )}
                  </div>
                );
              }
            )}

            <div className="my-card-stack">
              {displayPlacedCards.map((card, index) => {
                const topUnrevealedIndex =
                  displayPlacedCards
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
                      displayPhase !== "revealing" ||
                      !isMyTurn ||
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
          </div>
        </section>

        <HandArea
          handCards={displayHandCards}
          selectedCardId={selectedCardId}
          onSelectCard={setSelectedCardId}
        />

        <ActionButtons
          phase={displayPhase}
          selectedCardId={selectedCardId}
          isMyTurn={isMyTurn}
          onPlaceCard={handlePlaceCard}
          onStartBidding={handleStartBidding}
          onPass={handlePass}
          onBackToLobby={onBackToLobby}
        />

        <div className="dev-buttons">
          <button onClick={onGoToResult}>
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