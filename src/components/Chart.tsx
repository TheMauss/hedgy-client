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
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
);

const LineChart = () => {
  const data = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        data: [10, 25, 15, 35, 40, 75], // Example data
        borderColor: "rgba(51, 255, 119, 1)",
        fill: true,
        tension: 0.5, // Makes the line smooth
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hides the legend
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false, // Turns off the grid lines for the y-axis
        },
        ticks: {
          callback: function (value) {
            return value + "%"; // Adds percentage sign
          },
        },
      },
      x: {
        grid: {
          display: false, // Turns off the grid lines for the y-axis
        },
        ticks: {
          color: "#ffffff", // Optional: Add custom color for x-axis
        },
      },
    },
  };

  return <Line data={data} options={options} className="md:max-h-[400px]" />;
};

export default LineChart;
