import "../styles/Button.css";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean; // 最終的に?は消しましょう
};

export function Button({
  children,
  onClick,
  disabled = false,
}: ButtonProps) {
  // クリックSE
  const playClickSound = () => {
    const audio = new Audio(
      "/sounds/click.mp3"
    );

    audio.volume = 0.5;

    audio.play();
  };

  const handleClick = () => {
    if (disabled) return;

    playClickSound();

    onClick?.();
  };

  return (
    <button
      className="game-button"
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}