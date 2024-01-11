import io from 'socket.io-client';
import { priceDataState } from '../src/components/globalStatse'; // Import your global state

const ENDPOINT4 = process.env.NEXT_PUBLIC_ENDPOINT4;
const socket = io(ENDPOINT4);
const lastBarsCache = new Map();

socket.on('connect', () => console.log('[WebSocket] Connected'));
socket.on('connect_error', (error) => console.error('[WebSocket] Connect Error:', error));
  // Define the description based on the symbol name


const datafeed = {
    onReady: cb => setTimeout(() => cb({ supported_resolutions: ["1","5","15", "60", "240", "1D"] }), 0),
    searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {},
    resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
      let description;
      if (symbolName === 'Crypto.SOL/USD') {
        description = 'SOL/USD';
      } else if (symbolName === 'Crypto.BTC/USD') {
        description = 'BTC/USD';
      } else if (symbolName === 'Crypto.BONK/USD') {
        description = 'BONK/USD';
      } else if (symbolName === 'Crypto.PYTH/USD') {
        description = 'PYTH/USD';
      } else {
        // Handle other cases or set a default description
        description = symbolName;
      }
      let pricescale;
      if (symbolName === 'Crypto.SOL/USD') {
        pricescale = 1000;
      } else if (symbolName === 'Crypto.BTC/USD') {
        pricescale = 10;
      } else if (symbolName === 'Crypto.BONK/USD') {
        pricescale = 100000000;
      } else if (symbolName === 'Crypto.PYTH/USD') {
        pricescale = 1000;
      } else {
        // Handle other cases or set a default description
        pricescale = 100;
      }
        setTimeout(() => {
          onSymbolResolvedCallback({
            name: symbolName,
            ticker: symbolName,
            description: description,
            type: 'crypto',
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: 'PopFi',
            minmov: 1,
            pricescale: pricescale,
            has_intraday: true,
            has_no_volume: true,
            has_weekly_and_monthly: true,
            supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D'],
            // other required properties...
          });
        }, 0);
      },      
    getBars: (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback, firstDataRequest) => {

        const { from, to } = periodParams
        console.log('[getBars]: Emitting data', { symbol: symbolInfo.ticker, from: from , to: to, resolution: resolution,  });

        socket.emit('subscribe', { symbol: symbolInfo.ticker, from: from , to: to, resolution: resolution,   });
      
        socket.on('prices', (response) => {
            console.log('[getBars]: History data received', response);
        
            if (response.error) {
                console.error('[getBars]: Error in fetching history', response.error);
                onErrorCallback(response.error);
                return;
            }
        
    // Assuming the response is an array of {time, open, high, low, close} objects
    const bars = response.map(bar => {
        return {
            time: bar.time * 1000, // Convert time to milliseconds if needed
            open: bar.open / 1e8,
            high: bar.high/ 1e8 ,
            low: bar.low / 1e8,
            close: bar.close/ 1e8
        };
    });
        
            console.log('[getBars]: Processed bars', bars);
            onHistoryCallback(bars, { noData: bars.length === 0 });
        });
        
    },
    subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID) => {
      const handleNewPriceData = (priceData) => {
        if (priceData) {
          // Validate the timestamp
          if (typeof priceData.timestamp !== 'string' || isNaN(priceData.timestamp)) {
            console.error('Invalid timestamp:', priceData.timestamp);
            return; // or handle this case appropriately
          }
      
          // Convert to milliseconds and create a Date object
          const dateTime = priceData.timestamp * 1000;
      
          // Validate the Date object
          if (isNaN(dateTime)) {
            console.error('Invalid date created from timestamp:', priceData.timestamp);
            return; // or handle this case appropriately
          }
      
          // Proceed to create the bar object
          const bar = {
            time: dateTime, // This should now be valid
            open: priceData.price / 1e8, // Adjust according to your data
            high: priceData.price / 1e8,
            low: priceData.price / 1e8,
            close: priceData.price / 1e8,
          };
          onRealtimeCallback(bar);
        }
      };
  
      // Subscribe to updates for the given symbol
      priceDataState.subscribe(symbolInfo.ticker, handleNewPriceData);
    },
      unsubscribeBars: (subscriberUID) => {
      },
    
    // ... other required methods ...
  };
  

export default datafeed