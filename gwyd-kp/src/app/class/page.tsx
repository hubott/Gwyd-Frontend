"use client";
import { useState, useMemo, useCallback, memo } from "react";
import { Navbar } from "~/app/_components/navbar";

interface Player {
  [key: string]: string | number | boolean | undefined;
  class?: string;
  Current?: number;
}

interface ClassData {
  class: string;
  players: Player[];
}

type ApiResponse = ClassData[] | { error: string };

const ResultsTable = memo(function ResultsTable({ data }: { data: ClassData[] }) {
  const { allPlayers, allKeys } = useMemo(() => {
    // Flatten all players from all classes and add class info
    const players = data.flatMap((clsData: ClassData) =>
      clsData.players.map((player: Player) => ({
        ...player,
        class: clsData.class
      }))
    );

    // Sort by Current (assuming Current is a number, sort descending)
    players.sort((a: Player, b: Player) => (b.Current ?? 0) - (a.Current ?? 0));

    // Get all unique keys for table headers (optimized)
    const keys = Array.from(
      new Set(players.flatMap((player: Player) => Object.keys(player)))
    );

    return { allPlayers: players, allKeys: keys };
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Results</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {allPlayers.length} players found
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
        <div className="overflow-x-auto flex-1 flex flex-col">
          <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {allKeys.map(key => (
                  <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: `${100 / allKeys.length}%` }}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 overflow-y-auto">
              {allPlayers.map((player: Player, index: number) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {allKeys.map(key => (
                    <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ width: `${100 / allKeys.length}%` }}>
                      {key === "Last Raid" && player[key]
                        ? new Date(String(player[key])).toLocaleDateString("en-GB") // converts to dd/mm/yyyy
                        : (player[key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
});

export default function ClassPage() {
  const [classes, setClasses] = useState<string[]>(["Mage"]);
  const [minVal, setMinVal] = useState(1000);
  const [days, setDays] = useState(30);
  const [KP, setKP] = useState("GKP");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const allClasses = ["Mage", "Warrior", "Rogue", "Druid", "Ranger"]; // all possible classes

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const c = e.currentTarget.value;
    if (e.target.checked) {
      setClasses(prev => [...prev, c]);
    } else {
      setClasses(prev => prev.filter(cls => cls !== c));
    }
  }, []);

  const fetchData = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const query = classes.map(c => `player_classes=${encodeURIComponent(c)}`).join("&");
      const res = await fetch(`https://gwyd-production.up.railway.app/class?${query}&days=${days}&min_val=${minVal}&KP=${KP}`);
      const json = (await res.json()) as ApiResponse; 
      setData(json);
    } catch (err) {
      setData({ error: (err as Error).message });
    } finally {
      setIsLoading(false);
    }
  }, [classes, days, minVal, KP]);

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h1 className="text-3xl font-bold">Class Stats Dashboard</h1>
            <p className="text-blue-100 mt-2">Analyze player statistics across different classes and KP sheets</p>
          </div>

          {/* Form Section */}
          <div className="p-6 bg-gray-50 border-b">
            <form onSubmit={fetchData} className="space-y-6">
              {/* Classes Section */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Select Classes
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {allClasses.map(c => (
                    <label key={c} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isLoading
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={classes.includes(c)}
                        disabled={isLoading}
                        onChange={handleSelect}
                        value={c}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                      />
                      <span className={`font-medium ${isLoading ? 'text-gray-400' : 'text-gray-700'}`}>{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Parameters Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Minimum Value
                  </label>
                  <input
                    type="number"
                    value={minVal}
                    disabled={isLoading}
                    onChange={e => setMinVal(Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isLoading ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                    }`}
                    placeholder="1000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Days (attended a boss in the last X days)
                  </label>
                  <input
                    type="number"
                    value={days}
                    disabled={isLoading}
                    onChange={e => setDays(Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isLoading ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                    }`}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    KP Sheet
                  </label>
                  <select
                    value={KP}
                    disabled={isLoading}
                    onChange={e => setKP(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isLoading ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 bg-white'
                    }`}
                  >
                    <option value="GKP">GKP</option>
                    <option value="AKP">AKP</option>
                    <option value="PKP">PKP</option>
                    <option value="RBPP">RBPP</option>
                    <option value="DPKP">DPKP</option>
                    <option value="VKP">VKP</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg flex items-center gap-2 ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 hover:shadow-xl cursor-pointer'
                  }`}
                >
                  {isLoading && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isLoading ? 'Loading...' : 'Fetch Statistics'}
                </button>
              </div>
            </form>
          </div>

          {/* Results Section */}
          <div className="p-6">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-gray-600">
                  <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-lg font-medium">Fetching statistics...</span>
                </div>
              </div>
            )}

            {data && !isLoading && !('error' in data) && <ResultsTable data={data} />}

            {data && 'error' in data && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      {(data as { error: string }).error}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}