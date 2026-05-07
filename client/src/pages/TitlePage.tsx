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


  const handleNameChange = (
    value: string
  ) => {
    setPlayerName(value);

    localStorage.setItem(
      "playerName",
      value
    );
  };

  const handleRoomIdChange = (
    value: string
  ) => {
    const formattedValue = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
  
    setRoomId(formattedValue);
  };


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
          maxLength={20}
        />
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