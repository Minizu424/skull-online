type LobbyPageProps = {
  onBackToTitle: () => void;
  onStartGame: () => void;
};

export function LobbyPage({
  onBackToTitle,
  onStartGame,
}: LobbyPageProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "20px",
      }}
    >
      <h1>ロビー画面</h1>

      <p>ここにプレイヤー一覧やルーム情報を表示</p>

      <button
        onClick={onStartGame}
        style={{
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        ゲーム開始
      </button>

      <button
        onClick={onBackToTitle}
        style={{
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        タイトルへ戻る
      </button>
    </div>
  );
}