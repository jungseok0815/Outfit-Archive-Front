import React, { useState, useEffect, useMemo } from 'react';
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronLeft, ChevronRight, Search, MapPin, Phone, User } from 'lucide-react';
import './OrderManagement.css';
import { ListOrder, UpdateOrderStatus, DeleteOrder } from '../../../api/admin/order';

// 백엔드 OrderStatus enum → 한글 매핑
const STATUS_MAP = {
    PAYMENT_COMPLETE: { label: '결제완료', color: '#6c5ce7' },
    SHIPPING: { label: '배송중', color: '#3498db' },
    DELIVERED: { label: '배송완료', color: '#27ae60' },
    CANCELLED: { label: '취소', color: '#e74c3c' },
};

const STATUS_ORDER = ['PAYMENT_COMPLETE', 'SHIPPING', 'DELIVERED'];

const PAGE_SIZE = 10;

const getStatusIcon = (status) => {
    switch (status) {
        case 'PAYMENT_COMPLETE': return <Clock className="w-4 h-4" />;
        case 'SHIPPING': return <Truck className="w-4 h-4" />;
        case 'DELIVERED': return <CheckCircle className="w-4 h-4" />;
        case 'CANCELLED': return <Clock className="w-4 h-4" />;
        default: return <Clock className="w-4 h-4" />;
    }
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
};

const formatDateKey = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
};

const OrderManagement = ({ user }) => {
    const brandId = user?.adminRole === 'PARTNER' ? user?.brandId : null;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('전체');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const res = await ListOrder('', 0, 200, brandId);
            setOrders(res.data.content || []);
        } catch (e) {
            console.error('주문 조회 실패:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const totalOrders = orders.length;
    const statusCounts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});

    // 검색 + 상태 필터링
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchSearch = searchTerm === '' ||
                String(order.id).includes(searchTerm) ||
                order.productNm?.includes(searchTerm) ||
                order.recipientName?.includes(searchTerm) ||
                order.userNm?.includes(searchTerm);
            const matchStatus = statusFilter === '전체' || order.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    const totalFiltered = filteredOrders.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const pagedOrders = filteredOrders.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    // 날짜별 그룹핑
    const pagedGroups = useMemo(() => {
        const map = new Map();
        pagedOrders.forEach(order => {
            const key = formatDateKey(order.orderDate);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(order);
        });
        return Array.from(map.entries()).map(([date, orders]) => ({ date, orders }));
    }, [pagedOrders]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (value) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleStatusUpdate = (order, newStatus) => {
        UpdateOrderStatus({ id: order.id, status: newStatus })
            .then(() => {
                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
            })
            .catch(err => {
                alert(err.response?.data?.msg || '상태 변경에 실패했습니다.');
            });
    };

    const handleDelete = (orderId) => {
        if (!window.confirm('주문을 삭제하시겠습니까?')) return;
        DeleteOrder(orderId)
            .then(() => {
                setOrders(prev => prev.filter(o => o.id !== orderId));
            })
            .catch(err => {
                alert(err.response?.data?.msg || '삭제에 실패했습니다.');
            });
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
        let end = start + maxVisible - 1;
        if (end > totalPages) { end = totalPages; start = Math.max(1, end - maxVisible + 1); }
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    if (loading) {
        return <div className="order-management"><div className="order-empty">주문 데이터를 불러오는 중...</div></div>;
    }

    return (
        <div className="order-management">
            {/* 요약 카드 */}
            <div className="order-summary-cards">
                <div className="order-summary-card order-summary-total">
                    <p className="order-summary-label">전체 주문</p>
                    <p className="order-summary-value">{totalOrders}</p>
                </div>
                {Object.entries(STATUS_MAP).map(([key, { label, color }]) => (
                    <div className="order-summary-card" key={key}>
                        <p className="order-summary-label">{label}</p>
                        <p className="order-summary-value" style={{ color }}>{statusCounts[key] || 0}</p>
                    </div>
                ))}
            </div>

            {/* 검색 & 필터 */}
            <div className="order-toolbar">
                <div className="order-search-box">
                    <Search className="order-search-icon" />
                    <input
                        type="text"
                        placeholder="주문번호, 상품명, 주문자명 검색"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="order-search-input"
                    />
                </div>
                <div className="order-filter-btns">
                    <button
                        className={`order-filter-btn ${statusFilter === '전체' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('전체')}
                    >전체</button>
                    {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                        <button
                            key={key}
                            className={`order-filter-btn ${statusFilter === key ? 'active' : ''}`}
                            onClick={() => handleFilterChange(key)}
                        >{label}</button>
                    ))}
                </div>
            </div>

            {/* 날짜별 주문 목록 */}
            <div className="order-list">
                {pagedGroups.length === 0 ? (
                    <div className="order-empty">검색 결과가 없습니다.</div>
                ) : (
                    pagedGroups.map((group) => (
                        <div className="order-date-group" key={group.date}>
                            <div className="order-date-header">
                                <span className="order-date-text">{formatDate(group.date)}</span>
                                <span className="order-date-count">{group.orders.length}건</span>
                            </div>

                            <div className="order-date-items">
                                {group.orders.map((order) => {
                                    const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: '#999' };
                                    return (
                                        <div
                                            className={`order-item ${expandedOrder === order.id ? 'expanded' : ''}`}
                                            key={order.id}
                                        >
                                            {/* 주문 메인 행 */}
                                            <div
                                                className="order-item-main"
                                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                            >
                                                <div className="order-item-product">
                                                    <div className="order-item-thumb">
                                                        <div className="order-item-thumb-placeholder">
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                    </div>
                                                    <div className="order-item-product-info">
                                                        <span className="order-item-brand">{order.userNm}</span>
                                                        <span className="order-item-name">{order.productNm}</span>
                                                        <span className="order-item-price">
                                                            ₩{order.totalPrice?.toLocaleString()}
                                                            {order.quantity > 1 && (
                                                                <span className="order-item-qty"> ({order.quantity}개)</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="order-item-buyer">
                                                    <User className="w-3.5 h-3.5" />
                                                    <span>{order.recipientName}</span>
                                                </div>

                                                <div
                                                    className="order-item-status"
                                                    style={{ '--status-color': statusInfo.color }}
                                                >
                                                    {getStatusIcon(order.status)}
                                                    <span>{statusInfo.label}</span>
                                                </div>

                                                <div className="order-item-meta">
                                                    <span className="order-item-id">#{order.id}</span>
                                                    <ChevronDown className={`order-item-chevron ${expandedOrder === order.id ? 'rotated' : ''}`} />
                                                </div>
                                            </div>

                                            {/* 확장 상세 */}
                                            {expandedOrder === order.id && (
                                                <div className="order-item-detail">
                                                    <div className="order-detail-grid">
                                                        {/* 수령인 정보 */}
                                                        <div className="order-detail-section">
                                                            <h4 className="order-detail-title">수령인 정보</h4>
                                                            <div className="order-detail-rows">
                                                                <div className="order-detail-row">
                                                                    <User className="w-4 h-4" />
                                                                    <span>{order.recipientName}</span>
                                                                </div>
                                                                <div className="order-detail-row">
                                                                    <Phone className="w-4 h-4" />
                                                                    <span>{order.recipientPhone}</span>
                                                                </div>
                                                                <div className="order-detail-row">
                                                                    <MapPin className="w-4 h-4" />
                                                                    <span>{order.shippingAddress}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* 상품 정보 */}
                                                        <div className="order-detail-section">
                                                            <h4 className="order-detail-title">상품 정보</h4>
                                                            <div className="order-detail-rows">
                                                                <div className="order-detail-row">
                                                                    <span className="order-detail-label">주문자</span>
                                                                    <span>{order.userNm} ({order.userId})</span>
                                                                </div>
                                                                <div className="order-detail-row">
                                                                    <span className="order-detail-label">상품명</span>
                                                                    <span>{order.productNm}</span>
                                                                </div>
                                                                <div className="order-detail-row">
                                                                    <span className="order-detail-label">수량</span>
                                                                    <span>{order.quantity}개</span>
                                                                </div>
                                                                <div className="order-detail-row">
                                                                    <span className="order-detail-label">결제금액</span>
                                                                    <span>₩{order.totalPrice?.toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* 배송 상태 관리 */}
                                                        <div className="order-detail-section">
                                                            <h4 className="order-detail-title">배송 상태 관리</h4>
                                                            <div className="order-status-track">
                                                                {STATUS_ORDER.map((statusKey, i) => {
                                                                    const currentIdx = STATUS_ORDER.indexOf(order.status);
                                                                    const isActive = i <= currentIdx && order.status !== 'CANCELLED';
                                                                    const info = STATUS_MAP[statusKey];
                                                                    return (
                                                                        <div
                                                                            className={`order-status-step ${isActive ? 'active' : ''}`}
                                                                            key={statusKey}
                                                                            onClick={() => order.status !== 'CANCELLED' && handleStatusUpdate(order, statusKey)}
                                                                            style={{ cursor: order.status !== 'CANCELLED' ? 'pointer' : 'default' }}
                                                                        >
                                                                            <div className="order-status-dot" style={isActive ? { backgroundColor: info.color } : {}} />
                                                                            <span className="order-status-step-label">{info.label}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            {order.status === 'CANCELLED' && (
                                                                <div className="order-cancelled-badge">주문 취소됨</div>
                                                            )}
                                                            <div className="flex gap-2 mt-3">
                                                                {order.status !== 'CANCELLED' && (
                                                                    <button
                                                                        className="text-xs px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                                                                        onClick={() => handleStatusUpdate(order, 'CANCELLED')}
                                                                    >
                                                                        주문 취소
                                                                    </button>
                                                                )}
                                                                <button
                                                                    className="text-xs px-3 py-1.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                                                                    onClick={() => handleDelete(order.id)}
                                                                >
                                                                    주문 삭제
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 페이징 */}
            {totalFiltered > 0 && (
                <div className="order-pagination">
                    <div className="order-pagination-info">
                        총 <strong>{totalFiltered}</strong>건 중{' '}
                        <strong>{(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, totalFiltered)}</strong>건
                    </div>
                    <div className="order-pagination-controls">
                        <button className="order-page-btn order-page-arrow" disabled={safePage <= 1} onClick={() => setCurrentPage(1)}>
                            <ChevronLeft className="w-4 h-4" /><ChevronLeft className="w-4 h-4 order-page-double" />
                        </button>
                        <button className="order-page-btn order-page-arrow" disabled={safePage <= 1} onClick={() => setCurrentPage(safePage - 1)}>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {getPageNumbers().map(num => (
                            <button key={num} className={`order-page-btn ${safePage === num ? 'active' : ''}`} onClick={() => setCurrentPage(num)}>
                                {num}
                            </button>
                        ))}
                        <button className="order-page-btn order-page-arrow" disabled={safePage >= totalPages} onClick={() => setCurrentPage(safePage + 1)}>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button className="order-page-btn order-page-arrow" disabled={safePage >= totalPages} onClick={() => setCurrentPage(totalPages)}>
                            <ChevronRight className="w-4 h-4" /><ChevronRight className="w-4 h-4 order-page-double" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
