// src/components/ImageDetector.jsx
import { useState, useRef, useCallback } from 'react';
import api from '../api';

export default function ImageDetector() {
  const [preview, setPreview]   = useState(null);
  const [file, setFile]         = useState(null);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
  const MAX_SIZE_MB = 20;

  const processFile = useCallback((f) => {
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('Unsupported file type. Please upload a JPEG, PNG, WebP, GIF, or BMP image.');
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Max size is ${MAX_SIZE_MB}MB.`);
      return;
    }
    setError('');
    setResult(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const handleFileChange = (e) => processFile(e.target.files?.[0]);

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop      = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const form = new FormData();
      form.append('image', file);

      // Calls POST {VITE_API_BASE_URL}/predict
      const { data } = await api.post('/predict', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Normalise to a stable shape for the rendering layer
      const realProb  = data.probabilities.find((p) => p.classId === '0')?.probability ?? 0;
      const fakeProb  = data.probabilities.find((p) => p.classId === '1')?.probability ?? 0;
      setResult({
        isAI:       data.predictedClassId === '1',
        confidence: (data.confidence * 100).toFixed(1),
        probabilities: {
          real: (realProb * 100).toFixed(1),
          fake: (fakeProb * 100).toFixed(1),
        },
        model: data.model,
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      {!preview ? (
        <div
          className={`mt-4 border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all text-center ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-[1.01]'
              : 'border-gray-300 bg-neutral-100 hover:border-blue-400 hover:bg-blue-50/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="text-4xl mb-3">🖼️</div>
          <p className="font-semibold text-gray-700">Drag &amp; drop an image here</p>
          <p className="text-sm text-gray-500 mt-1">or click to browse</p>
          <p className="text-xs text-gray-400 mt-2">JPEG, PNG, WebP, GIF, BMP — up to 20MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Preview card */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-neutral-100">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-72 object-contain p-2"
            />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-gray-800/70 hover:bg-gray-900/80 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm transition-colors"
              title="Remove image"
            >
              ✕
            </button>
            <div className="px-4 pb-3 pt-1 text-xs text-gray-500 truncate">
              {file?.name} ({(file?.size / 1024).toFixed(0)} KB)
            </div>
          </div>

          {/* Analyze button */}
          {!result && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing image…
                </span>
              ) : (
                '🔍 Analyze Image'
              )}
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="mt-4 p-5 rounded-2xl border-2 border-gray-200 bg-neutral-100 space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Analysis Result</h3>

          {/* Verdict badge */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl border-2 ${
              result.isAI ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
            }`}
          >
            <div>
              <div className="text-xs font-semibold tracking-widest uppercase mb-1 text-gray-500">
                Verdict
              </div>
              <div className={`text-2xl font-bold ${result.isAI ? 'text-red-600' : 'text-green-600'}`}>
                {result.isAI ? '⚠️ AI-Generated' : '✅ Real Image'}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-extrabold ${result.isAI ? 'text-red-500' : 'text-green-500'}`}>
                {result.confidence}%
              </div>
              <div className="text-xs text-gray-500">confidence</div>
            </div>
          </div>

          {/* Probability bars */}
          <div className="space-y-2">
            <ProbBar label="Real"         value={parseFloat(result.probabilities.real)} color="green" />
            <ProbBar label="AI-Generated" value={parseFloat(result.probabilities.fake)} color="red"   />
          </div>

          {/* Analyze another */}
          <button
            onClick={handleClear}
            className="w-full py-2 rounded-xl border-2 border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Analyze Another Image
          </button>
        </div>
      )}
    </div>
  );
}

function ProbBar({ label, value, color }) {
  const colors = {
    green: { bar: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-100' },
    red:   { bar: 'bg-red-500',   text: 'text-red-700',   bg: 'bg-red-100'   },
  };
  const c = colors[color];

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className={`font-semibold ${c.text}`}>{value}%</span>
      </div>
      <div className={`w-full h-2 rounded-full ${c.bg}`}>
        <div
          className={`h-2 rounded-full transition-all duration-700 ${c.bar}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
