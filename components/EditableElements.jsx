'use client';
import React, { useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';

export function EditableText({ value, onChange, tagName = 'span', className, style, placeholder, isWYSIWYG, ...props }) {
    const Tag = tagName;
    
    // Using a ref to track the last committed value to avoid cursor jumping
    const lastCommittedValue = useRef(value);

    // Sync ref when parent value changes externally (not from user typing)
    useEffect(() => {
        if (value !== lastCommittedValue.current) {
            lastCommittedValue.current = value;
            if (contentEditableRef.current && contentEditableRef.current.textContent !== value) {
                 contentEditableRef.current.textContent = value || '';
            }
        }
    }, [value]);

    const contentEditableRef = useRef(null);

    const handleBlur = (e) => {
        const newValue = e.currentTarget.textContent;
        lastCommittedValue.current = newValue;
        if (onChange) onChange(newValue);
    };

    const handleKeyDown = (e) => {
        // Prevent enter key from creating new lines if it's a single line text
        if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };

    if (!isWYSIWYG) {
        return <Tag className={className} style={style} {...props}>{value || placeholder}</Tag>;
    }

    return (
        <Tag
            ref={contentEditableRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`transition-all duration-200 outline-none hover:ring-2 hover:ring-yellow-500/50 hover:bg-white/5 rounded px-1 cursor-text ${className || ''}`}
            style={{ 
                ...style, 
                borderBottom: '1px dashed rgba(255,255,255,0.4)', 
                minWidth: '20px', 
                display: 'inline-block' 
            }}
            {...props}
        >
            {value || placeholder}
        </Tag>
    );
}

export function EditableImage({ src, onUploadClick, className, style, wrapperClass, isWYSIWYG, alt, children }) {
    if (!isWYSIWYG) {
        return src ? <img src={src} className={className} style={style} alt={alt} /> : (children || null);
    }

    return (
        <div 
            className={`relative group cursor-pointer ${wrapperClass || ''}`} 
            onClick={onUploadClick}
        >
            {src ? <img src={src} className={className} style={style} alt={alt} /> : (children || null)}
            <div className="absolute inset-0 bg-black/60 hidden group-hover:flex flex-col items-center justify-center rounded-[inherit] transition-all duration-200 border-2 border-dashed border-yellow-500/50 z-10">
                <Camera className="text-white w-8 h-8 mb-1" />
                <span className="text-white text-[11px] font-bold px-2 py-1 bg-black/50 rounded-full">
                    تغيير الصورة
                </span>
            </div>
        </div>
    );
}
