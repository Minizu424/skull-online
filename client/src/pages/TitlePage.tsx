import { useEffect, useState } from "react";

import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { TextInput } from "../components/TextInput";
import { VolumeControl } from "../components/VolumeControl";
import { Logo } from "../components/Logo";

import "./TitlePage.css";

type TitlePageProps = {
  onCreateRoom: (roomId: string, playerName: string) => void;
  onJoinRoom?: (roomId: string, playerName: string) => void;
};

export function TitlePage({
  onCreateRoom,
  onJoinRoom,
}: TitlePageProps) {
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  // 名前復元
  useEffect(() => {
    const savedName = localStorage.getItem("playerName");

    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  const handleNameChange = (value: string) => {
    setPlayerName(value);

    localStorage.setItem("playerName", value);
  };

  const handleRoomIdChange = (value: string) => {
    const formattedValue = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);

    setRoomId(formattedValue);
  };

  const createTemporaryRoomId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let newRoomId = "";

    for (let i = 0; i < 6; i++) {
      newRoomId += chars[Math.floor(Math.random() * chars.length)];
    }

    return newRoomId;
  };

  const handleCreateRoom = () => {
    const newRoomId = createTemporaryRoomId();
    const trimmedPlayerName = playerName.trim();

    localStorage.setItem("roomId", newRoomId);

    onCreateRoom(newRoomId, trimmedPlayerName);
  };

  const handleJoinRoom = () => {
    const trimmedPlayerName = playerName.trim();

    if (roomId.length !== 6) {
      return;
    }

    localStorage.setItem("roomId", roomId);

    onJoinRoom?.(roomId, trimmedPlayerName);
  };

  const isNameEmpty = playerName.trim() === "";
  const isJoinDisabled = roomId.length !== 6;

  return (
    <div className="title-page">
      <div className="title-page__volume">
        <VolumeControl
          volume={volume}
          setVolume={setVolume}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />
      </div>

      <main className="title-page__content">
        <Logo />

        <div className="title-page__name-area">
          <TextInput
            value={playerName}
            onChange={handleNameChange}
            placeholder="プレイヤー名"
            maxLength={20}
          />

          <p className="title-page__name-count">
            {playerName.length} / 20
          </p>
        </div>

        <div className="title-page__buttons">
          <Button
            onClick={handleCreateRoom}
            disabled={isNameEmpty}
          >
            部屋を作る
          </Button>

          <Button
            onClick={() => setShowModal(true)}
            disabled={isNameEmpty}
          >
            部屋を探す
          </Button>

          <Button>
            ルール説明
          </Button>
        </div>
      </main>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="title-page__modal">
            <h2 className="title-page__modal-title">
              ルームID入力
            </h2>

            <TextInput
              value={roomId}
              onChange={handleRoomIdChange}
              placeholder="ABC123"
              maxLength={6}
            />

            <p className="title-page__room-id-count">
              {roomId.length} / 6
            </p>

            <div className="title-page__modal-buttons">
              <Button
                onClick={handleJoinRoom}
                disabled={isJoinDisabled}
              >
                入室
              </Button>

              <Button onClick={() => setShowModal(false)}>
                閉じる
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}