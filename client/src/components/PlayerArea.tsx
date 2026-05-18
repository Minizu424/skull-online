import playerFrameImage from "../assets/player_frame.webp";

type PlayerAreaProps = {
  position: "top" | "left" | "right";
  name: string;
  handCount: number;
  fieldCount: number;
  winCount: number;
  isCurrentTurn?: boolean;
};

export function PlayerArea({
  position,
  name,
  handCount,
  fieldCount,
  winCount,
  isCurrentTurn = false,
}: PlayerAreaProps) {
  return (
    <div
      className={`player-area ${position}-player ${
        isCurrentTurn ? "current-turn-player" : ""
      }`}
    >
      <img
        src={playerFrameImage}
        alt=""
        className="player-frame-image"
      />

      <div className="player-area-content">
        <h2>{name}</h2>

        <p>
          手札: {handCount} / 場札: {fieldCount}
        </p>

        <p>
          勝利数: 🌹 {winCount}
        </p>
      </div>
    </div>
  );
}