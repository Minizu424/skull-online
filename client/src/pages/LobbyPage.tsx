import { useState } from "react";
import { Button } from "../components/Button";
import "../styles/LobbyPage.css";
import { VolumeControl } from "../components/VolumeControl";

type Player = {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  frameColor: "blue" | "green" | "purple" | "red";
};

type LobbyPageProps = {
  roomId: string;
  playerName: string;
  players: Player[];
  onBackToTitle: () => void;
  onToggleReady: () => void;
  onStartGame: () => void;
};

export function LobbyPage({
  roomId,
  playerName,
  players,
  onBackToTitle,
  onToggleReady,
  onStartGame,
}: LobbyPageProps) {
  const [copied, setCopied] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  // コピー機能（セキュリティ制限回避版）
  const copyRoomId = () => {
    const textToCopy = roomId;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // 古いブラウザや非HTTPS環境用のフォールバック
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('コピーに失敗しました', err);
      }
      document.body.removeChild(textArea);
    }
  };

  // 自分のプレイヤー情報を取得
  const me = players.find((p) => p.name === playerName);
  const isMeHost = me?.isHost;

  // ゲーム開始条件：2人以上いて、全員（ホスト含む）がReady状態
  const allReady =
  (players.length === 3 || players.length === 4) &&
    players.every((player) => player.isReady || player.isHost);

  return (
    <div className="lobby-page">
      <div className="lobby-header">
        <div className="room-id-area">
          <h2>Room ID : {roomId}</h2>
          <Button onClick={copyRoomId}>Copy</Button>
          {copied && <span className="copied-text">Copied!</span>}
        </div>
        <h2>{players.length} / 4 Players</h2>
      </div>

      <main className="lobby-main">
        <div className="player-list">
          {[0, 1, 2, 3].map((slot) => {
            const player = players[slot];
            const isMe = player && player.name === playerName;

            return (
              <div
                key={player ? player.id : `empty-${slot}`}
                className={
                  player
                    ? `player-card player-card--filled player-card--${player.frameColor} ${
                        player.isReady ? "ready" : ""
                      }`
                    : "player-card player-card--empty"
                }
              >
                {player ? (
                  <div className="player-card__inner">
                    <h3>
                      {player.isHost && "👑 "}
                      {player.name}
                      {isMe && <span style={{ fontSize: "0.5em", opacity: 0.6 }}> (あなた)</span>}
                    </h3>
                    <p>{player.isReady ? "READY" : "Not Ready"}</p>
                  </div>
                ) : (
                  <div className="player-card__empty-inner">
                    <h3>Waiting...</h3>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="button-row">
          <Button onClick={onBackToTitle}>退室</Button>

          {/* 全員がReadyを切り替えられる */}
          <Button onClick={onToggleReady}>
            {me?.isReady ? "Ready解除" : "Ready!"}
          </Button>

          {/* ホストだけに「ゲーム開始」ボタンを表示 */}
          {isMeHost && (
            <Button onClick={onStartGame} disabled={!allReady}>
              ゲーム開始
            </Button>
          )}
        </div>
      </main>

      <div className="volume-control-area">
        <VolumeControl volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} />
      </div>
    </div>
  );
}