import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, ArrowUpRight, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
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

// 기간별 전체 키 목록 생성 (데이터 없는 구간도 표시)
const generatePeriodKeys = (period) => {
    const now = new Date();
    const y = now.getFullYear();
    const keys = [];

    if (period === 'monthly') {
        for (let mo = 1; mo <= 12; mo++) {
            keys.push(`${y}.${String(mo).padStart(2, '0')}`);
        }
    } else if (period === 'yearly') {
        for (let i = y - 5; i <= y; i++) {
            keys.push(String(i));
        }
    } else if (period === 'weekly') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i * 7);
            const dy = d.getFullYear();
            const startOfYear = new Date(dy, 0, 1);
            const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
            keys.push(`${dy}-${week}주`);
        }
    } else {
        // daily: 최근 30일
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const mo = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            keys.push(`${mo}/${day}`);
        }
    }
    return keys;
};

// 현재 시점의 기본 기간 키
const getCurrentPeriodKey = (period) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    if (period === 'daily') return `${m}/${day}`;
    if (period === 'weekly') {
        const startOfYear = new Date(y, 0, 1);
        const week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
        return `${y}-${week}주`;
    }
    if (period === 'monthly') return `${y}.${m}`;
    return String(y);
};

const SalesManagement = ({ user }) => {
    const brandId = user?.adminRole === 'PARTNER' ? user?.brandId : null;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState('monthly');
    const [selectedPeriodKey, setSelectedPeriodKey] = useState(() => getCurrentPeriodKey('monthly'));

    useEffect(() => {
        setLoading(true);
        ListOrder('', 0, 1000, brandId)
            .then(res => setOrders(res.data.content || []))
            .catch(e => console.error('주문 데이터 조회 실패:', e))
            .finally(() => setLoading(false));
    }, []);

    // 취소 제외한 실매출 주문
    const validOrders = useMemo(() => orders.filter(o => o.status !== 'CANCELLED'), [orders]);

    // 기간별 집계
    const chartData = useMemo(() => {
        const allKeys = generatePeriodKeys(period);
        const map = new Map();
        allKeys.forEach(k => map.set(k, { period: k, 매출: 0, 주문: 0 }));
        validOrders.forEach(order => {
            const key = getPeriodKey(order.orderDate, period);
            if (!key || !map.has(key)) return;
            map.get(key).매출 += order.totalPrice || 0;
            map.get(key).주문 += 1;
        });
        return allKeys.map(k => map.get(k));
    }, [validOrders, period]);

    // 기간 변경 시 selectedPeriodKey 초기화
    const handlePeriodChange = (val) => {
        setPeriod(val);
        setSelectedPeriodKey(getCurrentPeriodKey(val));
    };

    // 선택된 기간의 상품별 집계
    const periodProductStats = useMemo(() => {
        const filtered = validOrders.filter(o => getPeriodKey(o.orderDate, period) === selectedPeriodKey);
        const map = new Map();
        filtered.forEach(o => {
            const nm = o.productNm || '알 수 없음';
            if (!map.has(nm)) map.set(nm, { productNm: nm, productImgPath: o.productImgPath || null, quantity: 0, revenue: 0 });
            map.get(nm).quantity += o.quantity || 1;
            map.get(nm).revenue += o.totalPrice || 0;
        });
        return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
    }, [validOrders, period, selectedPeriodKey]);

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
        const currentKey = getCurrentPeriodKey(period);
        const currentIdx = chartData.findIndex(d => d.period === currentKey);
        const current = chartData[currentIdx]?.매출 || 0;
        const previous = currentIdx > 0 ? (chartData[currentIdx - 1]?.매출 || 0) : 0;
        const growthRate = previous > 0 ? parseFloat(((current - previous) / previous * 100).toFixed(1)) : 0;
        return { total, totalOrders, avg, growthRate, current };
    }, [validOrders, chartData, period]);

    const handleDownload = () => {
        const wb = XLSX.utils.book_new();
        const periodLabel = PERIOD_OPTIONS.find(o => o.value === period)?.label || period;
        const rows = [];

        // ── 요약 통계 ──────────────────────────────
        rows.push(['[ 요약 통계 ]']);
        rows.push(['총 매출', `₩${stats.total.toLocaleString()}`, '', '총 주문', `${stats.totalOrders}건`]);
        rows.push(['평균 주문금액', `₩${stats.avg.toLocaleString()}`, '', '전기 대비', `${stats.growthRate >= 0 ? '+' : ''}${stats.growthRate}%`]);
        rows.push([]);

        // ── 기간별 매출 추이 ───────────────────────
        rows.push([`[ ${periodLabel} 매출 추이 ]`]);
        rows.push(['기간', '매출액', '주문건수']);
        chartData.forEach(d => rows.push([d.period, d.매출, d.주문]));
        rows.push([]);

        // ── 상품별 매출 (선택 기간) ────────────────
        rows.push([`[ 상품별 매출 — ${selectedPeriodKey} ]`]);
        rows.push(['순위', '상품명', '판매수량', '매출액']);
        periodProductStats.forEach((item, idx) =>
            rows.push([idx + 1, item.productNm, item.quantity, item.revenue])
        );
        rows.push([]);

        // ── 주문 상태별 현황 ───────────────────────
        rows.push(['[ 주문 상태별 현황 ]']);
        rows.push(['상태', '건수', '비율(%)']);
        Object.entries(STATUS_MAP).forEach(([key, label]) => {
            const count = (orders.filter(o => o.status === key)).length;
            const pct = orders.length > 0 ? ((count / orders.length) * 100).toFixed(1) : '0.0';
            rows.push([label, count, pct]);
        });
        rows.push([]);

        // ── 전체 주문 목록 ─────────────────────────
        rows.push(['[ 전체 주문 목록 ]']);
        rows.push(['주문ID', '주문자', '상품명', '수량', '결제금액', '상태', '주문일시']);
        orders.forEach(o => rows.push([
            o.id, o.userNm, o.productNm, o.quantity, o.totalPrice,
            STATUS_MAP[o.status] || o.status, o.orderDate,
        ]));

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 16 }, { wch: 20 }, { wch: 12 }, { wch: 20 }, { wch: 16 }, { wch: 12 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, ws, '매출관리');
        XLSX.writeFile(wb, `매출관리_${periodLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

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
                                onClick={() => handlePeriodChange(opt.value)}
                            >{opt.label}</button>
                        ))}
                    </div>
                </div>
                <button className="sales-download-btn" onClick={handleDownload}>
                    <Download size={15} />
                    엑셀 다운로드
                </button>
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
                            <BarChart
                                data={chartData}
                                barCategoryGap="20%"
                                onClick={(e) => { if (e?.activeLabel) setSelectedPeriodKey(e.activeLabel); }}
                                style={{ cursor: 'pointer' }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#999' }} axisLine={{ stroke: '#e8e8e8' }} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                                <Bar dataKey="매출" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry) => (
                                        <Cell
                                            key={entry.period}
                                            fill={entry.period === selectedPeriodKey ? '#4834d4' : '#6c5ce7'}
                                            opacity={entry.period === selectedPeriodKey ? 1 : 0.65}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* 기간별 상품 매출 */}
            <div className="sales-chart-card sales-product-table-card">
                <div className="sales-chart-header">
                    <div>
                        <h3 className="sales-chart-title">
                            상품별 매출
                            <span className="sales-period-badge">{selectedPeriodKey}</span>
                        </h3>
                        <p className="sales-chart-subtitle">차트 막대를 클릭하면 해당 기간으로 변경됩니다</p>
                    </div>
                    <span className="sales-chart-current-label">{periodProductStats.length}개 상품</span>
                </div>
                <div className="sales-chart-body">
                    {periodProductStats.length === 0 ? (
                        <p className="sales-product-empty">해당 기간에 판매 데이터가 없습니다.</p>
                    ) : (
                        <table className="sales-product-table">
                            <thead>
                                <tr>
                                    <th>순위</th>
                                    <th>상품</th>
                                    <th>판매수량</th>
                                    <th>매출액</th>
                                    <th>비율</th>
                                </tr>
                            </thead>
                            <tbody>
                                {periodProductStats.map((item, idx) => {
                                    const totalRevenue = periodProductStats.reduce((s, i) => s + i.revenue, 0);
                                    const pct = totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(1) : '0.0';
                                    return (
                                        <tr key={item.productNm}>
                                            <td className="sales-product-rank">
                                                <span className={`sales-rank-badge ${idx < 3 ? `top${idx + 1}` : ''}`}>{idx + 1}</span>
                                            </td>
                                            <td className="sales-product-name-cell">
                                                {item.productImgPath && (
                                                    <img src={item.productImgPath} alt={item.productNm} className="sales-product-thumb" />
                                                )}
                                                <span>{item.productNm}</span>
                                            </td>
                                            <td className="sales-product-qty">{item.quantity.toLocaleString()}개</td>
                                            <td className="sales-product-revenue">₩{item.revenue.toLocaleString()}</td>
                                            <td className="sales-product-pct-cell">
                                                <div className="sales-product-pct-bar-bg">
                                                    <div className="sales-product-pct-bar-fill" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="sales-product-pct-text">{pct}%</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
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
