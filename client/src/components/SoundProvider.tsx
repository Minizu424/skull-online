import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import clickSound from "../assets/click_game.wav";

type SoundContextType = {
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  playClickSound: () => void;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

type SoundProviderProps = {
  children: ReactNode;
};

export function SoundProvider({ children }: SoundProviderProps) {
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  const playClickSound = () => {
    if (isMuted || volume === 0) {
      return;
    }

    const audio = new Audio(clickSound);
    audio.volume = volume / 100;
    audio.currentTime = 0;

    audio.play().catch(() => {
      // 再生できなかった場合は何もしない
    });
  };

  return (
    <SoundContext.Provider
      value={{
        volume,
        setVolume,
        isMuted,
        setIsMuted,
        playClickSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);

  if (!context) {
    throw new Error("useSound must be used within SoundProvider");
  }

  return context;
}