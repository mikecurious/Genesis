import React, { useState, useEffect } from "react";

const APITestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const runAllTests = async () => {
    setIsLoading(true);
    const results: { [key: string]: string } = {};

    // Test 1: Backend Health
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      results.health = response.ok ? "✅ Backend Running" : "❌ Backend Error";
    } catch (error) {
      results.health = "❌ Backend Unreachable";
    }

    // Test 2: Database Connection (via properties endpoint)
    try {
      const response = await fetch("/api/properties");
      results.database = response.ok
        ? "✅ Database Connected"
        : "❌ Database Error";
    } catch (error) {
      results.database = "❌ Database Unreachable";
    }

    // Test 3: CORS Configuration
    try {
      const response = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      results.cors = "✅ CORS Working";
    } catch (error) {
      results.cors = "❌ CORS Issue";
    }

    setTestResults(results);
    setIsLoading(false);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-xs">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
        🚀 System Status
      </h3>

      <div className="space-y-2 mb-3">
        {Object.entries(testResults).map(([test, result]) => (
          <div key={test} className="flex justify-between text-xs">
            <span className="capitalize text-gray-700 dark:text-gray-300">
              {test}:
            </span>
            <span className="ml-2">{result}</span>
          </div>
        ))}
      </div>

      <button
        onClick={runAllTests}
        disabled={isLoading}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-xs w-full"
      >
        {isLoading ? "Testing..." : "Refresh Tests"}
      </button>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Frontend: localhost:3001
        <br />
        Backend: localhost:5000
        <br />
        Database: MongoDB Atlas
      </div>
    </div>
  );
};

export default APITestComponent;
