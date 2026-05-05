type TextInputProps = {
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  placeholder?: string;
  maxLength?: number;
};

export function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
}: TextInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      style={{
        width: "280px",

        padding: "12px",

        fontSize: "18px",

        borderRadius: "8px",

        border:
          value.length >=
          (maxLength ?? 999)
            ? "2px solid red"
            : "2px solid gray",

        outline: "none",
      }}
    />
  );
}