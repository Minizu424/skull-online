import { useEffect, useState } from "react";

import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { TextInput } from "../components/TextInput";
import { VolumeControl } from "../components/VolumeControl";
import { Logo } from "../components/Logo";

type TitlePageProps = {
  onCreateRoom: () => void;
};

export function TitlePage({
  onCreateRoom,
}: TitlePageProps) {
  const [playerName, setPlayerName] =
    useState("");

  const [roomId, setRoomId] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [volume, setVolume] =
    useState(50);

  const [isMuted, setIsMuted] =
    useState(false);

  // 名前復元
  useEffect(() => {
    const savedName =
      localStorage.getItem(
        "playerName"
      );

    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  // 文字数計算関数
  const getCharacterCount = (
    text: string
  ) => {
    let count = 0;

    for (const char of text) {
      // 日本語なら2
      if (
        /[^\x00-\x7F]/.test(char)
      ) {
        count += 2;
      } else {
        count += 1;
      }
    }

    return count;
  };

  // ルームID入力
  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    let newValue = "";

    let count = 0;

    for (const char of value) {
      const charCount =
        /[^\x00-\x7F]/.test(char)
          ? 2
          : 1;

      if (count + charCount > 20) {
        break;
      }

      count += charCount;

      newValue += char;
    }

    setPlayerName(newValue);

    localStorage.setItem(
      "playerName",
      newValue
    );
  };

  const handleRoomIdChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
  
    setRoomId(value);
  };

  const currentCount =
  getCharacterCount(playerName);

  const isDisabled =
    playerName.trim() === "";

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",

        backgroundColor: "#1a1a1a",

        color: "white",

        display: "flex",
        flexDirection: "column",

        justifyContent: "center",
        alignItems: "center",

        gap: "20px",
      }}
    >
      {/* ロゴ */}
      <Logo />

      {/* 名前入力 */}
      <div>
        <TextInput
          value={playerName}
          onChange={handleNameChange}
          placeholder="プレイヤー名"
        />

        <div
          style={{
            textAlign: "right",

            fontSize: "14px",

            color:
              currentCount >= 20
                ? "red"
                : "#aaaaaa",
          }}
        >
          {currentCount}/20
        </div>
      </div>

      {/* ボタン */}
      <Button
        onClick={onCreateRoom}
        disabled={isDisabled}
      >
        部屋を作る
      </Button>

      <Button
        onClick={() =>
          setShowModal(true)
        }
        disabled={isDisabled}
      >
        部屋を探す
      </Button>

      <Button>
        ルール説明
      </Button>

      {/* 音量 */}
      <VolumeControl
        volume={volume}
        setVolume={setVolume}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* モーダル */}
      {showModal && (
        <Modal
          onClose={() =>
            setShowModal(false)
          }
        >
          <h2>ルームID入力</h2>

          <TextInput
            value={roomId}
            onChange={
              handleRoomIdChange
            }
            placeholder="ABC123"
            maxLength={6}
          />

          <Button>
            入室
          </Button>

          <Button
            onClick={() =>
              setShowModal(false)
            }
          >
            閉じる
          </Button>
        </Modal>
      )}
    </div>
  );
}