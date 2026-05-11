import { Button } from "./Button";

type ActionButtonsProps = {
  phase: "placing" | "bidding" | "revealing" | "result";
  selectedCardId: string | null;
  onPlaceCard: () => void;
  onStartBidding: () => void;
  onBackToLobby: () => void;
};

export function ActionButtons({
  phase,
  selectedCardId,
  onPlaceCard,
  onStartBidding,
  onBackToLobby,
}: ActionButtonsProps) {
  return (
    <footer className="action-area">
      <Button
        onClick={onPlaceCard}
        disabled={
          phase !== "placing" ||
          selectedCardId === null
        }
      >
        カードを出す
      </Button>

      <Button
        onClick={onStartBidding}
        disabled={phase === "revealing"}
      >
        宣言する
      </Button>

      <Button disabled={phase !== "bidding"}>
        パスする
      </Button>

      <Button onClick={onBackToLobby}>
        ロビーへ戻る
      </Button>
    </footer>
  );
}