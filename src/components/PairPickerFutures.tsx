import React, { FC, useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from 'next/router';
import { FaAngleUp} from 'react-icons/fa';
import { components } from 'react-select';
import Select from 'react-select';


interface PairPickerProps {
  onSymbolChange: (symbol: string) => void;
  prices: { [key: string]: { price: number, timestamp: string } };
  selectedCryptos: { [key: string]: boolean };
  setSelectedCryptos: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  openingPrice: number; // Add openingPrice here
}

const getWindowWidth = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth;
  }
  return undefined;
};

const options = [
  {
    value: 'Crypto.SOL/USD', 
    label: 'SOL/USD', 
    icon: '/coins/60x60/Sol.png'
  },
  {
    value: 'Crypto.BTC/USD', 
    label: 'BTC/USD', 
    icon: '/coins/60x60/Btc.png'
  },
 {
 value: 'Crypto.ETH/USD', 
  label: 'ETH/USD', 
  icon: '/coins/60x60/Eth.png'
 },
// {
// value: 'Crypto.JUP/USD', 
// label: 'JUP/USD', 
//   icon: '/coins/60x60/Jup.png'
//  },
  {
    value: 'Crypto.PYTH/USD', 
     label: 'PYTH/USD', 
     icon: '/coins/60x60/Pyth.png'
   },
   {
  value: 'Crypto.BONK/USD', 
  label: 'BONK/USD', 
   icon: '/coins/60x60/Bonk.png'
 },
 // {
 // value: 'Crypto.TIA/USD', 
 // label: 'TIA/USD', 
 //  icon: '/coins/60x60/Tia.png'
// },
// {
//  value: 'Crypto.SUI/USD', 
 // label: 'SUI/USD', 
 //  icon: '/coins/60x60/Sui.png'
 // },
  // more options here...
];

const formatOptionLabel = ({value, label, icon}) => (
  <div className="flex items-center">
    <img src={icon} alt="Logo" width="30" height="30" />
    <span className="bankGothic px-2 text-[1.2rem] text-[#A9AAB7]">{label}</span>
  </div>
);

const customStyles = {
  menu: (provided, state) => ({
    ...provided,
    zIndex: 9999,
    backgroundColor: '#1A1A25', // Change color to match your theme
  }),

  indicatorSeparator: () => ({
    display: 'none',
  }),

  menuList: (provided, state) => ({
    ...provided,
    top: '100%',
    borderRadius: '0.5rem',
    boxShadow: 'none',
    borderColor: '#434665',
    className: "custom-scrollbar",
    backgroundColor: '#1d202f', // Change color to match your theme
    '::-webkit-scrollbar': {
      width: '0px',
      height: '3px'
    },
    '::-webkit-scrollbar-track': {
      background: '#f1f1f1',
    },
    '::-webkit-scrollbar-thumb': {
      background: '#888',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: '#555',
    },
  }),
  control: (provided, state) => {
    const windowWidth = getWindowWidth();
    const isMdOrAbove = windowWidth >= 768;
    return {
      ...provided,
      height: isMdOrAbove ? '53px' : '55px',
      backgroundColor: isMdOrAbove ? (state.isFocused ? '#151722' : '#151722') : 'transparent',
      borderRadius: isMdOrAbove ? '0.5rem' : '0rem',
      borderColor: isMdOrAbove ? (state.isFocused ? 'transparent' : 'transparent') : 'transparent',
      borderWidth: isMdOrAbove ? '1px' : '0',
      boxShadow: 'none',
      color: '#fff',
      fontWeight: '600',
      ':hover': {
        backgroundColor: '#1d202f' ,
        borderColor: isMdOrAbove ? 'transparent' : 'transparent',
      },
      ':focus': {
        outline: 'none',
        border: 'none',
        boxShadow: 'none',
      }
    };
  },
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? '#A9AAB7' : '#A9AAB7',
    fontWeight: '600',
    borderRadius: '0.5rem',
    borderColor: state.isFocused ? '#434665' : '#434665',
    backgroundColor: '#1d202f',
    ':hover': {
      backgroundColor: '#434665' ,
    }
  }),
  
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = 'opacity 100ms';
    return { ...provided, opacity, transition, color: '#A9AAB7', fontWeight: '600' }; // change the color here
  }
};





export const PairPicker: React.FC<PairPickerProps> = ({setSelectedCryptos, selectedCryptos, onSymbolChange, prices, openingPrice}) => {

  const DropdownIndicator = (props) => {
    // Use useMemo to calculate displayPrice and displayPercentage
    const { displayPrice, displayPercentage, color } = useMemo(() => {
      // Determine the selected cryptocurrency
      const selectedCrypto = Object.keys(selectedCryptos).find(key => selectedCryptos[key]);
  
      // Get the price for the selected cryptocurrency
      const selectedCryptoPrice = prices?.[`Crypto.${selectedCrypto}/USD`]?.price;

           // Function to determine the number of decimal places
           const getDecimalPlaces = (crypto) => {
            switch (crypto) {
              case 'BTC':
                return 1; 
                case 'ETH':
                  return 1; // One decimal place for BTC
              case 'SOL':
                return 3; // Three decimal places for SOL
              // Add other cases as necessary
              case 'PYTH':
                return 4;
                case 'JUP':
                  return 4;
              case 'BONK':
                return 8;
                case 'TIA':
                  return 3;
                  case 'SUI':
                    return 3;  // Three decimal places for SOL
              default:
                return 2; // Default number of decimal places
            }
          };
  
      // Calculate the display price
      const newDisplayPrice = selectedCryptoPrice && !isNaN(selectedCryptoPrice)
        ? (selectedCryptoPrice / 100000000).toFixed(getDecimalPlaces(selectedCrypto))
        : '-';

  
      // Calculate the initial price
      const initialPrice = selectedCryptoPrice 
        ? selectedCryptoPrice / 100000000
        : 0;
  
      // Calculate the percentage change
      const percentage = (((initialPrice - openingPrice) / openingPrice) * 100).toFixed(2);
      const newColor = Number(percentage) < 0 ? 'text-red-500' : 'text-primary';
      const newDisplayPercentage = isNaN(Number(percentage)) ? '-' : Number(percentage) < 0 ? percentage : `+${percentage}`;
  
      return {
        displayPrice: newDisplayPrice,
        displayPercentage: newDisplayPercentage,
        color: newColor,
      };
    }, [prices, selectedCryptos, openingPrice]);

    const [initialPrice, setInitialPrice] = useState(0);

    useEffect(() => {
      const selectedCrypto = Object.keys(selectedCryptos).find(key => selectedCryptos[key]);
      const newInitialPrice = prices?.[`Crypto.${selectedCrypto?.toUpperCase()}/USD`]?.price / 100000000 || 0;
      setInitialPrice(newInitialPrice);
    }, [selectedCrypto, prices]);
  
    return (
      <components.DropdownIndicator {...props}>
        <div className="flex flex-row justify-center items-center text-[#A9AAB7] ">
          <div className=" leading-[18px] font-medium pb-1 text-lg text-white md:hidden mr-2">
          ${displayPrice}
          </div>
          <div className={`pb-1 md:hidden text-base leading-[16px] font-medium ${color}`}>{displayPercentage}%</div>
          <div style={{ 
            transition: 'transform 0.3s', 
            transform: `rotate(${props.selectProps.menuIsOpen ? '0deg' : '180deg'})`,
          }}
          className="text-[#A9AAB7]">
            <FaAngleUp/>
          </div>
        </div>
      </components.DropdownIndicator>
    );
  };
  
  const [selectedCrypto, setSelectedCrypto] = useState(options[0]);
  const { push } = useRouter();

  useEffect(() => {
    const selectedCrypto = Object.keys(selectedCryptos).find(key => selectedCryptos[key]);
    push(`/futures?crypto=${selectedCrypto}`, undefined, { shallow: true });
  }, [selectedCrypto]);

  useEffect(() => {
    const selectedCrypto = Object.keys(selectedCryptos).find(key => selectedCryptos[key]);
    // Assuming selectedCrypto is a string like 'Crypto.SOL/USD'
    const newSelectedOption = options.find(option => option.value === selectedCrypto);
  
    if (newSelectedOption) {
      // Assuming setSelectedCrypto should update the state with the option object
      // If setSelectedCrypto should only store the string, use newSelectedOption.value
      setSelectedCrypto(newSelectedOption);
    }
  }, [selectedCrypto, options]);

  const handleCryptoChange = (option) => {
    // Update the selectedCryptos state
    const cryptoIdentifier = option.value.split('.')[1].split('/')[0];

    // Update the selectedCryptos state
    setSelectedCryptos({ [cryptoIdentifier]: true });
    
    // Update the selectedCrypto state if needed
    setSelectedCrypto(option);
    
    onSymbolChange(option.value);
  };



return (
<div className="md:w-[330px] w-full sticky-tops md:bg-layer-1 bg-base rounded-lg ">
<Select 
          components={{
            DropdownIndicator: props => 
              <DropdownIndicator 
                {...props} 
                selectedCryptos={selectedCryptos}  
                prices={prices} // Make sure prices is passed correctly
              />
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
)
};

export default PairPicker;