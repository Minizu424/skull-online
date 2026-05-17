import "../styles/Button.css";
import { useSound } from "../components/SoundProvider";

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
  const { playClickSound } = useSound();

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