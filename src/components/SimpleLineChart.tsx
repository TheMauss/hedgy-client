import React from 'react';
import { LineChart, Line, XAxis, YAxis, ReferenceLine, Tooltip, ResponsiveContainer } from 'recharts';

const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  };
  
// Assume the data prop will be the array of hourly data passed to this component
const SimpleLineChart = ({ data, toggleState }) => {

    // Check if data is an array before mapping
    const formattedData = Array.isArray(data)
        ? data.map(entry => ({
              time: formatDate(entry.hour), // Convert hour to a readable date/time string
              valueToShow: toggleState === 'LONG' ? (entry.PnL / 1_000_000_000).toFixed(3) : (entry.Roi ?? 0).toFixed(3),
          }))
        : [];

  const minY = Math.min(...(data?.map(item => item.PnL / 1_000_000_000) ?? []));
  const maxY = Math.max(...(data?.map(item => item.PnL / 1_000_000_000) ?? []));
  
  // Add some padding
  const padding = (maxY - minY) * 0.15; // Use 15% padding as you have updated

  const formatTick = (tickItem) => {
    // Ensure we have a number and limit the decimal places to 2
    return tickItem.toFixed(2);
  };


  const axisLineStyle = {
    stroke: '161722', // Replace 'green' with your desired color for the axis lines
  };

  const tickLineStyle = {
    stroke: '434557', // Replace 'red' with your desired color for the tick lines
  };
  
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={formattedData}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <XAxis dataKey="time" 
                  axisLine={axisLineStyle} 
                  tickLine={tickLineStyle}/>
        <YAxis 
          axisLine={axisLineStyle} 
          tickLine={tickLineStyle}
  domain={[minY - padding, maxY + padding]}
  tickFormatter={formatTick} // Updated line
/>

          <Line type="monotone" dataKey="valueToShow" stroke="#34c796" activeDot={{ r: 8 }} dot={false} strokeWidth={3}/>
          <ReferenceLine y={0} stroke="#434665" strokeWidth={1} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

export default SimpleLineChart;
