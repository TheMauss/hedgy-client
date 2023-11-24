import React, { FC, useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from 'next/router';
import { FaAngleUp} from 'react-icons/fa';
import { components } from 'react-select';
import Select from 'react-select';


interface PairPickerProps {
  onSymbolChange: (symbol: string) => void;
  prices: { [key: string]: { price: number, timestamp: string } };
  isBitcoinSelected: boolean;
  isSoliditySelected: boolean;
  setIsBitcoinSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSoliditySelected: React.Dispatch<React.SetStateAction<boolean>>;
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
    icon: '/sol.png'
  },
  {
    value: 'Crypto.BTC/USD', 
    label: 'BTC/USD', 
    icon: '/Bitcoin.png'
  },
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
    backgroundColor: '#151722', // Change color to match your theme
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
    backgroundColor: '#151722',
    ':hover': {
      backgroundColor: '#1d202f' ,
    }
  }),
  
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = 'opacity 100ms';
    return { ...provided, opacity, transition, color: '#A9AAB7', fontWeight: '600' }; // change the color here
  }
};





export const PairPicker: React.FC<PairPickerProps> = ({isBitcoinSelected, isSoliditySelected, setIsBitcoinSelected,  setIsSoliditySelected, onSymbolChange, prices, openingPrice}) => {

  const DropdownIndicator = (props) => {
    // Safely access the properties of prices
  // Use useMemo to calculate displayPrice and displayPercentage
  const { displayPrice, displayPercentage, color } = useMemo(() => {
    const solPrice = prices?.['Crypto.SOL/USD']?.price;
    const btcPrice = prices?.['Crypto.BTC/USD']?.price;
    
    const newDisplayPrice = isSoliditySelected
      ? solPrice && !isNaN(solPrice)
        ? (solPrice / 100000000).toFixed(3)
        : '-'
      : btcPrice && !isNaN(btcPrice)
        ? (btcPrice / 100000000).toFixed(1)
        : '-';
    
    const initialPrice = isSoliditySelected
      ? solPrice / 100000000
      : btcPrice / 100000000;
    const percentage = (((initialPrice - openingPrice) / openingPrice) * 100).toFixed(2);
    const newColor = Number(percentage) < 0 ? 'text-red-500' : 'text-primary';
    const newDisplayPercentage = isNaN(Number(percentage)) ? '-' : Number(percentage) < 0 ? percentage : `+${percentage}`;
    
    return {
      displayPrice: newDisplayPrice,
      displayPercentage: newDisplayPercentage,
      color: newColor,
    };
  }, [prices, isSoliditySelected, isBitcoinSelected, openingPrice]);

        const [initialPrice, setInitialPrice] = useState(0);

        useEffect(() => {
          const initialPrice = isSoliditySelected
            ? prices['Crypto.SOL/USD']?.price / 100000000
            : prices['Crypto.BTC/USD']?.price / 100000000;
        
          setInitialPrice(initialPrice);
        }, [isSoliditySelected, prices]);

  
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
    if (isSoliditySelected) {
      push('/trade?crypto=sol', undefined, { shallow: true });
    } else if (isBitcoinSelected) {
      push('/trade?crypto=btc', undefined, { shallow: true });
    }
  }, [isSoliditySelected, isBitcoinSelected]);

  useEffect(() => {
    if(isSoliditySelected) {
      const newSelectedOption = options.find(option => option.value === 'Crypto.SOL/USD');
      if(newSelectedOption) {
        setSelectedCrypto(newSelectedOption);
      }
    } else if(isBitcoinSelected) {
      const newSelectedOption = options.find(option => option.value === 'Crypto.BTC/USD');
      if(newSelectedOption) {
        setSelectedCrypto(newSelectedOption);
      }
    }
  }, [isSoliditySelected, isBitcoinSelected]);

  const handleCryptoChange = (option) => {
    setSelectedCrypto(option);

    setIsSoliditySelected(option.value === 'Crypto.SOL/USD');
    setIsBitcoinSelected(option.value === 'Crypto.BTC/USD');
    
    onSymbolChange(option.value);
  };


return (
<div className="md:w-[330px] w-full sticky-tops md:bg-layer-1 bg-base rounded-lg md:border border-layer-3 ">
<Select 
          components={{
            DropdownIndicator: props => 
              <DropdownIndicator 
                {...props} 
                isSoliditySelected={isSoliditySelected} 
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