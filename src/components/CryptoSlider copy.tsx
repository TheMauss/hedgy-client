import React, { useState, useEffect, useRef } from "react";

const CryptoSlider = ({ cryptoPairs }) => {
  const sliderRef = useRef(null);
  const [translateX, setTranslateX] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setTranslateX((prevTranslateX) => prevTranslateX - 1); // Adjust the speed if necessary
    }, 20); // Adjust interval for speed

    setIntervalId(id);

    return () => clearInterval(id);
  }, []);

  const handleMouseOver = () => {
    setIsHovering(true);
    clearInterval(intervalId);
  };

  const handleMouseOut = () => {
    setIsHovering(false);
    const id = setInterval(() => {
      setTranslateX((prevTranslateX) => prevTranslateX - 1); // Adjust the speed if necessary
    }, 20); // Adjust interval for speed
    setIntervalId(id);
  };

  // Adjust the sliding effect based on hover state
  useEffect(() => {
    if (isHovering) {
      sliderRef.current.style.transition = "transform 1s ease-out";
    } else {
      sliderRef.current.style.transition = "transform 0.5s ease-out";
    }
  }, [isHovering]);

  return (
    <div
      className="crypto-slider-container w-full"
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <div
        className="crypto-slider-content w-full"
        style={{ transform: `translateX(${translateX}px)` }}
        ref={sliderRef}
      >
        {cryptoPairs.map((pair) => (
          <div className="crypto-pair" key={pair.name}>
            {pair.name} - {pair.price}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoSlider;
