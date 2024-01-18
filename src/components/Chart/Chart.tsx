import React, { useRef, useEffect, useState, FC, useCallback } from 'react';
import { ResolutionString } from '../../charting_library/charting_library'
import datafeed from '../../../utils/datafeed'
const chartingLibraryPath = '../charting_library/'
import localForage from "localforage";
import { BinaryOptionPosition, FutureContractPosition } from 'components/GraphNew';

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
}

interface Props {
  symbol: string;
  latestOpenedPosition: Record<string, FutureContractPosition | BinaryOptionPosition | null>;
  prices: { [key: string]: { price: number, timestamp: string } };
}

const SYMBOL_MAPPING = {
  "Crypto.SOL/USD": "0",
  "Crypto.BTC/USD": "1",
  "Crypto.PYTH/USD": "2",
  "Crypto.BONK/USD": "3",
  // Add more mappings if needed
};

// Define your custom color scheme
const customColorScheme = {
  "mainSeriesProperties.candleStyle.upColor": "#0B7A55",
  "mainSeriesProperties.candleStyle.downColor": "#7A3636",
  "mainSeriesProperties.candleStyle.borderUpColor": "#34C796",
  "mainSeriesProperties.candleStyle.borderDownColor": "#C44141",
  "mainSeriesProperties.candleStyle.wickUpColor": "#34C796",
  "mainSeriesProperties.candleStyle.wickDownColor": "#C44141",


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

const useChartComponent = (symbol: string, latestOpenedPosition: Record<string, FutureContractPosition | BinaryOptionPosition | null>) => {
  const [linesVisible, setLinesVisible] = useState(true);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const linesVisibleRef = useRef(linesVisible);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef(null);
  const positionLinesRef = useRef([]);

  const updateChartLines = (position: Position | null) => {
    const widget = widgetRef.current;
    if (!widget || !position) return;

    const chart = widget.chart();
    const { initialPrice, stopLossPrice, takeProfitPrice, liquidationPrice } = position;
    // Update or create initial price line
    const createPositionLine = (price, title, color) => {
      try {
        const line = chart.createPositionLine()
          .setPrice(Number(price))
          .setText(title)
          .setLineStyle(3)
          .setQuantity('')
          .setLineColor(color); // Set line color here// Adjust style as needed
        positionLinesRef.current.push(line);
      } catch (error) {
        console.error(`Error creating position line: ${error.message}`);
      }
    };

    // Create lines for each price point
    if (initialPrice) {
      const formattedPrice = initialPrice / 1e8;
      createPositionLine(formattedPrice, 'Entry Price', '#a9aab7');
    }

    // Create lines for each price point
    if (liquidationPrice && stopLossPrice === 0) {
      const formattedPrice = liquidationPrice / 1e8;
      createPositionLine(formattedPrice, 'Liquidation Price', '#C44141');
    } else if (stopLossPrice != 0) {
      const formattedPrice = stopLossPrice / 1e8;
      createPositionLine(formattedPrice, 'Stop Loss', '#C44141');
    }

    // Create lines for each price point
    if (takeProfitPrice != 0) {
      const formattedPrice = takeProfitPrice / 1e8;
      createPositionLine(formattedPrice, 'Take Profit', '#34C796');
    }
  };

  const removePositionLines = () => {
    positionLinesRef.current.forEach(line => {
      try {
        line.remove();
      } catch (error) {
        console.error(`Error removing position line: ${error.message}`);
      }
    });
    positionLinesRef.current = []; // Clear the references
  };

  const handleTogglePositionsButtonClick = useCallback(() => {
    if (linesVisibleRef.current) {
      setLinesVisible(false);
      removePositionLines();
    } else {
      setLinesVisible(true);
    }
  }, []);

  const handleSavePreferencesButtonClick = useCallback(async () => {
    const graphPreferences = JSON.stringify(widgetRef.current.activeChart().createStudyTemplate({ saveSymbol: false, saveInterval: false }));
    await localForage.setItem('graph_preferences', graphPreferences);
    console.log('Save graph preferences');
  }, []);

  const setupButtons = useCallback(async () => {
    if (widgetRef.current && isWidgetReady) {
      if ("headerReady" in widgetRef.current) await widgetRef.current.headerReady();
      if ("createButton" in widgetRef.current) {
        // Hide positions
        const hidePositionsButton = widgetRef.current.createButton();
        hidePositionsButton.setAttribute('title', 'Hide Positions from the graph');
        hidePositionsButton.addEventListener('click', handleTogglePositionsButtonClick);
        hidePositionsButton.textContent = 'Hide Positions';
        // Save preferences
        const savePreferencesButton = widgetRef.current.createButton();
        savePreferencesButton.setAttribute('title', 'Save used indicators');
        savePreferencesButton.addEventListener('click', handleSavePreferencesButtonClick);
        savePreferencesButton.textContent = 'Save indicators';
      }
    }
  }, [widgetRef, isWidgetReady, handleTogglePositionsButtonClick, handleSavePreferencesButtonClick]);

  useEffect(() => {
    linesVisibleRef.current = linesVisible;
  }, [linesVisible]);


  useEffect(() => {
    // Check if the widget is initialized
    if (isWidgetReady) {
      const index = SYMBOL_MAPPING[symbol];
      const position = latestOpenedPosition[index];

      // Check if the position exists or if it's closed/removed
      if (linesVisibleRef.current && position) {
        // If position exists, update the chart lines
        removePositionLines();
        updateChartLines(position);
      } else {
        // If position is closed or removed, remove the lines
        removePositionLines();
      }
    }
  }, [isWidgetReady, latestOpenedPosition, symbol]);

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

      widget.onChartReady(async () => {
        widgetRef.current = widget;
        setIsWidgetReady(true);
        const graphPreferences = await localForage.getItem('graph_preferences') as string;
        if (graphPreferences) {
          widgetRef.current.activeChart().applyStudyTemplate(JSON.parse(graphPreferences));
        }
      });

      return () => {
        if (widget && widget.remove) {
          widget.remove();
        }
      };
    }
  }, [symbol]);

  useEffect(() => {
    setupButtons();
  }, [widgetRef, isWidgetReady, setupButtons]);

  return { chartContainerRef };
}

export const Chart: FC<Props> = ({ symbol, latestOpenedPosition }) => {
  const { chartContainerRef } = useChartComponent(symbol, latestOpenedPosition);

  return <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />;
};
