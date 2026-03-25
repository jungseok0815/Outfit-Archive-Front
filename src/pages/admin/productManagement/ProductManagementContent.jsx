import React from "react";
import "../../../styles/admin/productManagement/ProductManagementContent.css"
import ProductItem from "../../../components/admin/product/ProductItemCard";

const ProductManagerContent = ({products, openModal, selectedIds, onToggleSelect}) => {
  return (
   <div className="productManagerContent overflow-scroll px-[20px] scrollbar-hide" >
      <div className="container mx-auto  px-4 py-7">
        <h2 className="text-xl font-bold text-gray-500 mb-6">상품 목록</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {products.map((product,index) => (
                <ProductItem key={index} product={product} openModal={openModal} id={index}
                  selected={selectedIds?.has(product.id)}
                  onToggleSelect={onToggleSelect}
                />
            ))}
        </div>
      </div>
   </div>
  )
 
};

export default ProductManagerContent;