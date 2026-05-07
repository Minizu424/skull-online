type TextInputProps = {
  value: string;
  onChange: (
    value: string
  ) => void;

  placeholder?: string;
  maxLength?: number;
};

export function TextInput({
  value,
  onChange,
  placeholder,
  maxLength=20,
}: TextInputProps) {
  const getCharacterCount = (
    text: string
  ) => {
    let count = 0;

    for (const char of text) {
        if (
            /[^\x00-\x7F]/.test(char)
        ){
            count += 2;
        } else {
            count += 1;
        }
    }

    return count;
  }

  const limitText =(
    text: string
  ) => {
    let result = "";

    let count = 0;

    for (const char of text) {
        const charCount =
        /[^\x00-\x7F]/.test(char)
          ?2
          :1;

        if (
            count + charCount >
            maxLength
        ){
            break;
        }

        count += charCount;

        result += char;
    }

    return result;
  };

  const currentCount =
    getCharacterCount(value);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const limitedValue = 
    limitText(e.target.value);

    onChange(limitedValue);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",

        gap: "5px"
      }}
    >
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: "280px",
  
          padding: "12px",
  
          fontSize: "18px",
  
          borderRadius: "8px",
  
          border:
            currentCount >= maxLength
              ? "2px solid red"
              : "2px solid gray",
  
          outline: "none",
        }}
      />

      <div
        style={{
          textAlign: "right",
  
          fontSize: "14px",
  
          color:
            currentCount >= maxLength
              ? "red"
              : "#aaaaaa",
        }}
      >
          {currentCount}/{maxLength}
      </div>
    </div>
  );
}