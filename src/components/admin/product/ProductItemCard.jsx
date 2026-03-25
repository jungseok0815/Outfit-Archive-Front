import {React} from 'react';


const ProductList = ({ product, openModal, id, selected, onToggleSelect }) => {

  return (
    <div
      key={id}
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 ${selected ? 'ring-2 ring-red-400' : ''}`}
      onClick={() => openModal(product)}
    >
      <div className="relative h-32">
        <img
          src={product.images.length === 0 ? "/api/placeholder/400/320" : product.images[0].imgPath}
          alt={product.productNm}
          className="w-full object-cover h-full"
        />
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