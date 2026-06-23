import React, { useState, useRef } from 'react';

export default function AudioProcessor() {
  const [audioFile, setAudioFile] = useState(null);
  const [audioMeta, setAudioMeta] = useState(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const handleAudioChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAudioFile(URL.createObjectURL(file));
    setAudioMeta({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2), // MB
      type: file.type
    });

    // Proses menggambar Waveform menggunakan Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    drawWaveform(audioBuffer);
  };

  const drawWaveform = (audioBuffer) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Mengambil data channel pertama (Left channel)
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#38bdf8'; // Sky blue warna bar

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      // Menggambar garis vertikal simetris mencerminkan gelombang suara
      ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold text-sky-400 mb-4 flex items-center gap-2">
        🎵 Audio Inspector & Waveform Visualizer
      </h2>

      <div className="border-2 border-dashed border-gray-700 hover:border-sky-500 rounded-xl p-6 text-center cursor-pointer transition relative">
        <input type="file" accept="audio/*" onChange={handleAudioChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <p className="text-gray-400">Klik atau seret file audio ke sini (MP3/WAV)</p>
        {audioMeta && <p className="text-sky-400 mt-2 font-medium text-sm">Terpilih: {audioMeta.name}</p>}
      </div>

      {audioMeta && (
        <div className="mt-6 space-y-4">
          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs space-y-1 text-gray-400">
            <p>Nama File: <span className="text-gray-200">{audioMeta.name}</span></p>
            <p>Ukuran File: <span className="text-gray-200">{audioMeta.size} MB</span></p>
            <p>Mime Type: <span className="text-gray-200">{audioMeta.type}</span></p>
          </div>

          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400">Audio Signal Waveform (Ekstraksi Channel 0)</h3>
            {/* Canvas untuk merender data signal audio digital */}
            <canvas ref={canvasRef} width={600} height={120} className="w-full bg-gray-900 rounded-lg border border-gray-800" />
            
            <audio ref={audioRef} src={audioFile} controls className="w-full mt-2 accent-sky-500" />
          </div>
        </div>
      )}
    </div>
  );
}