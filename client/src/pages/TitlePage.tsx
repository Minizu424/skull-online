type TitlePageProps = {
  onCreateRoom: () => void;
};

export function TitlePage({
  onCreateRoom,
}: TitlePageProps) {
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
      <h1>タイトル画面</h1>

      <button
        onClick={onCreateRoom}
        style={{
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        ルーム作成
      </button>
    </div>
  );
}