import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

/**
 * PopupConfig Schema - Defines popup/modal configuration
 */
export interface PopupConfig {
  id: string;
  title: string;
  content: React.ReactNode | string;
  isOpen: boolean;
  dismissTimeout: number; // in milliseconds, default 5000
  isBlocking: boolean; // true for full 90s modals
  zIndex?: number; // auto-calculated
  animation?: 'bounce' | 'slide' | 'fade'; // default 'fade'
  closeButton?: 'none' | 'force-dismiss'; // default 'force-dismiss'
  onClose?: () => void;
  isDismissing?: boolean;
}

interface PopupStore {
  popups: PopupConfig[];
  activePopup: PopupConfig | null;

  // Queue management
  addPopup: (config: Omit<PopupConfig, 'id' | 'isOpen' | 'zIndex'>) => string;
  removePopup: (id: string) => void;
  closePopup: (id: string) => void;
  closeAll: () => void;

  // Auto-dismiss handling
  setPopupDismissing: (id: string, isDismissing: boolean) => void;

  // Query functions
  getPopupById: (id: string) => PopupConfig | undefined;
  getStackIndex: (id: string) => number;
}

/**
 * Zustand popup queue store for managing modal stacking and blocking behavior
 */
export const usePopupStore = create<PopupStore>((set, get) => ({
  popups: [],
  activePopup: null,

  /**
   * Add popup to queue with auto-dismiss timeout
   */
  addPopup: (config) => {
    const id = uuidv4();
    const popup: PopupConfig = {
      ...config,
      id,
      isOpen: true,
      zIndex: 1000 + (get().popups.length * 100),
      animation: config.animation || 'fade',
      closeButton: config.closeButton || 'force-dismiss',
      isDismissing: false,
    };

    set((state) => ({
      popups: [...state.popups, popup],
      activePopup: popup,
    }));

    // Auto-dismiss timeout (max 15 seconds per spec, configurable)
    const timeout = config.dismissTimeout || 5000;
    const timeoutId = setTimeout(() => {
      get().closePopup(id);
    }, Math.min(timeout, 15000));

    // Store timeout ID for cleanup if needed
    (popup as any).__timeoutId = timeoutId;

    return id;
  },

  /**
   * Remove popup from queue immediately
   */
  removePopup: (id) => {
    set((state) => {
      const popup = state.popups.find((p) => p.id === id);
      if (popup && (popup as any).__timeoutId) {
        clearTimeout((popup as any).__timeoutId);
      }

      const updated = state.popups.filter((p) => p.id !== id);
      return {
        popups: updated,
        activePopup: updated.length > 0 ? updated[updated.length - 1] : null,
      };
    });
  },

  /**
   * Close popup with dismissing animation
   */
  closePopup: (id) => {
    set((state) => {
      const updated = state.popups.map((p) =>
        p.id === id ? { ...p, isDismissing: true } : p
      );

      // Remove after animation completes (200ms per CSS)
      setTimeout(() => {
        get().removePopup(id);
      }, 200);

      return { popups: updated };
    });
  },

  /**
   * Close all popups in queue
   */
  closeAll: () => {
    const popups = get().popups;
    popups.forEach((p) => get().closePopup(p.id));
  },

  /**
   * Set popup dismissing state for animation
   */
  setPopupDismissing: (id, isDismissing) => {
    set((state) => ({
      popups: state.popups.map((p) =>
        p.id === id ? { ...p, isDismissing } : p
      ),
    }));
  },

  /**
   * Get popup by ID
   */
  getPopupById: (id) => {
    return get().popups.find((p) => p.id === id);
  },

  /**
   * Get stack index of popup (for stacking offset calculation)
   */
  getStackIndex: (id) => {
    const index = get().popups.findIndex((p) => p.id === id);
    return index >= 0 ? index : 0;
  },
}));

/**
 * Hook to show a popup with convenience defaults
 */
export const useShowPopup = () => {
  const addPopup = usePopupStore((state) => state.addPopup);

  return (
    title: string,
    content: React.ReactNode | string,
    options?: {
      dismissTimeout?: number;
      onClose?: () => void;
      closeButton?: 'none' | 'force-dismiss';
    }
  ) => {
    return addPopup({
      title,
      content,
      isBlocking: true,
      dismissTimeout: options?.dismissTimeout || 5000,
      onClose: options?.onClose,
      closeButton: options?.closeButton || 'force-dismiss',
    });
  };
};
