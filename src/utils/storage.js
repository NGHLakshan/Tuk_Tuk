const STORAGE_KEY = 'tuk_finance_data';
const SETTINGS_KEY = 'tuk_finance_settings';

export const storage = {
    saveData: (data) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },
    getData: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { days: {}, transactions: [] };
    },
    saveSettings: (settings) => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    },
    getSettings: () => {
        const settings = localStorage.getItem(SETTINGS_KEY);
        const defaults = { dailyRent: 1500, startingBalance: 0, pin: '1234', pinEnabled: false };
        return settings ? { ...defaults, ...JSON.parse(settings) } : defaults;
    }
};

export const calculateProfit = (income, expenses) => {
    return income - expenses;
};

export const calculateFuelEfficiency = (cost, distance) => {
    if (!distance || distance === 0) return 0;
    return cost / distance;
};
