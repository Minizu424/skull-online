import "../styles/Button.css";
import clickSound from "../assets/click_game.wav";
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export function Button({
  children,
  onClick,
  disabled = false,
  className = "",
}: ButtonProps) {
  const playClickSound = () => {
    const audio = new Audio(clickSound);

    audio.volume = 0.5;
    audio.currentTime = 0;

    audio.play().catch(() => {
      // ブラウザ側で再生が止められた場合のエラー対策
    });
  };

  const handleClick = () => {
    if (disabled) {
      return;
    }

    playClickSound();

    onClick?.();
  };

  return (
    <button
      className={`game-button ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}