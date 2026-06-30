"use client";
import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function QRCodeGenerator({ tableNumber, baseUrl }) {
  const qrRef = useRef(null);

  // Fallback to table 1 if no number provided
  const num = tableNumber || 1;
  const targetUrl = baseUrl.replace('[tableNumber]', num);

  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `Table_${num}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl">
      <h3 className="text-white font-bold mb-3">رمز الـ QR للطاولة {num}</h3>
      <div 
        ref={qrRef} 
        className="p-3 bg-white rounded-xl shadow-lg mb-4"
      >
        <QRCodeCanvas 
          value={targetUrl} 
          size={200} 
          bgColor={"#ffffff"} 
          fgColor={"#000000"} 
          level={"H"} 
          includeMargin={false}
        />
      </div>
      <button 
        onClick={downloadQRCode}
        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
      >
        تحميل صورة الـ QR ⬇️
      </button>
    </div>
  );
}
