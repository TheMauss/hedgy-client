import React, { FC, useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import { FaAngleUp } from "react-icons/fa";
import { components } from "react-select";
import Select from "react-select";

interface PairPickerProps {
  onSymbolChange: (symbol: string) => void;
  prices: { [key: string]: { price: number; timestamp: string } };
  selectedCryptos: { [key: string]: boolean };
  setSelectedCryptos: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  openingPrice: number; // Add openingPrice here
}

const getWindowWidth = () => {
  if (typeof window !== "undefined") {
    return window.innerWidth;
  }
  return undefined;
};

const options = [
  {
    value: "Crypto.SOL/USD",
    label: "SOL/USD",
    icon: "/coins/60x60/Sol.png",
  },
  {
    value: "Crypto.BTC/USD",
    label: "BTC/USD",
    icon: "/coins/60x60/Btc.png",
  },
  {
    value: "Crypto.ETH/USD",
    label: "ETH/USD",
    icon: "/coins/60x60/Eth.png",
  },
  {
    value: "Crypto.JUP/USD",
    label: "JUP/USD",
    icon: "/coins/60x60/Jup.png",
  },
  {
    value: "Crypto.PYTH/USD",
    label: "PYTH/USD",
    icon: "/coins/60x60/Pyth.png",
  },
  {
    value: "Crypto.BONK/USD",
    label: "BONK/USD",
    icon: "/coins/60x60/Bonk.png",
  },
  // {
  // value: 'Crypto.TIA/USD',
  // label: 'TIA/USD',
  //  icon: '/coins/60x60/Tia.png'
  // },
  {
    value: "Crypto.SUI/USD",
    label: "SUI/USD",
    icon: "/coins/60x60/Sui.png",
  },
  // more options here...
];

const formatOptionLabel = ({ value, label, icon }) => (
  <div className="flex items-center">
    <img src={icon} alt="Logo" width="27" height="27" />
    <span className="bankGothic px-2 text-[1.2rem] text-[#ffffff]">
      {label}
    </span>
  </div>
);

const customStyles = {
  menu: (provided, state) => ({
    ...provided,
    zIndex: 9999,
    backgroundColor: "#000000", // Change color to match your theme
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  menuList: (provided, state) => ({
    ...provided,
    top: "100%",
    borderRadius: "0.5rem",
    boxShadow: "none",
    borderColor: "#fff",
    className: "custom-scrollbar",
    backgroundColor: "#000000", // Change color to match your theme
    "::-webkit-scrollbar": {
      width: "0px",
      height: "3px",
    },
    "::-webkit-scrollbar-track": {
      background: "#f1f1f1",
    },
    "::-webkit-scrollbar-thumb": {
      background: "#888",
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "#555",
    },
  }),
  control: (provided, state) => {
    const windowWidth = getWindowWidth();
    const isMdOrAbove = windowWidth >= 768;
    return {
      ...provided,
      height: isMdOrAbove ? "53px" : "45px",
      backgroundColor: isMdOrAbove
        ? state.isFocused
          ? "transparent"
          : "transparent"
        : "transparent",
      borderRadius: isMdOrAbove ? "0.5rem" : "0rem",
      borderColor: isMdOrAbove
        ? state.isFocused
          ? "transparent"
          : "transparent"
        : "transparent",
      borderWidth: isMdOrAbove ? "1px" : "0",
      boxShadow: "none",
      color: "#fff",
      fontWeight: "600",
      ":hover": {
        backgroundColor: "#ffffff12",
        borderColor: isMdOrAbove ? "transparent" : "transparent",
      },
      ":focus": {
        outline: "none",
        border: "none",
        boxShadow: "none",
      },
    };
  },
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? "#A9AAB7" : "#A9AAB7",
    fontWeight: "600",
    borderRadius: "0rem",
    borderColor: state.isFocused ? "#ffffff24" : "#ffffff24",
    backgroundColor: "#ffffff12",
    ":hover": {
      backgroundColor: "#ffffff24",
    },
  }),

  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = "opacity 100ms";
    return {
      ...provided,
      opacity,
      transition,
      color: "#A9AAB7",
      fontWeight: "600",
    }; // change the color here
  },
};

export const PairPicker: React.FC<PairPickerProps> = ({
  setSelectedCryptos,
  selectedCryptos,
  onSymbolChange,
  prices,
  openingPrice,
}) => {
  const DropdownIndicator = (props) => {
    // Use useMemo to calculate displayPrice and displayPercentage
    const { displayPrice, displayPercentage, color } = useMemo(() => {
      // Determine the selected cryptocurrency
      const selectedCrypto = Object.keys(selectedCryptos).find(
        (key) => selectedCryptos[key]
      );

      // Get the price for the selected cryptocurrency
      const selectedCryptoPrice =
        prices?.[`Crypto.${selectedCrypto}/USD`]?.price;

      // Function to determine the number of decimal places
      const getDecimalPlaces = (crypto) => {
        switch (crypto) {
          case "BTC":
            return 1;
          case "ETH":
            return 1; // One decimal place for BTC
          case "SOL":
            return 3; // Three decimal places for SOL
          // Add other cases as necessary
          case "PYTH":
            return 4;
          case "JUP":
            return 4;
          case "BONK":
            return 8;
          case "TIA":
            return 3;
          case "SUI":
            return 4; // Three decimal places for SOL
          default:
            return 2; // Default number of decimal places
        }
      };

      // Calculate the display price
      const newDisplayPrice =
        selectedCryptoPrice && !isNaN(selectedCryptoPrice)
          ? (selectedCryptoPrice / 100000000).toFixed(
              getDecimalPlaces(selectedCrypto)
            )
          : "-";

      // Calculate the initial price
      const initialPrice = selectedCryptoPrice
        ? selectedCryptoPrice / 100000000
        : 0;

      // Calculate the percentage change
      let percentage = "0";
      if (initialPrice && openingPrice) {
        percentage = (
          ((initialPrice - openingPrice) / openingPrice) *
          100
        ).toFixed(2);
      }
      const newColor = Number(percentage) < 0 ? "text-red-500" : "text-primary";
      const newDisplayPercentage = isNaN(Number(percentage))
        ? "-"
        : Number(percentage) < 0
          ? percentage
          : `${percentage}`;

      return {
        displayPrice: newDisplayPrice,
        displayPercentage: newDisplayPercentage,
        color: newColor,
      };
    }, [prices, selectedCryptos, openingPrice]);

    const [initialPrice, setInitialPrice] = useState(0);

    useEffect(() => {
      const selectedCrypto = Object.keys(selectedCryptos).find(
        (key) => selectedCryptos[key]
      );
      const newInitialPrice =
        prices?.[`Crypto.${selectedCrypto?.toUpperCase()}/USD`]?.price /
          100000000 || 0;
      setInitialPrice(newInitialPrice);
    }, [selectedCrypto, prices]);

    return (
      <components.DropdownIndicator {...props}>
        <div className="flex flex-row justify-center items-center text-[#A9AAB7] ">
          <div className=" leading-[18px] font-medium pb-1 text-lg text-white md:hidden mr-2">
            ${displayPrice}
          </div>
          <div
            className={`pb-1 md:hidden text-base leading-[16px] text-sm font-medium ${color}`}
          >
            {displayPercentage}%
          </div>
          <div
            style={{
              transition: "transform 0.3s",
              transform: `rotate(${props.selectProps.menuIsOpen ? "0deg" : "180deg"})`,
            }}
            className="ml-1 mb-0.5 text-[#ffffff60]"
          >
            <FaAngleUp />
          </div>
        </div>
      </components.DropdownIndicator>
    );
  };

  const router = useRouter();
  const cryptoQuery = router.query.crypto; // Assume this is always a string for simplicity.

  // Find the initial crypto option based on the URL query or default to the first option.
  const findInitialCrypto = () => {
    if (!cryptoQuery || Array.isArray(cryptoQuery)) return options[0];
    const cryptoKey = cryptoQuery.toString().toUpperCase();
    const matchingOption = options.find((option) =>
      option.value.includes(`${cryptoKey}/USD`)
    );
    console.log("matchingOption", matchingOption);

    return matchingOption || options[0];
  };

  // State to track the selected crypto option.
  const [selectedCrypto, setSelectedCrypto] = useState(() =>
    findInitialCrypto()
  );

  // Effect to update state based on URL query changes.
  useEffect(() => {
    if (router.isReady) {
      setSelectedCrypto(findInitialCrypto());
    }
  }, [router.isReady, cryptoQuery]);

  const handleCryptoChange = (option) => {
    // Update the selectedCryptos state
    const cryptoIdentifier = option.value.split(".")[1].split("/")[0];

    // Update the selectedCryptos state
    setSelectedCryptos({ [cryptoIdentifier]: true });

    // Update the selectedCrypto state if needed
    setSelectedCrypto(option);

    onSymbolChange(option.value);
    router.push(`/futures?crypto=${cryptoIdentifier}`, undefined, {
      shallow: true,
    });
  };

  return (
    <div className="z-30 md:w-[330px] w-full sticky-tops rounded-lg ">
      <Select
        components={{
          DropdownIndicator: (props) => (
            <DropdownIndicator
              {...props}
              selectedCryptos={selectedCryptos}
              prices={prices} // Make sure prices is passed correctly
            />
          ),
        }}
        value={selectedCrypto}
        onChange={handleCryptoChange}
        options={options}
        formatOptionLabel={formatOptionLabel}
        styles={customStyles}
        className="w-full z-1000"
        isSearchable={false}
      />
    </div>
  );
};

export default PairPicker;
