import React from 'react';
import ImageProcessor from './components/ImageProcessor';
import AudioProcessor from './components/AudioProcessor';
import VideoProcessor from './components/VideoProcessor';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              MULTI-CORE STUDIO
            </h1>
            <p className="text-xs text-gray-400">Aplikasi Kompresi Gambar, Audio & Video</p>
          </div>
          <span className="text-xs bg-gray-800 border border-gray-700 px-3 py-1 rounded-full text-gray-300 font-mono">
            Project UAS Sistem Multimedia
          </span>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <ImageProcessor />
        <AudioProcessor />
        <VideoProcessor />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-4 text-center text-xs text-gray-600">
        &copy; {new Date().getFullYear()} - Sistem Multimedia Aplikasi Converter Client-Side.
      </footer>
    </div>
  );
}