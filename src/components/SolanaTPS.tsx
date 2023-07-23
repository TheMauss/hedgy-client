import { useEffect, useState } from "react";

function SolanaTPS() {
  const [tps, setTPS] = useState(null);

  useEffect(() => {
    const intervalId = setInterval(fetchTPS, 60000); // update TPS every 15 seconds

    async function fetchTPS() {
        try {
          const response = await fetch('https://frozen-hamlet-77237-31263ec4359d.herokuapp.com/tps');  // Replace with your server's URL
          const json = await response.json();
          setTPS(json.tps);
        } catch (error) {
          console.error("Error fetching TPS, retrying in 5 seconds...", error);
          setTimeout(fetchTPS, 5000);  // Retry after 5 seconds
        }
      }

    fetchTPS();  // Fetch TPS immediately on component mount

    return () => clearInterval(intervalId); // clear interval on component unmount
  }, []);

  const tpsColor = tps > 3000 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="text-slate-300 ml-2">
      <span className={`${tpsColor} mr-1`}>&#9679;</span> 
      TPS: {tps ? tps.toFixed(0) : '-'} 
    </div>
  );
}

export default SolanaTPS;
