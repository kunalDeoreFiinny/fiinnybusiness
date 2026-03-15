import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

interface SalesChartProps {
    data: { date: string; amount: number }[];
}

export default function SalesChart({ data }: SalesChartProps) {
    const { t } = useTranslation();

    // Sort data by date just in case
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--text-secondary)' }}>{t('dashboard.revenue_trend')}</h3>
            <div style={{ flex: 1, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sortedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary-light)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--primary-light)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-tertiary)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(str) => {
                                const date = new Date(str);
                                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                            }}
                        />
                        <YAxis
                            stroke="var(--text-tertiary)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `₹${val}`}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--surface-raised)',
                                border: '1px solid var(--surface-border)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(10px)'
                            }}
                            itemStyle={{ color: 'var(--primary-light)' }}
                            labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                            formatter={(value: any) => [`₹${value.toLocaleString()}`, t('dashboard.amount')]}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="var(--primary-light)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorAmount)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
