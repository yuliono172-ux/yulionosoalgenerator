import React from 'react';
import {
  FileText,
  Table2,
  KeyRound,
  GraduationCap,
  Sliders,
  Code,
  Download,
  Printer,
  Sparkles,
  BookMarked,
  BookmarkPlus,
  Archive,
} from 'lucide-react';

export type ActiveTab =
  | 'parameter'
  | 'naskah'
  | 'kisi-kisi'
  | 'kunci-rubrik'
  | 'simulasi'
  | 'json';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onExportWord: () => void;
  onPrint: () => void;
  onOpenBankSoal: () => void;
  onSaveToBankSoal: () => void;
  hasKit: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onExportWord,
  onPrint,
  onOpenBankSoal,
  onSaveToBankSoal,
  hasKit,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white shadow-md shadow-emerald-700/20">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  Pakar Evaluasi
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Kurikulum Merdeka
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Penyusun Naskah Soal, Matriks Kisi-Kisi & Rubrik Penskoran
              </p>
            </div>
          </div>

          {/* Quick Actions (Simpan Bank Soal, Bank Soal, Export Word & Cetak) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSaveToBankSoal}
              disabled={!hasKit}
              title="Simpan naskah soal ini ke Bank Soal Firebase untuk tahun mendatang"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-xs disabled:opacity-50"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Simpan Bank Soal</span>
            </button>

            <button
              type="button"
              onClick={onOpenBankSoal}
              title="Buka koleksi Bank Soal tersimpan di Firebase"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-2xs"
            >
              <Archive className="h-3.5 w-3.5 text-emerald-600" />
              <span>Bank Soal</span>
            </button>

            <button
              type="button"
              onClick={onExportWord}
              disabled={!hasKit}
              title="Unduh format dokumen Microsoft Word (.doc) lengkap dengan Kop Surat Sekolah"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden md:inline">Ekspor Word</span>
            </button>

            <button
              type="button"
              onClick={onPrint}
              disabled={!hasKit}
              title="Buka Pusat Menu Cetak Dokumen Asesmen Resmi (Naskah, Kisi-Kisi, Kunci, LJK & Bundel)"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:to-slate-700 transition shadow-xs border border-slate-700/60 disabled:opacity-50"
            >
              <Printer className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>Menu Cetak</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('parameter')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'parameter'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-emerald-600" />
            Parameter & CP/TP
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('naskah')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'naskah'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-emerald-600" />
            1. Naskah Soal
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kisi-kisi')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'kisi-kisi'
                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Table2 className="h-3.5 w-3.5 text-indigo-600" />
            2. Matriks Kisi-Kisi
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kunci-rubrik')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'kunci-rubrik'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
            3. Kunci & Rubrik
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulasi')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'simulasi'
                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
            Mode Siswa (CBT)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'json'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Format JSON Murni
          </button>
        </div>
      </div>
    </header>
  );
};
