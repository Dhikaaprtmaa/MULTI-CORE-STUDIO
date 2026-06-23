import React, { useState, useRef } from 'react';

export default function VideoProcessor() {
  const [videoInfo, setVideoInfo] = useState(null);
  const [scale, setScale] = useState(0.5); // fraction of original
  const [fps, setFps] = useState(24);
  const [bitrate, setBitrate] = useState(800); // kbps
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const vid = document.createElement('video');
    vid.preload = 'metadata';
    vid.src = url;
    vid.onloadedmetadata = () => {
      setVideoInfo({
        file,
        url,
        width: vid.videoWidth,
        height: vid.videoHeight,
        duration: vid.duration,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2),
      });
    };
    videoRef.current = vid;
    setResult(null);
  };

  const processVideo = async () => {
    if (!videoInfo || !videoRef.current) return;
    setIsProcessing(true);

    const vid = videoRef.current;
    vid.muted = true;
    vid.playsInline = true;

    const targetWidth = Math.max(1, Math.round(videoInfo.width * scale));
    const targetHeight = Math.max(1, Math.round(videoInfo.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    canvasRef.current = canvas;

    // draw loop
    let rafId;
    const draw = () => {
      try {
        ctx.drawImage(vid, 0, 0, targetWidth, targetHeight);
      } catch (e) {
        // ignore if not ready
      }
      rafId = requestAnimationFrame(draw);
    };

    // capture canvas stream and record
    const stream = canvas.captureStream(fps);
    const bitsPerSecond = Math.max(1000, bitrate * 1000);
    const options = { mimeType: 'video/webm;codecs=vp8', bitsPerSecond };

    let recordedChunks = [];
    const recorder = new MediaRecorder(stream, options);
    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size) recordedChunks.push(ev.data);
    };

    recorder.onstop = () => {
      cancelAnimationFrame(rafId);
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
      setResult({ url, sizeMB, blob });
      setIsProcessing(false);
    };

    // autoplay video offscreen
    vid.currentTime = 0;
    await vid.play().catch(() => {});
    draw();
    recorder.start();

    // stop when video ends
    const onEnded = () => {
      if (recorder.state === 'recording') recorder.stop();
      vid.removeEventListener('ended', onEnded);
      vid.pause();
    };
    vid.addEventListener('ended', onEnded);

    // also provide a safety timeout in case video cannot play
    const maxMs = Math.ceil(videoInfo.duration * 1000) + 2000;
    setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop();
    }, maxMs + 1000);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold text-pink-400 mb-4 flex items-center gap-2">🎬 Video Compressor</h2>

      <div className="border-2 border-dashed border-gray-700 hover:border-pink-500 rounded-xl p-6 text-center cursor-pointer transition relative">
        <input type="file" accept="video/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <p className="text-gray-400">Klik atau seret file video (MP4/WebM)</p>
        {videoInfo && <p className="text-pink-300 mt-2 font-medium text-sm">Terpilih: {videoInfo.file.name}</p>}
      </div>

      {videoInfo && (
        <div className="mt-6 space-y-4">
          <div className="bg-gray-950 p-3 rounded-lg text-xs text-gray-400 grid grid-cols-2 gap-2">
            <div>Resolusi: <span className="text-gray-200">{videoInfo.width}x{videoInfo.height}</span></div>
            <div>Durasi: <span className="text-gray-200">{Math.round(videoInfo.duration)} s</span></div>
            <div>Ukuran Asal: <span className="text-gray-200">{videoInfo.sizeMB} MB</span></div>
            <div></div>
          </div>

          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Pengaturan Kompresi</h3>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Skala Resolusi: {Math.round(scale * 100)}%</label>
              <input type="range" min="0.1" max="1" step="0.05" value={scale} onChange={(e)=> setScale(parseFloat(e.target.value))} className="w-full accent-pink-500 bg-gray-800 h-2 rounded-lg cursor-pointer" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">FPS</label>
                <input type="number" value={fps} onChange={(e)=> setFps(parseInt(e.target.value)||1)} className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-100 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Bitrate (kbps): {bitrate}</label>
                <input type="range" min="100" max="3000" step="50" value={bitrate} onChange={(e)=> setBitrate(parseInt(e.target.value)||100)} className="w-full accent-pink-500 bg-gray-800 h-2 rounded-lg cursor-pointer" />
              </div>
            </div>

            <button onClick={processVideo} disabled={isProcessing} className="w-full bg-pink-600 hover:bg-pink-500 font-medium text-sm py-2.5 rounded-lg transition text-gray-950 font-bold mt-2 disabled:opacity-50">
              {isProcessing ? 'Memproses...' : 'Kompres Video'}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-pink-950/20 border border-pink-800/50 rounded-xl space-y-2 text-xs text-gray-300">
          <p>Ukuran Baru: <span className="font-semibold text-white">{result.sizeMB} MB</span></p>
          <a href={result.url} download={`compressed_${videoInfo.file.name.split('.')[0]}.webm`} className="inline-block mt-2 bg-pink-500 hover:bg-pink-400 text-gray-950 font-bold text-sm py-2 px-3 rounded-lg">Download WebM</a>
        </div>
      )}
    </div>
  );
}
