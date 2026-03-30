import { useState } from 'react';
import { Phone, MapPin } from 'lucide-react';
import { SubmitButton, DeleteButton } from '../../common/Button/Button';
import { InsertBrand, UpdateBrand, DeleteBrand } from '../../../api/admin/brand';
import { toast } from "react-toastify";
import ConfirmModal from '../../common/Modal/ConfirmModal';

// brand prop이 있으면 수정 모드, 없으면 등록 모드
const BrandItemCard = ({ brand, onSuccess }) => {
    const isEdit = !!brand;
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [formData, setFormData] = useState({
        brandNm: brand?.brandNm || "",
        brandNum: brand?.brandNum || "",
        brandImg: null,
        brandBannerImg: null,
        brandDc: brand?.brandDc || "",
        brandLocation: brand?.brandLocation || "",
    });
    const [preview, setPreview] = useState(brand?.imgPath || null);
    const [bannerPreview, setBannerPreview] = useState(brand?.bannerImgPath || null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, brandImg: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, brandBannerImg: file }));
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const fd = new FormData();
        if (isEdit) fd.append('id', brand.id);
        fd.append('brandNm', formData.brandNm);
        fd.append('brandNum', formData.brandNum);
        fd.append('brandDc', formData.brandDc);
        fd.append('brandLocation', formData.brandLocation);
        if (formData.brandImg) fd.append('brandImg', formData.brandImg);
        if (formData.brandBannerImg) fd.append('brandBannerImg', formData.brandBannerImg);

        const request = isEdit ? UpdateBrand(fd) : InsertBrand(fd);
        request
            .then(() => {
                toast.success(isEdit ? '브랜드가 수정되었습니다.' : '브랜드가 등록되었습니다.');
                if (onSuccess) onSuccess();
            })
            .catch(err => {
                const msg = err.response?.data?.msg || '처리 중 오류가 발생했습니다.';
                toast.error(msg);
            });
    };

    const handleDelete = () => {
        if (!brand) return;
        setConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        setConfirmOpen(false);
        DeleteBrand(brand.id)
            .then(() => {
                toast.success('브랜드가 삭제되었습니다.');
                if (onSuccess) onSuccess();
            })
            .catch(err => {
                const msg = err.response?.data?.msg || '삭제 중 오류가 발생했습니다.';
                toast.error(msg);
            });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <ConfirmModal
                isOpen={confirmOpen}
                message="브랜드를 삭제하시겠습니까? 해당 브랜드의 모든 상품도 함께 삭제될 수 있습니다."
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />
            <form onSubmit={handleSubmit} className="bg-white rounded-xl overflow-hidden">

                {/* 배너 이미지 업로드 */}
                <div className="p-4 border-b bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">배너 이미지</label>
                    <div
                        className="w-full h-32 bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center mb-2 relative cursor-pointer"
                        onClick={() => document.getElementById('bannerImgInput').click()}
                    >
                        {bannerPreview ? (
                            <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                        ) : (
                            <p className="text-gray-400 text-sm">배너 이미지 클릭하여 업로드</p>
                        )}
                    </div>
                    <input
                        id="bannerImgInput"
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className="hidden"
                    />
                </div>

                <div className="flex">
                    {/* 왼쪽 로고 섹션 */}
                    <div className="w-1/3 bg-gray-50 p-6 flex flex-col items-center justify-center border-r">
                        <p className="text-sm font-medium text-gray-700 mb-2">로고 이미지</p>
                        <div className="w-full aspect-square bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4 overflow-hidden">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-center p-4">
                                    <p className="text-gray-500 text-sm">로고 이미지 업로드</p>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    {/* 오른쪽 정보 입력 섹션 */}
                    <div className="w-2/3 p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">회사명</label>
                            <input
                                type="text"
                                name="brandNm"
                                value={formData.brandNm}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="회사명을 입력하세요"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">회사 소개</label>
                            <textarea
                                name="brandDc"
                                value={formData.brandDc}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="회사 소개를 입력하세요"
                            />
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>전화번호</span>
                                    </div>
                                </label>
                                <input
                                    type="tel"
                                    name="brandNum"
                                    value={formData.brandNum}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="전화번호를 입력하세요"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>주소</span>
                                    </div>
                                </label>
                                <input
                                    type="text"
                                    name="brandLocation"
                                    value={formData.brandLocation}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="주소를 입력하세요"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-2">
                            <SubmitButton>{isEdit ? "수정" : "등록"}</SubmitButton>
                            {isEdit && <DeleteButton onClick={handleDelete} type="button">삭제</DeleteButton>}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BrandItemCard;
