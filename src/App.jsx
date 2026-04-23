// src/App.jsx
import ImageDetector from './components/ImageDetector';

export default function App() {
  return (
    <>
      <nav className="w-full px-4 py-2">
        <h1 className="text-2xl font-bold font-bruno">TruePixel</h1>
      </nav>

      <main className="w-[90%] max-w-2xl mx-auto mt-16 lg:mt-24 pb-16">
        <h1 className="text-xl text-center text-gray-800 font-bold mb-2">
          Detect AI-Generated Images
          <br />
          Instantly and Accurately
        </h1>
        <p className="text-gray-700 text-center text-sm mb-4">
          Drop or upload any image to find out if it was created by AI or a human
        </p>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
          <span className="font-semibold">Powered by SigLIP + LoRA</span> — our custom-trained vision
          model analyzes images at 512×512 resolution to detect AI-generated content.
        </div>

        <ImageDetector />
      </main>
    </>
  );
}
