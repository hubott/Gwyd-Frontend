"use client";
import { useState, useMemo, useCallback, memo } from "react";
import { Navbar } from "~/app/_components/navbar";

type PlayerData = Record<string, string | number | boolean>;

type ApiResponse = PlayerData | PlayerData[] | { error: string };

const ResultsTable = memo(function ResultsTable({ data }: { data: ApiResponse }) {
  const allKeys = useMemo(() => {
    if (data && !('error' in data)) {
      return Object.keys(data instanceof Array ? data[0] ?? {} : data);
    }
    return [];
  }, [data]);

  const displayData = useMemo(() => {
    if (data instanceof Array) {
      return data[0];
    }
    return data;
  }, [data]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Player Statistics</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ height: 'auto', maxHeight: '400px', overflowY: 'auto', overflowX: 'auto' }}>
        <table className="min-w-full bg-white border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr>
              {allKeys.map((key: string) => (
                <th
                  key={key}
                  className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b"
                  style={{ width: `${100 / allKeys.length}%` }}
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              {allKeys.map((key: string) => {
                const dataValue = (displayData as PlayerData)[key];
                return (
                  <td key={key} className="px-4 py-2 text-sm text-gray-600 border-b" style={{ width: `${100 / allKeys.length}%` }}>
                    {dataValue ?? 'N/A'}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default function IndividualPage() {
  const [characterInput, setCharacterInput] = useState("");
  const [days, setDays] = useState(30);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [kp, setKp] = useState("RBPP");

  const fetchData = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setData(null);
    try {
      if (!characterInput.trim()) {
        throw new Error("Please enter a character name");
      }

      const res = await fetch(
        `https://gwyd-production.up.railway.app/individual?character=${encodeURIComponent(
          characterInput.trim()
        )}&days=${days}&KP=${kp}`
      );

      if (!res.ok) {
        // If API returns HTML (404 etc), capture it
        const text = await res.text();
        throw new Error(`API returned ${res.status}: ${text}`);
      }

      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch (err) {
      setData({ error: (err as Error).message });
    } finally {
      setIsLoading(false);
    }
  }, [characterInput, days]);

  return (
    <div>
        <title>Individual Stats - Gwyd-KP</title>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h1 className="text-3xl font-bold">Individual Player Stats</h1>
            <p className="text-purple-100 mt-2">
              Raid attend % for a given player over the last N days in a specific KP. Enter a player name and number of days to fetch their statistics.
            </p>
          </div>

          {/* Form Section */}
          <div className="p-6 bg-gray-50 border-b">
            <form onSubmit={fetchData} className="space-y-6">
              {/* Character Input */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Player Name
                </label>
                <input
                  type="text"
                  value={characterInput}
                  disabled={isLoading}
                  onChange={(e) => setCharacterInput(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    isLoading ? "border-gray-200 bg-gray-50 cursor-not-allowed" : "border-gray-300"
                  }`}
                  placeholder="Enter player name (e.g., FrozenRage)"
                />
              </div>

              {/* Days Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Days
                </label>
                <input
                  type="number"
                  value={days}
                  disabled={isLoading}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    isLoading ? "border-gray-200 bg-gray-50 cursor-not-allowed" : "border-gray-300"
                  }`}
                  placeholder="Range in days (e.g., 30)"
                />
              </div>

              <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    KP Sheet
                  </label>
                  <select
                    value={kp}
                    disabled={isLoading}
                    onChange={e => setKp(e.target.value)}
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
              <div className="flex items-center justify-center py-12 text-gray-600">
                <svg
                  className="animate-spin h-8 w-8 mr-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-lg font-medium">Fetching player statistics...</span>
              </div>
            )}

            {data && !isLoading && 'error' in data && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{(data as { error: string }).error}</div>
                  </div>
                </div>
              </div>
            )}

            {data && !isLoading && !('error' in data) && <ResultsTable data={data} />}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}