import { useEffect, useState } from "react";

import { Button } from "../components/Button";
import { VolumeControl } from "../components/VolumeControl";

import "../styles/ResultPage.css";
import resultBg from "../assets/back-result.png";
import timerIcon from "../assets/icon_timer.webp";

import skullBlue from "../assets/skull_icon_blue_double_eye.webp";
import skullGreen from "../assets/skull_icon_green_double_eye.webp";
import skullPurple from "../assets/skull_icon_purple_double_eye.webp";
import skullRed from "../assets/skull_icon_red_double_eye.webp";

type WinnerColor =
  | "blue"
  | "green"
  | "purple"
  | "red";

type ResultPageProps = {
  winnerName: string;

  winnerColor: WinnerColor;

  onRematch: () => void;

  onBackToTitle: () => void;
};

const winnerIconByColor: Record<WinnerColor, string> = {
  blue: skullBlue,
  green: skullGreen,
  purple: skullPurple,
  red: skullRed,
};

export function ResultPage({
  winnerName,
  winnerColor,
  onRematch,
  onBackToTitle,
}: ResultPageProps) {
  const [timeLeft, setTimeLeft] =
    useState(30);

  const [volume, setVolume] =
    useState(50);

  const [isMuted, setIsMuted] =
    useState(false);

  const winnerIcon =
    winnerIconByColor[winnerColor] ?? skullBlue;

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
    <div
      className="result-page"
      style={{
        backgroundImage: `url(${resultBg})`,
      }}
    >
      <main className="result-page__content">
        <h1 className="result-page__title">
          WINNER
        </h1>

        <img
          src={winnerIcon}
          alt={`${winnerName} icon`}
          className="result-page__winner-icon"
        />

        <h2 className="result-page__winner-name">
          {winnerName}
        </h2>

        <div className="result-page__timer-area">
          <p>
            30秒後にタイトルへ戻ります
          </p>

          <div className="result-page__time-left-row">
            <img
              src={timerIcon}
              alt="timer"
              className="result-page__timer-icon"
            />

            <p>
              残り {timeLeft} 秒
            </p>
          </div>
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