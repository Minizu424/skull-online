type PlayerAreaProps = {
  position: "top" | "left" | "right";
  name: string;
  handCount: number;
  fieldCount: number;
  winCount: number;
};

export function PlayerArea({
  position,
  name,
  handCount,
  fieldCount,
  winCount,
}: PlayerAreaProps) {
  return (
    <section
      className={`player-area ${position}-player`}
    >
      <h2>{name}</h2>

      <p>
        手札: {handCount} / 場札: {fieldCount}
      </p>

      <p>勝利数: 🌹 {winCount}</p>
    </section>
  );
}