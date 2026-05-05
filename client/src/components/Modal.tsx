type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
};

export function Modal({
  children,
  onClose,
}: ModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,

        backgroundColor:
          "rgba(0,0,0,0.7)",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{
          width: "320px",

          backgroundColor: "#2a2a2a",

          padding: "30px",

          borderRadius: "16px",

          display: "flex",
          flexDirection: "column",

          gap: "15px",
        }}
      >
        {children}
      </div>
    </div>
  );
}