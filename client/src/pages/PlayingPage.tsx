type PlayPageProps = {
  onBackToLobby: () => void;
};

export function PlayingPage({ onBackToLobby }: PlayPageProps) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      gap: "20px",
    }}>
      <h1>プレイ画面</h1>

      <button onClick={onBackToLobby}>
        ロビーに戻る
      </button>
    </div>
  );
}