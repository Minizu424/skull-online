type Card = {
  id: string;
  type: "rose" | "skull" | "doubleRose";
  label: string;
};

type HandAreaProps = {
  handCards: Card[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
};

export function HandArea({
  handCards,
  selectedCardId,
  onSelectCard,
}: HandAreaProps) {
  return (
    <section className="hand-area">
      {handCards.map((card) => (
        <button
          key={card.id}
          className={`card-button ${
            selectedCardId === card.id
              ? "selected"
              : ""
          }`}
          onClick={() => onSelectCard(card.id)}
        >
          {card.label}
        </button>
      ))}
    </section>
  );
}