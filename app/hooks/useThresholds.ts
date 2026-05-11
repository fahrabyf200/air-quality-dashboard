import { useState, useEffect } from 'react';

export const defaultThresholds = { co2: 800, nh3: 2, voc: 10, temp: 35, hum: 80 };

export function useThresholds() {
  const [thresholds, setThresholds] = useState(defaultThresholds);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('skywatch_thresholds');
    if (saved) {
      try {
        setThresholds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse thresholds");
      }
    }
    setIsLoaded(true);
  }, []);

  const saveThresholds = (newT: typeof defaultThresholds) => {
    setThresholds(newT);
    localStorage.setItem('skywatch_thresholds', JSON.stringify(newT));
    window.dispatchEvent(new Event('thresholds_updated'));
  };

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('skywatch_thresholds');
      if (saved) {
        try {
          setThresholds(JSON.parse(saved));
        } catch (e) {}
      }
    };
    window.addEventListener('thresholds_updated', handleUpdate);
    return () => window.removeEventListener('thresholds_updated', handleUpdate);
  }, []);

  return { thresholds, saveThresholds, isLoaded };
}
