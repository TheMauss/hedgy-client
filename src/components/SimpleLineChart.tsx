import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
};

// Assume the data prop will be the array of hourly data passed to this component
const SimpleLineChart = ({ data, toggleState, selectedCurrency }) => {
  // Check if data is an array before mapping
  const formattedData = Array.isArray(data)
    ? data.map((entry) => ({
        time: formatDate(entry.hour), // Convert hour to a readable date/time string
        valueToShow:
          toggleState === "LONG"
            ? selectedCurrency === "SOL"
              ? (entry.solPnl / 1_000_000_000).toFixed(3) // solPnl for SOL
              : (entry.usdcPnL / 1_000_000_000_000_000).toFixed(3) // usdcPnL for USD assuming conversion
            : selectedCurrency === "SOL"
              ? (entry.solRoi * 100).toFixed(3) // solRoi as percentage for SOL
              : (entry.usdcRoi * 100).toFixed(3), // usdcRoi as percentage for USD
      }))
    : [];

  // Function to get value based on toggleState and selectedCurrency
  const getValue = (item) => {
    if (toggleState === "LONG") {
      return selectedCurrency === "SOL"
        ? (item.solPnl ?? 0) / 1_000_000_000
        : (item.usdcPnL ?? 0) / 1_000_000_000_000_000; // Assuming 1_000_000 is the scale for usdcPnL
    } else {
      return (item.solRoi ?? 0) * 100; // Here assuming the same scaling for ROI in both currencies
    }
  };

  const minY = Math.min(...(data?.map(getValue) ?? []));
  const maxY = Math.max(...(data?.map(getValue) ?? []));

  // Add some padding
  const padding = (maxY - minY) * 0.15; // Use 15% padding as you have updated

  const formatTick = (tickItem) => {
    // Ensure we have a number and limit the decimal places to 2
    return tickItem.toFixed(2);
  };

  const axisLineStyle = {
    stroke: "161722", // Replace 'green' with your desired color for the axis lines
  };

  const tickLineStyle = {
    stroke: "434557", // Replace 'red' with your desired color for the tick lines
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={formattedData}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <XAxis
          dataKey="time"
          axisLine={axisLineStyle}
          tickLine={tickLineStyle}
        />
        <YAxis
          axisLine={axisLineStyle}
          tickLine={tickLineStyle}
          domain={[minY - padding, maxY + padding]}
          tickFormatter={formatTick} // Updated line
        />

        <Line
          type="monotone"
          dataKey="valueToShow"
          stroke="#34c796"
          activeDot={{ r: 8 }}
          dot={false}
          strokeWidth={3}
        />
        <ReferenceLine y={0} stroke="#ffffff24" strokeWidth={1} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SimpleLineChart;
