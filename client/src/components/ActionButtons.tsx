import { Button } from "./Button";

type ActionButtonsProps = {
  phase: "placing" | "bidding" | "revealing" | "result";
  selectedCardId: string | null;
  isMyTurn: boolean;
  onPlaceCard: () => void;
  onStartBidding: () => void;
  onPass: () => void;
  onBackToLobby: () => void;
};

export function ActionButtons({
  phase,
  selectedCardId,
  isMyTurn,
  onPlaceCard,
  onStartBidding,
  onPass,
  onBackToLobby,
}: ActionButtonsProps) {
  return (
    <footer className="action-area">
      <Button
        onClick={onPlaceCard}
        disabled={
          !isMyTurn ||
          phase !== "placing" ||
          selectedCardId === null
        }
      >
        カードを出す
      </Button>

      <Button
        onClick={onStartBidding}
        disabled={
          !isMyTurn ||
          (phase !== "placing" && phase !== "bidding")
        }
      >
        宣言する
      </Button>

      <Button
        onClick={onPass}
        disabled={
          !isMyTurn ||
          phase !== "bidding"
        }
      >
        パスする
      </Button>

      <Button onClick={onBackToLobby}>
        ロビーへ戻る
      </Button>
    </footer>
  );
}