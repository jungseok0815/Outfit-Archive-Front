import { React, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import BrandItemCard from './BrandItemCard';

const BrandInsertAccordion = ({ forceOpen, onClose, onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (forceOpen) {
            setIsOpen(true);
        }
    }, [forceOpen]);

    const handleToggle = () => {
        const next = !isOpen;
        setIsOpen(next);
        if (!next && onClose) onClose();
    };

    return (
        <div className="border rounded-lg overflow-hidden">
            <button
                className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors"
                onClick={handleToggle}
            >
                <div className="flex-1 text-center">
                    <span className="font-medium">브랜드 등록</span>
                </div>
                <ChevronDown
                    className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-500 ${
                    isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="bg-gray-50 p-2">
                    <BrandItemCard onSuccess={onSuccess} />
                </div>
            </div>
        </div>
    );
};

export default BrandInsertAccordion;
