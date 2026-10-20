import React, { useState } from 'react';
import {
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  Sparkles,
  Check,
  Edit2,
} from 'lucide-react';
import { getSubjectVectorDiagram } from '../utils/vectorDiagrams';

interface QuestionIllustrationProps {
  description: string;
  nomorSoal: number;
  imageUrl?: string;
  size?: 'compact' | 'medium' | 'large';
  onUpdateImage?: (newUrl: string) => void;
  isEditable?: boolean;
}

export const QuestionIllustration: React.FC<QuestionIllustrationProps> = ({
  description,
  nomorSoal,
  imageUrl,
  size = 'medium',
  onUpdateImage,
  isEditable = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [activeImageUrl, setActiveImageUrl] = useState<string | undefined>(imageUrl);

  // Sync external prop if changed
  React.useEffect(() => {
    setActiveImageUrl(imageUrl);
  }, [imageUrl]);

  const { svgString, caption, subjectCategory } = getSubjectVectorDiagram(
    description,
    nomorSoal
  );

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.0));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const handleApplyUrl = () => {
    if (customUrlInput.trim()) {
      setActiveImageUrl(customUrlInput.trim());
      if (onUpdateImage) onUpdateImage(customUrlInput.trim());
      setShowEditModal(false);
      setCustomUrlInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setActiveImageUrl(result);
          if (onUpdateImage) onUpdateImage(result);
          setShowEditModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Dimensions based on size
  const maxWidthClass =
    size === 'compact'
      ? 'max-w-[280px]'
      : size === 'large'
      ? 'max-w-[480px]'
      : 'max-w-[360px]';

  return (
    <figure
      className={`my-3 sm:my-4 mx-auto ${maxWidthClass} w-full print:max-w-[260px] print:my-2 print:break-inside-avoid`}
    >
      {/* Interactive Box */}
      <div className="relative group bg-slate-50/70 rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200 hover:border-slate-300 print:bg-white print:border print:border-slate-300 print:shadow-none">
        {/* Toolbar in Screen Mode */}
        <div className="flex items-center justify-between px-2.5 py-1 bg-white/90 border-b border-slate-100 text-[10px] text-slate-500 print:hidden">
          <span className="font-semibold flex items-center gap-1 text-slate-600 truncate max-w-[200px]">
            <Sparkles className="h-3 w-3 text-emerald-600 shrink-0" />
            <span className="truncate">{subjectCategory}</span>
          </span>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 transition"
              title="Perkecil Gambar"
            >
              <ZoomOut className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 transition"
              title="Perbesar Gambar"
            >
              <ZoomIn className="h-3 w-3" />
            </button>
            {zoomLevel !== 1 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1 rounded hover:bg-slate-100 text-slate-600 transition"
                title="Reset Ukuran"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}

            {isEditable && (
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="p-1 rounded hover:bg-emerald-50 text-emerald-700 transition ml-1"
                title="Ganti atau Unggah Gambar Sendiri"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Visual Content Display */}
        <div className="p-2 sm:p-3 flex items-center justify-center min-h-[110px] max-h-[220px] overflow-hidden bg-white">
          <div
            style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease' }}
            className="w-full flex items-center justify-center"
          >
            {activeImageUrl ? (
              <img
                src={activeImageUrl}
                alt={caption}
                className="max-h-40 max-w-full object-contain rounded"
              />
            ) : (
              <div
                className="w-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: svgString }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Caption Caption */}
      <figcaption className="text-center mt-1.5 text-[11px] sm:text-xs font-semibold text-slate-700 print:text-[9.5pt] print:font-bold print:text-black italic">
        {caption}
      </figcaption>

      {/* Edit/Upload Modal if user wishes to change the image */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-xs font-bold text-slate-900">
                Ganti Gambar Butir Soal #{nomorSoal}
              </h4>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Unggah Berkas Gambar dari Komputer:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="pt-2 border-t">
                <label className="block font-semibold text-slate-700 mb-1">
                  2. Atau Masukkan URL Gambar:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://example.com/gambar-soal.png"
                    className="flex-1 text-xs p-2 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-bold"
                  >
                    Terapkan
                  </button>
                </div>
              </div>

              {activeImageUrl && (
                <div className="pt-2 border-t text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveImageUrl(undefined);
                      if (onUpdateImage) onUpdateImage('');
                      setShowEditModal(false);
                    }}
                    className="text-[11px] text-rose-600 hover:underline"
                  >
                    Kembalikan ke Diagram Bawaan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </figure>
  );
};
