import {React, useState} from 'react';
import { ChevronDown, Edit2, Package } from 'lucide-react';
import BrandItemCard from './BrandItemCard';

const BrandAccordion = ({ brand, id }) => {
    const [activeIndex, setActiveIndex] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);

    const toggleAccordion = (index) => {
      setActiveIndex(activeIndex === index ? null : index);
    };

    const totalStock = brand.products?.reduce((sum, p) => sum + p.productQuantity, 0) || 0;
    const productCount = brand.products?.length || 0;

    return (
        <div key={id} className="border rounded-lg overflow-hidden shadow-sm">
          {/* 브랜드 헤더 */}
          <button
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
              onClick={() => toggleAccordion(id)}
          >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {brand.title?.charAt(0)}
                </div>
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">{brand.title}</span>
                  <span className="text-xs text-gray-400">{brand.content}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Package className="w-3.5 h-3.5" />
                  <span>{productCount}개 상품</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${
                      activeIndex === id ? 'rotate-180' : ''
                  }`}
                />
              </div>
          </button>

          {/* 확장 영역 */}
          <div
              className={`overflow-hidden transition-all duration-500 ${
                activeIndex === id
                  ? 'max-h-[2000px] opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
          >
              <div className="bg-gray-50 border-t">
                {/* 브랜드 요약 바 */}
                <div className="flex items-center justify-between px-5 py-3 bg-white border-b">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">총 상품</p>
                      <p className="text-sm font-bold text-gray-800">{productCount}개</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="text-center">
                      <p className="text-xs text-gray-400">총 재고</p>
                      <p className="text-sm font-bold text-gray-800">{totalStock.toLocaleString()}개</p>
                    </div>
                  </div>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setShowEditForm(!showEditForm); }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    브랜드 수정
                  </button>
                </div>

                {/* 브랜드 수정 폼 (토글) */}
                {showEditForm && (
                  <div className="p-3 border-b">
                    <BrandItemCard brand={brand}/>
                  </div>
                )}

                {/* 상품 그리드 */}
                <div className="p-4">
                  {brand.products && brand.products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {brand.products.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="relative h-32 bg-gray-100">
                            <img
                              src={
                                product.images?.length > 0
                                  ? `http://localhost:8080/api/img/get?imgNm=${product.images[0].imgNm}`
                                  : `https://placehold.co/400x320/f3f4f6/9ca3af?text=${encodeURIComponent(product.productNm)}`
                              }
                              alt={product.productNm}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2 left-2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded-full">
                              {product.category}
                            </span>
                          </div>
                          <div className="p-2.5">
                            <h4 className="text-sm font-semibold text-gray-800 truncate">
                              {product.productNm}
                            </h4>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-sm font-bold text-blue-500">
                                ₩{product.productPrice?.toLocaleString()}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                재고 {product.productQuantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* 상품 추가 버튼 */}
                      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center min-h-[180px] cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                        <div className="text-center">
                          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </div>
                          <span className="text-xs text-gray-400 font-medium">상품 추가</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      등록된 상품이 없습니다.
                    </div>
                  )}
                </div>
              </div>
          </div>
        </div>
    );
};

export default BrandAccordion;
