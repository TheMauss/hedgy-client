import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";

// Register Chart.js components and plugins
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
  Filler
);

const LineChartAPY = ({ labels, dataPoints }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        data: dataPoints, // Directly use APY data
        borderColor: "rgba(51, 255, 119, 1)", // Fixed color for APY
        backgroundColor: "rgba(51, 255, 119, 0.2)", // Soft green background
        fill: true,
        tension: 0.1,
        pointRadius: 0, // No point markers
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 800,
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          callback: function (value) {
            return value.toFixed(2); // Format as APY without percentage sign
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return <Line data={data} options={options} className="md:max-h-[400px]" />;
};

export default LineChartAPY;
