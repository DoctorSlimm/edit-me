'use client';

import { useState, useEffect, useCallback } from 'react';

export default function Counter() {
  const [counter, setCounter] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Initialize counter from localStorage on component mount
  useEffect(() => {
    const storedValue = localStorage.getItem('counterValue');
    if (storedValue !== null) {
      setCounter(parseInt(storedValue, 10));
    }
    setIsLoaded(true);
  }, []);

  // Persist counter to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('counterValue', counter.toString());
    }
  }, [counter, isLoaded]);

  // Increment handler
  const handleIncrement = useCallback(() => {
    setCounter(prev => prev + 1);
  }, []);

  // Decrement handler
  const handleDecrement = useCallback(() => {
    setCounter(prev => prev - 1);
  }, []);

  // Reset handler
  const handleReset = useCallback(() => {
    setCounter(0);
    localStorage.removeItem('counterValue');
  }, []);

  return (
    <div className="bg-blue-600 border-4 border-blue-700 p-8 max-w-md w-full mb-8 shadow-lg">
      <h2 className="text-3xl text-white text-center mb-6 font-bold underline">
        🔢 COUNTER APP 🔢
      </h2>

      <div className="bg-blue-700 border-2 border-blue-400 p-8 rounded text-center mb-6">
        <div className="text-6xl font-bold text-yellow-300 mb-4">
          {counter}
        </div>
        <p className="text-blue-100 text-sm">Current Count</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <button
            onClick={handleDecrement}
            className="flex-1 bg-red-600 hover:bg-red-700 border-2 border-red-800 p-4 text-white font-bold text-xl transition-colors cursor-pointer"
          >
            ➖ Decrement
          </button>

          <button
            onClick={handleIncrement}
            className="flex-1 bg-green-600 hover:bg-green-700 border-2 border-green-800 p-4 text-white font-bold text-xl transition-colors cursor-pointer"
          >
            ➕ Increment
          </button>
        </div>

        <button
          onClick={handleReset}
          className="w-full bg-yellow-500 hover:bg-yellow-600 border-2 border-yellow-700 p-3 text-black font-bold text-lg transition-colors cursor-pointer"
        >
          🔄 Reset
        </button>
      </div>

      <p className="text-blue-100 text-xs text-center mt-6">
        💾 State persists in browser localStorage
      </p>
    </div>
  );
}
