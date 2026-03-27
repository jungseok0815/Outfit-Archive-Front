import {React} from 'react';
import { HideProduct } from '../../../api/admin/product';
import { toast } from 'react-toastify';

const ProductList = ({ product, openModal, id, selected, onToggleSelect, onHideToggle }) => {

  const handleHideToggle = (e) => {
    e.stopPropagation();
    HideProduct(product.id)
      .then(res => {
        const isHidden = res.data;
        toast.success(isHidden ? '상품이 숨김 처리되었습니다.' : '상품이 노출 처리되었습니다.');
        onHideToggle?.();
      })
      .catch(() => toast.error('처리에 실패했습니다.'));
  };

  return (
    <div
      key={id}
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 ${selected ? 'ring-2 ring-red-400' : ''} ${product.hidden ? 'opacity-50' : ''}`}
      onClick={() => openModal(product)}
    >
      <div className="relative h-32">
        <img
          src={product.images.length === 0 ? "/api/placeholder/400/320" : product.images[0].imgPath}
          alt={product.productNm}
          className="w-full object-cover h-full"
        />
        {product.hidden && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-gray-700 px-2 py-1 rounded">숨김</span>
          </div>
        )}
        {onToggleSelect && (
          <div
            className="absolute top-1.5 left-1.5"
            onClick={e => { e.stopPropagation(); onToggleSelect(product.id); }}
          >
            <input
              type="checkbox"
              checked={!!selected}
              onChange={() => {}}
              className="w-4 h-4 accent-red-500 cursor-pointer"
            />
          </div>
        )}
        <button
          className={`absolute top-1.5 right-1.5 text-xs px-1.5 py-0.5 rounded font-medium ${product.hidden ? 'bg-green-500 text-white' : 'bg-gray-700 text-white'}`}
          onClick={handleHideToggle}
        >
          {product.hidden ? '노출' : '숨김'}
        </button>
      </div>
      <div className="p-2">
        <h3 className="text-sm font-semibold text-gray-800 mb-1 truncate">
          {product.productNm}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{product.category}</span>
          <span className="text-sm font-bold text-blue-400">
            ₩{product.productPrice?.toLocaleString()}
          </span>
        </div>
        <div className="mt-1">
          <span className="text-xs text-gray-400">
            재고: {product.productQuantity}개
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
