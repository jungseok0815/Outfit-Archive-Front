import React,{useState, useEffect, useRef} from 'react';
import SearchBar from "./ProductManagementSearchbar";
import Content from "./ProductManagementContent"
import ProducttModal from "../../../components/common/Modal/ProductModal"
import "../../../styles/admin/productManagement/ProductManagement.css"
import { InsertButton } from '../../../components/common/Button/Button';
import { ListProduct } from '../../../api/user/product';
import useUpdateEffect from '../../../hooks/useDidMountEffect';


const ProductManagement = ({ registerTrigger, user }) => {
  const isPartner = user?.adminRole === 'PARTNER';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [updateProduct, setUpdateProduct] = useState(false)
  const [product, setProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);

  const filterByBrand = (list) => {
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
      if(res.status === 200) setProducts(filterByBrand(res.data.data.content))
    })
  },[searchTerm])

  useUpdateEffect(()=>{
    console.log("tetete1111")
  },[page])

  // 헤더 등록 버튼 클릭 시 모달 열기
  useEffect(() => {
    if (registerTrigger > 0) handleOpenModal(false);
  }, [registerTrigger])
 

  //product list를 호출하는 api
  const fetchProducts =  async () => {
    try {
        const response = await ListProduct(null);
        setProducts(filterByBrand(response.data.data.content));
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


  return <div>
      <SearchBar searchTerm={searchTerm} onChange={handleChangeSearchTerm}/>
      <Content products={products} openModal={handleOpenModal}/>
      <ProducttModal isOpen={isModalOpen} onClose={handleCloseModal} updateProduct={handleUpdateProduct} product={product}/>
    </div>;
};

export default ProductManagement;