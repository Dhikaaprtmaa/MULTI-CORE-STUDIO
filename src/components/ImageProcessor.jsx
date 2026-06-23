import React, { useState, useRef } from 'react';

export default function ImageProcessor() {
  const [imageInfo, setImageInfo] = useState(null);
  const [quality, setQuality] = useState(0.8);
  const [outputWidth, setOutputWidth] = useState(0);
  const [outputHeight, setOutputHeight] = useState(0);
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const originalImgRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        setImageInfo({
          src: event.target.result,
          name: file.name,
          size: (file.size / 1024).toFixed(2), // KB
          originalWidth: img.width,
          originalHeight: img.height,
        });
        setOutputWidth(img.width);
        setOutputHeight(img.height);
        setResult(null);
      };
      originalImgRef.current = img;
    };
    reader.readAsDataURL(file);
  };

  const handleWidthChange = (val) => {
    setOutputWidth(val);
    if (originalImgRef.current) {
      const ratio = originalImgRef.current.height / originalImgRef.current.width;
      setOutputHeight(Math.round(val * ratio));
    }
  };

  const processImage = () => {
    if (!imageInfo) return;
    setIsProcessing(true);

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      
      ctx.drawImage(originalImgRef.current, 0, 0, outputWidth, outputHeight);
      
      // Mengonversi ke WebP dengan kualitas kustom
      const compressedDataUrl = canvas.toDataURL('image/webp', quality);
      
      // Menghitung estimasi ukuran file dari Base64 string
      const head = 'data:image/webp;base64,';
      const fileSizeInBytes = Math.round((compressedDataUrl.length - head.length) * 3 / 4);
      const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);
      const compressionRatio = ((1 - (fileSizeInKB / imageInfo.size)) * 100).toFixed(1);

      setResult({
        url: compressedDataUrl,
        size: fileSizeInKB,
        ratio: compressionRatio,
        width: outputWidth,
        height: outputHeight
      });
      setIsProcessing(false);
    }, 300);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
        🖼️ Image Converter & Compressor
      </h2>
      
      <div className="border-2 border-dashed border-gray-700 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition relative">
        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <p className="text-gray-400">Klik atau seret file gambar ke sini (PNG/JPG)</p>
        {imageInfo && <p className="text-emerald-400 mt-2 font-medium text-sm">Terpilih: {imageInfo.name}</p>}
      </div>

      {imageInfo && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-gray-950 p-3 rounded-lg text-xs text-gray-400">
            <div>
              <p>Dimensi Asal: <span className="text-gray-200">{imageInfo.originalWidth}x{imageInfo.originalHeight} px</span></p>
            </div>
            <div>
              <p>Ukuran Asal: <span className="text-gray-200">{imageInfo.size} KB</span></p>
            </div>
          </div>

          <div className="space-y-4 bg-gray-950 p-4 rounded-xl border border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300">Pengaturan Output (.WebP)</h3>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Kualitas: {Math.round(quality * 100)}%</label>
              <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-full accent-emerald-500 bg-gray-800 h-2 rounded-lg cursor-pointer" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Lebar (px)</label>
                <input type="number" value={outputWidth} onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-100 focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tinggi (px)</label>
                <input type="number" value={outputHeight} readOnly className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-400 cursor-not-allowed outline-none" />
              </div>
            </div>

            <button onClick={processImage} disabled={isProcessing} className="w-full bg-emerald-600 hover:bg-emerald-500 font-medium text-sm py-2.5 rounded-lg transition text-gray-950 font-bold mt-2 disabled:opacity-50">
              {isProcessing ? 'Memproses...' : 'Kompres & Konversi'}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-emerald-950/30 border border-emerald-800/50 rounded-xl space-y-3">
          <h3 className="text-sm font-bold text-emerald-400">🚀 Hasil Pemrosesan</h3>
          <div className="text-xs space-y-1 text-gray-300">
            <p>Format Baru: <span className="font-semibold text-white">WEBP</span></p>
            <p>Ukuran Baru: <span className="font-semibold text-white">{result.size} KB</span></p>
            <p>Rasio Kompresi: <span className={`font-bold ${result.ratio >= 0 ? 'text-green-400' : 'text-red-400'}`}>{result.ratio}% Lebih Hemat</span></p>
          </div>
          <a href={result.url} download={`compressed_${imageInfo?.name.split('.')[0]}.webp`} className="block text-center bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm py-2 rounded-lg transition shadow-lg shadow-emerald-500/20">
            Download File .WebP
          </a>
        </div>
      )}
    </div>
  );
}