'use client';

import React from 'react';
import { useShowPopup } from '@/lib/stores/popupStore';
import { RetroButton } from './RetroButton';

/**
 * ModalTestPanel - 90s Retro styled panel for testing modal functionality
 * Demonstrates:
 * - Single modal display with auto-dismiss
 * - Multiple stacked modals
 * - Modal blocking behavior
 * - Custom timeout configurations
 */
export function ModalTestPanel() {
  const showPopup = useShowPopup();

  const handleShowSimpleModal = () => {
    showPopup(
      '📬 Alert',
      'This is a simple 90s modal dialog with auto-dismiss in 5 seconds.',
      { dismissTimeout: 5000 }
    );
  };

  const handleShowStackedModals = () => {
    showPopup(
      '1️⃣ Modal One',
      'This is the first modal in the stack. New modals will stack on top.',
      { dismissTimeout: 8000 }
    );

    setTimeout(() => {
      showPopup(
        '2️⃣ Modal Two',
        'This is the second modal, appearing on top of the first.',
        { dismissTimeout: 8000 }
      );
    }, 500);

    setTimeout(() => {
      showPopup(
        '3️⃣ Modal Three',
        'This is the third modal, demonstrating multiple stacked popups.',
        { dismissTimeout: 8000 }
      );
    }, 1000);
  };

  const handleShowFormModal = () => {
    showPopup(
      '📝 Form Submission',
      (
        <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
          <p>✓ Your data has been saved successfully!</p>
          <p>Reference ID: <code style={{ backgroundColor: '#f0f0f0', padding: '2px 4px' }}>REF-2024-001</code></p>
        </div>
      ),
      { dismissTimeout: 6000 }
    );
  };

  const handleShowErrorModal = () => {
    showPopup(
      '⚠️ Error',
      'An error occurred while processing your request. Please try again.',
      { dismissTimeout: 5000 }
    );
  };

  const handleShowCustomModal = () => {
    showPopup(
      '✨ Welcome',
      (
        <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
          <p>Welcome to the 90s Retro Experience!</p>
          <p>🎨 This application features:</p>
          <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
            <li>Authentic Windows 95 styling</li>
            <li>Beveled 3D buttons and panels</li>
            <li>Modal stacking with z-index management</li>
            <li>Auto-dismiss timeout behavior</li>
          </ul>
        </div>
      ),
      { dismissTimeout: 8000 }
    );
  };

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
          marginTop: '-4px',
          marginLeft: '-4px',
          marginRight: '-4px',
        }}
      >
        <span>📢 MODAL TESTER</span>
        <span style={{ fontSize: '10px' }}>v1.0</span>
      </div>

      <div style={{ padding: '12px' }}>
        <p style={{ fontSize: '12px', margin: '0 0 12px 0', color: '#000080' }}>
          Click buttons below to test modal functionality:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
          <RetroButton
            variant="primary"
            onClick={handleShowSimpleModal}
            style={{ width: '100%', fontSize: '11px' }}
          >
            Simple Modal
          </RetroButton>

          <RetroButton
            variant="success"
            onClick={handleShowFormModal}
            style={{ width: '100%', fontSize: '11px' }}
          >
            Success Modal
          </RetroButton>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
          <RetroButton
            variant="danger"
            onClick={handleShowErrorModal}
            style={{ width: '100%', fontSize: '11px' }}
          >
            Error Modal
          </RetroButton>

          <RetroButton
            variant="primary"
            onClick={handleShowCustomModal}
            style={{ width: '100%', fontSize: '11px' }}
          >
            Custom Modal
          </RetroButton>
        </div>

        <RetroButton
          variant="primary"
          onClick={handleShowStackedModals}
          style={{ width: '100%', marginBottom: '0' }}
        >
          Stack 3 Modals
        </RetroButton>

        <p style={{ fontSize: '10px', color: '#666666', marginTop: '12px', marginBottom: '0' }}>
          💡 Modals auto-dismiss after 5-8 seconds or close with button.
        </p>
      </div>
    </div>
  );
}
