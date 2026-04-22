import React from "react";
import "../../../styles/admin/productManagement/ProductManagementSearchbar.css";
import { SearchBar } from "../../../components/admin/searchbar/Searchbar";

const BrandManagementSearchbar = ({ keyword, setKeyword }) => {
    return (
        <nav className="productManagerSearchbar">
            <div className="navbar-content">
                <SearchBar
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="브랜드명을 입력하세요"
                    value={keyword}
                    width="500px"
                />
            </div>
        </nav>
    );
};

export default BrandManagementSearchbar;
