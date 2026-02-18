import React, { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, ChevronDown, Search, MapPin, Phone, User } from 'lucide-react';
import './OrderManagement.css';

const STATUS_OPTIONS = [
  { value: '결제완료', label: '결제완료', color: '#6c5ce7' },
  { value: '상품준비중', label: '상품준비중', color: '#f39c12' },
  { value: '배송중', label: '배송중', color: '#3498db' },
  { value: '배송완료', label: '배송완료', color: '#27ae60' },
  { value: '취소', label: '취소', color: '#e74c3c' },
];

const dummyOrders = [
  {
    date: '2025-01-15',
    orders: [
      {
        id: 'OA-20250115-001',
        product: { name: '오버핏 후디', brand: '999휴머니티', price: 89000, quantity: 1, image: null, category: '상의' },
        buyer: { name: '김민수', phone: '010-1234-5678', address: '서울시 강남구 역삼동 123-45' },
        status: '배송중',
        paymentMethod: '카드결제',
        shipping: { carrier: 'CJ대한통운', trackingNo: '640012345678', shippedAt: '2025-01-15 14:30' },
      },
      {
        id: 'OA-20250115-002',
        product: { name: '에어맥스 97', brand: '나이키', price: 189000, quantity: 1, image: null, category: '신발' },
        buyer: { name: '이지은', phone: '010-9876-5432', address: '서울시 마포구 서교동 456-78' },
        status: '결제완료',
        paymentMethod: '카드결제',
      },
      {
        id: 'OA-20250115-003',
        product: { name: '캐시미어 니트', brand: '해칭룸', price: 128000, quantity: 2, image: null, category: '상의' },
        buyer: { name: '박준혁', phone: '010-5555-1234', address: '경기도 성남시 분당구 정자동 11-3' },
        status: '상품준비중',
        paymentMethod: '무통장입금',
      },
    ],
  },
  {
    date: '2025-01-14',
    orders: [
      {
        id: 'OA-20250114-001',
        product: { name: '와이드 카고팬츠', brand: '999휴머니티', price: 79000, quantity: 1, image: null, category: '하의' },
        buyer: { name: '최서연', phone: '010-3333-7777', address: '서울시 송파구 잠실동 200-5' },
        status: '배송완료',
        paymentMethod: '카드결제',
        shipping: { carrier: '한진택배', trackingNo: '550098765432', shippedAt: '2025-01-13 09:15', deliveredAt: '2025-01-14 16:40' },
      },
      {
        id: 'OA-20250114-002',
        product: { name: '윈드러너 자켓', brand: '나이키', price: 139000, quantity: 1, image: null, category: '아우터' },
        buyer: { name: '정다윤', phone: '010-8888-2222', address: '인천시 남동구 구월동 55-12' },
        status: '배송완료',
        paymentMethod: '간편결제',
        shipping: { carrier: 'CJ대한통운', trackingNo: '640087654321', shippedAt: '2025-01-13 11:00', deliveredAt: '2025-01-14 14:20' },
      },
    ],
  },
  {
    date: '2025-01-13',
    orders: [
      {
        id: 'OA-20250113-001',
        product: { name: '울 블렌드 코트', brand: '해칭룸', price: 198000, quantity: 1, image: null, category: '아우터' },
        buyer: { name: '한지민', phone: '010-1111-4444', address: '서울시 용산구 이태원동 88-9' },
        status: '취소',
        paymentMethod: '카드결제',
      },
      {
        id: 'OA-20250113-002',
        product: { name: '테크 플리스 팬츠', brand: '나이키', price: 109000, quantity: 1, image: null, category: '하의' },
        buyer: { name: '오승우', phone: '010-6666-9999', address: '경기도 고양시 일산동구 장항동 33-7' },
        status: '배송중',
        paymentMethod: '카드결제',
        shipping: { carrier: '롯데택배', trackingNo: '770055556666', shippedAt: '2025-01-13 16:45' },
      },
      {
        id: 'OA-20250113-003',
        product: { name: '그래픽 반팔티', brand: '999휴머니티', price: 45000, quantity: 3, image: null, category: '상의' },
        buyer: { name: '신예은', phone: '010-2222-8888', address: '서울시 서초구 서초동 1600-3' },
        status: '배송완료',
        paymentMethod: '간편결제',
        shipping: { carrier: 'CJ대한통운', trackingNo: '640011112222', shippedAt: '2025-01-12 10:00', deliveredAt: '2025-01-13 11:30' },
      },
    ],
  },
];

const getStatusIcon = (status) => {
  switch (status) {
    case '결제완료': return <Clock className="w-4 h-4" />;
    case '상품준비중': return <Package className="w-4 h-4" />;
    case '배송중': return <Truck className="w-4 h-4" />;
    case '배송완료': return <CheckCircle className="w-4 h-4" />;
    case '취소': return <Clock className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const getStatusColor = (status) => {
  return STATUS_OPTIONS.find(s => s.value === status)?.color || '#999';
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
};

const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const totalOrders = dummyOrders.reduce((sum, g) => sum + g.orders.length, 0);
  const statusCounts = dummyOrders.flatMap(g => g.orders).reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const filteredGroups = dummyOrders.map(group => ({
    ...group,
    orders: group.orders.filter(order => {
      const matchSearch = searchTerm === '' ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product.name.includes(searchTerm) ||
        order.buyer.name.includes(searchTerm);
      const matchStatus = statusFilter === '전체' || order.status === statusFilter;
      return matchSearch && matchStatus;
    }),
  })).filter(group => group.orders.length > 0);

  return (
    <div className="order-management">
      {/* 요약 카드 */}
      <div className="order-summary-cards">
        <div className="order-summary-card order-summary-total">
          <p className="order-summary-label">전체 주문</p>
          <p className="order-summary-value">{totalOrders}</p>
        </div>
        {STATUS_OPTIONS.map(s => (
          <div className="order-summary-card" key={s.value}>
            <p className="order-summary-label">{s.label}</p>
            <p className="order-summary-value" style={{ color: s.color }}>{statusCounts[s.value] || 0}</p>
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="order-search-input"
          />
        </div>
        <div className="order-filter-btns">
          <button
            className={`order-filter-btn ${statusFilter === '전체' ? 'active' : ''}`}
            onClick={() => setStatusFilter('전체')}
          >전체</button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              className={`order-filter-btn ${statusFilter === s.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 날짜별 주문 목록 */}
      <div className="order-list">
        {filteredGroups.length === 0 ? (
          <div className="order-empty">검색 결과가 없습니다.</div>
        ) : (
          filteredGroups.map((group) => (
            <div className="order-date-group" key={group.date}>
              <div className="order-date-header">
                <span className="order-date-text">{formatDate(group.date)}</span>
                <span className="order-date-count">{group.orders.length}건</span>
              </div>

              <div className="order-date-items">
                {group.orders.map((order) => (
                  <div
                    className={`order-item ${expandedOrder === order.id ? 'expanded' : ''}`}
                    key={order.id}
                  >
                    {/* 주문 메인 행 */}
                    <div
                      className="order-item-main"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      {/* 상품 정보 */}
                      <div className="order-item-product">
                        <div className="order-item-thumb">
                          {order.product.image ? (
                            <img src={order.product.image} alt={order.product.name} />
                          ) : (
                            <div className="order-item-thumb-placeholder">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="order-item-product-info">
                          <span className="order-item-brand">{order.product.brand}</span>
                          <span className="order-item-name">{order.product.name}</span>
                          <span className="order-item-price">
                            ₩{(order.product.price * order.product.quantity).toLocaleString()}
                            {order.product.quantity > 1 && (
                              <span className="order-item-qty"> ({order.product.quantity}개)</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* 주문자 */}
                      <div className="order-item-buyer">
                        <User className="w-3.5 h-3.5" />
                        <span>{order.buyer.name}</span>
                      </div>

                      {/* 배송 상태 */}
                      <div
                        className="order-item-status"
                        style={{ '--status-color': getStatusColor(order.status) }}
                      >
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </div>

                      {/* 주문번호 & 확장 토글 */}
                      <div className="order-item-meta">
                        <span className="order-item-id">{order.id}</span>
                        <ChevronDown className={`order-item-chevron ${expandedOrder === order.id ? 'rotated' : ''}`} />
                      </div>
                    </div>

                    {/* 확장 상세 */}
                    {expandedOrder === order.id && (
                      <div className="order-item-detail">
                        <div className="order-detail-grid">
                          {/* 주문자 상세 */}
                          <div className="order-detail-section">
                            <h4 className="order-detail-title">주문자 정보</h4>
                            <div className="order-detail-rows">
                              <div className="order-detail-row">
                                <User className="w-4 h-4" />
                                <span>{order.buyer.name}</span>
                              </div>
                              <div className="order-detail-row">
                                <Phone className="w-4 h-4" />
                                <span>{order.buyer.phone}</span>
                              </div>
                              <div className="order-detail-row">
                                <MapPin className="w-4 h-4" />
                                <span>{order.buyer.address}</span>
                              </div>
                            </div>
                          </div>

                          {/* 상품 상세 */}
                          <div className="order-detail-section">
                            <h4 className="order-detail-title">상품 정보</h4>
                            <div className="order-detail-rows">
                              <div className="order-detail-row">
                                <span className="order-detail-label">브랜드</span>
                                <span>{order.product.brand}</span>
                              </div>
                              <div className="order-detail-row">
                                <span className="order-detail-label">카테고리</span>
                                <span>{order.product.category}</span>
                              </div>
                              <div className="order-detail-row">
                                <span className="order-detail-label">단가</span>
                                <span>₩{order.product.price.toLocaleString()}</span>
                              </div>
                              <div className="order-detail-row">
                                <span className="order-detail-label">수량</span>
                                <span>{order.product.quantity}개</span>
                              </div>
                              <div className="order-detail-row">
                                <span className="order-detail-label">결제수단</span>
                                <span>{order.paymentMethod}</span>
                              </div>
                            </div>
                          </div>

                          {/* 운송장 정보 */}
                          {order.shipping && (
                            <div className="order-detail-section">
                              <h4 className="order-detail-title">운송장 정보</h4>
                              <div className="order-shipping-card">
                                <div className="order-shipping-header">
                                  <Truck className="w-4 h-4" />
                                  <span className="order-shipping-carrier">{order.shipping.carrier}</span>
                                </div>
                                <div className="order-shipping-tracking">
                                  <span className="order-shipping-tracking-label">운송장번호</span>
                                  <span className="order-shipping-tracking-no">{order.shipping.trackingNo}</span>
                                </div>
                                <div className="order-shipping-dates">
                                  <div className="order-shipping-date-row">
                                    <span className="order-shipping-date-label">발송일시</span>
                                    <span>{order.shipping.shippedAt}</span>
                                  </div>
                                  {order.shipping.deliveredAt && (
                                    <div className="order-shipping-date-row">
                                      <span className="order-shipping-date-label">배송완료</span>
                                      <span>{order.shipping.deliveredAt}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 배송 상태 변경 */}
                          <div className="order-detail-section">
                            <h4 className="order-detail-title">배송 상태 관리</h4>
                            <div className="order-status-track">
                              {STATUS_OPTIONS.filter(s => s.value !== '취소').map((s, i) => {
                                const currentIdx = STATUS_OPTIONS.filter(x => x.value !== '취소').findIndex(x => x.value === order.status);
                                const isActive = i <= currentIdx && order.status !== '취소';
                                return (
                                  <div className={`order-status-step ${isActive ? 'active' : ''}`} key={s.value}>
                                    <div className="order-status-dot" style={isActive ? { backgroundColor: s.color } : {}} />
                                    <span className="order-status-step-label">{s.label}</span>
                                  </div>
                                );
                              })}
                            </div>
                            {order.status === '취소' && (
                              <div className="order-cancelled-badge">주문 취소됨</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
