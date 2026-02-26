import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, ArrowUpRight } from 'lucide-react';
import './SalesManagement.css';
import { ListOrder } from '../../../api/admin/order';

const PERIOD_OPTIONS = [
    { value: 'daily', label: '일별' },
    { value: 'weekly', label: '주별' },
    { value: 'monthly', label: '월별' },
    { value: 'yearly', label: '연별' },
];

const STATUS_MAP = {
    PAYMENT_COMPLETE: '결제완료',
    SHIPPING: '배송중',
    DELIVERED: '배송완료',
    CANCELLED: '취소',
};

const STATUS_COLORS = {
    PAYMENT_COMPLETE: '#6c5ce7',
    SHIPPING: '#3498db',
    DELIVERED: '#27ae60',
    CANCELLED: '#e74c3c',
};

const formatCurrency = (value) => {
    if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
    if (value >= 10000) return `${(value / 10000).toFixed(0)}만`;
    return value.toLocaleString();
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="sales-tooltip">
            <p className="sales-tooltip-label">{label}</p>
            {payload.map((entry, i) => (
                <div className="sales-tooltip-row" key={i}>
                    <span className="sales-tooltip-dot" style={{ background: entry.color }} />
                    <span className="sales-tooltip-name">{entry.name}</span>
                    <span className="sales-tooltip-value">₩{entry.value?.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
};

// 날짜 → 기간 키 변환
const getPeriodKey = (dateStr, period) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    if (period === 'daily') return `${m}/${day}`;
    if (period === 'weekly') {
        const startOfYear = new Date(y, 0, 1);
        const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
        return `${y}-${week}주`;
    }
    if (period === 'monthly') return `${y}.${m}`;
    return String(y);
};

const SalesManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState('monthly');

    useEffect(() => {
        setLoading(true);
        ListOrder('', 0, 1000)
            .then(res => setOrders(res.data.content || []))
            .catch(e => console.error('주문 데이터 조회 실패:', e))
            .finally(() => setLoading(false));
    }, []);

    // 취소 제외한 실매출 주문
    const validOrders = useMemo(() => orders.filter(o => o.status !== 'CANCELLED'), [orders]);

    // 기간별 집계
    const chartData = useMemo(() => {
        const map = new Map();
        validOrders.forEach(order => {
            const key = getPeriodKey(order.orderDate, period);
            if (!key) return;
            if (!map.has(key)) map.set(key, { period: key, 매출: 0, 주문: 0 });
            map.get(key).매출 += order.totalPrice || 0;
            map.get(key).주문 += 1;
        });
        return Array.from(map.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([, v]) => v)
            .slice(-30); // 최근 30개 기간
    }, [validOrders, period]);

    // 상태별 집계
    const statusStats = useMemo(() => {
        return orders.reduce((acc, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1;
            return acc;
        }, {});
    }, [orders]);

    // 요약 통계
    const stats = useMemo(() => {
        const total = validOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const totalOrders = validOrders.length;
        const avg = totalOrders > 0 ? Math.floor(total / totalOrders) : 0;
        const lastTwo = chartData.slice(-2);
        const current = lastTwo[1]?.매출 || 0;
        const previous = lastTwo[0]?.매출 || 1;
        const growthRate = previous > 0 ? parseFloat(((current - previous) / previous * 100).toFixed(1)) : 0;
        return { total, totalOrders, avg, growthRate, current };
    }, [validOrders, chartData]);

    if (loading) {
        return <div className="sales-management"><div className="flex justify-center py-16 text-gray-400">데이터를 불러오는 중...</div></div>;
    }

    return (
        <div className="sales-management">
            {/* 요약 카드 */}
            <div className="sales-summary-cards">
                <div className="sales-stat-card">
                    <div className="sales-stat-icon" style={{ background: '#eef0ff' }}>
                        <DollarSign className="w-5 h-5" style={{ color: '#6c5ce7' }} />
                    </div>
                    <div className="sales-stat-info">
                        <p className="sales-stat-label">총 매출</p>
                        <p className="sales-stat-value">₩{stats.total.toLocaleString()}</p>
                    </div>
                </div>
                <div className="sales-stat-card">
                    <div className="sales-stat-icon" style={{ background: '#e8f8f0' }}>
                        <ShoppingBag className="w-5 h-5" style={{ color: '#27ae60' }} />
                    </div>
                    <div className="sales-stat-info">
                        <p className="sales-stat-label">총 주문</p>
                        <p className="sales-stat-value">{stats.totalOrders.toLocaleString()}건</p>
                    </div>
                </div>
                <div className="sales-stat-card">
                    <div className="sales-stat-icon" style={{ background: '#fff4e6' }}>
                        <Users className="w-5 h-5" style={{ color: '#e67e22' }} />
                    </div>
                    <div className="sales-stat-info">
                        <p className="sales-stat-label">평균 주문금액</p>
                        <p className="sales-stat-value">₩{stats.avg.toLocaleString()}</p>
                    </div>
                </div>
                <div className="sales-stat-card">
                    <div className="sales-stat-icon" style={{ background: stats.growthRate >= 0 ? '#e8f8f0' : '#ffeef0' }}>
                        {stats.growthRate >= 0
                            ? <TrendingUp className="w-5 h-5" style={{ color: '#27ae60' }} />
                            : <TrendingDown className="w-5 h-5" style={{ color: '#e74c3c' }} />
                        }
                    </div>
                    <div className="sales-stat-info">
                        <p className="sales-stat-label">전기 대비</p>
                        <p className={`sales-stat-value ${stats.growthRate >= 0 ? 'positive' : 'negative'}`}>
                            {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate}%
                        </p>
                    </div>
                </div>
            </div>

            {/* 기간 필터 */}
            <div className="sales-filters">
                <div className="sales-filter-group">
                    <span className="sales-filter-label">기간</span>
                    <div className="sales-filter-btns">
                        {PERIOD_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                className={`sales-filter-btn ${period === opt.value ? 'active' : ''}`}
                                onClick={() => setPeriod(opt.value)}
                            >{opt.label}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 메인 차트 */}
            <div className="sales-chart-card">
                <div className="sales-chart-header">
                    <div>
                        <h3 className="sales-chart-title">
                            {PERIOD_OPTIONS.find(o => o.value === period)?.label} 매출 추이
                        </h3>
                        <p className="sales-chart-subtitle">취소 제외 실매출 기준</p>
                    </div>
                    <div className="sales-chart-current">
                        <span className="sales-chart-current-label">최근 매출</span>
                        <span className="sales-chart-current-value">₩{stats.current.toLocaleString()}</span>
                    </div>
                </div>
                <div className="sales-chart-body">
                    {chartData.length === 0 ? (
                        <div className="flex justify-center items-center h-48 text-gray-400 text-sm">매출 데이터가 없습니다.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={360}>
                            <BarChart data={chartData} barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#999' }} axisLine={{ stroke: '#e8e8e8' }} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                                <Bar dataKey="매출" fill="#6c5ce7" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* 주문 상태별 현황 */}
            <div className="sales-category-grid cols-4">
                {Object.entries(STATUS_MAP).map(([key, label]) => {
                    const count = statusStats[key] || 0;
                    const color = STATUS_COLORS[key];
                    const percent = orders.length > 0 ? ((count / orders.length) * 100).toFixed(1) : '0.0';
                    return (
                        <div className="sales-category-card" key={key}>
                            <div className="sales-category-card-header">
                                <div className="sales-category-dot" style={{ background: color }} />
                                <span className="sales-category-name">{label}</span>
                                <span className="sales-category-growth positive">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    {percent}%
                                </span>
                            </div>
                            <p className="sales-category-total">{count}건</p>
                            <div className="sales-category-bar-bg">
                                <div className="sales-category-bar-fill" style={{ width: `${percent}%`, background: color }} />
                            </div>
                            <p className="sales-category-percent">전체 대비 {percent}%</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SalesManagement;
