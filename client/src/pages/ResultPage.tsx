import { useEffect, useState } from "react";

import { Button } from "../components/Button";
import { VolumeControl } from "../components/VolumeControl";

import "../styles/ResultPage.css";

type ResultPageProps = {
  winnerName: string;

  onRematch: () => void;

  onBackToTitle: () => void;
};

export function ResultPage({
  winnerName,
  onRematch,
  onBackToTitle,
}: ResultPageProps) {

  const [timeLeft, setTimeLeft] =
    useState(30);

  const [volume, setVolume] =
    useState(50);

  const [isMuted, setIsMuted] =
    useState(false);

  // カウントダウン
  useEffect(() => {
    if (timeLeft <= 0) {
      onBackToTitle();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onBackToTitle]);

  return (
    <div className="result-page">

      <main className="result-page__content">

        <h1 className="result-page__title">
          WINNER
        </h1>

        <div className="result-page__skull">
          ☠
        </div>

        <h2 className="result-page__winner-name">
          {winnerName}
        </h2>

        <div className="result-page__timer-area">
          <p>
            30秒後にタイトルへ戻ります
          </p>

          <p>
            残り {timeLeft} 秒
          </p>
        </div>

        <div className="result-page__buttons">

          <Button onClick={onRematch}>
            もう一度遊ぶ
          </Button>

          <Button onClick={onBackToTitle}>
            部屋を出る
          </Button>

        </div>
      </main>

      <div className="result-page__volume">
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
