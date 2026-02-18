import {React, useState, useEffect} from 'react';
import { ChevronDown } from 'lucide-react';
import BrandItemCard from './BrandItemCard';

const BrandInsertAccordion = ({ forceOpen, onClose }) => {
    const [activeIndex, setActiveIndex] = useState(true);

    useEffect(() => {
        if (forceOpen) {
            setActiveIndex(false); // false = 열림 상태 (기존 로직 유지)
            if (onClose) onClose();
        }
    }, [forceOpen]);

    const handleChageActive = () => {
        setActiveIndex(!activeIndex)
    }

    return (
        <div className="border rounded-lg overflow-hidden">
        <button
            className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors"
            onClick={() => handleChageActive()}
        >
            <div className="flex-1 text-center">
              <span className="font-medium">브랜드 등록</span>
            </div>
            <ChevronDown
            className={`w-5 h-5 transform transition-transform ${
                activeIndex === true ? 'rotate-180' : ''
            }`}
            />
        </button>
        <div
            className={`overflow-hidden transition-all duration-500 ${
            activeIndex === false
                ? 'max-h-68 opacity-100'
                : 'max-h-0 opacity-0'
            }`}
        >
            <div className="bg-gray-50 p-2">
                <BrandItemCard/>
            </div>
        </div>
        </div>
    );
};


export default BrandInsertAccordion;
