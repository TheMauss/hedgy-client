import React, { useEffect, useState } from "react";

interface TwoDigitInputProps {
  value: string;
  onValueChange?: (value: string) => void;
  formatAmount?: boolean;
  maxValue?: number;
  setError?: (error: string) => void; // Add setError prop
}

const TwoDigitInput: React.FC<TwoDigitInputProps> = ({ value, onValueChange, formatAmount, maxValue, setError }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value;
    // Allow only numbers to be inputted
    if (newValue.length <= 2 && /^[0-9]*$/.test(newValue)) {
      // Restrict input to a maximum value
      if (maxValue !== undefined && parseInt(newValue) > maxValue) {
        setInputValue(maxValue.toString());
        // Call setError with an error message
        if (setError) {
          setError(`Maximum value exceeded: ${maxValue}`);
        }
      } else {
        setInputValue(newValue);
        // Clear the error message
        if (setError) {
          setError("");
        }
      }
    }
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    let newValue = event.target.value;
  
    if (formatAmount) {
      newValue = newValue.padStart(2, "0");
    }
  
    // If the value is not a number, set it to "00"
    if (isNaN(parseInt(newValue))) {
      newValue = "00";
    }
  
    setInputValue(newValue);
  
    if (onValueChange) {
      onValueChange(newValue); // Notify parent component of value change
    }
  };
  

  return (
    <input
      type="text"
      value={inputValue}
      className="bg-transparent outline-none border-none text-lg"
      onChange={handleInput}
      onBlur={handleBlur}
    />
  );
};

export default TwoDigitInput;
