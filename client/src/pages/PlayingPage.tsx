import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { ActionButtons } from "../components/ActionButtons";
import { PlayerArea } from "../components/PlayerArea";
import { VolumeControl } from "../components/VolumeControl";
import { useSound } from "../components/SoundProvider";

import cardRoseBlueImage from "../assets/card_rose_blue.webp";
import cardSkullBlueImage from "../assets/card_skull_blue.webp";
import cardDoubleRoseBlueImage from "../assets/card_Wrose_blue.webp";
import cardBackBlueImage from "../assets/card_back_blue.webp";

import cardRoseRedImage from "../assets/card_rose_red.webp";
import cardSkullRedImage from "../assets/card_skull_red.webp";
import cardDoubleRoseRedImage from "../assets/card_Wrose_red.webp";
import cardBackRedImage from "../assets/card_back_red.webp";

import cardRoseGreenImage from "../assets/card_rose_green.webp";
import cardSkullGreenImage from "../assets/card_skull_green.webp";
import cardDoubleRoseGreenImage from "../assets/card_Wrose_green.webp";
import cardBackGreenImage from "../assets/card_back_green.webp";

import cardRosePurpleImage from "../assets/card_rose_purple.webp";
import cardSkullPurpleImage from "../assets/card_skull_purple.webp";
import cardDoubleRosePurpleImage from "../assets/card_Wrose_purple.webp";
import cardBackPurpleImage from "../assets/card_back_purple.webp";

import skullIconBlueNoEyeImage from "../assets/skull_icon_blue_no_eye.webp";
import skullIconBlueSingleEyeImage from "../assets/skull_icon_blue_single_eye.webp";
import skullIconBlueDoubleEyeImage from "../assets/skull_icon_blue_double_eye.webp";

import skullIconRedNoEyeImage from "../assets/skull_icon_red_no_eye.webp";
import skullIconRedSingleEyeImage from "../assets/skull_icon_red_single_eye.webp";
import skullIconRedDoubleEyeImage from "../assets/skull_icon_red_double_eye.webp";

import skullIconGreenNoEyeImage from "../assets/skull_icon_green_no_eye.webp";
import skullIconGreenSingleEyeImage from "../assets/skull_icon_green_single_eye.webp";
import skullIconGreenDoubleEyeImage from "../assets/skull_icon_green_double_eye.webp";

import skullIconPurpleNoEyeImage from "../assets/skull_icon_purple_no_eye.webp";
import skullIconPurpleSingleEyeImage from "../assets/skull_icon_purple_single_eye.webp";
import skullIconPurpleDoubleEyeImage from "../assets/skull_icon_purple_double_eye.webp";

import playingMatImage from "../assets/playing_mat.webp";
import backgroundImage from "../assets/background.webp";

import "../styles/PlayingPage.css";

type CardColor =
  | "blue"
  | "green"
  | "purple"
  | "red";

type SkullEyeState =
  | "noEye"
  | "singleEye"
  | "doubleEye";

type OnlinePlayer = {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  frameColor: CardColor;
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
  onGameWon: (
    winnerName: string,
    winnerColor: CardColor
  ) => void;
};

const onlinePlayerPositions: Array<"top" | "left" | "right"> = [
  "left",
  "top",
  "right",
];

const cardImages: Record<
  CardColor,
  Record<CardType | "back", string>
> = {
  blue: {
    rose: cardRoseBlueImage,
    skull: cardSkullBlueImage,
    doubleRose: cardDoubleRoseBlueImage,
    back: cardBackBlueImage,
  },
  red: {
    rose: cardRoseRedImage,
    skull: cardSkullRedImage,
    doubleRose: cardDoubleRoseRedImage,
    back: cardBackRedImage,
  },
  green: {
    rose: cardRoseGreenImage,
    skull: cardSkullGreenImage,
    doubleRose: cardDoubleRoseGreenImage,
    back: cardBackGreenImage,
  },
  purple: {
    rose: cardRosePurpleImage,
    skull: cardSkullPurpleImage,
    doubleRose: cardDoubleRosePurpleImage,
    back: cardBackPurpleImage,
  },
};

const skullIconImages: Record<
  CardColor,
  Record<SkullEyeState, string>
> = {
  blue: {
    noEye: skullIconBlueNoEyeImage,
    singleEye: skullIconBlueSingleEyeImage,
    doubleEye: skullIconBlueDoubleEyeImage,
  },
  red: {
    noEye: skullIconRedNoEyeImage,
    singleEye: skullIconRedSingleEyeImage,
    doubleEye: skullIconRedDoubleEyeImage,
  },
  green: {
    noEye: skullIconGreenNoEyeImage,
    singleEye: skullIconGreenSingleEyeImage,
    doubleEye: skullIconGreenDoubleEyeImage,
  },
  purple: {
    noEye: skullIconPurpleNoEyeImage,
    singleEye: skullIconPurpleSingleEyeImage,
    doubleEye: skullIconPurpleDoubleEyeImage,
  },
};

const getSkullEyeState = (
  winCount: number
): SkullEyeState => {
  if (winCount >= 2) return "doubleEye";
  if (winCount >= 1) return "singleEye";

  return "noEye";
};

const getSkullIconImage = (
  color: CardColor,
  winCount: number
) => {
  return skullIconImages[color][getSkullEyeState(winCount)];
};

const getCardImage = (
  cardType: CardType,
  color: CardColor
) => {
  return cardImages[color][cardType];
};

const getCardBackImage = (
  color: CardColor
) => {
  return cardImages[color].back;
};

export function PlayingPage({
  socket,
  roomId,
  playerName,
  players,
  playingState,
  onBackToLobby,
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

  const {
    volume,
    setVolume,
    isMuted,
    setIsMuted,
  } = useSound();

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

  const [, setMessage] =
    useState("カードを1枚出してください");

  const [flippingCard, setFlippingCard] =
    useState<RevealedCard | null>(null);

  const [flippingCardColor, setFlippingCardColor] =
    useState<CardColor>("blue");

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

  const displayBid =
    playingState?.bid ?? bid;

  const displayMyWinCount =
    myPlayingPlayer?.winCount ?? 0;

  const minBid =
    displayBid + 1;

  const isMyTurn =
    playingState
      ? playingState.currentTurnPlayerId === myPlayerId
      : true;

  const selectedCard =
    displayHandCards.find(
      (card) => card.id === selectedCardId
    );

  const getPlayerColor = (
    playerId?: string,
    name?: string
  ): CardColor => {
    const onlinePlayer =
      players.find((player) => player.id === playerId) ??
      players.find((player) => player.name === name);

    return onlinePlayer?.frameColor ?? "blue";
  };

  const myCardColor =
    getPlayerColor(myPlayerId, playerName);

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
      targetPlayerId,
      card,
    }: {
      targetPlayerId: string;
      card: RevealedCard;
    }) => {
      const targetPlayer =
        players.find(
          (player) => player.id === targetPlayerId
        );

      setFlippingCardColor(
        targetPlayer?.frameColor ?? "blue"
      );

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
  }, [socket, players]);

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

      const fixedWinnerColor =
        players.find(
          (player) => player.id === winnerId
        )?.frameColor ?? "blue";
      
      setTimeout(() => {
        onGameWon(
          fixedWinnerName,
          fixedWinnerColor
        );
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
        <img
          src={backgroundImage}
          alt="background"
          className="playing-background-image"
        />

        <div className="field-info field-info--screen">
          <p>
            伏せカード: {totalPlacedCardCount}
          </p>

          <p>
            宣言数: {isChoosingBid ? bid : displayBid}
          </p>
        </div>

        {otherPlayingPlayers.map((player, index) => {
          const position =
            onlinePlayerPositions[index];

          return (
            <PlayerArea
              key={player.id}
              position={position}
              name={player.name}
              handCount={player.handCards.length}
              fieldCount={player.placedCards.length}
              winCount={player.winCount}
              isCurrentTurn={
                playingState?.currentTurnPlayerId === player.id
              }
            />
          );
        })}

        <section className="my-field">
          <img
            src={playingMatImage}
            alt="playing mat"
            className="playing-mat-image"
          />

          <div className="mat-skull-icon-layer">
            {otherPlayingPlayers.map((player, index) => {
              const position =
                onlinePlayerPositions[index];

              const playerColor =
                getPlayerColor(player.id, player.name);

              return (
                <img
                  key={`mat-skull-icon-${player.id}`}
                  src={getSkullIconImage(
                    playerColor,
                    player.winCount
                  )}
                  alt={`${player.name}の勝利アイコン`}
                  className={`mat-skull-icon mat-skull-icon--${position}`}
                />
              );
            })}

            <img
              src={getSkullIconImage(
                myCardColor,
                displayMyWinCount
              )}
              alt="自分の勝利アイコン"
              className="mat-skull-icon mat-skull-icon--bottom"
            />
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

                const playerColor =
                  getPlayerColor(
                    player.id,
                    player.name
                  );

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
                            <img
                              src={
                                card.revealed
                                  ? getCardImage(
                                      card.type,
                                      playerColor
                                    )
                                  : getCardBackImage(
                                      playerColor
                                    )
                              }
                              alt={
                                card.revealed
                                  ? card.label
                                  : "裏"
                              }
                              className="placed-card-image"
                            />
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
                    <img
                      src={
                        card.revealed
                          ? getCardImage(
                              card.type,
                              myCardColor
                            )
                          : getCardBackImage(
                              myCardColor
                            )
                      }
                      alt={
                        card.revealed
                          ? card.label
                          : "裏"
                      }
                      className="placed-card-image"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="hand-area">
          {displayHandCards.map((card) => (
            <button
              key={card.id}
              className={`card-button ${
                selectedCardId === card.id
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setSelectedCardId(card.id)
              }
              disabled={
                displayPhase !== "placing" ||
                !isMyTurn
              }
            >
              <img
                src={getCardImage(
                  card.type,
                  myCardColor
                )}
                alt={card.label}
                className="card-image"
              />
            </button>
          ))}
        </section>

        <ActionButtons
          phase={displayPhase}
          selectedCardId={selectedCardId}
          isMyTurn={isMyTurn}
          onPlaceCard={handlePlaceCard}
          onStartBidding={handleStartBidding}
          onPass={handlePass}
          onBackToLobby={onBackToLobby}
        />

        {flippingCard && (
          <div className="flip-overlay">
            <div className="flip-card">
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <img
                    src={getCardBackImage(flippingCardColor)}
                    alt="裏"
                    className="flip-card-image"
                  />
                </div>

                <div className="flip-card-back">
                  <img
                    src={getCardImage(
                      flippingCard.type,
                      flippingCardColor
                    )}
                    alt={flippingCard.label}
                    className="flip-card-image"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="playing-volume-control">
          <VolumeControl
            volume={volume}
            setVolume={setVolume}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />
        </div>
      </main>
    </div>
  );
}