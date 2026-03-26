import { useState } from "react";

export default function App() {
  const [minVal, setMinVal] = useState(1000);
  const [days, setDays] = useState(30);
  const [playerClass, setPlayerClass] = useState("Mage");
  const [kp, setKp] = useState("GKP");
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const url = `https://gwyd-production.up.railway.app/class?min_val=${minVal}&days=${days}&player_class=${playerClass}&KP=${kp}`;
    
    try {
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>KP Dashboard</h2>

      {/* Inputs */}
      <div style={{ marginBottom: "10px" }}>
        <label>Min KP: </label>
        <input
          type="number"
          value={minVal}
          onChange={(e) => setMinVal(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Days: </label>
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Class: </label>
        <select
          value={playerClass}
          onChange={(e) => setPlayerClass(e.target.value)}
        >
          <option>Warrior</option>
          <option>Druid</option>
          <option>Rogue</option>
          <option>Mage</option>
          <option>Ranger</option>
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>KP Type: </label>
        <select value={kp} onChange={(e) => setKp(e.target.value)}>
          <option>GKP</option>
          <option>DPKP</option>
          <option>VKP</option>
          <option>RBPP</option>
          <option>AKP</option>
          <option>PKP</option>
        </select>
      </div>

      <button onClick={fetchData}>Fetch Data</button>

      {/* Results */}
      <div style={{ marginTop: "20px" }}>
        <h3>Results</h3>
        {data.length === 0 && <p>No data</p>}

        {data.map((player, index) => (
          <div key={index} style={{ marginBottom: "8px" }}>
            <strong>{player["Player Name"]}</strong> — {player["Current"]} KP —{" "}
            {new Date(player["Last Raid"]).toLocaleString()}
          </div>
        ))}
      </div>
    </div>
  );
}