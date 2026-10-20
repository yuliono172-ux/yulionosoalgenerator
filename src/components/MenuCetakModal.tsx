import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  EvaluationKit,
  SchoolMetadata,
} from '../types/assessment';
import {
  DEFAULT_PRINT_ENGINE_CONFIG,
  PrintEngineConfig,
  PrintableDocumentType,
  executeIframePrint,
  generateCoverHtml,
  generateKisiKisiHtml,
  generateKunciRubrikHtml,
  generateLembarJawabHtml,
  generateMultiDocsHtml,
  generateNaskahHtml,
  openStandalonePrintTab,
  wrapInPrintableDocument,
} from '../utils/printEngine';
import { exportElementToPdf } from '../utils/pdfExport';
import {
  Printer,
  X,
  FileText,
  Table2,
  KeyRound,
  CheckSquare,
  BookOpen,
  Settings2,
  ExternalLink,
  FileDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Check,
  Layers,
  FileStack,
  Eye,
} from 'lucide-react';

interface MenuCetakModalProps {
  isOpen: boolean;
  onClose: () => void;
  kit: EvaluationKit;
  schoolInfo: SchoolMetadata;
  initialDocType?: PrintableDocumentType;
}

interface DocOptionItem {
  type: PrintableDocumentType;
  label: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOrientation: 'portrait' | 'landscape';
  recommendedFor: string;
}

const AVAILABLE_DOCS: DocOptionItem[] = [
  {
    type: 'cover',
    label: '1. Sampul / Kover Asesmen',
    badge: 'Kover Formal',
    desc: 'Halaman sampul resmi bundel portofolio asesmen dengan Kop dan identitas',
    icon: BookOpen,
    defaultOrientation: 'portrait',
    recommendedFor: 'Arsip & Portofolio',
  },
  {
    type: 'naskah',
    label: '2. Naskah Soal Evaluasi',
    badge: 'Soal Lengkap',
    desc: 'Naskah lengkap dengan Kop Surat, identitas siswa, petunjuk, dan butir soal',
    icon: FileText,
    defaultOrientation: 'portrait',
    recommendedFor: 'Siswa / Ulangan',
  },
  {
    type: 'kisi-kisi',
    label: '3. Matriks Kisi-Kisi Soal',
    badge: 'BSKAP Kemendikbud',
    desc: 'Tabel pemetaan CP, TP, materi, indikator soal, level kognitif & bentuk soal',
    icon: Table2,
    defaultOrientation: 'landscape',
    recommendedFor: 'Administrasi Guru',
  },
  {
    type: 'kunci-rubrik',
    label: '4. Kunci & Rubrik Penskoran',
    badge: 'Kunci & Pedoman',
    desc: 'Kunci jawaban ringkas, pembahasan analitis, dan rubrik analitik esai 0-4',
    icon: KeyRound,
    defaultOrientation: 'portrait',
    recommendedFor: 'Guru / Korektor',
  },
  {
    type: 'lembar-jawab',
    label: '5. Lembar Jawab Siswa (LJK)',
    badge: 'LJK Cetak',
    desc: 'Format cetak LJK lingkaran A-D/E dan ruang jawaban esai/uraian',
    icon: CheckSquare,
    defaultOrientation: 'portrait',
    recommendedFor: 'Siswa Saat Ujian',
  },
];

// Document order priority when compiling multi-document bundle
const DOC_ORDER: PrintableDocumentType[] = [
  'cover',
  'naskah',
  'kisi-kisi',
  'kunci-rubrik',
  'lembar-jawab',
];

export const MenuCetakModal: React.FC<MenuCetakModalProps> = ({
  isOpen,
  onClose,
  kit,
  schoolInfo,
  initialDocType = 'naskah',
}) => {
  // Multi-document selection state: holds array of selected document types
  const [selectedDocTypes, setSelectedDocTypes] = useState<PrintableDocumentType[]>(() => {
    if (initialDocType === 'bundel-lengkap') {
      return ['cover', 'naskah', 'kisi-kisi', 'kunci-rubrik', 'lembar-jawab'];
    }
    return [initialDocType || 'naskah'];
  });

  // Active preview mode: 'all' (merged preview) or single document type
  const [previewTab, setPreviewTab] = useState<'all' | PrintableDocumentType>('all');

  const [config, setConfig] = useState<PrintEngineConfig>({
    ...DEFAULT_PRINT_ENGINE_CONFIG,
    docType: initialDocType,
    orientation: initialDocType === 'kisi-kisi' ? 'landscape' : 'portrait',
  });

  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Synchronize state when modal opens or initialDocType changes
  useEffect(() => {
    if (isOpen) {
      if (initialDocType === 'bundel-lengkap') {
        setSelectedDocTypes(['cover', 'naskah', 'kisi-kisi', 'kunci-rubrik', 'lembar-jawab']);
        setPreviewTab('all');
        setConfig((prev) => ({
          ...prev,
          docType: 'bundel-lengkap',
          orientation: 'portrait',
        }));
      } else if (initialDocType) {
        setSelectedDocTypes([initialDocType]);
        setPreviewTab(initialDocType);
        setConfig((prev) => ({
          ...prev,
          docType: initialDocType,
          orientation: initialDocType === 'kisi-kisi' ? 'landscape' : 'portrait',
        }));
      }
    }
  }, [isOpen, initialDocType]);

  // Keep previewTab synchronized if the active tab is unchecked
  useEffect(() => {
    if (previewTab !== 'all' && !selectedDocTypes.includes(previewTab)) {
      setPreviewTab('all');
    }
  }, [selectedDocTypes, previewTab]);

  // Toggle selection for a document type
  const handleToggleDoc = (docType: PrintableDocumentType) => {
    setSelectedDocTypes((prev) => {
      let updated: PrintableDocumentType[];
      if (prev.includes(docType)) {
        updated = prev.filter((t) => t !== docType);
      } else {
        // Keep in standard sorted order
        updated = DOC_ORDER.filter((t) => t === docType || prev.includes(t));
      }

      // Auto-adjust default orientation if only kisi-kisi is selected
      if (updated.length === 1 && updated[0] === 'kisi-kisi') {
        setConfig((c) => ({ ...c, orientation: 'landscape' }));
      } else if (updated.length > 0 && !updated.includes('kisi-kisi')) {
        setConfig((c) => ({ ...c, orientation: 'portrait' }));
      }

      return updated;
    });
  };

  // Quick preset handlers
  const handleSelectAll = () => {
    setSelectedDocTypes(['cover', 'naskah', 'kisi-kisi', 'kunci-rubrik', 'lembar-jawab']);
    setPreviewTab('all');
    setConfig((prev) => ({ ...prev, orientation: 'portrait' }));
    setStatusNotice('Semua 5 berkas telah dipilih untuk dicetak sekaligus.');
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleSelectStudentKit = () => {
    setSelectedDocTypes(['naskah', 'lembar-jawab']);
    setPreviewTab('all');
    setConfig((prev) => ({ ...prev, orientation: 'portrait' }));
    setStatusNotice('Paket Siswa dipilih: Naskah Soal + Lembar Jawab Siswa (LJK).');
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleSelectTeacherKit = () => {
    setSelectedDocTypes(['kisi-kisi', 'naskah', 'kunci-rubrik']);
    setPreviewTab('all');
    setConfig((prev) => ({ ...prev, orientation: 'portrait' }));
    setStatusNotice('Paket Administrasi Guru dipilih: Kisi-Kisi + Naskah + Kunci & Rubrik.');
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleSelectNaskahOnly = () => {
    setSelectedDocTypes(['naskah']);
    setPreviewTab('naskah');
    setConfig((prev) => ({ ...prev, orientation: 'portrait' }));
  };

  const handleClearSelection = () => {
    setSelectedDocTypes([]);
    setPreviewTab('all');
  };

  // Ordered list of currently selected documents
  const activeSelectedDocs = useMemo(() => {
    return DOC_ORDER.filter((t) => selectedDocTypes.includes(t));
  }, [selectedDocTypes]);

  // Generate the HTML for the preview box
  const rawPreviewHtml = useMemo(() => {
    if (activeSelectedDocs.length === 0) {
      return `
        <div style="text-align: center; padding: 60px 20px; color: #64748b; font-family: sans-serif;">
          <div style="font-size: 15pt; font-weight: bold; color: #1e293b; margin-bottom: 8px;">
            Belum Ada Dokumen yang Dipilih
          </div>
          <p style="font-size: 11pt; line-height: 1.5; max-width: 420px; margin: 0 auto; color: #64748b;">
            Silakan centang satu atau beberapa dokumen pada daftar di sebelah kiri untuk melihat pratinjau dan mencetak sekaligus.
          </p>
        </div>
      `;
    }

    if (previewTab === 'all' || activeSelectedDocs.length === 1) {
      return generateMultiDocsHtml(activeSelectedDocs, kit, schoolInfo, config);
    }

    // Single document tab view
    switch (previewTab) {
      case 'cover':
        return generateCoverHtml(kit, schoolInfo, config);
      case 'kisi-kisi':
        return generateKisiKisiHtml(kit, schoolInfo, config);
      case 'kunci-rubrik':
        return generateKunciRubrikHtml(kit, schoolInfo, config);
      case 'lembar-jawab':
        return generateLembarJawabHtml(kit, schoolInfo, config);
      case 'naskah':
      default:
        return generateNaskahHtml(kit, schoolInfo, config);
    }
  }, [activeSelectedDocs, previewTab, kit, schoolInfo, config]);

  // Generate complete combined printable HTML for print engine (ALWAYS prints all selected docs!)
  const fullPrintableHtml = useMemo(() => {
    const docLabels = activeSelectedDocs.map((d) => d.toUpperCase()).join('_');
    const title = `${schoolInfo.namaAsesmen || 'Asesmen'}-${docLabels || 'KOSONG'}`;
    const multiHtml = generateMultiDocsHtml(activeSelectedDocs, kit, schoolInfo, config);
    return wrapInPrintableDocument(multiHtml, title, config);
  }, [activeSelectedDocs, kit, schoolInfo, config]);

  if (!isOpen) return null;

  // Handle direct print via isolated iframe (prints all selected files!)
  const handlePrintDirect = async () => {
    if (activeSelectedDocs.length === 0) {
      setStatusNotice('Pilih minimal satu dokumen untuk dicetak.');
      setTimeout(() => setStatusNotice(null), 3000);
      return;
    }

    setIsPrinting(true);
    setStatusNotice(`Menyiapkan ${activeSelectedDocs.length} berkas dokumen untuk dicetak sekaligus...`);
    try {
      await executeIframePrint(fullPrintableHtml);
      setStatusNotice('Dialog cetak browser telah dibuka! Semua dokumen siap dicetak.');
      setTimeout(() => setStatusNotice(null), 4000);
    } catch (err: any) {
      console.error('Print failed:', err);
      window.print();
    } finally {
      setIsPrinting(false);
    }
  };

  // Handle standalone new tab print
  const handleOpenNewTab = () => {
    if (activeSelectedDocs.length === 0) return;
    const title = `${schoolInfo.namaAsesmen || 'Asesmen'} - ${activeSelectedDocs.length} Dokumen`;
    openStandalonePrintTab(fullPrintableHtml, title);
    setStatusNotice(`Dokumen (${activeSelectedDocs.length} berkas) telah dibuka pada tab cetak mandiri!`);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // Handle direct PDF download from preview element
  const handleDownloadPdf = async () => {
    if (!previewRef.current || activeSelectedDocs.length === 0) return;
    setIsExportingPdf(true);
    setStatusNotice(`Merender berkas PDF (${activeSelectedDocs.length} dokumen terpilih)...`);
    try {
      const summaryTag =
        activeSelectedDocs.length === 5
          ? 'Bundel-Lengkap-Semua'
          : activeSelectedDocs.join('-');
      const filename = `${(schoolInfo.namaAsesmen || 'Asesmen').replace(/\s+/g, '-')}-${summaryTag}.pdf`;
      await exportElementToPdf(previewRef.current, {
        filename,
      });
      setStatusNotice(`Berkas PDF "${filename}" berhasil diunduh!`);
      setTimeout(() => setStatusNotice(null), 4000);
    } catch (err: any) {
      console.error('Export PDF error:', err);
      setStatusNotice('Gagal mengunduh PDF langsung. Gunakan tombol Cetak lalu pilih opsi "Save as PDF".');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-6xl w-full max-h-[96vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Pusat Cetak & Unduh Dokumen Asesmen
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <FileStack className="h-3 w-3" />
                  Mendukung Pilihan Banyak Berkas Sekaligus
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pilih satu atau beberapa berkas, sesuaikan format lembar, lalu cetak seluruhnya dalam 1 kali klik.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Notification */}
        {statusNotice && (
          <div className="px-6 py-2 bg-emerald-50 text-emerald-900 border-b border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Left Panel: Document Multi-Selection & Configuration (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Pilih Dokumen Checklist */}
            <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-emerald-700" />
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Pilih Berkas Yang Dicetak:
                  </label>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {activeSelectedDocs.length} dari {AVAILABLE_DOCS.length} Dipilih
                </span>
              </div>

              {/* Quick preset chips */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3 pt-1">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-700 text-white hover:bg-emerald-800 shadow-2xs transition"
                >
                  Pilih Semua (5)
                </button>
                <button
                  type="button"
                  onClick={handleSelectStudentKit}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-2xs transition"
                  title="Naskah Soal + Lembar Jawab Siswa (LJK)"
                >
                  Paket Siswa (Naskah + LJK)
                </button>
                <button
                  type="button"
                  onClick={handleSelectTeacherKit}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-2xs transition"
                  title="Kisi-Kisi + Naskah + Kunci & Rubrik"
                >
                  Paket Guru / Arsip
                </button>
                {activeSelectedDocs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition ml-auto"
                  >
                    Kosongkan
                  </button>
                )}
              </div>

              {/* Document items list with checkboxes */}
              <div className="space-y-2">
                {AVAILABLE_DOCS.map((doc) => {
                  const Icon = doc.icon;
                  const isChecked = selectedDocTypes.includes(doc.type);
                  return (
                    <div
                      key={doc.type}
                      onClick={() => handleToggleDoc(doc.type)}
                      className={`cursor-pointer w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-start gap-3 select-none ${
                        isChecked
                          ? 'bg-white border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                          : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300 opacity-80'
                      }`}
                    >
                      {/* Checkbox Box */}
                      <div className="pt-0.5 shrink-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'border-2 border-slate-300 bg-white hover:border-slate-400'
                          }`}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Icon */}
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isChecked
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-bold ${
                              isChecked ? 'text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {doc.label}
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            {doc.defaultOrientation === 'landscape' ? 'Lanskap' : 'Potret'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {doc.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeSelectedDocs.length === 0 && (
                <div className="mt-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span>Silakan centang minimal satu berkas dokumen untuk dicetak.</span>
                </div>
              )}
            </div>

            {/* 2. Pengaturan Kertas & Tata Letak */}
            <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Settings2 className="h-3.5 w-3.5 text-emerald-700" />
                Pengaturan Kertas & Format:
              </h4>

              {/* Ukuran Kertas & Orientasi */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Ukuran Kertas:</label>
                  <select
                    value={config.paperSize}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        paperSize: e.target.value as 'A4' | 'F4',
                      }))
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800 text-xs focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="A4">A4 (210 x 297 mm)</option>
                    <option value="F4">F4 / Folio (215 x 330 mm)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Orientasi Utama:</label>
                  <select
                    value={config.orientation}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        orientation: e.target.value as 'portrait' | 'landscape',
                      }))
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800 text-xs focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="portrait">Potret (Tegak)</option>
                    <option value="landscape">Lanskap (Mendatar)</option>
                  </select>
                </div>
              </div>

              {/* Ukuran Font & Kolom Naskah */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Ukuran Teks:</label>
                  <select
                    value={config.fontSize}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        fontSize: e.target.value as 'compact' | 'standard' | 'large',
                      }))
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs"
                  >
                    <option value="compact">Kompak (10pt)</option>
                    <option value="standard">Standar (11pt)</option>
                    <option value="large">Besar (12pt)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Kolom Naskah:</label>
                  <select
                    value={config.columns}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        columns: Number(e.target.value) as 1 | 2,
                      }))
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs"
                  >
                    <option value={1}>1 Kolom (Standar)</option>
                    <option value={2}>2 Kolom (Hemat Kertas)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showKop}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, showKop: e.target.checked }))
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-slate-700">Tampilkan Kop Surat Resmi Sekolah</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showStudentIdentity}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        showStudentIdentity: e.target.checked,
                      }))
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-slate-700">
                    Tampilkan Kolom Identitas Peserta Tes
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showSignatures}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, showSignatures: e.target.checked }))
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-slate-700">
                    Tampilkan Kolom Tanda Tangan Pengesahan Guru & Kepsek
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Panel: Interactive Live Multi-Document Print Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col min-h-[420px]">
            {/* Top Toolbar: Tabs to preview all or single document */}
            <div className="pb-2.5 mb-2 border-b border-slate-200 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Pratinjau Lembar Cetak
                </span>
                <span className="text-[11px] text-slate-500">
                  {config.paperSize} &bull; {config.orientation === 'landscape' ? 'Lanskap' : 'Potret'} &bull; Font {config.fontSize}
                </span>
              </div>

              {/* Preview Mode Selector (Only when at least 1 doc selected) */}
              {activeSelectedDocs.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <span className="text-[11px] font-semibold text-slate-500 shrink-0 flex items-center gap-1 mr-1">
                    <Eye className="h-3 w-3" />
                    Tampilan:
                  </span>

                  {/* All combined option */}
                  <button
                    type="button"
                    onClick={() => setPreviewTab('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                      previewTab === 'all'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>Semua Terpilih (Digabung)</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-slate-950 font-extrabold">
                      {activeSelectedDocs.length}
                    </span>
                  </button>

                  {/* Individual tabs for each selected document */}
                  {activeSelectedDocs.map((docType) => {
                    const docInfo = AVAILABLE_DOCS.find((d) => d.type === docType);
                    const isTabActive = previewTab === docType;
                    return (
                      <button
                        key={docType}
                        type="button"
                        onClick={() => setPreviewTab(docType)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                          isTabActive
                            ? 'bg-emerald-700 text-white font-bold shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {docInfo?.label.replace(/^\d+\.\s*/, '') || docType}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Simulated Paper Box */}
            <div className="flex-1 bg-slate-200/90 rounded-2xl p-3 sm:p-5 overflow-y-auto max-h-[58vh] border border-slate-300 shadow-inner">
              <div
                ref={previewRef}
                className="bg-white mx-auto shadow-md border border-slate-300 text-black p-6 sm:p-8 rounded-xs"
                style={{
                  maxWidth: config.orientation === 'landscape' ? '920px' : '680px',
                  fontFamily: 'Times New Roman, serif',
                  fontSize:
                    config.fontSize === 'compact'
                      ? '10pt'
                      : config.fontSize === 'large'
                      ? '12pt'
                      : '11pt',
                  lineHeight: 1.35,
                }}
                dangerouslySetInnerHTML={{ __html: rawPreviewHtml }}
              />
            </div>

            {/* Page break info footnote */}
            {activeSelectedDocs.length > 1 && previewTab === 'all' && (
              <p className="text-[11px] text-slate-500 mt-1.5 text-center italic">
                Setiap dokumen di atas otomatis dimulai pada lembar halaman baru saat dicetak fisik maupun disimpan sebagai PDF.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Satuan Pendidikan: <strong>{schoolInfo.namaSekolah}</strong> &bull; Total Soal:{' '}
            <strong>{kit.soal_evaluasi.length} Butir</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition"
            >
              Tutup
            </button>

            {/* Buka Tab Cetak Baru */}
            <button
              type="button"
              disabled={activeSelectedDocs.length === 0}
              onClick={handleOpenNewTab}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl shadow-2xs transition disabled:opacity-50"
              title="Buka seluruh dokumen terpilih pada tab browser baru khusus cetak"
            >
              <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
              <span>Tab Cetak Baru</span>
            </button>

            {/* Unduh PDF Gabungan */}
            <button
              type="button"
              disabled={isExportingPdf || activeSelectedDocs.length === 0}
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition disabled:opacity-50"
              title="Simpan seluruh berkas terpilih dalam 1 berkas PDF resolusi tinggi"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Merender PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="h-3.5 w-3.5" />
                  <span>
                    Unduh PDF ({activeSelectedDocs.length} Berkas)
                  </span>
                </>
              )}
            </button>

            {/* Cetak Sekaligus (Print Dialog) */}
            <button
              type="button"
              disabled={isPrinting || activeSelectedDocs.length === 0}
              onClick={handlePrintDirect}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-700/20 transition active:scale-95 disabled:opacity-50"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyiapkan Cetak...</span>
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 text-emerald-200" />
                  <span>
                    {activeSelectedDocs.length > 1
                      ? `Cetak Sekaligus (${activeSelectedDocs.length} Dokumen)`
                      : activeSelectedDocs.length === 1
                      ? 'Cetak Dokumen Sekarang'
                      : 'Pilih Dokumen'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
