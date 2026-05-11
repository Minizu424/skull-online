import { useState } from "react";
import { Button } from "../components/Button";
import "../styles/LobbyPage.css";
import { VolumeControl } from "../components/VolumeControl";
type Player = {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
};

type LobbyPageProps = {
  roomId:string;
  playerName: string;
  onBackToTitle: () => void;
  onStartGame: () => void;
};

export function LobbyPage({
  roomId,
  playerName,
  onBackToTitle,
  onStartGame,
}: LobbyPageProps) {
  const [copied, setCopied] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([
    {
      id: "1",
      name: playerName,
      isHost: true,
      isReady: false,
    },
  ]);

  // ダミー入室
  const addDummyPlayer = () => {
    if (players.length >= 4) return;

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: `Player${players.length + 1}`,
      isHost: false,
      isReady: false,
    };

    setPlayers([...players, newPlayer]);
  };

  // ダミー退出
  const removeDummyPlayer = () => {
    if (players.length <= 1) return;

    setPlayers(players.slice(0, -1));
  };

  // Ready切り替え
  const toggleReady = () => {
    const updatedPlayers = players.map((player, index) => {
      if (index === 0) {
        return {
          ...player,
          isReady: !player.isReady,
        };
      }

      return player;
    });

    setPlayers(updatedPlayers);
  };
  const setAllReady = () => {
    const updatedPlayers = players.map((player) => {
      return {
        ...player,
        isReady: true,
      };
    });

    setPlayers(updatedPlayers);
  };
  const setAllNotReady = () => {
  const updatedPlayers = players.map((player) => {
    return {
      ...player,
      isReady: false,
    };
  });

  setPlayers(updatedPlayers);
};
const copyRoomId = async () => {
  await navigator.clipboard.writeText(roomId);

  setCopied(true);

  setTimeout(() => {
    setCopied(false);
  }, 2000);
};
  // 全員Ready判定
  const allReady =
    players.length >= 3 &&
    players.every((player) => player.isReady);

  return (
    <div className="lobby-page">

      {/* 上部 */}
      <div className="lobby-header">
        <div className="room-id-area">
          <h2>Room ID : {roomId}</h2>

          <Button onClick={copyRoomId}>
              Copy
          </Button>

          {copied && (
            <span className="copied-text">
             Copied!
            </span>
          )}
        </div>
        <h2>{players.length} / 4 Players</h2>
      </div>

      {/* プレイヤーカード */}
      <div className="player-list">
        {[0, 1, 2, 3].map((slot) => {
          const player = players[slot];

          return (
            <div
              key={slot}
              className={
                player
                  ? player.isReady
                    ? "player-card ready"
                    : "player-card"
                  : "player-card empty"
              }
            >
              {player ? (
                <>
                  <h3>
                    {player.isHost && "👑 "}
                    {player.name}
                  </h3>

                  <p>
                    {player.isReady
                      ? "READY"
                      : "Not Ready"}
                  </p>
                </>
              ) : (
                <h3>Waiting...</h3>
              )}
            </div>
          );
        })}
      </div>

      {/* メインボタン */}
      <div className="button-row">
        <Button onClick={onBackToTitle}>
          退室
        </Button>
        <Button onClick={setAllReady}>
          全員Ready
        </Button>
        <Button onClick={setAllNotReady}>
          全員NotReady
        </Button>
        <Button onClick={toggleReady}>
          Ready切り替え
        </Button>

        <Button
          onClick={onStartGame}
          disabled={!allReady}
        >
          ゲーム開始
        </Button>
      </div>

      {/* 開発用 */}
      <div className="button-row">
        <Button onClick={addDummyPlayer}>
          ダミー入室
        </Button>

        <Button onClick={removeDummyPlayer}>
          ダミー退出
        </Button>
      </div>
      <div className="volume-control-area">
        <VolumeControl
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />
      </div>
    </div>
  );
}