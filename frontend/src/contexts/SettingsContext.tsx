import { createContext, useContext, useEffect, useState } from 'react';

type AppSettings = {
  requireSummaryOnSave: boolean;
};

interface SettingsContextValue {
  requireSummaryOnSave: boolean;
  setRequireSummaryOnSave: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function isSummaryRequired(): boolean {
  return localStorage.getItem('require-summary') === 'true';
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    requireSummaryOnSave: isSummaryRequired(),
  });

  useEffect(() => {
    localStorage.setItem('require-summary', String(settings.requireSummaryOnSave));
  }, [settings]);

  const setRequireSummaryOnSave = (value: boolean) => {
    setSettings((prev) => ({ ...prev, requireSummaryOnSave: value }));
  };

  return (
    <SettingsContext.Provider value={{ requireSummaryOnSave: settings.requireSummaryOnSave, setRequireSummaryOnSave }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
