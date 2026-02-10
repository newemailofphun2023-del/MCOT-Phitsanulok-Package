
import { SystemData } from '../types';

const STORAGE_KEY = 'mcot_package_v4_data';

export const storageService = {
  save: (data: SystemData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      settings: {
        ...data.settings,
        lastSave: new Date().toISOString()
      }
    }));
  },
  
  load: (): SystemData | null => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse system data", e);
      return null;
    }
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  exportData: (data: SystemData) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MCOT_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData: (file: File): Promise<SystemData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data);
        } catch (err) {
          reject(new Error("Invalid JSON file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }
};
