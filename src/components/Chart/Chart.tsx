import React, { useRef, useEffect, useState, FC, useCallback } from "react";
import { ResolutionString } from "../../charting_library/charting_library";
import datafeed from "../../../utils/datafeed";
const chartingLibraryPath = "../charting_library/";
import localForage from "localforage";
import {
  BinaryOptionPosition,
  FutureContractPosition,
} from "components/GraphNew";
import {
  CloseFutContAccounts,
  closeFutCont,
} from "../../out/instructions/closeFutCont";
import { v4 as uuidv4 } from "uuid";
import { notify } from "../../utils/notifications";
import {
  ComputeBudgetProgram,
  Connection,
  SystemProgram,
  Transaction,
  TransactionSignature,
  PublicKey,
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { usePriorityFee } from "../../contexts/PriorityFee";
import socketIOClient from "socket.io-client";

interface Props {
  symbol: string;
  latestOpenedPosition: Record<
    string,
    FutureContractPosition | BinaryOptionPosition | null
  >;
  prices: { [key: string]: { price: number; timestamp: string } };
}

const SYMBOL_MAPPING = {
  "Crypto.SOL/USD": "0",
  "Crypto.BTC/USD": "1",
  "Crypto.PYTH/USD": "2",
  "Crypto.BONK/USD": "3",
  "Crypto.JUP/USD": "4",
  "Crypto.ETH/USD": "5",
  "Crypto.TIA/USD": "6",
  "Crypto.SUI/USD": "7",
  // Add more mappings if needed
};

const ENDPOINT5 = process.env.NEXT_PUBLIC_ENDPOINT13;
const ENDPOINT2 = process.env.NEXT_PUBLIC_ENDPOINT2;

const getPriorityFeeEstimate = async () => {
  try {
    const rpcUrl = ENDPOINT5;

    const requestData = {
      jsonrpc: "2.0",
      id: "1",
      method: "getPriorityFeeEstimate",
      params: [
        {
          accountKeys: ["PopFiDLVBg7MRoyzerAop6p85uxdM73nSFj35Zjn5Mt"],
          options: {
            includeAllPriorityFeeLevels: true,
          },
        },
      ],
    };

    const response = await axios.post(rpcUrl, requestData);

    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = response.data;
    if (responseData.error) {
      throw new Error(
        `RPC error! Code: ${responseData.error.code}, Message: ${responseData.error.message}`
      );
    }

    return (responseData.result.priorityFeeLevels.veryHigh + 300).toFixed(0);
  } catch (error) {
    console.error("Error fetching priority fee estimate:", error);
  }
};

const useChartComponent = (
  symbol: string,
  latestOpenedPosition: Record<
    string,
    FutureContractPosition | BinaryOptionPosition | null
  >
) => {
  const [linesVisible, setLinesVisible] = useState(true);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const linesVisibleRef = useRef(linesVisible);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef(null);
  const positionLinesRef = useRef([]);

  const { connection } = useConnection();
  const { sendTransaction } = useWallet();
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toString() || "";
  const { isPriorityFee } = usePriorityFee();

  const socketRef = useRef(null);

  useEffect(() => {
    // Establish socket connection
    socketRef.current = socketIOClient(ENDPOINT2);

    // Define event listeners
    socketRef.current.on("connect", () => {
      console.log("Connected to socket server");
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    // Handle reconnection logic
    // socketRef.current.on('reconnect_attempt', () => {
    //   console.log('Attempting to reconnect');
    // });

    // socketRef.current.on('reconnect', (attemptNumber) => {
    //   console.log(`Reconnected after ${attemptNumber} attempts`);
    // });

    // socketRef.current.on('reconnect_error', (error) => {
    //   console.error('Reconnection error:', error);
    // });

    // socketRef.current.on('reconnect_failed', () => {
    //   console.error('Reconnection failed');
    // });

    // // Example: handle a custom event
    // socketRef.current.on('your_event', (data) => {
    //   console.log('Received data:', data);
    // });

    // Cleanup connection on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const sendSymbol = (symbol) => {
    if (socketRef.current && publicKey?.toString() !== "") {
      const messageObject = {
        symbol: symbol,
        active: true,
      };
      // socketRef.current.emit("symbolUpdate", messageObject);
    }
  };

  const resolveFutCont = async (position: FutureContractPosition) => {
    const transactionId = uuidv4();

    const accounts: CloseFutContAccounts = {
      futCont: new PublicKey(position.futuresContract),
      playerAcc: new PublicKey(walletAddress),
    };

    let PRIORITY_FEE_IX;

    if (isPriorityFee) {
      const priorityfees = await getPriorityFeeEstimate();
      PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: priorityfees,
      });
    } else {
      PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 0,
      });
    }

    // Create the transaction
    const transaction = new Transaction()
      .add(closeFutCont(accounts))
      .add(PRIORITY_FEE_IX);

    let signature: TransactionSignature = "";
    try {
      // Send the transaction
      sendSymbol(position.symbol);
      signature = await sendTransaction(transaction, connection);
      notify({
        id: transactionId,
        type: "info",
        message: `Closing the Position`,
      });

      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");
      notify({
        id: transactionId,
        type: "success",
        message: `Closing Order Created`,
      });
      // Optionally, show a success notification
    } catch (error: any) {
      console.error("Transaction failed:", error);
      // Optionally, show an error notification
      notify({
        id: transactionId,
        type: "error",
        message: `Contract resolution failed`,
        description: error?.message,
        txid: signature,
      });
    }
  };

  const updateChartLines = (
    position: FutureContractPosition | BinaryOptionPosition | null
  ) => {
    const widget = widgetRef.current;
    if (!widget || !position) return;
    const invalidPosition = {
      betAmount: "not a number",
      leverage: "not a number",
    };
    const chart = widget.chart();
    const { initialPrice } = position;
    // Create lines for each price point - Binary Options and Future Contracts
    if (initialPrice) {
      const formattedPrice = initialPrice / 1e8;
      const title = position.priceDirection === 0 ? "Long" : "Short";
      const color = position.priceDirection === 0 ? "#39ca9a" : "#e04456";
      const textcolor = position.priceDirection === 0 ? "#39ca9a" : "#e04456";

      createPositionLine(
        formattedPrice,
        title,
        color,
        chart,
        textcolor,
        position
      );
    }

    // Only Future Contracts
    if ("stopLossPrice" in position) {
      const { stopLossPrice, takeProfitPrice, liquidationPrice } = position;
      // Create lines for each price point
      if (liquidationPrice && stopLossPrice === 0) {
        const formattedPrice = liquidationPrice / 1e8;
        createPositionLine(
          formattedPrice,
          "Liquidation Price",
          "#e04456",
          chart,
          "#e04456",
          invalidPosition
        );
      } else if (stopLossPrice !== 0) {
        const formattedPrice = stopLossPrice / 1e8;
        createPositionLine(
          formattedPrice,
          "Stop Loss",
          "#e04456",
          chart,
          "#e04456",
          invalidPosition
        );
      }

      // Create lines for each price point
      if (takeProfitPrice !== 0) {
        const formattedPrice = takeProfitPrice / 1e8;
        createPositionLine(
          formattedPrice,
          "Take Profit",
          "#34C796",
          chart,
          "#23EEA4",
          invalidPosition
        );
      }
    }
  };

  const createPositionLine = (
    price,
    title,
    color,
    chart,
    bodycolor,
    position
  ) => {
    try {
      const line = chart
        .createPositionLine()
        .setPrice(Number(price))
        .setText(title)
        .setLineStyle(1)
        .setLineColor(color)
        .setBodyBackgroundColor("#222222")
        .setBodyBorderColor("")
        .setBodyTextColor(bodycolor);
      // Set line color here

      // Optionally set quantity if provided
      if (
        position &&
        typeof position.betAmount === "number" &&
        typeof position.leverage === "number" &&
        !isNaN(position.betAmount) &&
        !isNaN(position.leverage)
      ) {
        const quantity = (position.betAmount * position.leverage) / 1000000000;
        const quantitySOLorUSDC =
          position.usdc === 1 ? quantity * 1000 : quantity;
        const unit = position.usdc === 1 ? "USDC" : "SOL";
        line.setQuantity(`${quantitySOLorUSDC.toFixed(2)} ${unit}`);
        line.onClose("onClose called", function (text) {
          resolveFutCont(position);
        });

        if (position.priceDirection === 0) {
          line
            .setCloseButtonBorderColor("")
            .setCloseButtonBackgroundColor("#222222")
            .setCloseButtonIconColor("#23EEA4")

            .setQuantityBorderColor("")
            .setQuantityBackgroundColor("#222222");
        } else {
          line
            .setCloseButtonBorderColor("")
            .setCloseButtonBackgroundColor("#222222")
            .setCloseButtonIconColor("#e04456")

            .setQuantityBorderColor("")
            .setQuantityBackgroundColor("#222222");
        }
      } else {
        console.log("Invalid or undefined position:", position);
        line.setQuantity("");
      }

      positionLinesRef.current.push(line);
    } catch (error) {
      console.error(`Error creating position line: ${error.message}`);
    }
  };

  const removePositionLines = () => {
    positionLinesRef.current.forEach((line) => {
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
    const graphPreferences = JSON.stringify(
      widgetRef.current
        .activeChart()
        .createStudyTemplate({ saveSymbol: false, saveInterval: false })
    );
    await localForage.setItem("graph_preferences", graphPreferences);
    console.log("Save graph preferences");
  }, []);

  const setupButtons = useCallback(async () => {
    if (widgetRef.current && isWidgetReady) {
      if ("headerReady" in widgetRef.current)
        await widgetRef.current.headerReady();
      if ("createButton" in widgetRef.current) {
        // Hide positions
        const hidePositionsButton = widgetRef.current.createButton();
        hidePositionsButton.setAttribute(
          "title",
          "Hide Positions from the graph"
        );
        hidePositionsButton.addEventListener(
          "click",
          handleTogglePositionsButtonClick
        );
        hidePositionsButton.textContent = "Hide Positions";
        // Save preferences
        const savePreferencesButton = widgetRef.current.createButton();
        savePreferencesButton.setAttribute("title", "Save used indicators");
        savePreferencesButton.addEventListener(
          "click",
          handleSavePreferencesButtonClick
        );
        savePreferencesButton.textContent = "Save indicators";
      }
    }
  }, [
    widgetRef,
    isWidgetReady,
    handleTogglePositionsButtonClick,
    handleSavePreferencesButtonClick,
  ]);

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
    const initializeWidget = () => {
      if (
        typeof window !== "undefined" &&
        window.TradingView &&
        chartContainerRef.current
      ) {
        const widget = new window.TradingView.widget({
          container: chartContainerRef.current,
          locale: "en",
          library_path: chartingLibraryPath,
          datafeed: datafeed,
          symbol: symbol,
          interval: "15" as ResolutionString,
          fullscreen: false,
          autosize: true,
          loading_screen: {
            backgroundColor: "#080808",
            foregroundColor: "#34C796",
          },
          theme: "dark",
          custom_css_url: "/tv.css",

          toolbar_bg: "#080808",
          enabled_features: ["hide_left_toolbar_by_default"],
          overrides: {
            "mainSeriesProperties.candleStyle.upColor": "#39ca9a",
            "mainSeriesProperties.candleStyle.downColor": "#e04456",
            "mainSeriesProperties.candleStyle.borderUpColor": "#39ca9a",
            "mainSeriesProperties.candleStyle.borderDownColor": "#e04456",
            "mainSeriesProperties.candleStyle.wickUpColor": "#39ca9a",
            "mainSeriesProperties.candleStyle.wickDownColor": "#e04456",

            "paneProperties.background": "#080808",
            "paneProperties.backgroundType": "solid",
            "paneProperties.vertGridProperties.color": "#ffffff12",
            "paneProperties.horzGridProperties.color": "#ffffff12",
            "paneProperties.separatorColor": "#080808",
            "paneProperties.legendProperties.backgroundTransparency": 100,
            // Axis and scales
            "scalesProperties.textColor": "#CCC",
            "scalesProperties.lineColor": "#555555",
            "scalesProperties.axisLineToolLabelBackgroundColorActive":
              "#ffffff12",

            "mainSeriesProperties.barStyle.downColor": "",
            "mainSeriesProperties.barStyle.upColor": "#20b482",

            // Crosshair
            "paneProperties.crossHairProperties.color": "#909090",
            // Add more overrides for grid, background, text colors, etc.

            "timeScaleProperties.backgroundColor": "#2b2b43", // Set the color for the bottom bar
            "timeScaleProperties.textColor": "#2b2b43", // Text color for the bottom bar
          },
          disabled_features: [
            "header_symbol_search",
            "header_compare",
            "border_around_the_chart",

            "adaptive_logo",
            "adaptive_logo",
            "header_undo_redo",
            "popup_hints",
            "timeframes_toolbar",
            "property_pages",
            "header_screenshot",
          ],
        });

        widget.onChartReady(async () => {
          widgetRef.current = widget;
          setIsWidgetReady(true);
          const graphPreferences = (await localForage.getItem(
            "graph_preferences"
          )) as string;
          if (graphPreferences) {
            widgetRef.current
              .activeChart()
              .applyStudyTemplate(JSON.parse(graphPreferences));
          }
          widget.applyOverrides({
            "mainSeriesProperties.candleStyle.upColor": "#39ca9a",
            "mainSeriesProperties.candleStyle.downColor": "#e04456",
            "mainSeriesProperties.candleStyle.borderUpColor": "#39ca9a",
            "mainSeriesProperties.candleStyle.borderDownColor": "#e04456",
            "mainSeriesProperties.candleStyle.wickUpColor": "#39ca9a",
            "mainSeriesProperties.candleStyle.wickDownColor": "#e04456",

            "paneProperties.background": "#080808",
            "paneProperties.backgroundType": "solid",
            "paneProperties.vertGridProperties.color": "#ffffff12",
            "paneProperties.horzGridProperties.color": "#ffffff12",
            "paneProperties.separatorColor": "#080808",
            "paneProperties.legendProperties.backgroundTransparency": 100,
            // Axis and scales
            "scalesProperties.textColor": "#CCC",
            "scalesProperties.lineColor": "#555555",
            "scalesProperties.axisLineToolLabelBackgroundColorActive":
              "#ffffff12",

            "mainSeriesProperties.barStyle.downColor": "",
            "mainSeriesProperties.barStyle.upColor": "#20b482",

            // Crosshair
            "paneProperties.crossHairProperties.color": "#909090",
            // Add more overrides for grid, background, text colors, etc.

            "timeScaleProperties.backgroundColor": "#2b2b43", // Set the color for the bottom bar
            "timeScaleProperties.textColor": "#2b2b43", // Text color for the bottom bar
            // ... other overrides you want to change or add
          });
        });

        return () => {
          if (widget && widget.remove) {
            widget.remove();
          }
        };
      }
    };
    if (
      typeof window !== "undefined" &&
      window.TradingView &&
      chartContainerRef.current
    ) {
      // Set a timeout to delay the widget initialization
      const timer = setTimeout(() => initializeWidget(), 1000); // Delay for 1 second

      // Clean up function to clear the timeout
      return () => clearTimeout(timer);
    }
  }, [symbol]);

  useEffect(() => {
    setupButtons();
  }, [widgetRef, isWidgetReady, setupButtons]);

  return { chartContainerRef };
};

export const Chart: FC<Props> = ({ symbol, latestOpenedPosition }) => {
  const { chartContainerRef } = useChartComponent(symbol, latestOpenedPosition);

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />
  );
};
