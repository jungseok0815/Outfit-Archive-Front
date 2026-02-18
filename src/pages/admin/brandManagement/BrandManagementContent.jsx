import React from "react";
import BrandAccordion from "../../../components/admin/brand/BrandAccordion";


const dummyBrands = [
  {
    title: "999휴머니티",
    content: "스트릿 패션 브랜드",
    logo: null,
    products: [
      { id: 1, productNm: "오버핏 후디", category: "상의", productPrice: 89000, productQuantity: 42, images: [] },
      { id: 2, productNm: "와이드 카고팬츠", category: "하의", productPrice: 79000, productQuantity: 35, images: [] },
      { id: 3, productNm: "그래픽 반팔티", category: "상의", productPrice: 45000, productQuantity: 120, images: [] },
      { id: 4, productNm: "나일론 백팩", category: "악세서리", productPrice: 65000, productQuantity: 28, images: [] },
    ],
  },
  {
    title: "해칭룸",
    content: "모던 캐주얼 브랜드",
    logo: null,
    products: [
      { id: 5, productNm: "울 블렌드 코트", category: "아우터", productPrice: 198000, productQuantity: 15, images: [] },
      { id: 6, productNm: "캐시미어 니트", category: "상의", productPrice: 128000, productQuantity: 22, images: [] },
      { id: 7, productNm: "슬랙스", category: "하의", productPrice: 89000, productQuantity: 50, images: [] },
    ],
  },
  {
    title: "나이키",
    content: "글로벌 스포츠 브랜드",
    logo: null,
    products: [
      { id: 8, productNm: "에어맥스 97", category: "신발", productPrice: 189000, productQuantity: 60, images: [] },
      { id: 9, productNm: "드라이핏 반팔티", category: "상의", productPrice: 45000, productQuantity: 200, images: [] },
      { id: 10, productNm: "테크 플리스 팬츠", category: "하의", productPrice: 109000, productQuantity: 85, images: [] },
      { id: 11, productNm: "윈드러너 자켓", category: "아우터", productPrice: 139000, productQuantity: 40, images: [] },
      { id: 12, productNm: "헤리티지 크로스백", category: "악세서리", productPrice: 35000, productQuantity: 150, images: [] },
    ],
  },
];

const BrandManagementContent = () => {
  return (
    <div className="productManagerContent overflow-scroll px-[20px] scrollbar-hide">
      <div className="container mx-auto px-4 py-7">
        <h2 className="text-xl font-bold text-gray-500 mb-6">브랜드 & 상품 목록</h2>
        <div className="w-full mx-auto space-y-3">
          {dummyBrands.map((brand, index) => (
            <BrandAccordion brand={brand} id={index} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandManagementContent;
