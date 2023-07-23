import React, { useEffect, useRef } from 'react';

let tvScriptLoadingPromise;

export default function TradingViewWidget({ symbol }) {
  const containerId = 'tradingview_110d9';
  const onLoadScriptRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = resolve;

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

    return () => {
      onLoadScriptRef.current = null;
      // Clean up the old widget if it exists
      const widgetContainer = document.getElementById(containerId);
      if (widgetContainer) {
        widgetContainer.innerHTML = '';
      }
    };
  }, [symbol]); // Notice the dependency here

  function createWidget() {
    if (document.getElementById(containerId) && 'TradingView' in window) {
      const TradingView = window.TradingView as any;

      new TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: '1',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        hide_legend: true,
        hide_side_toolbar: false,
        container_id: containerId,
      });
    }
  }

  return (
    <div className="tradingview-widget-container" style={{ width: '100%', height: '100%' }}>
      <div id="tradingview_110d9" style={{ width: '100%', height: '100%' }} />
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener noreferrer" target="_blank">
        </a>
      </div>
    </div>
  );
}
