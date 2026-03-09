import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';

export const Analytics = ({ transactions }) => {
    // Simple grouping by date for the last 7 days
    const dailyData = transactions.reduce((acc, t) => {
        const date = t.date;
        if (!acc[date]) acc[date] = { date, income: 0, expense: 0, profit: 0 };
        if (t.type === 'income') acc[date].income += Number(t.amount);
        else acc[date].expense += Number(t.amount);
        acc[date].profit = acc[date].income - acc[date].expense;
        return acc;
    }, {});

    const chartData = Object.values(dailyData).slice(-7).map(d => ({
        ...d,
        displayDate: new Date(d.date).toLocaleDateString([], { weekday: 'short' })
    }));

    return (
        <div className="space-y-6">
            <div className="glass-card h-64">
                <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Weekly Income vs Expense</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="glass-card h-64">
                <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Profit Trend</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        <Line type="monotone" dataKey="profit" stroke="#fbbf24" strokeWidth={3} dot={{ fill: '#fbbf24' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
