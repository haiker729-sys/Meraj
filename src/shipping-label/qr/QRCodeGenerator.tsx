import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  caption?: string;
}

export const QRCodeGenerator: React.FC<QRCodeProps> = ({
  value,
  size = 110,
  className = '',
  caption
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(value, {
      width: size * 2, // High DPI for thermal print sharpness
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`QR Code: ${value}`}
          style={{ width: `${size}px`, height: `${size}px` }}
          className="border border-black p-0.5 bg-white"
        />
      ) : (
        <div
          style={{ width: `${size}px`, height: `${size}px` }}
          className="border border-neutral-300 flex items-center justify-center text-[10px] text-neutral-400"
        >
          Generating...
        </div>
      )}
      {caption && (
        <span className="text-[9px] font-mono text-neutral-600 mt-0.5 tracking-tight text-center">
          {caption}
        </span>
      )}
    </div>
  );
};
