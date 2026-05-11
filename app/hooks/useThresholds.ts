import { useState, useEffect } from 'react';

export const defaultThresholds = { co2: 800, nh3: 4, voc: 10, temp: 35, hum: 80 };

export function useThresholds() {
  const [thresholds, setThresholds] = useState(defaultThresholds);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch dari database saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchThresholds = async () => {
      try {
        const res = await fetch('/api/settings/thresholds');
        if (res.ok) {
          const data = await res.json();
          setThresholds(data);
        }
      } catch (e) {
        console.error("Failed to fetch thresholds from server", e);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchThresholds();
  }, []);

  // Update thresholds (hanya admin yang bisa menyimpan ke DB)
  const saveThresholds = async (newT: typeof defaultThresholds) => {
    // Optimistic UI update
    setThresholds(newT);
    
    // Save to server
    try {
      const res = await fetch('/api/settings/thresholds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newT)
      });
      if (res.ok) {
        // Beri tahu window lain bahwa threshold terupdate
        window.dispatchEvent(new Event('thresholds_updated'));
      } else {
        console.error("Gagal menyimpan threshold");
      }
    } catch (e) {
      console.error("Error saving thresholds", e);
    }
  };

  // Sync state dengan event jika di tab lain terupdate
  useEffect(() => {
    const handleUpdate = async () => {
      try {
        const res = await fetch('/api/settings/thresholds');
        if (res.ok) {
          const data = await res.json();
          setThresholds(data);
        }
      } catch (e) {}
    };
    window.addEventListener('thresholds_updated', handleUpdate);
    return () => window.removeEventListener('thresholds_updated', handleUpdate);
  }, []);

  return { thresholds, saveThresholds, isLoaded };
}
