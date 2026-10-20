import React, { useState } from 'react';
import { EvaluationKit } from '../types/assessment';
import { copyToClipboard, downloadJsonFile } from '../utils/exportUtils';
import {
  Code,
  Copy,
  Check,
  Download,
  Upload,
  AlertCircle,
  FileJson,
} from 'lucide-react';

interface JsonViewModalProps {
  kit: EvaluationKit;
  onImportJson: (imported: EvaluationKit) => void;
}

export const JsonViewModal: React.FC<JsonViewModalProps> = ({ kit, onImportJson }) => {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [importError, setImportError] = useState('');

  // Exact clean JSON without internal state wrappers
  const cleanJson = {
    kisi_kisi: kit.kisi_kisi,
    soal_evaluasi: kit.soal_evaluasi,
    kunci_dan_lembar_jawab: kit.kunci_dan_lembar_jawab,
  };

  const jsonString = JSON.stringify(cleanJson, null, 2);

  const handleCopy = async () => {
    try {
      await copyToClipboard(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleImport = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importText);
      if (
        !parsed.kisi_kisi ||
        !parsed.soal_evaluasi ||
        !parsed.kunci_dan_lembar_jawab
      ) {
        throw new Error(
          'Format JSON tidak sesuai skema. Harus memuat: kisi_kisi, soal_evaluasi, dan kunci_dan_lembar_jawab.'
        );
      }
      onImportJson(parsed);
      setShowImportBox(false);
      setImportText('');
    } catch (err: any) {
      setImportError(err.message || 'JSON tidak valid.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 lg:p-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
              <Code className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Format Luaran JSON Murni (Skema Resmi)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sesuai skema data JSON evaluasi pembelajaran standar tanpa narasi di luar struktur objek.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowImportBox(!showImportBox)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <Upload className="h-3.5 w-3.5" />
            Impor JSON
          </button>

          <button
            type="button"
            onClick={() => downloadJsonFile(kit)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
          >
            <Download className="h-3.5 w-3.5" />
            Unduh .json
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Tersalin!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Salin JSON
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import Box */}
      {showImportBox && (
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-300 animate-fadeIn">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
            Tempelkan JSON Perangkat Soal:
          </h3>
          <textarea
            rows={5}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{ "kisi_kisi": [...], "soal_evaluasi": [...], "kunci_dan_lembar_jawab": [...] }'
            className="w-full text-xs font-mono p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
          {importError && (
            <div className="mt-2 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {importError}
            </div>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowImportBox(false)}
              className="px-3 py-1 rounded text-xs text-slate-600 hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="px-4 py-1.5 rounded text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Muat ke Aplikasi
            </button>
          </div>
        </div>
      )}

      {/* JSON Viewer */}
      <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[600px] shadow-inner">
        <pre className="whitespace-pre">{jsonString}</pre>
      </div>
    </div>
  );
};
