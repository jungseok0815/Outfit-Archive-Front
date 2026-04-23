import {useState,useEffect } from "react";
import Modal from "./Modal";
import ConfirmModal from "./ConfirmModal";
import "./ProductModal.css";
import { InsertProduct, UpdateProduct, DeleteProduct, HideProduct } from "../../../api/admin/product";
import { ImagePlus, X } from 'lucide-react'
import { toast } from "react-toastify";
import { CancelButton, DeleteButton, SubmitButton } from "../Button/Button";

const ProductModal = ({ isOpen, onClose, updateProduct, product, user }) => {

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [formData, setFormData] = useState({
    id : "",
    productNm: "",
    productEnNm: "",
    productPrice : "",
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
  // 사이즈
  const [sizes, setSizes] = useState([]); // [{sizeNm, quantity}]

  useEffect(() => {
    const autoBrandId = user?.brandId || "";
    if (product) {
      setFormData({
        id : product.id || "",
        productNm: product.productNm || "",
        productEnNm: product.productEnNm || "",
        productPrice: product.productPrice || "",
        brandId: product.brandId || autoBrandId,
        productCode: product.productCode || "",
        category: typeof product.category === 'object' ? (product.category?.name || '') : (product.category || ''),
      });
      setExistingImages(
        product.images?.map(img => ({ id: img.id, imgPath: img.imgPath })) || []
      );
      setRemovedImageIds([]);
      setNewFiles([]);
      setNewPreviews([]);
      setSizes(product.sizes?.map(s => ({ sizeNm: s.sizeNm, quantity: s.quantity })) || []);
      setHidden(product.hidden || false);
    } else {
      setFormData({
        id : "",
        productNm: "",
        productEnNm: "",
        productPrice: "",
        brandId: autoBrandId,
        productCode: "",
        category:  "",
      });
      setExistingImages([]);
      setRemovedImageIds([]);
      setNewFiles([]);
      setNewPreviews([]);
      setSizes([]);
      setHidden(false);
    }
  }, [product, user]);

  const handleToggleHidden = () => {
    HideProduct(formData.id)
      .then(res => {
        setHidden(res.data);
        updateProduct();
        toast.success(res.data ? '상품이 숨김 처리되었습니다.' : '상품이 노출 처리되었습니다.');
      })
      .catch(() => toast.error('처리에 실패했습니다.'));
  };


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

  const handleAddSize = () => setSizes(prev => [...prev, { sizeNm: '', quantity: '' }]);
  const handleRemoveSize = (i) => setSizes(prev => prev.filter((_, idx) => idx !== i));
  const handleSizeChange = (i, field, value) =>
    setSizes(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData();
    Object.entries(formData).forEach(([k, v]) => { if (v !== "") form.append(k, v); });
    newFiles.forEach(f => form.append('image', f));
    if (sizes.length > 0) form.append('sizesJson', JSON.stringify(sizes.filter(s => s.sizeNm.trim())));
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
    form.append('sizesJson', JSON.stringify(sizes.filter(s => s.sizeNm.toString().trim())));
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
                {/* 사이즈 관리 */}
                <div className="pm-size-section">
                  <div className="pm-size-header">
                    <span className="pm-size-label">사이즈별 수량</span>
                    <button type="button" className="pm-size-add-btn" onClick={handleAddSize}>+ 사이즈 추가</button>
                  </div>
                  {sizes.length === 0 ? (
                    <p className="pm-size-empty">사이즈를 추가하여 사이즈별 수량을 관리하세요.</p>
                  ) : (
                    <div className="pm-size-list">
                      {sizes.map((s, i) => (
                        <div key={i} className="pm-size-row">
                          <span className="pm-size-row-label">사이즈</span>
                          <input
                            type="text"
                            className="pm-size-input-nm"
                            placeholder="S / M / L / 95"
                            value={s.sizeNm}
                            onChange={e => handleSizeChange(i, 'sizeNm', e.target.value)}
                          />
                          <span className="pm-size-divider">|</span>
                          <span className="pm-size-row-label">수량</span>
                          <input
                            type="number"
                            className="pm-size-input-qty"
                            placeholder="0"
                            min="0"
                            value={s.quantity}
                            onChange={e => handleSizeChange(i, 'quantity', Number(e.target.value))}
                          />
                          <button type="button" className="pm-size-remove-btn" onClick={() => handleRemoveSize(i)}>
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end space-x-2">
              {!product  && (
                <SubmitButton children={"등록"}/>
              )}
              {product  && (
                <SubmitButton children={"수정"}/>
              )}
               {product && (
                <button
                  type="button"
                  onClick={handleToggleHidden}
                  className={`px-3 py-1.5 rounded text-sm font-medium border ${hidden ? 'bg-green-500 text-white border-green-500' : 'bg-gray-100 text-gray-600 border-gray-300'}`}
                >
                  {hidden ? '👁 노출하기' : '🚫 숨김처리'}
                </button>
              )}
              {product && user?.adminRole !== 'PARTNER' && (
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
