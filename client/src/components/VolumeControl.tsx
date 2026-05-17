import "../styles/VolumeControl.css";

import iconMuted from "../assets/icon_muted.webp";
import iconVolumeOn from "../assets/icon_volume_on.webp";
import iconVolumeZero from "../assets/icon_volume_zero.webp";

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
  const displayedVolume = isMuted ? 0 : volume;

  const volumeIcon = isMuted
    ? iconMuted
    : displayedVolume === 0
      ? iconVolumeZero
      : iconVolumeOn;

  const volumeIconAlt = isMuted
    ? "ミュート"
    : displayedVolume === 0
      ? "音量0"
      : "音量あり";

  return (
    <div className="volume-control">
      <button
        className="volume-control__mute-button"
        onClick={() => setIsMuted(!isMuted)}
        type="button"
      >
        <img
          src={volumeIcon}
          alt={volumeIconAlt}
          className="volume-control__icon"
        />
      </button>

      <input
        className="volume-control__slider"
        type="range"
        min={0}
        max={100}
        value={displayedVolume}
        onChange={(e) => {
          const nextVolume = Number(e.target.value);

          setVolume(nextVolume);

          if (nextVolume > 0 && isMuted) {
            setIsMuted(false);
          }
        }}
      />

      <span className="volume-control__value">
        {displayedVolume}%
      </span>
    </div>
  );
}