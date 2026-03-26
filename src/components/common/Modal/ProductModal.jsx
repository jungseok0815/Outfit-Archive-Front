import {useState,useEffect } from "react";
import Modal from "./Modal";
import ConfirmModal from "./ConfirmModal";
import "./ProductModal.css";
import { InsertProduct, UpdateProduct, DeleteProduct} from "../../../api/admin/product";
import { ImagePlus, X } from 'lucide-react'
import { toast } from "react-toastify";
import { CancelButton, DeleteButton, SubmitButton } from "../Button/Button";

const ProductModal = ({ isOpen, onClose, updateProduct, product, user }) => {

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id : "",
    productNm: "",
    productEnNm: "",
    productPrice : "",
    productQuantity : "",
    brandId : "",
    productCode : "",
    category: "",
  });

  // 기존 이미지 (수정 모드)
  const [existingImages, setExistingImages] = useState([]); // [{id, imgPath}]
  const [removedImageIds, setRemovedImageIds] = useState([]); // 삭제할 이미지 ID 목록
  // 새로 추가할 파일
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  useEffect(() => {
    const autoBrandId = user?.brandId || "";
    if (product) {
      setFormData({
        id : product.id || "",
        productNm: product.productNm || "",
        productEnNm: product.productEnNm || "",
        productPrice: product.productPrice || "",
        productQuantity: product.productQuantity || "",
        brandId: product.brandId || autoBrandId,
        productCode: product.productCode || "",
        category: product.category || "",
      });
      setExistingImages(
        product.images?.map(img => ({ id: img.id, imgPath: img.imgPath })) || []
      );
      setRemovedImageIds([]);
      setNewFiles([]);
      setNewPreviews([]);
    } else {
      setFormData({
        id : "",
        productNm: "",
        productEnNm: "",
        productPrice: "",
        productQuantity: "",
        brandId: autoBrandId,
        productCode: "",
        category:  "",
      });
      setExistingImages([]);
      setRemovedImageIds([]);
      setNewFiles([]);
      setNewPreviews([]);
    }
  }, [product, user]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalCount = existingImages.length + newFiles.length + files.length;
    if (totalCount > 4) {
      toast.warn("사진은 최대 4장 등록 가능합니다!");
      return;
    }
    setNewFiles(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setNewPreviews(prev => [...prev, ...previews]);
    e.target.value = "";
  };

  const handleRemoveExisting = (imgId) => {
    setExistingImages(prev => prev.filter(img => img.id !== imgId));
    setRemovedImageIds(prev => [...prev, imgId]);
  };

  const handleRemoveNew = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData();
    Object.entries(formData).forEach(([k, v]) => { if (v !== "") form.append(k, v); });
    newFiles.forEach(f => form.append('image', f));
    InsertProduct(form)
      .then(res => {
        if (res.status === 200 || res.status === 201) {
          toast.success("상품등록 성공!")
          updateProduct()
          onClose();
        }
      }).catch(() => {
        toast.error("상품등록 실패")
      }).finally(() => setSubmitting(false));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData();
    Object.entries(formData).forEach(([k, v]) => { if (v !== "") form.append(k, v); });
    newFiles.forEach(f => form.append('image', f));
    removedImageIds.forEach(id => form.append('deleteImageIds', id));
    UpdateProduct(form)
      .then(res => {
        if (res.status === 200) {
          toast.success("상품 수정 성공!")
          updateProduct()
          onClose();
        }
      }).catch(() => {
        toast.error("상품 수정 실패")
      }).finally(() => setSubmitting(false));
  };

  const handlerDeleteProduct = (e) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    DeleteProduct(formData.id)
      .then(res => {
        if (res.status === 200) {
          toast.success("상품 삭제 성공!")
          updateProduct()
          onClose();
        }
      }).catch(() => {
        toast.error("상품 삭제 실패")
      });
  };

  return (
    <div>
      <ConfirmModal
        isOpen={confirmOpen}
        message="해당 상품을 삭제하시겠습니까?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        width="800px"
        height="500px">
        {submitting && (
          <div className="product-modal-progress">
            <div className="product-modal-progress-bar" />
          </div>
        )}
        <div className="bg-white rounded-lg w-full max-w-4xl">
         <form onSubmit={product ? handleUpdate : handleSubmit} className="p-6">
            <h2 className="text-2xl font-semibold mb-4">상품 {product ? "수정" : "등록"}</h2>

            <div className="flex gap-6">
              {/* 왼쪽: 이미지 업로드 섹션 */}
              <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상품 이미지
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      id="imageUpload"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <label
                      htmlFor="imageUpload"
                      className="block w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <ImagePlus className="w-8 h-8 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">이미지를 추가하세요</span>
                        <span className="mt-1 text-xs text-gray-400">
                          (최대 5MB, jpg/png 파일)
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* 이미지 미리보기 */}
                  {(existingImages.length > 0 || newPreviews.length > 0) && (
                    <div className="flex flex-wrap gap-2" style={{ marginTop: "8px" }}>
                      {/* 기존 이미지 */}
                      {existingImages.map((img) => (
                        <div key={"exist-" + img.id} className="relative h-16 w-16">
                          <div className="h-16 w-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={img.imgPath}
                              alt="기존이미지"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExisting(img.id)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                      {/* 새로 추가한 이미지 */}
                      {newPreviews.map((url, index) => (
                        <div key={"new-" + index} className="relative h-16 w-16">
                          <div className="h-16 w-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={url}
                              alt={`새이미지-${index}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveNew(index)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    * 이미지는 최대 4장까지 등록 가능합니다.
                  </p>
                </div>
              </div>

              {/* 오른쪽: 상품 정보 입력 폼 */}
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품명 (한글)
                    </label>
                    <input
                      type="text"
                      name="productNm"
                      value={formData.productNm}
                      onChange={handleChange}
                      placeholder="상품명을 입력하세요"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품명 (영문)
                    </label>
                    <input
                      type="text"
                      name="productEnNm"
                      value={formData.productEnNm}
                      onChange={handleChange}
                      placeholder="English product name"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      카테고리
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">선택하세요</option>
                      <option value="TOP">상의</option>
                      <option value="BOTTOM">하의</option>
                      <option value="OUTER">아우터</option>
                      <option value="DRESS">드레스</option>
                      <option value="SHOES">신발</option>
                      <option value="BAG">가방</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품코드
                    </label>
                    <input
                      type="text"
                      name="productCode"
                      value={formData.productCode}
                      onChange={handleChange}
                      placeholder="상품코드 입력"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      수량
                    </label>
                    <input
                      type="number"
                      name="productQuantity"
                      value={formData.productQuantity}
                      onChange={handleChange}
                      placeholder="수량 입력"
                      min="0"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      가격
                    </label>
                    <input
                      type="number"
                      name="productPrice"
                      value={formData.productPrice}
                      onChange={handleChange}
                      placeholder="가격 입력"
                      min="0"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                <div className="mt-16 flex justify-end space-x-2">
              {!product  && (
                <SubmitButton children={"등록"}/>
              )}
              {product  && (
                <SubmitButton children={"수정"}/>
              )}
               {product  && (
                <DeleteButton onClick={handlerDeleteProduct} children={"삭제"}/>
              )}
              <CancelButton onClick={onClose} children={"취소"}/>

            </div>
              </div>
            </div>


          </form>
        </div>
      </Modal>

    </div>
  );
}
export default ProductModal;
