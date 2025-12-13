'use client';

import React, { ReactNode } from 'react';
import { RetroModalContainer } from '@/app/components/RetroModal';

/**
 * PopupProvider - Wraps application and renders modal portal
 * Must be placed near root of component tree to ensure modals render properly
 */
export function PopupProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <RetroModalContainer />
    </>
  );
}
