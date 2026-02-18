import { React, useState } from "react";
import { useAuth } from "../../store/context/UserContext";
import "../../styles/admin/AdminMainPage.css";
import BrandManagement from "../admin/brandManagement/BrandManagement";
import OrderManagement from "../admin/orderManagement/OrderManagement";
import SalesManagement from "../admin/saleManagement/SalesManagement";

const menuItems = [
  {
    key: "브랜드 관리",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    key: "주문 관리",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    key: "매출 관리",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
  },
];

const registerLabels = {
  "브랜드 관리": "브랜드 등록",
};

function Admin() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState("브랜드 관리");
  const [registerTrigger, setRegisterTrigger] = useState(0);

  const handleRegisterClick = () => setRegisterTrigger((prev) => prev + 1);

  const renderContent = () => {
    switch (activePage) {
      case "브랜드 관리":
        return <BrandManagement registerTrigger={registerTrigger} />;
      case "주문 관리":
        return <OrderManagement />;
      case "매출 관리":
        return <SalesManagement />;
      default:
        return <div>잘못된 요청입니다.</div>;
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/admin";
  };

  return (
    <div className="admin-layout">
      {/* 사이드바 */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <span className="admin-logo-icon">OA</span>
          <span className="admin-logo-text">Outfit Archive</span>
        </div>

        <nav className="admin-sidebar-nav">
          <p className="admin-nav-label">메뉴</p>
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`admin-nav-item ${activePage === item.key ? "active" : ""}`}
              onClick={() => setActivePage(item.key)}
            >
              {item.icon}
              <span>{item.key}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {user?.userNm?.charAt(0) || "A"}
            </div>
            <div className="admin-user-detail">
              <span className="admin-user-name">{user?.userNm || "관리자"}</span>
              <span className="admin-user-role">Administrator</span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 영역 */}
      <div className="admin-main">
        {/* 상단 헤더 */}
        <header className="admin-header">
          <div className="admin-header-left">
            <h1 className="admin-header-title">{activePage}</h1>
            <div className="admin-header-breadcrumb">
              <span>관리자</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 6 15 12 9 18" />
              </svg>
              <span className="admin-breadcrumb-current">{activePage}</span>
            </div>
          </div>
          {registerLabels[activePage] && (
            <button className="admin-register-btn" onClick={handleRegisterClick}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {registerLabels[activePage]}
            </button>
          )}
        </header>

        {/* 콘텐츠 */}
        <div className="admin-content">{renderContent()}</div>
      </div>
    </div>
  );
}

export default Admin;
