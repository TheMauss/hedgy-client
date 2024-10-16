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
  Filler, // Filler is necessary for area chart fills
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
  Filler // Register Filler plugin for the fill effect
);

const LineChart = ({ labels, dataPoints }) => {
  const firstDataPoint = dataPoints.length > 0 ? dataPoints[0] : 0;

  // Avoid division by zero
  const transformedDataPoints =
    firstDataPoint === 0
      ? dataPoints.map(() => 0)
      : dataPoints.map((point, index) =>
          index === 0 ? 0 : ((point - firstDataPoint) / firstDataPoint) * 100
        );

  // Find the min and max values to adjust the gradient dynamically
  const minValue = Math.min(...transformedDataPoints);
  const maxValue = Math.max(...transformedDataPoints);

  const data = {
    labels: labels,
    datasets: [
      {
        data: transformedDataPoints,
        segment: {
          borderColor: (ctx) =>
            ctx.p1.parsed.y >= 0
              ? "rgba(51, 255, 119, 1)"
              : "rgba(255, 51, 51, 1)",
        },
        fill: true, // Enables the fill effect
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return null; // Return early if the chart area is not available
          }

          // Calculate the ratio of where the origin should be between the min and max
          const range = maxValue - minValue;
          const originYPosition =
            isFinite(range) && range !== 0 ? (0 - minValue) / range : 0.5;

          // Create a gradient for the entire chart area
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );

          // Define the gradient stops based on the dynamic position of the origin
          gradient.addColorStop(0, "rgba(51, 255, 119, 0.6)"); // Green at the top
          gradient.addColorStop(
            Math.max(0, 1 - originYPosition),
            "rgba(0, 0, 0, 0)"
          ); // Transparent at the origin
          gradient.addColorStop(1, "rgba(255, 51, 51, 0.6)"); // Red at the bottom

          return gradient; // Return the created gradient as the background color
        },
        tension: 0.1, // Slightly reduce tension to avoid extreme bends
        pointRadius: 0, // No point markers
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 800, // Increase duration for smoother transitions
    },
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Start the y-axis at 0
        grid: {
          display: false, // No grid lines
        },
        ticks: {
          callback: function (value) {
            return value.toFixed(2) + "%"; // Format y-axis labels as percentages
          },
        },
      },
      x: {
        grid: {
          display: false, // No grid lines
        },
      },
    },
  };

  return <Line data={data} options={options} className="md:max-h-[400px]" />;
};

export default LineChart;
