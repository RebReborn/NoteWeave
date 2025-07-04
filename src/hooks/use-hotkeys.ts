
"use client";

import { useEffect, useCallback } from 'react';

type Hotkey = {
  keys: string[];
  callback: (event: KeyboardEvent) => void;
};

// A map to handle platform-specific modifier keys
const keyMap: { [key: string]: (event: KeyboardEvent) => boolean } = {
  'ctrl': (event) => event.ctrlKey,
  'meta': (event) => event.metaKey,
  'shift': (event) => event.shiftKey,
  'alt': (event) => event.altKey,
};

const getHotkeyMatcher = (keys: string[]) => {
  const lowercasedKeys = keys.map(k => k.toLowerCase());
  
  const mainKey = lowercasedKeys.find(key => !keyMap[key]);
  const modifierKeys = lowercasedKeys.filter(key => keyMap[key]);

  return (event: KeyboardEvent) => {
    if (mainKey && event.key.toLowerCase() !== mainKey) {
      return false;
    }
    
    return modifierKeys.every(mod => keyMap[mod](event));
  };
};

export function useHotkeys(hotkeys: Hotkey[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      hotkeys.forEach((hotkey) => {
        const matcher = getHotkeyMatcher(hotkey.keys);
        if (matcher(event)) {
          event.preventDefault();
          hotkey.callback(event);
        }
      });
    },
    [hotkeys]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
