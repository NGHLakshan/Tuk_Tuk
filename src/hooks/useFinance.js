import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { format } from 'date-fns';

export const useFinance = () => {
    const [data, setData] = useState(storage.getData());
    const [settings, setSettings] = useState(storage.getSettings());
    const [today, setToday] = useState(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        storage.saveData(data);
    }, [data]);

    useEffect(() => {
        storage.saveSettings(settings);
    }, [settings]);

    const addTransaction = (transaction) => {
        const newTransaction = {
            ...transaction,
            id: Date.now(),
            date: today,
            timestamp: new Date().toISOString()
        };
        setData(prev => ({
            ...prev,
            transactions: [...prev.transactions, newTransaction]
        }));
    };

    const deleteTransaction = (id) => {
        setData(prev => ({
            ...prev,
            transactions: prev.transactions.filter(t => t.id !== id)
        }));
    };

    const updateTransaction = (id, updatedTransaction) => {
        setData(prev => ({
            ...prev,
            transactions: prev.transactions.map(t => t.id === id ? { ...t, ...updatedTransaction } : t)
        }));
    };

    const getDaySummary = (date = today) => {
        const dayTransactions = data.transactions.filter(t => t.date === date);
        const income = dayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const expenses = dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const fuelTransactions = dayTransactions.filter(t => t.category === 'fuel');
        const totalFuelCost = fuelTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const totalDistance = fuelTransactions.reduce((sum, t) => sum + Number(t.distance || 0), 0);
        const fuelEfficiency = totalDistance > 0 ? (totalFuelCost / totalDistance) : 0;

        return {
            income,
            expenses: expenses + Number(settings.dailyRent || 0),
            profit: income - (expenses + Number(settings.dailyRent || 0)),
            transactions: dayTransactions,
            fuelEfficiency
        };
    };

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const resetData = () => {
        const defaultSettings = { dailyRent: 1500, startingBalance: 0, pin: '1234', pinEnabled: false };
        setData({ days: {}, transactions: [] });
        setSettings(defaultSettings);
        storage.saveData({ days: {}, transactions: [] });
        storage.saveSettings(defaultSettings);
    };

    const exportData = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Date,Type,Amount,Note\n"
            + data.transactions.map(t => `${t.date},${t.type},${t.amount},"${t.note || ''}"`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `tuk_finance_export_${today}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return {
        data,
        settings,
        updateSettings,
        exportData,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        getDaySummary,
        resetData,
        today
    };
};
