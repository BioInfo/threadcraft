'use client';

import { useEffect } from 'react';

export default function ConfigPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
  }, []);
  return null;
}