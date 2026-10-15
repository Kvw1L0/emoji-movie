import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Smartphone } from 'lucide-react';

export const QRCodeDisplay = ({ url, size = 160, showDetails = true }) => {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 1.5,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (err) => {
        if (err) console.error('Error generando QR code:', err);
      });
    }
  }, [url, size]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-xl text-center">
      <div className="p-2 bg-white rounded-xl shadow-inner mb-3">
        <canvas ref={canvasRef} className="block rounded-lg" />
      </div>

      {showDetails && (
        <div className="w-full">
          <div className="flex items-center justify-center gap-1.5 text-xs text-yellow-400 font-semibold mb-1 uppercase tracking-wider">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Escanea para jugar</span>
          </div>

          <div className="text-[11px] text-gray-300 font-mono break-all bg-black/40 px-2 py-1 rounded border border-white/5 mb-2">
            {url}
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 border border-yellow-400/40 rounded-lg text-xs font-semibold transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Enlace</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
