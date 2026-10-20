import React, { useState, useMemo, useRef } from 'react';
import { EvaluationKit, SchoolMetadata, SoalEvaluasiItem } from '../types/assessment';
import { VisualDiagramBox } from './VisualDiagramBox';
import { extractQuestionImageData } from '../utils/imageDetector';
import { SmartSpellcheckModal } from './SmartSpellcheckModal';
import { checkTextForIssues } from '../utils/smartSpellcheck';
import { exportElementToPdf } from '../utils/pdfExport';
import {
  FileText,
  Printer,
  Edit3,
  Check,
  BookmarkPlus,
  SlidersHorizontal,
  Columns,
  Hash,
  Type,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  FileCheck,
  SpellCheck2,
  FileDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

interface NaskahSoalViewProps {
  kit: EvaluationKit;
  schoolInfo: SchoolMetadata;
  onUpdateSoal?: (updated: SoalEvaluasiItem[]) => void;
  onPrint: () => void;
  onSaveToBankSoal?: () => void;
  isSavingBankSoal?: boolean;
  onNavigateToKunciRubrik?: () => void;
}

export interface PrintConfig {
  columns: 1 | 2 | 3;
  showColumnRule: boolean;
  showQuestionNumber: boolean;
  numberingStyle: 'arabic' | 'roman' | 'letter';
  numberPrefix: string;
  showHeaderKop: boolean;
  showStudentIdentity: boolean;
  showSignature: boolean;
  fontSize: 'compact' | 'normal' | 'large';
  spacing: 'tight' | 'normal' | 'loose';
  showScoreBox: boolean;
}

const DEFAULT_PRINT_CONFIG: PrintConfig = {
  columns: 1,
  showColumnRule: true,
  showQuestionNumber: true,
  numberingStyle: 'arabic',
  numberPrefix: '',
  showHeaderKop: true,
  showStudentIdentity: true,
  showSignature: true,
  fontSize: 'normal',
  spacing: 'normal',
  showScoreBox: false,
};

export const NaskahSoalView: React.FC<NaskahSoalViewProps> = ({
  kit,
  schoolInfo,
  onUpdateSoal,
  onPrint,
  onSaveToBankSoal,
  isSavingBankSoal = false,
  onNavigateToKunciRubrik,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showSpellcheckModal, setShowSpellcheckModal] = useState(false);
  const [config, setConfig] = useState<PrintConfig>(DEFAULT_PRINT_CONFIG);
  const [soalList, setSoalList] = useState<SoalEvaluasiItem[]>(kit.soal_evaluasi);

  // PDF Export State & Ref
  const printableAreaRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');
  const [pdfExportNotice, setPdfExportNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleExportToPdf = async () => {
    if (!printableAreaRef.current) return;
    try {
      setIsExportingPdf(true);
      setPdfExportNotice(null);

      const rawTitle = schoolInfo.namaAsesmen || 'Naskah_Asesmen';
      const rawSubject = kit.paramsSnapshot?.mataPelajaran || 'Evaluasi';
      const rawClass = kit.paramsSnapshot?.levelKelas || 'Fase';

      const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
      const filename = `Naskah_${sanitize(rawSubject)}_${sanitize(rawClass)}_${sanitize(rawTitle)}.pdf`;

      await exportElementToPdf(printableAreaRef.current, {
        filename,
        onProgress: (status) => setPdfProgress(status),
      });

      setPdfExportNotice({
        type: 'success',
        message: `Berkas PDF "${filename}" berhasil diunduh langsung dengan tata letak siap cetak!`,
      });
      setTimeout(() => {
        setPdfExportNotice(null);
      }, 6000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setPdfExportNotice({
        type: 'error',
        message: 'Gagal mengekspor PDF secara otomatis. Silakan coba sesaat lagi atau gunakan opsi Cetak Naskah.',
      });
    } finally {
      setIsExportingPdf(false);
      setPdfProgress('');
    }
  };

  // Live count of spellcheck/grammar issues across all questions
  const spellcheckIssueCount = useMemo(() => {
    let count = 0;
    soalList.forEach((soal) => {
      if (soal.pertanyaan) count += checkTextForIssues(soal.pertanyaan, soal.nomor_soal, 'pertanyaan', '').length;
      if (soal.stimulus) count += checkTextForIssues(soal.stimulus, soal.nomor_soal, 'stimulus', '').length;
      if (soal.petunjuk_khusus) count += checkTextForIssues(soal.petunjuk_khusus, soal.nomor_soal, 'petunjuk_khusus', '').length;
      if (soal.opsi_jawaban) {
        soal.opsi_jawaban.forEach((op, idx) => {
          count += checkTextForIssues(op, soal.nomor_soal, 'opsi_jawaban', '', idx).length;
        });
      }
      if (soal.pernyataan_benar_salah) {
        soal.pernyataan_benar_salah.forEach((p, idx) => {
          count += checkTextForIssues(p.kalimat, soal.nomor_soal, 'pernyataan_benar_salah', '', idx).length;
        });
      }
      if (soal.pasangan_menjodohkan) {
        soal.pasangan_menjodohkan.kolom_a.forEach((a, idx) => {
          count += checkTextForIssues(a, soal.nomor_soal, 'pasangan_menjodohkan', '', idx).length;
        });
        soal.pasangan_menjodohkan.kolom_b.forEach((b, idx) => {
          count += checkTextForIssues(b, soal.nomor_soal, 'pasangan_menjodohkan', '', idx + 100).length;
        });
      }
    });
    return count;
  }, [soalList]);

  const handleApplySpellcheckFix = (updated: SoalEvaluasiItem[]) => {
    setSoalList(updated);
    if (onUpdateSoal) {
      onUpdateSoal(updated);
    }
  };

  const handleTextChange = (
    index: number,
    field: keyof SoalEvaluasiItem,
    value: any
  ) => {
    const updated = [...soalList];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setSoalList(updated);
    if (onUpdateSoal) {
      onUpdateSoal(updated);
    }
  };

  const handleOptionChange = (
    soalIndex: number,
    optionIndex: number,
    val: string
  ) => {
    const updated = [...soalList];
    const currentOptions = updated[soalIndex].opsi_jawaban
      ? [...updated[soalIndex].opsi_jawaban!]
      : [];
    currentOptions[optionIndex] = val;
    updated[soalIndex].opsi_jawaban = currentOptions;
    setSoalList(updated);
    if (onUpdateSoal) {
      onUpdateSoal(updated);
    }
  };

  // Helper to determine question type label
  const getSoalCategoryTitle = (soal: SoalEvaluasiItem) => {
    const type = soal.bentuk_soal.toLowerCase();
    if (type.includes('kompleks')) return 'SOAL PILGAN KOMPLEKS';
    if (type.includes('ganda')) return 'SOAL PILIHAN GANDA';
    if (type.includes('jodoh') || type.includes('menjodohkan')) return 'SOAL MENJODOHKAN';
    if (type.includes('benar') || type.includes('salah')) return 'SOAL BENAR SALAH';
    if (type.includes('uraian') || type.includes('esai')) return 'SOAL URAIAN';
    return `SOAL ${soal.bentuk_soal.toUpperCase()}`;
  };

  // Format question number based on config
  const formatQuestionNumber = (indexZeroBased: number) => {
    const num = indexZeroBased + 1;
    let formatted = `${num}`;
    if (config.numberingStyle === 'roman') {
      const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV'];
      formatted = romans[indexZeroBased] || `${num}`;
    } else if (config.numberingStyle === 'letter') {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      formatted = alphabet[indexZeroBased % 26] || `${num}`;
    }
    return `${config.numberPrefix}${formatted}.`;
  };

  // Presets
  const applyPreset = (presetName: 'standar' | 'hemat' | 'ljk' | 'kartu') => {
    if (presetName === 'standar') {
      setConfig({
        ...DEFAULT_PRINT_CONFIG,
      });
    } else if (presetName === 'hemat') {
      setConfig({
        columns: 2,
        showColumnRule: true,
        showQuestionNumber: true,
        numberingStyle: 'arabic',
        numberPrefix: '',
        showHeaderKop: true,
        showStudentIdentity: true,
        showSignature: true,
        fontSize: 'compact',
        spacing: 'tight',
        showScoreBox: false,
      });
    } else if (presetName === 'ljk') {
      setConfig({
        columns: 2,
        showColumnRule: true,
        showQuestionNumber: true,
        numberingStyle: 'arabic',
        numberPrefix: '',
        showHeaderKop: true,
        showStudentIdentity: false,
        showSignature: false,
        fontSize: 'compact',
        spacing: 'tight',
        showScoreBox: false,
      });
    } else if (presetName === 'kartu') {
      setConfig({
        columns: 1,
        showColumnRule: false,
        showQuestionNumber: false,
        numberingStyle: 'arabic',
        numberPrefix: '',
        showHeaderKop: false,
        showStudentIdentity: false,
        showSignature: false,
        fontSize: 'large',
        spacing: 'loose',
        showScoreBox: true,
      });
    }
  };

  // Font size classes
  const getFontSizeClass = () => {
    switch (config.fontSize) {
      case 'compact':
        return 'text-xs print:text-[9.5pt]';
      case 'large':
        return 'text-sm sm:text-base print:text-[12pt]';
      case 'normal':
      default:
        return 'text-xs sm:text-sm print:text-[11pt]';
    }
  };

  // Spacing between questions
  const getSpacingClass = () => {
    switch (config.spacing) {
      case 'tight':
        return 'space-y-4 print:space-y-3';
      case 'loose':
        return 'space-y-8 print:space-y-6';
      case 'normal':
      default:
        return 'space-y-6 print:space-y-4';
    }
  };

  // Column styling
  const getColumnContainerClass = () => {
    if (config.columns === 2) {
      return `md:columns-2 print:columns-2 gap-8 ${
        config.showColumnRule ? '[column-rule:1px_solid_#e2e8f0] print:[column-rule:1px_solid_#000000]' : ''
      }`;
    }
    if (config.columns === 3) {
      return `md:columns-3 print:columns-3 gap-6 ${
        config.showColumnRule ? '[column-rule:1px_solid_#e2e8f0] print:[column-rule:1px_solid_#000000]' : ''
      }`;
    }
    return '';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 lg:p-10 print:p-0 print:border-none print:shadow-none">
      {/* Top Action Bar (hidden when printing) */}
      <div className="border-b border-slate-200 pb-5 mb-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                <FileText className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Komponen 1: Naskah Soal Evaluasi Siswa
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Format lembar naskah soal presisi sesuai template kedinasan dengan konfigurasi cetak kolom & nomor kustom.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Print Config Panel */}
            <button
              type="button"
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition shadow-2xs ${
                showConfigPanel
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-200'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600" />
              <span>Konfigurasi Cetak</span>
              <span className="ml-1 px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded text-[10px] font-semibold">
                {config.columns} Kolom
              </span>
              {showConfigPanel ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {/* Smart Spellcheck & Tata Bahasa Button */}
            <button
              type="button"
              onClick={() => setShowSpellcheckModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100 shadow-2xs transition"
              title="Periksa istilah tidak baku, kaidah 'di', dan kesalahan pengetikan"
            >
              <SpellCheck2 className="h-3.5 w-3.5 text-teal-600" />
              <span>Smart Spellcheck</span>
              {spellcheckIssueCount > 0 ? (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold text-[10px]">
                  {spellcheckIssueCount}
                </span>
              ) : (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-0.5">
                  <Check className="h-2.5 w-2.5" /> Baku
                </span>
              )}
            </button>

            {/* Shortcut to Kunci & Rubrik Penskoran Otomatis */}
            {onNavigateToKunciRubrik && (
              <button
                type="button"
                onClick={onNavigateToKunciRubrik}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 shadow-2xs transition"
                title="Buka atau buat Kunci Jawaban & Rubrik Penskoran Detail Otomatis"
              >
                <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
                <span>Kunci & Rubrik</span>
              </button>
            )}

            {onSaveToBankSoal && (
              <button
                type="button"
                onClick={onSaveToBankSoal}
                disabled={isSavingBankSoal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs transition"
              >
                <BookmarkPlus className="h-3.5 w-3.5" />
                {isSavingBankSoal ? 'Menyimpan...' : 'Simpan ke Bank Soal'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isEditing
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isEditing ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Selesai Edit
                </>
              ) : (
                <>
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Butir Soal
                </>
              )}
            </button>

            {/* Ekspor PDF Langsung Button */}
            <button
              type="button"
              onClick={handleExportToPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-xs transition disabled:opacity-75 disabled:cursor-wait"
              title="Unduh langsung berkas PDF format A4 tanpa harus melalui dialog print browser"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{pdfProgress || 'Mengekspor PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="h-3.5 w-3.5" />
                  <span>Ekspor PDF</span>
                  <span className="px-1.5 py-0.2 bg-rose-700 text-rose-100 rounded text-[10px] font-extrabold uppercase tracking-wider">
                    A4
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition"
            >
              <Printer className="h-3.5 w-3.5" />
              Cetak Naskah
            </button>
          </div>
        </div>

        {/* Notifikasi Status Ekspor PDF */}
        {pdfExportNotice && (
          <div
            className={`mt-3 p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium animate-fadeIn ${
              pdfExportNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {pdfExportNotice.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span>{pdfExportNotice.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setPdfExportNotice(null)}
              className="text-slate-400 hover:text-slate-600 font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* =========================================================================
            PANEL KONFIGURASI CETAK (PRINT CONFIGURATION PANEL)
           ========================================================================= */}
        {showConfigPanel && (
          <div className="mt-4 p-4 sm:p-5 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 rounded-xl border border-indigo-200 shadow-sm transition-all animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-4 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-xs">
                  <SlidersHorizontal className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Panel Pengaturan Tata Letak & Format Cetak Naskah
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sesuaikan kolom, penomoran, ukuran teks, dan elemen naskah sebelum dicetak atau diekspor ke PDF.
                  </p>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Preset Cepat:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('standar')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition ${
                    config.columns === 1 && config.showQuestionNumber && config.showHeaderKop
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-indigo-50'
                  }`}
                >
                  Standar (1 Kolom)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('hemat')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition ${
                    config.columns === 2 && config.fontSize === 'compact' && config.showStudentIdentity
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-indigo-50'
                  }`}
                >
                  Hemat Kertas (2 Kolom)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('ljk')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-indigo-50 transition"
                  title="Format untuk ujian yang menggunakan Lembar Jawaban Komputer terpisah"
                >
                  LJK Terpisah
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('kartu')}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-indigo-50 transition"
                  title="Format bebas nomor untuk kartu soal atau modul tugas"
                >
                  Kartu / Tanpa No.
                </button>
                <button
                  type="button"
                  onClick={() => setConfig(DEFAULT_PRINT_CONFIG)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white transition ml-1"
                  title="Reset Pengaturan ke Default"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Config Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              {/* Opsi 1: Tata Letak Kolom */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <label className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
                  <Columns className="h-3.5 w-3.5 text-indigo-600" />
                  Tata Letak Kolom
                </label>
                <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, columns: 1 })}
                    className={`py-1.5 px-2 rounded font-semibold text-center text-xs transition border ${
                      config.columns === 1
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    1 Kolom
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, columns: 2 })}
                    className={`py-1.5 px-2 rounded font-semibold text-center text-xs transition border ${
                      config.columns === 2
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    2 Kolom
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, columns: 3 })}
                    className={`py-1.5 px-2 rounded font-semibold text-center text-xs transition border ${
                      config.columns === 3
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    3 Kolom
                  </button>
                </div>
                {config.columns > 1 && (
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.showColumnRule}
                      onChange={(e) => setConfig({ ...config, showColumnRule: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>Tampilkan garis pemisah kolom</span>
                  </label>
                )}
                <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
                  {config.columns === 1
                    ? 'Layout standar lebar penuh, ideal untuk lembar soal formal.'
                    : 'Layout gaya koran hemat kertas, mengalir berurutan otomatis.'}
                </p>
              </div>

              {/* Opsi 2: Penomoran Soal */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <label className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
                  <Hash className="h-3.5 w-3.5 text-indigo-600" />
                  Nomor Soal Otomatis
                </label>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                  <span className="text-slate-600 text-[11px]">Tampilkan Nomor</span>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, showQuestionNumber: !config.showQuestionNumber })}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      config.showQuestionNumber
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    {config.showQuestionNumber ? (
                      <>
                        <Eye className="h-3 w-3" /> Aktif
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" /> Disembunyikan
                      </>
                    )}
                  </button>
                </div>

                {config.showQuestionNumber && (
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 block mb-1">Gaya Penomoran:</span>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, numberingStyle: 'arabic' })}
                          className={`py-1 text-[11px] rounded border font-medium ${
                            config.numberingStyle === 'arabic'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          1, 2, 3
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, numberingStyle: 'roman' })}
                          className={`py-1 text-[11px] rounded border font-medium ${
                            config.numberingStyle === 'roman'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          I, II, III
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, numberingStyle: 'letter' })}
                          className={`py-1 text-[11px] rounded border font-medium ${
                            config.numberingStyle === 'letter'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          A, B, C
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 block mb-1">Awalan / Prefix:</span>
                      <input
                        type="text"
                        value={config.numberPrefix}
                        onChange={(e) => setConfig({ ...config, numberPrefix: e.target.value })}
                        placeholder="Contoh: No. atau Soal"
                        className="w-full text-[11px] py-1 px-2 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Opsi 3: Ukuran Huruf & Spasi */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <label className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
                  <Type className="h-3.5 w-3.5 text-indigo-600" />
                  Ukuran Teks & Kerapatan
                </label>

                <div className="mb-2">
                  <span className="text-[10px] font-semibold text-slate-500 block mb-1">Ukuran Huruf Cetak:</span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, fontSize: 'compact' })}
                      className={`py-1 text-[11px] rounded border font-medium ${
                        config.fontSize === 'compact'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                      title="10pt - Hemat Kertas"
                    >
                      Kecil (10pt)
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, fontSize: 'normal' })}
                      className={`py-1 text-[11px] rounded border font-medium ${
                        config.fontSize === 'normal'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                      title="11pt - Standar Kedinasan"
                    >
                      Standar (11pt)
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, fontSize: 'large' })}
                      className={`py-1 text-[11px] rounded border font-medium ${
                        config.fontSize === 'large'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                      title="12pt - Nyaman Dibaca"
                    >
                      Besar (12pt)
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block mb-1">Jarak Antar Soal:</span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, spacing: 'tight' })}
                      className={`py-1 text-[11px] rounded border font-medium ${
                        config.spacing === 'tight'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Rapat
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, spacing: 'normal' })}
                      className={`py-1 text-[11px] rounded border font-medium ${
                        config.spacing === 'normal'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Sedang
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, spacing: 'loose' })}
                      className={`py-1 text-[11px] rounded border font-medium ${
                        config.spacing === 'loose'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Longgar
                    </button>
                  </div>
                </div>
              </div>

              {/* Opsi 4: Elemen Tambahan Naskah */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <label className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
                  <Layers className="h-3.5 w-3.5 text-indigo-600" />
                  Komponen Tambahan
                </label>
                <div className="space-y-2 text-[11px]">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.showHeaderKop}
                      onChange={(e) => setConfig({ ...config, showHeaderKop: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>Kop Surat & Judul Asesmen</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.showStudentIdentity}
                      onChange={(e) => setConfig({ ...config, showStudentIdentity: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>Kolom Identitas Siswa</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.showSignature}
                      onChange={(e) => setConfig({ ...config, showSignature: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>Kolom Tanda Tangan Guru</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.showScoreBox}
                      onChange={(e) => setConfig({ ...config, showScoreBox: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>Kotak Nilai / Skor Per Butir</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Quick Action Footer in Config Panel */}
            <div className="mt-4 pt-3 border-t border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-indigo-50/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-indigo-900">
                <FileDown className="h-4 w-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Siap Cetak atau Simpan?</strong> Berkas PDF akan dihasilkan dengan konfigurasi <strong>{config.columns} Kolom</strong> &amp; ukuran teks <strong>{config.fontSize === 'compact' ? 'Kecil (10pt)' : config.fontSize === 'large' ? 'Besar (12pt)' : 'Standar (11pt)'}</strong> yang Anda pilih.
                </span>
              </div>
              <button
                type="button"
                onClick={handleExportToPdf}
                disabled={isExportingPdf}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition disabled:opacity-75 disabled:cursor-wait shrink-0"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{pdfProgress || 'Memproses PDF...'}</span>
                  </>
                ) : (
                  <>
                    <FileDown className="h-3.5 w-3.5" />
                    <span>Unduh PDF Langsung</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          OFFICIAL EXAM PAPER CONTENT (NASKAH ASESMEN SISWA)
         ========================================================================= */}
      <div ref={printableAreaRef} id="naskah-printable-document" className="bg-white">
        {/* Official Exam Paper Header (Kop Naskah Ujian) */}
        {config.showHeaderKop && (
        <div className="text-center border-b-2 border-black pb-4 mb-6 print:border-black">
          <h3 className="text-xs sm:text-sm font-semibold tracking-wide text-black uppercase">
            {schoolInfo.dinasPendidikan || 'DINAS PENDIDIKAN DAN KEBUDAYAAN'}
          </h3>
          <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-black uppercase my-0.5">
            {schoolInfo.namaSekolah || 'SEKOLAH DASAR NEGERI'}
          </h1>
          <h2 className="text-xs sm:text-sm font-bold text-black uppercase">
            {schoolInfo.namaAsesmen || 'ASESMEN SUMATIF LINGKUP MATERI'} - TAHUN AJARAN {schoolInfo.tahunPelajaran || '2026/2027'}
          </h2>
          <div className="h-0.5 bg-black mt-2 mb-0.5"></div>
          <div className="h-[1px] bg-black"></div>
        </div>
      )}

      {/* Identitas Peserta Didik Table */}
      {config.showStudentIdentity && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-black text-xs sm:text-sm mb-6 print:bg-transparent print:border-black print:p-2">
          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-32 font-bold text-black">Mata Pelajaran</span>
              <span className="text-black font-semibold">: {kit.paramsSnapshot?.mataPelajaran || 'IPAS'}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-bold text-black">Kelas / Fase</span>
              <span className="text-black">: {kit.paramsSnapshot?.levelKelas || 'Fase B'}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-bold text-black">Alokasi Waktu</span>
              <span className="text-black">: {schoolInfo.alokasiWaktu || '90 Menit'}</span>
            </div>
          </div>

          <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-300 md:pl-6 pt-2 md:pt-0 print:border-black">
            <div className="flex items-center">
              <span className="w-32 font-bold text-black">Nama Siswa</span>
              <span className="text-slate-400 border-b border-dotted border-black flex-1 pl-2">
                ................................................
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-bold text-black">Nomor Absen / NIS</span>
              <span className="text-slate-400 border-b border-dotted border-black flex-1 pl-2">
                ...................
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-32 font-bold text-black">Hari, Tanggal</span>
              <span className="text-slate-400 border-b border-dotted border-black flex-1 pl-2">
                ................................................
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Daftar Butir Soal Berurutan dengan Layout Dinamis Kolom & Format Pilihan */}
      <div className={`${getColumnContainerClass()} ${getSpacingClass()}`}>
        {soalList.map((soal, index) => {
          const categoryTitle = getSoalCategoryTitle(soal);
          const isPilganKompleks = categoryTitle === 'SOAL PILGAN KOMPLEKS';
          const isPilgan = categoryTitle === 'SOAL PILIHAN GANDA';
          const isMenjodohkan = categoryTitle === 'SOAL MENJODOHKAN';
          const isBenarSalah = categoryTitle === 'SOAL BENAR SALAH';
          const isUraian = categoryTitle === 'SOAL URAIAN';

          // Robust Universal Image & Visual Context Detection
          const {
            hasImage,
            imageDescription,
            cleanedStimulus,
            cleanedPertanyaan,
            customImageUrl,
          } = extractQuestionImageData(soal);

          return (
            <div
              key={index}
              className={`p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white shadow-2xs print:border-none print:shadow-none print:p-0.5 print:break-inside-avoid break-inside-avoid mb-6 ${getFontSizeClass()}`}
            >
              {/* Soal Number & Question */}
              <div className="mb-2.5">
                {/* Stimulus Context if available */}
                {isEditing ? (
                  <div className="mb-2">
                    <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                      Stimulus Bacaan / Konteks:
                    </label>
                    <textarea
                      rows={3}
                      value={soal.stimulus}
                      onChange={(e) => handleTextChange(index, 'stimulus', e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50"
                    />
                  </div>
                ) : (
                  cleanedStimulus && (
                    <div className="mb-2 text-black leading-relaxed font-sans">
                      {cleanedStimulus}
                    </div>
                  )
                )}

                {/* Render Diagram inline if present - ukuran nyaman dan proporsional */}
                {hasImage && (
                  <VisualDiagramBox
                    description={imageDescription || cleanedPertanyaan}
                    nomorSoal={soal.nomor_soal}
                    imageUrl={customImageUrl}
                    size="medium"
                    isEditable={isEditing}
                    onUpdateImage={(newUrl) => handleTextChange(index, 'gambar_url' as any, newUrl)}
                  />
                )}

                {/* Pertanyaan with optional custom numbering */}
                {isEditing ? (
                  <div className="mb-2">
                    <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                      Pertanyaan Soal #{soal.nomor_soal}:
                    </label>
                    <textarea
                      rows={2}
                      value={soal.pertanyaan}
                      onChange={(e) => handleTextChange(index, 'pertanyaan', e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg font-semibold"
                    />
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2 mb-2 leading-relaxed">
                    <p className="font-semibold text-black">
                      {config.showQuestionNumber && (
                        <span className="font-bold mr-1.5">
                          {formatQuestionNumber(index)}
                        </span>
                      )}
                      {cleanedPertanyaan}
                    </p>
                    {config.showScoreBox && (
                      <div className="shrink-0 border border-black px-2 py-0.5 text-center text-[10px] font-mono font-bold text-black bg-slate-50 print:bg-transparent">
                        Skor: ___
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* =========================================================================
                  LAYOUT 1: SOAL PILGAN KOMPLEKS (Sesuai Gambar 1)
                  - Title: Berilah tanda centang () pada 3 jawaban yang tepat!
                  - Table with left column for checkmark and right column for A, B, C, D, E
                 ========================================================================= */}
              {isPilganKompleks && (
                <div className="mt-2 space-y-2">
                  <p className="font-medium text-black mb-1.5">
                    {soal.petunjuk_khusus || 'Berilah tanda centang () pada jawaban yang tepat!'}
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-black">
                      <tbody>
                        {soal.opsi_jawaban?.map((opsi, optIdx) => (
                          <tr key={optIdx} className="border border-black">
                            {/* Checkmark square cell */}
                            <td className="w-8 sm:w-10 border-r border-black p-2 text-center align-middle bg-white">
                              <span className="inline-block w-3.5 h-3.5 border border-black rounded-xs"></span>
                            </td>
                            {/* Option letter and content */}
                            <td className="p-2 text-black align-middle font-normal">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={opsi}
                                  onChange={(e) => handleOptionChange(index, optIdx, e.target.value)}
                                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                />
                              ) : (
                                <span>{opsi}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  LAYOUT 2: SOAL PILIHAN GANDA (Sesuai Gambar 2)
                  - Indented lettered list: A., B., C., D.
                 ========================================================================= */}
              {isPilgan && (
                <div className="mt-2 pl-4 space-y-1.5 font-sans">
                  {soal.opsi_jawaban?.map((opsi, optIdx) => (
                    <div key={optIdx} className="text-black leading-snug">
                      {isEditing ? (
                        <div className="flex items-center gap-2 mb-1">
                          <input
                            type="text"
                            value={opsi}
                            onChange={(e) => handleOptionChange(index, optIdx, e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                          />
                        </div>
                      ) : (
                        <div>{opsi}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* =========================================================================
                  LAYOUT 3: SOAL MENJODOHKAN (Sesuai Gambar User)
                  - Tabel Kiri: "Pernyataan" (1 Kolom utuh rapi)
                  - Area Tengah: Titik-titik hitam (●) berada DILUAR kolom dengan rapi
                                 dan ruang kosong lapang untuk menarik garis
                  - Tabel Kanan: "Pasangan jawaban" (1 Kolom utuh rapi)
                 ========================================================================= */}
              {isMenjodohkan && soal.pasangan_menjodohkan && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr>
                        {/* Header Tabel Kiri */}
                        <th
                          className="p-2 sm:p-2.5 text-center font-bold text-black border border-black bg-slate-50/50 print:bg-transparent w-[43%]"
                        >
                          Pernyataan
                        </th>

                        {/* Area Tengah: Jarak Tarik Garis (Tanpa Border) */}
                        <th className="w-[14%] sm:w-[14%] text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider print:text-transparent select-none border-none">
                          Tarik Garis
                        </th>

                        {/* Header Tabel Kanan */}
                        <th
                          className="p-2 sm:p-2.5 text-center font-bold text-black border border-black bg-slate-50/50 print:bg-transparent w-[43%]"
                        >
                          Pasangan jawaban
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({
                        length: Math.max(
                          soal.pasangan_menjodohkan.kolom_a.length,
                          soal.pasangan_menjodohkan.kolom_b.length
                        ),
                      }).map((_, i) => {
                        const itemA = soal.pasangan_menjodohkan!.kolom_a[i];
                        const itemB = soal.pasangan_menjodohkan!.kolom_b[i];
                        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                        const letterPrefix = `${letters[i]}.`;
                        const displayB = itemB
                          ? itemB.startsWith(`${letters[i]}.`)
                            ? itemB
                            : `${letterPrefix} ${itemB}`
                          : null;
                        const displayA = itemA
                          ? itemA.startsWith(`${i + 1}.`)
                            ? itemA
                            : `${i + 1}. ${itemA}`
                          : null;

                        return (
                          <tr key={i} className="min-h-[46px]">
                            {/* === TABEL KIRI: PERNYATAAN (1 Kolom Rapi) === */}
                            {itemA ? (
                              <td className="p-2.5 border border-black text-black align-middle font-normal bg-white">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={itemA}
                                    onChange={(e) => {
                                      const updated = [...soalList];
                                      const curKolomA = [
                                        ...(updated[index].pasangan_menjodohkan?.kolom_a || []),
                                      ];
                                      curKolomA[i] = e.target.value;
                                      updated[index].pasangan_menjodohkan!.kolom_a = curKolomA;
                                      setSoalList(updated);
                                      if (onUpdateSoal) onUpdateSoal(updated);
                                    }}
                                    className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                  />
                                ) : (
                                  <span>{displayA}</span>
                                )}
                              </td>
                            ) : (
                              <td className="border-none bg-transparent"></td>
                            )}

                            {/* === AREA TENGAH: TITIK HITAM BERADA DILUAR KOLOM DENGAN RAPI + JARAK TARIK GARIS === */}
                            <td className="w-[14%] sm:w-[14%] border-none bg-transparent align-middle px-1.5 sm:px-2.5 select-none">
                              <div className="flex items-center justify-between w-full h-full">
                                {itemA ? (
                                  <span
                                    className="inline-block w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-black shadow-xs shrink-0"
                                    title="Titik awal tarik garis"
                                  />
                                ) : (
                                  <span className="w-3.5 sm:w-4 inline-block" />
                                )}

                                {/* Ruang kosong lapang untuk menarik garis lurus */}
                                <div className="flex-1 min-w-[20px]"></div>

                                {itemB ? (
                                  <span
                                    className="inline-block w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-black shadow-xs shrink-0"
                                    title="Titik tujuan tarik garis"
                                  />
                                ) : (
                                  <span className="w-3.5 sm:w-4 inline-block" />
                                )}
                              </div>
                            </td>

                            {/* === TABEL KANAN: PASANGAN JAWABAN (1 Kolom Rapi) === */}
                            {itemB ? (
                              <td className="p-2.5 border border-black text-black align-middle font-normal bg-white">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={itemB}
                                    onChange={(e) => {
                                      const updated = [...soalList];
                                      const curKolomB = [
                                        ...(updated[index].pasangan_menjodohkan?.kolom_b || []),
                                      ];
                                      curKolomB[i] = e.target.value;
                                      updated[index].pasangan_menjodohkan!.kolom_b = curKolomB;
                                      setSoalList(updated);
                                      if (onUpdateSoal) onUpdateSoal(updated);
                                    }}
                                    className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                                  />
                                ) : (
                                  <span>{displayB}</span>
                                )}
                              </td>
                            ) : (
                              <td className="border-none bg-transparent"></td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* =========================================================================
                  LAYOUT 4: SOAL BENAR SALAH (Sesuai Gambar 4)
                  - Single table:
                    Column 1: "Kalimat/Pernyataan" (1., 2., 3.)
                    Column 2: "Benar atau Salah" (Benar / Salah)
                 ========================================================================= */}
              {isBenarSalah && (
                <div className="mt-2.5 overflow-x-auto">
                  <table className="w-full border-collapse border border-black">
                    <thead>
                      <tr className="border-b border-black bg-slate-50/50 print:bg-transparent">
                        <th className="p-2 text-center font-bold text-black border border-black w-3/4">
                          Kalimat/Pernyataan
                        </th>
                        <th className="p-2 text-center font-bold text-black border border-black w-1/4">
                          Benar atau Salah
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {soal.pernyataan_benar_salah && soal.pernyataan_benar_salah.length > 0 ? (
                        soal.pernyataan_benar_salah.map((row, rIdx) => (
                          <tr key={rIdx} className="border border-black">
                            <td className="p-2 border border-black text-black">
                              {`${row.nomor}. ${row.kalimat}`}
                            </td>
                            <td className="p-2 border border-black text-center text-black font-medium">
                              Benar / Salah
                            </td>
                          </tr>
                        ))
                      ) : (
                        // Fallback single statement row
                        <tr className="border border-black">
                          <td className="p-2 border border-black text-black">
                            1. {soal.pertanyaan.replace(/^Pernyataan:\s*/i, '')}
                          </td>
                          <td className="p-2 border border-black text-center text-black font-medium">
                            Benar / Salah
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* =========================================================================
                  LAYOUT 5: SOAL URAIAN (Sesuai Gambar 5)
                  - Bordered box
                  - Top-left label: "Jawab:"
                  - Full horizontal lines across the box for handwriting
                 ========================================================================= */}
              {isUraian && (
                <div className="mt-2.5 border border-black p-3 bg-white">
                  <span className="font-bold text-black block mb-2 font-sans">
                    Jawab:
                  </span>
                  {/* Clean solid horizontal writing lines as shown in user's image */}
                  <div className="space-y-5 pt-1 pb-1">
                    <div className="border-b border-black h-1"></div>
                    <div className="border-b border-black h-1"></div>
                    <div className="border-b border-black h-1"></div>
                    <div className="border-b border-black h-1"></div>
                    <div className="border-b border-black h-1"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Signature Section at bottom */}
      {config.showSignature && (
        <div className="mt-10 pt-5 border-t border-black grid grid-cols-2 text-center text-xs sm:text-sm print:break-inside-avoid">
          <div>
            <p className="text-black">Mengetahui,</p>
            <p className="font-semibold text-black">Kepala {schoolInfo.namaSekolah || 'Sekolah'}</p>
            <div className="h-14"></div>
            <p className="font-bold underline text-black">
              {schoolInfo.namaKepalaSekolah || 'Dr. H. Ahmad Fauzi, M.Pd.'}
            </p>
            <p className="text-black">NIP. {schoolInfo.nipKepalaSekolah || '19750812 200003 1 004'}</p>
          </div>

          <div>
            <p className="text-black">Guru Penyusun Asesmen,</p>
            <p className="font-semibold text-black">Mata Pelajaran {kit.paramsSnapshot?.mataPelajaran || ''}</p>
            <div className="h-14"></div>
            <p className="font-bold underline text-black">
              {schoolInfo.namaGuru || 'Yuliono, S.Pd.'}
            </p>
            <p className="text-black">NIP. {schoolInfo.nipGuru || '19880415 201101 1 002'}</p>
          </div>
        </div>
      )}
      </div>

      {/* Smart Spellcheck & Grammar Modal */}
      <SmartSpellcheckModal
        isOpen={showSpellcheckModal}
        onClose={() => setShowSpellcheckModal(false)}
        soalList={soalList}
        onApplyFix={handleApplySpellcheckFix}
      />
    </div>
  );
};
