import React from "react";
import { Zap } from "lucide-react";
import "../../../styles/admin/productManagement/ProductManagementSearchbar.css";
import { SearchBar } from "../../../components/admin/searchbar/Searchbar";

const BrandManagementSearchbar = ({ keyword, setKeyword, onAutoCollect }) => {
    return (
        <nav className="productManagerSearchbar">
            <div className="navbar-content" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SearchBar
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="브랜드명을 입력하세요"
                    value={keyword}
                    width="500px"
                />
                <button
                    onClick={onAutoCollect}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        fontFamily: 'inherit',
                        color: '#fff',
                        background: '#f59e0b',
                        border: 'none',
                        borderRadius: '9px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#d97706'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f59e0b'}
                >
                    <Zap size={14} />
                    자동 상품
                </button>
            </div>
        </nav>
    );
};

export default BrandManagementSearchbar;
