import React, { useRef, useEffect, useState } from 'react';
import { ResolutionString } from '../charting_library'
import datafeed from '../../utils/datafeed'
import { colors } from '@react-spring/shared';
import { timeStamp } from 'console';

const chartingLibraryPath = '../charting_library/'

interface Price {
  _id: string;
  symbol: string;
  price: number;
  timestamp: string;
}

interface Position {
  _id: string;
  futuresContract: string;
  playerAcc: string;
  initialPrice: number;
  betAmount: number;
  priceDirection: number;
  leverage: number,
  stopLossPrice: number,
  takeProfitPrice: number,
  liquidationPrice: number,
  symbol: number;
  resolved: boolean;
  winner: string | null;
  finalPrice: number;
  currentPrice: number;
  pnl: number;
  timestamp: number;
}

interface ChartComponentProps {
  symbol: string;
  latestOpenedPosition: Record<string, Position | null>;  // Add this line
  prices: { [key: string]: { price: number, timestamp: string } };
}

const ChartComponent: React.FC<ChartComponentProps> = ({ symbol, latestOpenedPosition }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const lineRefs = useRef<{ [key: string]: any }>({}); // Store references to the lines
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const positionLinesRef = useRef([]);
  const [positionLines, setPositionLines] = useState([]);
  const [positionArrows, setPositionArrows] = useState([]);

  const SYMBOL_MAPPING = {
    "Crypto.SOL/USD": "0", // Assuming '0' is the key for SOL in latestOpenedPosition
    "Crypto.BTC/USD": "1", // Assuming '1' is the key for BTC
    // Add more mappings if needed
  };


        // Define your custom color scheme
        const customColorScheme = {
          "paneProperties.background": "#151722",
        "paneProperties.backgroundType": "solid",
      'paneProperties.vertGridProperties.color': '#1d202f',
      'paneProperties.horzGridProperties.color': '#1d202f',
      'paneProperties.separatorColor': '#151722',
      'paneProperties.legendProperties.backgroundTransparency': 100,
      // Axis and scales
      'scalesProperties.textColor': '#CCC',
      'scalesProperties.lineColor': '#555555',
      'scalesProperties.axisLineToolLabelBackgroundColorActive': '#555555',

      'mainSeriesProperties.barStyle.downColor': '',
      'mainSeriesProperties.barStyle.upColor': '#20b482',

      // Crosshair
      'paneProperties.crossHairProperties.color': '#909090',
          // Add more overrides for grid, background, text colors, etc.

          'timeScaleProperties.backgroundColor': '#2b2b43', // Set the color for the bottom bar
          'timeScaleProperties.textColor': '#2b2b43', // Text color for the bottom bar
        };
      
        const updateChartLines = (position: Position | null) => {
          const widget = widgetRef.current;
          if (!widget || !position) return;
      
          const chart = widget.chart();
          const { initialPrice, stopLossPrice, takeProfitPrice, liquidationPrice, timestamp } = position;
          console.log("tradeposition",position)
          // Update or create initial price line
          const createPositionLine = (price, title, color, timestamp) => {
            console.log(`Creating position line: ${title} at price ${price}`);


            try {
              const line = chart.createPositionLine()
              .setPrice(Number(price))
              .setText(title)
              .setLineStyle(3)
              .setQuantity('')
              .setLineColor(color); // Set line color here// Adjust style as needed
              // Instead of pushing to positionLinesRef.current, update the state
              setPositionLines(prevLines => [...prevLines, line]);

            } catch (error) {
              console.error(`Error creating position line: ${error.message}`);
            }
          };

          const createOrUpdateArrow = (position) => {
            const widget = widgetRef.current;
            if (!widget || !position) return;
        
            const chart = widget.chart();
            const { timestamp, direction, color } = position; // Add direction and color properties to your position object if necessary
        
            // Check if an arrow for this position already exists
            const existingArrowIndex = positionArrows.findIndex(arrow => arrow.timestamp === timestamp);
            let arrow;
            if (existingArrowIndex !== -1) {
              // Update existing arrow
              arrow = positionArrows[existingArrowIndex];
              // Update arrow properties as necessary
            } else {
              // Create new arrow
              try {
                arrow = chart.createExecutionShape()
                  .setArrowColor(color)
                  .setDirection(direction)
                  .setTime(timestamp);
              } catch (error) {
                console.error(`Error creating arrow: ${error.message}`);
                return;
              }
            }
        
            // Update state
            setPositionArrows(prevArrows => {
              if (existingArrowIndex !== -1) {
                return prevArrows.map((a, index) => index === existingArrowIndex ? arrow : a);
              } else {
                return [...prevArrows, arrow];
              }
            });
          };
          
        
// Create lines for each price point
if (initialPrice) {
  console.log(`Initial Price (raw): ${initialPrice}`);
  const formattedPrice = initialPrice / 1e8; // or use initialPrice directly if already in correct scale
  console.log(`Initial Price (formatted): ${formattedPrice}`);
  createPositionLine(formattedPrice, 'Entry Price', '#a9aab7', timestamp);
}

// Create lines for each price point
if (liquidationPrice && stopLossPrice === 0) {
  console.log(`Initial Price (raw): ${liquidationPrice}`);
  const formattedPrice = liquidationPrice / 1e8; // or use initialPrice directly if already in correct scale
  console.log(`Initial Price (formatted): ${formattedPrice}`);
  createPositionLine(formattedPrice, 'Liquidation Price', '#C44141', timestamp);
} else if (stopLossPrice != 0)
{
    console.log(`Initial Price (raw): ${stopLossPrice}`);
    const formattedPrice = stopLossPrice / 1e8; // or use initialPrice directly if already in correct scale
    console.log(`Initial Price (formatted): ${formattedPrice}`, );
    createPositionLine(formattedPrice, 'Stop Loss', '#C44141', timestamp);

}


// Create lines for each price point
if (takeProfitPrice != 0) {
  console.log(`Initial Price (raw): ${takeProfitPrice}`);
  const formattedPrice = takeProfitPrice / 1e8; // or use initialPrice directly if already in correct scale
  console.log(`Initial Price (formatted): ${formattedPrice}`);
  createPositionLine(formattedPrice, 'Take Profit', '#34C796', timestamp);
}



          // Repeat for other prices like stopLossPrice, takeProfitPrice, etc.
        };

        const removePositionLinesFromChart = () => {
          positionLinesRef.current.forEach(line => {
              try {
                  line.remove(); // Remove line using the charting library's method
              } catch (error) {
                  console.error(`Error removing position line: ${error.message}`);
              }
          });
          positionLinesRef.current = []; // Clear the references
      };
  
      // Function to update the state and remove lines
      const removePositionLines = () => {
          removePositionLinesFromChart(); // Remove lines from the chart
          // No need to update the state if it's just for holding references
      };

        useEffect(() => {
          const index = SYMBOL_MAPPING[symbol]; 
          const position = latestOpenedPosition[index];
      
          if (position) {
            console.log("Position data for symbol:", symbol, position);
            removePositionLines();
            updateChartLines(position);
          } else {
            console.log("No position data for symbol:", symbol);
          }
          if (widgetRef.current) {
            const position = latestOpenedPosition[symbol];
            updateChartLines(position);
          }
        }, [latestOpenedPosition, symbol, widgetRef.current]);
    


      useEffect(() => {
      if (typeof window !== 'undefined' && window.TradingView && chartContainerRef.current) {
        const widget = new window.TradingView.widget({
          container: chartContainerRef.current,
          locale: 'en',
          library_path: chartingLibraryPath,
          datafeed: datafeed,
          symbol: symbol,
          interval: '1' as ResolutionString,
          fullscreen: false,
          autosize: true,
          debug: true,
          overrides: customColorScheme,
          theme: "dark",
          toolbar_bg: "#151722",

          enabled_features: ["hide_left_toolbar_by_default"],
          disabled_features: [
            "header_symbol_search",
            "header_compare",
            "border_around_the_chart",
            "use_localstorage_for_settings",
            "adaptive_logo",
            "header_fullscreen_button",
            "adaptive_logo",
            "header_undo_redo",
            "popup_hints",
            "timeframes_toolbar"
        ]
      });

      widget.onChartReady(() => {
        widgetRef.current = widget;
        const position = latestOpenedPosition[symbol];
        updateChartLines(position);
      });

      return () => {
        if (widget && widget.remove) {
          widget.remove();
        }
      };
    }
  }, [symbol, containerSize]);


  
    return <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />;
  };
export default ChartComponent;
