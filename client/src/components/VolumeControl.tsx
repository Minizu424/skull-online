type VolumeControlProps = {
  volume: number;
  setVolume: (value: number) => void;

  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
};

export function VolumeControl({
  volume,
  setVolume,
  isMuted,
  setIsMuted,
}: VolumeControlProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",

        gap: "10px",
      }}
    >
      <button
        onClick={() =>
          setIsMuted(!isMuted)
        }
        style={{
          cursor: "pointer",
        }}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      <input
        type="range"
        min={0}
        max={100}
        value={isMuted ? 0 : volume}
        onChange={(e) =>
          setVolume(
            Number(e.target.value)
          )
        }
      />

      <span>
        {isMuted ? 0 : volume}%
      </span>
    </div>
  );
}