import React,{useState, useEffect, useRef} from 'react';
import SearchBar from "./ProductManagementSearchbar";
import Content from "./ProductManagementContent"
import ProducttModal from "../../../components/common/Modal/ProductModal"
import "../../../styles/admin/productManagement/ProductManagement.css"
import { toast } from "react-toastify";
import { ListProduct, BulkInsertProduct } from '../../../api/admin/product';
import useUpdateEffect from '../../../hooks/useDidMountEffect';
import { FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 24;

const ProductManagement = ({ registerTrigger, user }) => {
  const isPartner = user?.adminRole === 'PARTNER';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [updateProduct, setUpdateProduct] = useState(false)
  const [product, setProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);
  const excelInputRef = useRef(null);

  const filterByBrand = (list) => {
    if (!Array.isArray(list)) return [];
    if (!isPartner || !user?.brandId) return list;
    return list.filter((p) => p.brandId === user.brandId);
  };

  // 초기 상품 리스트 조회
  useEffect(() => {fetchProducts()}, [])

  // 상품 변경 시 렌더링
  useEffect(()=> {
    if(updateProduct){
      fetchProducts()
      setUpdateProduct(false)
    }
  },[updateProduct])


  useUpdateEffect(()=>{
    ListProduct(searchTerm).then((res)=>{
      if(res.status === 200) {
        setProducts(filterByBrand(res.data.content))
        setCurrentPage(1)
      }
    })
  },[searchTerm])

  // 헤더 등록 버튼 클릭 시 모달 열기
  useEffect(() => {
    if (registerTrigger > 0) handleOpenModal(false);
  }, [registerTrigger])
 

  //product list를 호출하는 api
  const fetchProducts =  async () => {
    try {
        const response = await ListProduct(null);
        setProducts(filterByBrand(response.data.content));
    } catch (error) {
        console.error("상품 목록 조회 실패:", error);
    }
  };

  //모달이 열리도록 상태값을 변경
  const handleOpenModal = (selectProduct) => {
    setIsModalOpen(true)
    if(selectProduct){   
      setProduct(selectProduct)
    }else{
      setProduct(null)
    }
  };  
  //모달이 닫히도록 상태가을 변경
  const handleCloseModal = () => setIsModalOpen(false);
  
  //상품 등록 수정 삭제 시 바로 반영되도록 상태값을 변경
  const handleUpdateProduct = () => setUpdateProduct(true)

  const handleChangeSearchTerm = (e) => setSearchTerm(e.target.value)

  // 페이징 계산
  const totalProducts = products.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedProducts = products.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > totalPages) { end = totalPages; start = Math.max(1, end - maxVisible + 1); }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    toast.info(`"${file.name}" 업로드 중...`);
    BulkInsertProduct(file)
      .then(res => {
        toast.success(res.data);
        fetchProducts();
      })
      .catch(() => toast.error('일괄 등록에 실패했습니다.'));
    e.target.value = '';
  };

  return <div>
      <SearchBar searchTerm={searchTerm} onChange={handleChangeSearchTerm}/>

      {/* 액션 툴바 */}
      <div className="pm-toolbar">
        <button className="pm-btn-register" onClick={() => handleOpenModal(false)}>
          + 상품 등록
        </button>
        <button className="pm-btn-excel" onClick={() => excelInputRef.current?.click()}>
          <FileSpreadsheet size={15}/>
          ZIP 일괄 등록
        </button>
        <input ref={excelInputRef} type="file" accept=".zip" hidden onChange={handleExcelUpload}/>
        <div className="pm-guide-wrap" onMouseEnter={() => setGuideOpen(true)} onMouseLeave={() => setGuideOpen(false)}>
          <button className="pm-btn-guide">?</button>
          {guideOpen && (
        <div className="pm-guide">
          <h4 className="pm-guide-title">ZIP 파일 구성 방법</h4>
          <p className="pm-guide-desc">ZIP 파일 안에 products.xlsx와 이미지 파일을 함께 넣어주세요.</p>
          <div className="pm-guide-structure">
            <code>products.zip</code>
            <code>├── products.xlsx</code>
            <code>├── image1.jpg</code>
            <code>└── image2.jpg</code>
          </div>
          <p className="pm-guide-desc" style={{marginTop:'10px'}}>엑셀 열 순서 (1행: 헤더, 2행부터 데이터)</p>
          <table className="pm-guide-table">
            <thead>
              <tr>
                <th>열</th><th>항목</th><th>형식</th><th>예시</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>A</td><td>상품명</td><td>텍스트</td><td>슬림 데님 팬츠</td></tr>
              <tr><td>B</td><td>상품코드</td><td>텍스트</td><td>P2024-001</td></tr>
              <tr><td>C</td><td>가격</td><td>숫자(원)</td><td>59000</td></tr>
              <tr><td>D</td><td>수량</td><td>숫자</td><td>100</td></tr>
              <tr><td>E</td><td>카테고리</td><td>코드</td><td>BOTTOM</td></tr>
              <tr><td>F</td><td>브랜드ID</td><td>숫자</td><td>1</td></tr>
              <tr><td>G</td><td>이미지파일명</td><td>텍스트</td><td>image1.jpg</td></tr>
            </tbody>
          </table>
          <div className="pm-guide-categories">
            <span className="pm-guide-label">카테고리 코드</span>
            {[
              { code: 'TOP', label: '상의' },
              { code: 'BOTTOM', label: '하의' },
              { code: 'OUTER', label: '아우터' },
              { code: 'DRESS', label: '원피스/세트' },
              { code: 'SHOES', label: '신발' },
              { code: 'BAG', label: '가방' },
            ].map(({ code, label }) => (
              <span key={code} className="pm-guide-badge">{code} ({label})</span>
            ))}
          </div>
        </div>
          )}
        </div>
      </div>

      <Content products={pagedProducts} openModal={handleOpenModal}/>

      {/* 페이징 */}
      {totalProducts > 0 && (
        <div className="pm-pagination">
          <div className="pm-pagination-info">
            총 <strong>{totalProducts}</strong>건 중{' '}
            <strong>{(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, totalProducts)}</strong>건
          </div>
          <div className="pm-pagination-controls">
            <button className="pm-page-btn pm-page-arrow" disabled={safePage <= 1} onClick={() => setCurrentPage(1)}>
              <ChevronLeft className="w-4 h-4" /><ChevronLeft className="w-4 h-4 pm-page-double" />
            </button>
            <button className="pm-page-btn pm-page-arrow" disabled={safePage <= 1} onClick={() => setCurrentPage(safePage - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            {getPageNumbers().map(num => (
              <button key={num} className={`pm-page-btn ${safePage === num ? 'active' : ''}`} onClick={() => setCurrentPage(num)}>
                {num}
              </button>
            ))}
            <button className="pm-page-btn pm-page-arrow" disabled={safePage >= totalPages} onClick={() => setCurrentPage(safePage + 1)}>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="pm-page-btn pm-page-arrow" disabled={safePage >= totalPages} onClick={() => setCurrentPage(totalPages)}>
              <ChevronRight className="w-4 h-4" /><ChevronRight className="w-4 h-4 pm-page-double" />
            </button>
          </div>
        </div>
      )}

      <ProducttModal isOpen={isModalOpen} onClose={handleCloseModal} updateProduct={handleUpdateProduct} product={product} user={user}/>
    </div>;
};

export default ProductManagement;