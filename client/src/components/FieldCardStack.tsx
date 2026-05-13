type RevealedCard = {
  id: string;
  label: string;
  revealed: boolean;
};

type FieldCardStackProps = {
  cards: RevealedCard[];
  phase:
    | "placing"
    | "bidding"
    | "revealing"
    | "result";

  onReveal: (cardId: string) => void;
};

export function FieldCardStack({
  cards,
  phase,
  onReveal,
}: FieldCardStackProps) {
  const topUnrevealedIndex =
    cards
      .map((c) => c.revealed)
      .lastIndexOf(false);

  return (
    <div className="placed-card-stack">
      {cards.map((card, index) => {
        const canReveal =
          index === topUnrevealedIndex;

        return (
          <button
            key={card.id}
            className="placed-card"
            onClick={() =>
              onReveal(card.id)
            }
            disabled={
              phase !== "revealing" ||
              !canReveal ||
              card.revealed
            }
          >
            {card.revealed
              ? card.label
              : "裏"}
          </button>
        );
      })}
    </div>
  );
}