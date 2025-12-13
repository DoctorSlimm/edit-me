'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePopupStore } from '@/lib/stores/popupStore';

interface RetroModalProps {
  popupId: string;
}

/**
 * RetroModal Component - 90s Windows 95 styled modal dialog
 * Features:
 * - Beveled 3D borders
 * - Windows 95 title bar with blue gradient
 * - Fully blocking modal with dark overlay (70% opacity)
 * - Auto-dismiss timeout
 * - Limited close options (top-right X button or force-dismiss)
 * - Stacked modal support with z-index and position offset
 * - Fade in/out animations (200ms)
 */
export function RetroModal({ popupId }: RetroModalProps) {
  const popup = usePopupStore((state) => state.getPopupById(popupId));
  const closePopup = usePopupStore((state) => state.closePopup);
  const getStackIndex = usePopupStore((state) => state.getStackIndex);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!popup || !mounted) return null;

  const stackIndex = getStackIndex(popupId);
  const stackClass = stackIndex > 0 ? `stacked-${Math.min(stackIndex, 3)}` : '';

  // Handle close button click
  const handleClose = () => {
    closePopup(popupId);
    popup.onClose?.();
  };

  return createPortal(
    <>
      {/* Blocking overlay - prevents interaction with content behind */}
      <div
        className="retro-modal-overlay"
        style={{
          zIndex: popup.zIndex || 1000,
        }}
      />

      {/* Modal dialog */}
      <div
        className={`retro-modal-dialog ${stackClass} ${
          popup.isDismissing ? 'closing' : ''
        }`}
        style={{
          zIndex: (popup.zIndex || 1001) + 1,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-title-${popupId}`}
      >
        {/* Title Bar - Windows 95 Style */}
        <div className="retro-modal-title">
          <span id={`modal-title-${popupId}`}>{popup.title}</span>
          {popup.closeButton !== 'none' && (
            <button
              className="retro-modal-close"
              onClick={handleClose}
              aria-label="Close modal"
              type="button"
            >
              ×
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="retro-modal-body">
          {typeof popup.content === 'string' ? (
            <p>{popup.content}</p>
          ) : (
            popup.content
          )}
        </div>

        {/* Modal Footer with Action Buttons */}
        <div className="retro-modal-footer">
          <button
            className="retro-button primary"
            onClick={handleClose}
            type="button"
          >
            OK
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

/**
 * RetroModalContainer - Renders all active modals from the popup queue
 * Manages stacking and blocking behavior
 */
export function RetroModalContainer() {
  const popups = usePopupStore((state) => state.popups);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || popups.length === 0) return null;

  return (
    <>
      {popups.map((popup) => (
        <RetroModal key={popup.id} popupId={popup.id} />
      ))}
    </>
  );
}
