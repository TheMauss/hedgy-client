import React, { FC, useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: FC = () => {
  const [data, setData] = useState(null); // Holds the fetched data
  const [range, setRange] = useState("24h"); // Selected time range
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch data from the backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://riskboard-76585405e3d7.herokuapp.com/data?range=${range}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the range changes
  useEffect(() => {
    fetchData();
  }, [range]);

  // Prepare data for the charts
  const prepareChartData = () => {
    if (!data) return {};

    const timestamps = data.map((item) => {
      const date = new Date(item.timestamp);

      // Conditionally format the labels based on the selected range
      if (range === "24h") {
        return date.toLocaleDateString([], {
          month: "2-digit",
          day: "2-digit",
        }); // Show days for 7d and 30d (MM/DD)
      } else if (range === "7d" || range === "30d") {
        return date.toLocaleDateString([], {
          month: "2-digit",
          day: "2-digit",
        }); // Show days for 7d and 30d (MM/DD)
      } else if (range === "all") {
        return date.toLocaleDateString([], {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        }); // Show full date for "all" (MM/DD/YY)
      }

      return date.toLocaleString(); // Fallback format
    });
    const tvl = data.map((item) => item.tvl / 1e15);
    const premium = data.map((item) => item.premium);

    // Prepare asset-specific data
    const assetsData = {};

    data[0]?.assets.forEach((asset) => {
      const assetName = asset.assetName;
      assetsData[assetName] = {
        fees: [],
        owned: [],
        locked: [],
        utilization: [],
      };
    });

    data.forEach((item) => {
      item.assets.forEach((asset) => {
        const assetName = asset.assetName;

        if (!assetsData[assetName]) {
          assetsData[assetName] = {
            fees: [],
            owned: [],
            locked: [],
            utilization: [],
          };
        }

        // Determine the scaling factor based on asset type
        let scalingFactor = 1e9; // Default for SOL
        if (assetName === "BTC" || assetName === "ETH") {
          scalingFactor = 1e8;
        } else if (assetName === "USDT" || assetName === "USDC") {
          scalingFactor = 1e6;
        }

        // Populate the chart data
        assetsData[assetName].fees.push(asset.feesReserves);
        assetsData[assetName].owned.push(asset.owned / scalingFactor);
        assetsData[assetName].locked.push(asset.locked / scalingFactor);
        assetsData[assetName].utilization.push(asset.utilization);
      });
    });

    return { timestamps, tvl, premium, assetsData };
  };

  const chartData = prepareChartData();

  const renderAssetGraphs = () => {
    if (!chartData.assetsData) return null;

    return Object.keys(chartData.assetsData).map((assetName) => {
      const assetData = chartData.assetsData[assetName];

      // Line chart for Utilization
      const utilizationChart = {
        labels: chartData.timestamps,
        datasets: [
          {
            label: `${assetName} Utilization`,
            data: assetData.utilization,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
          },
        ],
      };

      // Combined Line chart for Owned and Locked
      const ownedLockedChart = {
        labels: chartData.timestamps,
        datasets: [
          {
            label: `${assetName} Owned`,
            data: assetData.owned,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
          },
          {
            label: `${assetName} Locked`,
            data: assetData.locked,
            borderColor: "rgba(153, 102, 255, 1)",
            backgroundColor: "rgba(153, 102, 255, 0.2)",
          },
        ],
      };

      return (
        <div key={assetName} className="w-full flex flex-col md:flex-row mb-4">
          <div className="w-full md:w-1/2">
            <h4>{assetName} Utilization</h4>
            <Line data={utilizationChart} />
          </div>
          <div className="w-full md:w-1/2">
            <h4>{assetName} Owned and Locked</h4>
            <Line data={ownedLockedChart} />
          </div>
        </div>
      );
    });
  };

  const renderFeesCharts = () => {
    if (!chartData.assetsData) return null;

    return Object.keys(chartData.assetsData).map((assetName) => {
      const assetData = chartData.assetsData[assetName];

      // Determine the scaling factor based on asset type
      let scalingFactor = 1e9; // Default for SOL
      if (assetName === "BTC" || assetName === "ETH") {
        scalingFactor = 1e8;
      } else if (assetName === "USDT" || assetName === "USDC") {
        scalingFactor = 1e6;
      }

      // Scale the fees data
      const scaledFees = assetData.fees.map((fee) => fee / scalingFactor);

      // Line chart for Fees
      const feesChart = {
        labels: chartData.timestamps,
        datasets: [
          {
            label: `${assetName} Fees`,
            data: scaledFees,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
          },
        ],
      };

      return (
        <div key={assetName} className="w-full md:w-1/3">
          <h4>{assetName} Fees</h4>
          <Line data={feesChart} />
        </div>
      );
    });
  };

  // Line chart for TVL
  const tvlChart = {
    labels: chartData.timestamps,
    datasets: [
      {
        label: "TVL",
        data: chartData.tvl,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  // Line chart for Premium
  const premiumChart = {
    labels: chartData.timestamps,
    datasets: [
      {
        label: "Premium",
        data: chartData.premium,
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
      },
    ],
  };

  return (
    <div className="text-white flex justify-center items-top min-h-[calc(100vh-172px)] z-100 ">
      <div className="w-[95%] max-w-[1550px]">
        {" "}
        <h1>Dashboard</h1>
        {/* Range Selector */}
        <div className="range-selector mb-4">
          <button onClick={() => setRange("24h")}>24h</button>
          <button onClick={() => setRange("7d")}>7d</button>
          <button onClick={() => setRange("30d")}>30d</button>
          <button onClick={() => setRange("all")}>All</button>
        </div>
        {/* Show loading spinner if data is loading */}
        {loading && <p>Loading...</p>}
        {/* Charts */}
        {!loading && data && (
          <div>
            <div className="flex flex-col items-center justify-center ">
              <div className="w-full flex flex-col md:flex-row mb-4">
                <div className="w-full md:w-1/2">
                  <h2>TVL in Billions</h2>
                  <Line data={tvlChart} />
                </div>
                <div className="w-full md:w-1/2">
                  <h2>Premium</h2>
                  <Line data={premiumChart} />
                </div>
              </div>

              <h2>Asset-Specific Graphs</h2>
              {renderAssetGraphs()}
              <div className=" mb-4">
                <button onClick={() => setRange("24h")}>24h</button>
                <button onClick={() => setRange("7d")}>7d</button>
                <button onClick={() => setRange("30d")}>30d</button>
                <button onClick={() => setRange("all")}>All</button>
              </div>
              <h2>All Fees</h2>
              <div className="w-full flex flex-wrap">{renderFeesCharts()}</div>
            </div>
          </div>
        )}
      </div>{" "}
    </div>
  );
};

export default Dashboard;
