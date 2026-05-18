const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ロビー用
const rooms = {};

// プレイ画面用
const playingStates = {};

// 成功・失敗後に場を残す時間
const ROUND_RESULT_DELAY_MS = 5000;

const createInitialHand = (playerId) => [
  {
    id: `${playerId}-rose-1`,
    type: "rose",
    label: "Rose",
  },
  {
    id: `${playerId}-rose-2`,
    type: "rose",
    label: "Rose",
  },
  {
    id: `${playerId}-skull-1`,
    type: "skull",
    label: "Skull",
  },
  {
    id: `${playerId}-double-1`,
    type: "doubleRose",
    label: "W-Rose",
  },
];

const getRevealPoint = (card) => {
  if (card.type === "doubleRose") {
    return 2;
  }

  if (card.type === "rose") {
    return 1;
  }

  return 0;
};

const moveToNextTurn = (state) => {
  const currentIndex = state.turnOrder.indexOf(
    state.currentTurnPlayerId
  );

  if (currentIndex === -1) {
    const firstPlayer = state.players.find((player) => {
      if (state.phase === "placing") {
        return (
          player.handCards.length > 0 ||
          player.placedCards.length > 0
        );
      }

      if (state.phase === "bidding") {
        return !player.passed;
      }

      return true;
    });

    if (firstPlayer) {
      state.currentTurnPlayerId = firstPlayer.id;
      state.message = `${firstPlayer.name} のターンです`;
    }

    return;
  }

  for (let i = 1; i <= state.turnOrder.length; i++) {
    const nextIndex =
      (currentIndex + i) % state.turnOrder.length;

    const nextPlayerId = state.turnOrder[nextIndex];

    const nextPlayer = state.players.find(
      (player) => player.id === nextPlayerId
    );

    if (!nextPlayer) {
      continue;
    }

    if (state.phase === "placing") {
      const canPlaceCard =
        nextPlayer.handCards.length > 0;

      const canStartBidding =
        nextPlayer.placedCards.length > 0;

      if (!canPlaceCard && !canStartBidding) {
        continue;
      }
    }

    if (state.phase === "bidding" && nextPlayer.passed) {
      continue;
    }

    state.currentTurnPlayerId = nextPlayer.id;
    state.message = `${nextPlayer.name} のターンです`;
    return;
  }
};

const getNextPlayerAfter = (state, playerId) => {
  const currentIndex = state.turnOrder.indexOf(playerId);

  if (currentIndex === -1) {
    return state.players[0] ?? null;
  }

  for (let i = 1; i <= state.turnOrder.length; i++) {
    const nextIndex =
      (currentIndex + i) % state.turnOrder.length;

    const nextPlayerId = state.turnOrder[nextIndex];

    const nextPlayer = state.players.find(
      (player) => player.id === nextPlayerId
    );

    if (nextPlayer) {
      return nextPlayer;
    }
  }

  return null;
};

const hasEveryPlayerUsedAllCards = (state) => {
  return state.players.every(
    (player) => player.handCards.length === 0
  );
};

const startBiddingBecauseAllCardsPlaced = (
  state,
  nextBidder
) => {
  state.phase = "bidding";
  state.bid = 0;
  state.highestBidderId = null;
  state.revealedRoseCount = 0;

  state.players = state.players.map((player) => ({
    ...player,
    passed: false,
  }));

  state.currentTurnPlayerId = nextBidder.id;

  state.message =
    `全員がカードを出し切りました。` +
    `${nextBidder.name} から宣言してください。`;
};

const removeRandomCardFromPlayer = (player) => {
  const allCards = [
    ...player.handCards.map((card) => ({
      ...card,
      from: "hand",
    })),
    ...player.placedCards.map((card) => ({
      id: card.id,
      type: card.type,
      label: card.label,
      from: "placed",
    })),
  ];

  if (allCards.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(
    Math.random() * allCards.length
  );

  const lostCard = allCards[randomIndex];

  if (lostCard.from === "hand") {
    player.handCards = player.handCards.filter(
      (card) => card.id !== lostCard.id
    );
  } else {
    player.placedCards = player.placedCards.filter(
      (card) => card.id !== lostCard.id
    );
  }

  return lostCard;
};

const returnPlacedCardsToHands = (state) => {
  state.players = state.players.map((player) => {
    const returnedCards = player.placedCards.map((card) => ({
      id: card.id,
      type: card.type,
      label: card.label,
    }));

    return {
      ...player,
      handCards: [
        ...player.handCards,
        ...returnedCards,
      ],
      placedCards: [],
      passed: false,
    };
  });
};

const chooseNextRoundStarter = (state, preferredPlayerId) => {
  const preferredPlayer = state.players.find(
    (player) =>
      player.id === preferredPlayerId &&
      player.handCards.length > 0
  );

  if (preferredPlayer) {
    state.currentTurnPlayerId = preferredPlayer.id;
    return;
  }

  const firstAvailablePlayer = state.players.find(
    (player) => player.handCards.length > 0
  );

  if (firstAvailablePlayer) {
    state.currentTurnPlayerId = firstAvailablePlayer.id;
  }
};

const resetRoundAfterSuccess = (state, winnerPlayer) => {
  returnPlacedCardsToHands(state);

  state.phase = "placing";
  state.bid = 0;
  state.highestBidderId = null;
  state.revealedRoseCount = 0;

  chooseNextRoundStarter(state, winnerPlayer.id);

  const nextPlayer = state.players.find(
    (player) => player.id === state.currentTurnPlayerId
  );

  state.message = nextPlayer
    ? `${nextPlayer.name} のターンです`
    : "次のラウンドです";
};

const resetRoundAfterFailure = (
  state,
  failedPlayer,
  lostCard
) => {
  returnPlacedCardsToHands(state);

  state.phase = "placing";
  state.bid = 0;
  state.highestBidderId = null;
  state.revealedRoseCount = 0;

  chooseNextRoundStarter(state, failedPlayer.id);

  const nextPlayer = state.players.find(
    (player) => player.id === state.currentTurnPlayerId
  );

  state.message = nextPlayer
    ? `${nextPlayer.name} のターンです`
    : "次のラウンドです";
};

const handleBidSuccess = (roomId, state, challenger) => {
  challenger.winCount += 1;

  state.phase = "result";

  if (challenger.winCount >= 2) {
    state.message =
      `${challenger.name} が勝ち点2に到達して優勝しました！`;

    io.to(roomId).emit("playing_state", state);

    setTimeout(() => {
      io.to(roomId).emit("playing_game_won", {
        winnerId: challenger.id,
        winnerName: challenger.name,
      });
    }, ROUND_RESULT_DELAY_MS);

    return;
  }

  state.message =
    `${challenger.name} が宣言成功しました。`;

  io.to(roomId).emit("playing_state", state);

  setTimeout(() => {
    const latestState = playingStates[roomId];

    if (!latestState) return;
    if (latestState.phase !== "result") return;

    const latestChallenger =
      latestState.players.find(
        (player) => player.id === challenger.id
      );

    if (!latestChallenger) return;

    resetRoundAfterSuccess(
      latestState,
      latestChallenger
    );

    io.to(roomId).emit("playing_state", latestState);
  }, ROUND_RESULT_DELAY_MS);
};

const handleBidFailure = (roomId, state, challenger) => {
  state.phase = "result";
  state.message =
    `${challenger.name} が宣言失敗しました。`;

  io.to(roomId).emit("playing_state", state);

  setTimeout(() => {
    const latestState = playingStates[roomId];

    if (!latestState) return;
    if (latestState.phase !== "result") return;

    const latestChallenger =
      latestState.players.find(
        (player) => player.id === challenger.id
      );

    if (!latestChallenger) return;

    const lostCard =
      removeRandomCardFromPlayer(latestChallenger);

    resetRoundAfterFailure(
      latestState,
      latestChallenger,
      lostCard
    );

    io.to(roomId).emit("playing_state", latestState);
  }, ROUND_RESULT_DELAY_MS);
};

const areAllPlacedCardsRevealed = (state) => {
  return state.players.every((player) =>
    player.placedCards.every((card) => card.revealed)
  );
};

const startRevealPhase = (roomId, state, revealer) => {
  state.phase = "revealing";
  state.currentTurnPlayerId = revealer.id;

  const ownCardsToReveal = revealer.placedCards.filter(
    (card) => !card.revealed
  );

  revealer.placedCards = revealer.placedCards.map((card) => ({
    ...card,
    revealed: true,
    isFlipping: false,
  }));

  const hasSkull = ownCardsToReveal.some(
    (card) => card.type === "skull"
  );

  if (hasSkull) {
    handleBidFailure(roomId, state, revealer);
    return;
  }

  const ownRoseCount = ownCardsToReveal.reduce(
    (sum, card) => sum + getRevealPoint(card),
    0
  );

  state.revealedRoseCount = ownRoseCount;

  if (state.revealedRoseCount >= state.bid) {
    handleBidSuccess(roomId, state, revealer);
    return;
  }

  if (areAllPlacedCardsRevealed(state)) {
    handleBidFailure(roomId, state, revealer);
    return;
  }

  state.message =
    `${revealer.name} の場のカードを表にしました。` +
    `${state.revealedRoseCount} / ${state.bid} Roseです。` +
    `続けて他のカードをめくってください`;

  io.to(roomId).emit("playing_state", state);
};

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("join_room", ({ roomId, playerName }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    const alreadyJoined = rooms[roomId].some(
      (player) => player.id === socket.id
    );

    if (alreadyJoined) {
      return;
    }

    const newPlayer = {
      id: socket.id,
      name: playerName,
      isHost: rooms[roomId].length === 0,
      isReady: false,
      frameColor:
        ["blue", "green", "purple", "red"][
          rooms[roomId].length
        ] || "blue",
    };

    rooms[roomId].push(newPlayer);

    io.to(roomId).emit("update_players", rooms[roomId]);

    console.log(`${playerName} joined room: ${roomId}`);
  });

  socket.on("toggle_ready", ({ roomId }) => {
    console.log("toggle_ready received:", socket.id);

    if (!rooms[roomId]) {
      return;
    }

    rooms[roomId] = rooms[roomId].map((player) =>
      player.id === socket.id
        ? {
            ...player,
            isReady: !player.isReady,
          }
        : player
    );

    io.to(roomId).emit("update_players", rooms[roomId]);
  });

  socket.on("start_game", ({ roomId }) => {
    console.log("start_game received for:", roomId);

    const roomPlayers = rooms[roomId];

    if (!roomPlayers) {
      console.log("room not found:", roomId);
      return;
    }

    if (roomPlayers.length < 2) {
      console.log("not enough players");
      return;
    }

    playingStates[roomId] = {
      phase: "placing",
      message: `${roomPlayers[0].name} のターンです`,
      currentTurnPlayerId: roomPlayers[0].id,
      turnOrder: roomPlayers.map((player) => player.id),
      bid: 0,
      highestBidderId: null,
      revealedRoseCount: 0,
      players: roomPlayers.map((player) => ({
        id: player.id,
        name: player.name,
        handCards: createInitialHand(player.id),
        placedCards: [],
        winCount: 0,
        passed: false,
      })),
    };

    io.to(roomId).emit("game_started");

    io.to(roomId).emit(
      "playing_state",
      playingStates[roomId]
    );

    console.log(
      "playing state created:",
      playingStates[roomId]
    );
  });

  socket.on("playing_place_card", ({ roomId, cardId }) => {
    console.log("playing_place_card received:", {
      roomId,
      cardId,
      socketId: socket.id,
    });

    const state = playingStates[roomId];

    if (!state) {
      console.log("playing state not found:", roomId);
      return;
    }

    if (state.phase !== "placing") {
      console.log("not placing phase:", state.phase);
      return;
    }

    if (state.currentTurnPlayerId !== socket.id) {
      console.log("not your turn:", socket.id);
      return;
    }

    const player = state.players.find(
      (player) => player.id === socket.id
    );

    if (!player) {
      console.log("player not found:", socket.id);
      return;
    }

    const selectedCard = player.handCards.find(
      (card) => card.id === cardId
    );

    if (!selectedCard) {
      console.log("card not found:", cardId);
      return;
    }

    player.handCards = player.handCards.filter(
      (card) => card.id !== cardId
    );

    player.placedCards.push({
      ...selectedCard,
      revealed: false,
      isFlipping: false,
    });

    console.log(
      `${player.name} hand: ${player.handCards.length}, field: ${player.placedCards.length}`
    );

    const nextPlayer = getNextPlayerAfter(state, socket.id);

    if (hasEveryPlayerUsedAllCards(state) && nextPlayer) {
      startBiddingBecauseAllCardsPlaced(state, nextPlayer);

      io.to(roomId).emit("playing_state", state);
      return;
    }

    moveToNextTurn(state);

    io.to(roomId).emit("playing_state", state);
  });

  socket.on("playing_start_bidding", ({ roomId, bid }) => {
    console.log("playing_start_bidding received:", {
      roomId,
      bid,
      socketId: socket.id,
    });

    const state = playingStates[roomId];

    if (!state) {
      console.log("playing state not found:", roomId);
      return;
    }

    if (state.currentTurnPlayerId !== socket.id) {
      console.log("not your turn:", socket.id);
      return;
    }

    const player = state.players.find(
      (player) => player.id === socket.id
    );

    if (!player) {
      console.log("player not found:", socket.id);
      return;
    }

    if (player.placedCards.length === 0) {
      console.log("no placed cards");
      return;
    }

    const nextBid = Number(bid);

    if (!Number.isFinite(nextBid)) {
      console.log("invalid bid:", bid);
      return;
    }

    if (nextBid <= state.bid) {
      console.log("bid must be larger than current bid:", {
        nextBid,
        currentBid: state.bid,
      });
      return;
    }

    if (nextBid > 16) {
      console.log("bid is larger than 16:", nextBid);

      state.message = "宣言数は16までです";

      io.to(roomId).emit("playing_state", state);
      return;
    }

    state.phase = "bidding";
    state.bid = nextBid;
    state.highestBidderId = socket.id;
    state.revealedRoseCount = 0;

    state.players = state.players.map((p) => ({
      ...p,
      passed: false,
    }));

    state.message =
      `${player.name} が ${nextBid} 枚で宣言しました`;

    if (nextBid === 16) {
      startRevealPhase(roomId, state, player);
      return;
    }

    moveToNextTurn(state);

    io.to(roomId).emit("playing_state", state);
  });

  socket.on("playing_pass", ({ roomId }) => {
    console.log("playing_pass received:", {
      roomId,
      socketId: socket.id,
    });

    const state = playingStates[roomId];

    if (!state) {
      console.log("playing state not found:", roomId);
      return;
    }

    if (state.phase !== "bidding") {
      console.log("not bidding phase:", state.phase);
      return;
    }

    if (!state.highestBidderId) {
      console.log("cannot pass before first bid");

      state.message =
        "まだ宣言されていません。先に宣言してください。";

      io.to(roomId).emit("playing_state", state);
      return;
    }

    if (state.currentTurnPlayerId !== socket.id) {
      console.log("not your turn:", socket.id);
      return;
    }

    const player = state.players.find(
      (player) => player.id === socket.id
    );

    if (!player) {
      console.log("player not found:", socket.id);
      return;
    }

    player.passed = true;

    state.message = `${player.name} がパスしました`;

    const activePlayers = state.players.filter(
      (p) => !p.passed
    );

    if (activePlayers.length === 1) {
      const revealerId =
        state.highestBidderId ?? activePlayers[0].id;

      const revealer = state.players.find(
        (player) => player.id === revealerId
      );

      if (!revealer) {
        io.to(roomId).emit("playing_state", state);
        return;
      }

      startRevealPhase(roomId, state, revealer);
      return;
    }

    moveToNextTurn(state);

    io.to(roomId).emit("playing_state", state);
  });

  socket.on(
    "playing_reveal_card",
    ({ roomId, targetPlayerId, cardId }) => {
      console.log("playing_reveal_card received:", {
        roomId,
        targetPlayerId,
        cardId,
        socketId: socket.id,
      });

      const state = playingStates[roomId];

      if (!state) {
        console.log("playing state not found:", roomId);
        return;
      }

      if (state.phase !== "revealing") {
        console.log("not revealing phase:", state.phase);
        return;
      }

      if (state.currentTurnPlayerId !== socket.id) {
        console.log("not your turn:", socket.id);
        return;
      }

      const challenger = state.players.find(
        (player) => player.id === state.currentTurnPlayerId
      );

      if (!challenger) {
        console.log("challenger not found:", socket.id);
        return;
      }

      const targetPlayer = state.players.find(
        (player) => player.id === targetPlayerId
      );

      if (!targetPlayer) {
        console.log(
          "target player not found:",
          targetPlayerId
        );
        return;
      }

      const targetCard = targetPlayer.placedCards.find(
        (card) => card.id === cardId
      );

      if (!targetCard) {
        console.log("target card not found:", cardId);
        return;
      }

      if (targetCard.revealed) {
        console.log("card already revealed:", cardId);
        return;
      }

      io.to(roomId).emit("playing_card_reveal_started", {
        targetPlayerId,
        card: {
          ...targetCard,
        },
      });

      setTimeout(() => {
        const latestState = playingStates[roomId];

        if (!latestState) return;

        if (latestState.phase !== "revealing") return;

        const latestChallenger = latestState.players.find(
          (player) =>
            player.id === latestState.currentTurnPlayerId
        );

        if (!latestChallenger) return;

        const latestTargetPlayer =
          latestState.players.find(
            (player) => player.id === targetPlayerId
          );

        if (!latestTargetPlayer) return;

        const latestTargetCard =
          latestTargetPlayer.placedCards.find(
            (card) => card.id === cardId
          );

        if (!latestTargetCard) return;

        if (latestTargetCard.revealed) return;

        latestTargetCard.revealed = true;
        latestTargetCard.isFlipping = false;

        if (latestTargetCard.type === "skull") {
          handleBidFailure(
            roomId,
            latestState,
            latestChallenger
          );
          return;
        }

        latestState.revealedRoseCount +=
          getRevealPoint(latestTargetCard);

        if (
          latestState.revealedRoseCount >= latestState.bid
        ) {
          handleBidSuccess(
            roomId,
            latestState,
            latestChallenger
          );
          return;
        }

        if (areAllPlacedCardsRevealed(latestState)) {
          handleBidFailure(
            roomId,
            latestState,
            latestChallenger
          );
          return;
        }

        latestState.message =
          `${latestTargetPlayer.name} のカードがめくられました。` +
          `${latestState.revealedRoseCount} / ${latestState.bid} Roseです。`;

        io.to(roomId).emit("playing_state", latestState);
      }, 3400);
    }
  );

  socket.on("disconnect", () => {
    console.log("disconnected:", socket.id);

    for (const roomId in rooms) {
      const beforeLength = rooms[roomId].length;

      rooms[roomId] = rooms[roomId].filter(
        (player) => player.id !== socket.id
      );

      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
        delete playingStates[roomId];
        continue;
      }

      const hasHost = rooms[roomId].some(
        (player) => player.isHost
      );

      if (!hasHost) {
        rooms[roomId][0].isHost = true;
      }

      if (rooms[roomId].length !== beforeLength) {
        io.to(roomId).emit(
          "update_players",
          rooms[roomId]
        );
      }

      if (playingStates[roomId]) {
        const state = playingStates[roomId];

        state.players = state.players.filter(
          (player) => player.id !== socket.id
        );

        state.turnOrder = state.turnOrder.filter(
          (playerId) => playerId !== socket.id
        );

        if (state.currentTurnPlayerId === socket.id) {
          const firstPlayer = state.players.find(
            (player) => player.handCards.length > 0
          );

          if (firstPlayer) {
            state.currentTurnPlayerId = firstPlayer.id;
            state.message = `${firstPlayer.name} のターンです`;
          }
        }

        io.to(roomId).emit("playing_state", state);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`server running on port ${PORT}`);
});