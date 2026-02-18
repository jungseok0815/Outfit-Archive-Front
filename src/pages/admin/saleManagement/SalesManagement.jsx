import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, ArrowUpRight } from 'lucide-react';
import './SalesManagement.css';

const PERIOD_OPTIONS = [
  { value: 'daily', label: '일별' },
  { value: 'weekly', label: '주별' },
  { value: 'monthly', label: '월별' },
  { value: 'yearly', label: '연별' },
];

const CATEGORY_OPTIONS = ['전체', '상의', '하의', '아우터', '신발', '악세서리'];
const BRAND_OPTIONS = ['전체', '999휴머니티', '해칭룸', '나이키'];

const VIEW_TABS = [
  { value: 'category', label: '카테고리별' },
  { value: 'brand', label: '브랜드별' },
];

// ===== 카테고리 기준 더미 데이터 =====
const monthlyData = [
  { period: '2024.02', 전체: 3200000, 상의: 980000, 하의: 720000, 아우터: 850000, 신발: 420000, 악세서리: 230000, '999휴머니티': 960000, '해칭룸': 880000, '나이키': 1360000, orders: 38 },
  { period: '2024.03', 전체: 4100000, 상의: 1250000, 하의: 880000, 아우터: 1050000, 신발: 560000, 악세서리: 360000, '999휴머니티': 1230000, '해칭룸': 1050000, '나이키': 1820000, orders: 47 },
  { period: '2024.04', 전체: 3800000, 상의: 1100000, 하의: 820000, 아우터: 650000, 신발: 780000, 악세서리: 450000, '999휴머니티': 1140000, '해칭룸': 950000, '나이키': 1710000, orders: 43 },
  { period: '2024.05', 전체: 4500000, 상의: 1400000, 하의: 950000, 아우터: 380000, 신발: 1200000, 악세서리: 570000, '999휴머니티': 1260000, '해칭룸': 1080000, '나이키': 2160000, orders: 52 },
  { period: '2024.06', 전체: 5200000, 상의: 1800000, 하의: 1100000, 아우터: 250000, 신발: 1350000, 악세서리: 700000, '999휴머니티': 1456000, '해칭룸': 1248000, '나이키': 2496000, orders: 61 },
  { period: '2024.07', 전체: 5800000, 상의: 2100000, 하의: 1250000, 아우터: 180000, 신발: 1500000, 악세서리: 770000, '999휴머니티': 1624000, '해칭룸': 1392000, '나이키': 2784000, orders: 68 },
  { period: '2024.08', 전체: 5400000, 상의: 1900000, 하의: 1150000, 아우터: 220000, 신발: 1380000, 악세서리: 750000, '999휴머니티': 1512000, '해칭룸': 1296000, '나이키': 2592000, orders: 63 },
  { period: '2024.09', 전체: 4900000, 상의: 1500000, 하의: 1050000, 아우터: 680000, 신발: 1020000, 악세서리: 650000, '999휴머니티': 1372000, '해칭룸': 1176000, '나이키': 2352000, orders: 56 },
  { period: '2024.10', 전체: 5600000, 상의: 1350000, 하의: 980000, 아우터: 1500000, 신발: 920000, 악세서리: 850000, '999휴머니티': 1568000, '해칭룸': 1456000, '나이키': 2576000, orders: 65 },
  { period: '2024.11', 전체: 7200000, 상의: 1600000, 하의: 1200000, 아우터: 2400000, 신발: 1100000, 악세서리: 900000, '999휴머니티': 2016000, '해칭룸': 1872000, '나이키': 3312000, orders: 82 },
  { period: '2024.12', 전체: 8500000, 상의: 1900000, 하의: 1350000, 아우터: 2800000, 신발: 1350000, 악세서리: 1100000, '999휴머니티': 2380000, '해칭룸': 2210000, '나이키': 3910000, orders: 95 },
  { period: '2025.01', 전체: 6800000, 상의: 1700000, 하의: 1100000, 아우터: 2200000, 신발: 1050000, 악세서리: 750000, '999휴머니티': 1904000, '해칭룸': 1768000, '나이키': 3128000, orders: 78 },
];

const dailyData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2025, 0, 30 - i);
  const base = 150000 + Math.floor(Math.random() * 200000);
  return {
    period: `${date.getMonth() + 1}/${date.getDate()}`,
    전체: base,
    상의: Math.floor(base * 0.3), 하의: Math.floor(base * 0.2), 아우터: Math.floor(base * 0.25), 신발: Math.floor(base * 0.15), 악세서리: Math.floor(base * 0.1),
    '999휴머니티': Math.floor(base * 0.28), '해칭룸': Math.floor(base * 0.26), '나이키': Math.floor(base * 0.46),
    orders: Math.floor(base / 50000),
  };
}).reverse();

const weeklyData = Array.from({ length: 12 }, (_, i) => {
  const base = 1200000 + Math.floor(Math.random() * 1500000);
  return {
    period: `${12 - i}주차`,
    전체: base,
    상의: Math.floor(base * 0.28), 하의: Math.floor(base * 0.22), 아우터: Math.floor(base * 0.24), 신발: Math.floor(base * 0.16), 악세서리: Math.floor(base * 0.1),
    '999휴머니티': Math.floor(base * 0.28), '해칭룸': Math.floor(base * 0.26), '나이키': Math.floor(base * 0.46),
    orders: Math.floor(base / 40000),
  };
}).reverse();

const yearlyData = [
  { period: '2022', 전체: 38000000, 상의: 11000000, 하의: 8200000, 아우터: 8500000, 신발: 6300000, 악세서리: 4000000, '999휴머니티': 10640000, '해칭룸': 9880000, '나이키': 17480000, orders: 420 },
  { period: '2023', 전체: 52000000, 상의: 15000000, 하의: 11000000, 아우터: 12500000, 신발: 8000000, 악세서리: 5500000, '999휴머니티': 14560000, '해칭룸': 13520000, '나이키': 23920000, orders: 580 },
  { period: '2024', 전체: 64200000, 상의: 17880000, 하의: 12460000, 아우터: 11960000, 신발: 12580000, 악세서리: 9320000, '999휴머니티': 17976000, '해칭룸': 16692000, '나이키': 29532000, orders: 690 },
  { period: '2025', 전체: 6800000, 상의: 1700000, 하의: 1100000, 아우터: 2200000, 신발: 1050000, 악세서리: 750000, '999휴머니티': 1904000, '해칭룸': 1768000, '나이키': 3128000, orders: 78 },
];

const dataByPeriod = { daily: dailyData, weekly: weeklyData, monthly: monthlyData, yearly: yearlyData };

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
          <span className="sales-tooltip-value">₩{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const categoryColors = {
  상의: '#6c5ce7', 하의: '#3498db', 아우터: '#e67e22', 신발: '#27ae60', 악세서리: '#e74c3c',
};

const brandColors = {
  '999휴머니티': '#6c5ce7', '해칭룸': '#e67e22', '나이키': '#27ae60',
};

const SalesManagement = () => {
  const [period, setPeriod] = useState('monthly');
  const [viewTab, setViewTab] = useState('category');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedBrand, setSelectedBrand] = useState('전체');

  const data = dataByPeriod[period];

  const isCategory = viewTab === 'category';
  const activeFilter = isCategory ? selectedCategory : selectedBrand;
  const activeColors = isCategory ? categoryColors : brandColors;
  const activeOptions = isCategory ? CATEGORY_OPTIONS : BRAND_OPTIONS;
  const activeKeys = isCategory
    ? (selectedCategory === '전체' ? Object.keys(categoryColors) : [selectedCategory])
    : (selectedBrand === '전체' ? Object.keys(brandColors) : [selectedBrand]);

  const stats = useMemo(() => {
    const key = activeFilter;
    const total = data.reduce((sum, d) => sum + (d[key] || 0), 0);
    const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);
    const avg = Math.floor(total / data.length);
    const lastTwo = data.slice(-2);
    const current = lastTwo[1]?.[key] || 0;
    const previous = lastTwo[0]?.[key] || 1;
    const growthRate = ((current - previous) / previous * 100).toFixed(1);
    return { total, totalOrders, avg, growthRate: parseFloat(growthRate), current };
  }, [data, activeFilter]);

  const handleFilterClick = (value) => {
    if (isCategory) setSelectedCategory(value);
    else setSelectedBrand(value);
  };

  const handleViewTabChange = (tab) => {
    setViewTab(tab);
    setSelectedCategory('전체');
    setSelectedBrand('전체');
  };

  const chartTitle = () => {
    const periodLabel = PERIOD_OPTIONS.find(o => o.value === period)?.label;
    if (activeFilter === '전체') return `${periodLabel} 매출 추이`;
    return `${periodLabel} 매출 추이 — ${activeFilter}`;
  };

  const chartSubtitle = () => {
    if (activeFilter === '전체') return isCategory ? '카테고리별 매출 구성' : '브랜드별 매출 구성';
    return `${activeFilter} 매출`;
  };

  // 하단 카드에 표시할 항목
  const bottomCards = isCategory ? categoryColors : brandColors;

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
            <p className="sales-stat-label">평균 매출</p>
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

      {/* 필터 영역 */}
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

        <div className="sales-filter-group">
          <span className="sales-filter-label">분류</span>
          <div className="sales-view-tabs">
            {VIEW_TABS.map(tab => (
              <button
                key={tab.value}
                className={`sales-view-tab ${viewTab === tab.value ? 'active' : ''}`}
                onClick={() => handleViewTabChange(tab.value)}
              >{tab.label}</button>
            ))}
          </div>
        </div>

        <div className="sales-filter-group">
          <span className="sales-filter-label">{isCategory ? '카테고리' : '브랜드'}</span>
          <div className="sales-filter-btns">
            {activeOptions.map(opt => (
              <button
                key={opt}
                className={`sales-filter-btn ${activeFilter === opt ? 'active' : ''}`}
                onClick={() => handleFilterClick(opt)}
              >{opt}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 차트 */}
      <div className="sales-chart-card">
        <div className="sales-chart-header">
          <div>
            <h3 className="sales-chart-title">{chartTitle()}</h3>
            <p className="sales-chart-subtitle">{chartSubtitle()}</p>
          </div>
          <div className="sales-chart-current">
            <span className="sales-chart-current-label">최근 매출</span>
            <span className="sales-chart-current-value">₩{stats.current.toLocaleString()}</span>
          </div>
        </div>

        <div className="sales-chart-body">
          <ResponsiveContainer width="100%" height={360}>
            {activeFilter === '전체' ? (
              <BarChart data={data} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#999' }} axisLine={{ stroke: '#e8e8e8' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                {activeKeys.map((key, idx) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={activeColors[key]}
                    radius={idx === activeKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#999' }} axisLine={{ stroke: '#e8e8e8' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey={activeFilter}
                  stroke={activeColors[activeFilter]}
                  strokeWidth={3}
                  dot={{ r: 4, fill: activeColors[activeFilter] }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 하단 비교 카드 */}
      <div className={`sales-category-grid ${isCategory ? 'cols-5' : 'cols-3'}`}>
        {Object.entries(bottomCards).map(([name, color]) => {
          const itemTotal = data.reduce((sum, d) => sum + (d[name] || 0), 0);
          const allTotal = data.reduce((sum, d) => sum + d['전체'], 0);
          const percent = ((itemTotal / allTotal) * 100).toFixed(1);
          const lastTwo = data.slice(-2);
          const growth = lastTwo[0]?.[name]
            ? (((lastTwo[1]?.[name] || 0) - lastTwo[0][name]) / lastTwo[0][name] * 100).toFixed(1)
            : '0.0';

          return (
            <div className="sales-category-card" key={name}>
              <div className="sales-category-card-header">
                <div className="sales-category-dot" style={{ background: color }} />
                <span className="sales-category-name">{name}</span>
                <span className={`sales-category-growth ${parseFloat(growth) >= 0 ? 'positive' : 'negative'}`}>
                  <ArrowUpRight className="w-3.5 h-3.5" style={parseFloat(growth) < 0 ? { transform: 'rotate(90deg)' } : {}} />
                  {Math.abs(parseFloat(growth))}%
                </span>
              </div>
              <p className="sales-category-total">₩{itemTotal.toLocaleString()}</p>
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
