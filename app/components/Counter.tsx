'use client';

import { useState, useEffect, useCallback } from 'react';
import { RetroButton } from './RetroButton';
import { useShowPopup } from '@/lib/stores/popupStore';

export default function Counter() {
  const [counter, setCounter] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const showPopup = useShowPopup();

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
    const newValue = counter + 1;
    setCounter(newValue);
    if (newValue % 10 === 0) {
      showPopup(
        '🎉 Milestone!',
        `You've reached a count of ${newValue}!`,
        { dismissTimeout: 3000 }
      );
    }
  }, [counter, showPopup]);

  // Decrement handler
  const handleDecrement = useCallback(() => {
    setCounter(prev => Math.max(0, prev - 1));
  }, []);

  // Reset handler
  const handleReset = useCallback(() => {
    showPopup(
      '⚠️ Confirmation',
      'Are you sure you want to reset the counter?',
      {
        dismissTimeout: 5000,
        closeButton: 'force-dismiss',
      }
    );
    setCounter(0);
    localStorage.removeItem('counterValue');
  }, [showPopup]);

  return (
    <div className="retro-panel" style={{ width: '100%', maxWidth: '500px', marginBottom: '2rem' }}>
      {/* Title Bar */}
      <div
        style={{
          background: 'linear-gradient(90deg, #000080 0%, #1084d7 100%)',
          color: 'white',
          padding: '2px 4px',
          marginBottom: '0.5rem',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>🔢 COUNTER.EXE</span>
        <span style={{ fontSize: '10px' }}>v1.0</span>
      </div>

      {/* Counter Display */}
      <div style={{ padding: '1rem', backgroundColor: '#c0c0c0', textAlign: 'center', marginBottom: '1rem' }}>
        <div
          style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#EF4444',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-90s-mono)',
            border: '2px solid',
            borderColor: '#000080 #FFFFFF #FFFFFF #000080',
            padding: '1rem',
            backgroundColor: '#FFFFFF',
          }}
        >
          {counter}
        </div>
        <p style={{ fontSize: '12px', color: '#000080', margin: '0' }}>
          ← Current Count →
        </p>
      </div>

      {/* Button Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <RetroButton
          variant="danger"
          onClick={handleDecrement}
          style={{ width: '100%' }}
        >
          ➖ Decrement
        </RetroButton>

        <RetroButton
          variant="success"
          onClick={handleIncrement}
          style={{ width: '100%' }}
        >
          ➕ Increment
        </RetroButton>
      </div>

      <RetroButton
        variant="primary"
        onClick={handleReset}
        style={{ width: '100%', marginBottom: '0.5rem' }}
      >
        🔄 Reset
      </RetroButton>

      <p style={{ fontSize: '10px', color: '#666666', textAlign: 'center', margin: '0.5rem 0 0 0' }}>
        💾 Saved in browser storage
      </p>
    </div>
  );
}
