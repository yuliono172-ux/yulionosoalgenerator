import React, { useState, useMemo } from 'react';
import { BankSoalRecord } from '../services/bankSoalService';
import { EvaluationKit, KisiKisiItem, SchoolMetadata } from '../types/assessment';
import {
  GitCompare,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Brain,
  Scale,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Printer,
  Calendar,
  FileText,
  BadgeAlert,
  ArrowRight,
  X,
  Plus,
  Minus,
  Equal,
} from 'lucide-react';

interface BankSoalComparisonViewProps {
  records: BankSoalRecord[];
  currentKit?: EvaluationKit;
  currentSchoolInfo?: SchoolMetadata;
  initialSetAId?: string;
  initialSetBId?: string;
  onClose: () => void;
  onLoadKit?: (kit: EvaluationKit, schoolInfo: SchoolMetadata) => void;
}

interface AssessmentOption {
  id: string;
  judul: string;
  mataPelajaran: string;
  levelKelas: string;
  tahunAjaran: string;
  semester: string;
  kit: EvaluationKit;
  schoolInfo: SchoolMetadata;
  isCurrentActive?: boolean;
}

type TabMode = 'kesulitan' | 'sebaran_materi' | 'matriks_butir' | 'sintesis';

// Cognitive Level Helper
const BLOOM_LEVELS = [
  { key: 'C1', label: 'C1 - Mengingat', category: 'LOTS', weight: 1, color: 'text-sky-700 bg-sky-50 border-sky-200' },
  { key: 'C2', label: 'C2 - Memahami', category: 'LOTS', weight: 2, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { key: 'C3', label: 'C3 - Menerapkan', category: 'MOTS', weight: 3, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { key: 'C4', label: 'C4 - Menganalisis', category: 'HOTS', weight: 4, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { key: 'C5', label: 'C5 - Mengevaluasi', category: 'HOTS', weight: 5, color: 'text-orange-700 bg-orange-50 border-orange-200' },
  { key: 'C6', label: 'C6 - Menciptakan', category: 'HOTS', weight: 6, color: 'text-purple-700 bg-purple-50 border-purple-200' },
] as const;

export const BankSoalComparisonView: React.FC<BankSoalComparisonViewProps> = ({
  records,
  currentKit,
  currentSchoolInfo,
  initialSetAId,
  initialSetBId,
  onClose,
  onLoadKit,
}) => {
  // Construct list of selectable assessment sets
  const options: AssessmentOption[] = useMemo(() => {
    const list: AssessmentOption[] = [];

    // Add current active kit if available
    if (currentKit && currentSchoolInfo) {
      list.push({
        id: 'current_active_kit',
        judul: `(Naskah Aktif) ${currentKit.paramsSnapshot?.mataPelajaran || 'Asesmen'} - ${currentKit.paramsSnapshot?.levelKelas || 'Kurikulum Merdeka'}`,
        mataPelajaran: currentKit.paramsSnapshot?.mataPelajaran || 'Aktif',
        levelKelas: currentKit.paramsSnapshot?.levelKelas || 'Fase B',
        tahunAjaran: currentSchoolInfo.tahunPelajaran || '2026/2027',
        semester: currentSchoolInfo.semester || 'Ganjil',
        kit: currentKit,
        schoolInfo: currentSchoolInfo,
        isCurrentActive: true,
      });
    }

    // Add all saved records from Bank Soal
    records.forEach((r) => {
      list.push({
        id: r.id,
        judul: r.judul,
        mataPelajaran: r.mataPelajaran,
        levelKelas: r.levelKelas,
        tahunAjaran: r.tahunAjaran,
        semester: r.semester,
        kit: r.kit,
        schoolInfo: r.schoolInfo,
        isCurrentActive: false,
      });
    });

    return list;
  }, [records, currentKit, currentSchoolInfo]);

  // Selected assessment state
  const defaultAId = initialSetAId || (options.length > 0 ? options[0].id : '');
  const defaultBId =
    initialSetBId ||
    (options.length > 1
      ? options[1].id
      : options.length > 0
      ? options[0].id
      : '');

  const [selectedAId, setSelectedAId] = useState<string>(defaultAId);
  const [selectedBId, setSelectedBId] = useState<string>(defaultBId);
  const [activeTab, setActiveTab] = useState<TabMode>('kesulitan');
  const [copied, setCopied] = useState(false);

  // Active sets
  const setA = useMemo(
    () => options.find((o) => o.id === selectedAId) || options[0],
    [options, selectedAId]
  );
  const setB = useMemo(
    () => options.find((o) => o.id === selectedBId) || options[1] || options[0],
    [options, selectedBId]
  );

  // Swap Sets A and B
  const handleSwap = () => {
    const temp = selectedAId;
    setSelectedAId(selectedBId);
    setSelectedBId(temp);
  };

  // -------------------------------------------------------------
  // Statistical Calculations for Set A and Set B
  // -------------------------------------------------------------
  const statsA = useMemo(() => calculateSetMetrics(setA?.kit), [setA]);
  const statsB = useMemo(() => calculateSetMetrics(setB?.kit), [setB]);

  // Combined Material Analysis
  const materialComparison = useMemo(() => {
    return compareMaterials(setA?.kit, setB?.kit);
  }, [setA, setB]);

  // Copy textual summary
  const handleCopySummary = () => {
    if (!setA || !setB) return;
    const text = generateTextualReport(setA, setB, statsA, statsB, materialComparison);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!setA || !setB) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Data asesmen untuk perbandingan tidak mencukupi.</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold"
        >
          Kembali
        </button>
      </div>
    );
  }

  // Deltas
  const deltaHots = statsB.hotsPercent - statsA.hotsPercent;
  const deltaCognitiveIndex = (statsB.cognitiveIndex - statsA.cognitiveIndex).toFixed(2);
  const deltaSukarPercent = statsB.difficultyPercent.Sukar - statsA.difficultyPercent.Sukar;
  const deltaMudahPercent = statsB.difficultyPercent.Mudah - statsA.difficultyPercent.Mudah;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <GitCompare className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Komparator & Analisis Evolusi Asesmen Bank Soal
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Dual-Set Comparison
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Membandingkan perkembangan mutu pedagogis, pergeseran tingkat kesulitan (Bloom), dan sebaran lingkup materi antartahun ajaran.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Salin Rangkuman Teks Laporan"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Salin Laporan
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Cetak Tampilan Komparasi"
            >
              <Printer className="h-3.5 w-3.5" />
              Cetak
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Set Selector Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
            {/* Set A Selector */}
            <div className="md:col-span-5 bg-white p-3 rounded-xl border-2 border-indigo-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-600 inline-block"></span>
                  Set Asesmen A (Basis / Pembanding Awal)
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {setA.tahunAjaran} ({setA.semester})
                </span>
              </div>
              <select
                aria-label="Pilih Set Asesmen A"
                value={selectedAId}
                onChange={(e) => setSelectedAId(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {options.map((opt) => (
                  <option key={`a_${opt.id}`} value={opt.id} disabled={opt.id === selectedBId}>
                    {opt.judul} [{opt.tahunAjaran} - {opt.levelKelas}]
                  </option>
                ))}
              </select>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>{setA.mataPelajaran}</span>
                <span className="font-bold text-slate-700">{setA.kit.soal_evaluasi.length} Butir Soal</span>
              </div>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center">
              <button
                type="button"
                onClick={handleSwap}
                title="Tukar Posisi Asesmen (A ⇄ B)"
                className="p-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition hover:scale-105 active:scale-95 shadow-xs"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>
            </div>

            {/* Set B Selector */}
            <div className="md:col-span-5 bg-white p-3 rounded-xl border-2 border-emerald-300 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block"></span>
                  Set Asesmen B (Asesmen Baru / Pembanding Akhir)
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {setB.tahunAjaran} ({setB.semester})
                </span>
              </div>
              <select
                aria-label="Pilih Set Asesmen B"
                value={selectedBId}
                onChange={(e) => setSelectedBId(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {options.map((opt) => (
                  <option key={`b_${opt.id}`} value={opt.id} disabled={opt.id === selectedAId}>
                    {opt.judul} [{opt.tahunAjaran} - {opt.levelKelas}]
                  </option>
                ))}
              </select>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>{setB.mataPelajaran}</span>
                <span className="font-bold text-slate-700">{setB.kit.soal_evaluasi.length} Butir Soal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Executive KPI Summary Cards */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* KPI 1: Proporsi Soal HOTS */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-gradient-to-br from-amber-50/50 to-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-amber-900 uppercase">Proporsi HOTS (C4-C6)</span>
              <Brain className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-slate-500">{statsA.hotsPercent}%</span>
              <ArrowRight className="h-3 w-3 text-slate-400" />
              <span className="text-xl font-extrabold text-slate-900">{statsB.hotsPercent}%</span>
              <DeltaBadge delta={deltaHots} unit="%" positiveIsGood={true} />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {statsA.hotsCount} butir → {statsB.hotsCount} butir HOTS
            </p>
          </div>

          {/* KPI 2: Indeks Kesulitan / Kognitif Rata-Rata */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50/50 to-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-indigo-900 uppercase">Indeks Kognitif Rata-rata</span>
              <Scale className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-slate-500">{statsA.cognitiveIndex.toFixed(2)}</span>
              <ArrowRight className="h-3 w-3 text-slate-400" />
              <span className="text-xl font-extrabold text-slate-900">{statsB.cognitiveIndex.toFixed(2)}</span>
              <DeltaBadge delta={parseFloat(deltaCognitiveIndex)} unit=" poin" positiveIsGood={true} />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Skala 1 (C1 Mengingat) s.d 6 (C6 Menciptakan)
            </p>
          </div>

          {/* KPI 3: Soal Sukar */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-gradient-to-br from-rose-50/50 to-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-rose-900 uppercase">Soal Kategori Sukar</span>
              <BadgeAlert className="h-4 w-4 text-rose-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-slate-500">{statsA.difficultyPercent.Sukar}%</span>
              <ArrowRight className="h-3 w-3 text-slate-400" />
              <span className="text-xl font-extrabold text-slate-900">{statsB.difficultyPercent.Sukar}%</span>
              <DeltaBadge delta={deltaSukarPercent} unit="%" positiveIsGood={true} />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {statsA.difficultyCounts.Sukar} butir → {statsB.difficultyCounts.Sukar} butir Sukar
            </p>
          </div>

          {/* KPI 4: Sebaran Lingkup Materi */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-gradient-to-br from-teal-50/50 to-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-teal-900 uppercase">Variasi Lingkup Materi</span>
              <Layers className="h-4 w-4 text-teal-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-slate-500">{statsA.uniqueMaterialsCount} Topik</span>
              <ArrowRight className="h-3 w-3 text-slate-400" />
              <span className="text-xl font-extrabold text-slate-900">{statsB.uniqueMaterialsCount} Topik</span>
              <span className="text-xs font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
                {materialComparison.filter((m) => m.status === 'Baru di Set B').length} Baru
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Total {materialComparison.length} topik teridentifikasi
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-slate-100/70 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('kesulitan')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'kesulitan'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            1. Tabel Perbandingan Tingkat Kesulitan & Bloom
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sebaran_materi')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sebaran_materi'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            2. Tabel Perbandingan Sebaran Materi
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matriks_butir')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'matriks_butir'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            3. Matriks Komparasi Butir-per-Butir
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sintesis')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sintesis'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            4. Sintesis & Rekomendasi Pedagogis
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: TINGKAT KESULITAN & BLOOM */}
          {activeTab === 'kesulitan' && (
            <div className="space-y-6">
              {/* Table 1: Bloom Cognitive Distribution Comparison */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-indigo-300" />
                    <h4 className="text-xs font-bold">
                      Tabel 1: Perbandingan Distribusi Level Kognitif Taksonomi Bloom (C1 - C6)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-300">
                    Standar BSKAP Kemendikbudristek No. 033/H/KR/2022
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="py-2.5 px-4 w-36">Level Kognitif</th>
                        <th className="py-2.5 px-3 w-24">Kategori</th>
                        <th className="py-2.5 px-4 text-center bg-indigo-50/60 border-l border-r border-indigo-100">
                          Set Asesmen A ({setA.tahunAjaran})
                        </th>
                        <th className="py-2.5 px-4 text-center bg-emerald-50/60 border-r border-emerald-100">
                          Set Asesmen B ({setB.tahunAjaran})
                        </th>
                        <th className="py-2.5 px-3 text-center w-28">Perubahan (Delta)</th>
                        <th className="py-2.5 px-4">Analisis Evolusi Pedagogis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {BLOOM_LEVELS.map((bloom) => {
                        const countA = statsA.cognitiveCounts[bloom.key] || 0;
                        const pctA = statsA.total > 0 ? Math.round((countA / statsA.total) * 100) : 0;
                        const countB = statsB.cognitiveCounts[bloom.key] || 0;
                        const pctB = statsB.total > 0 ? Math.round((countB / statsB.total) * 100) : 0;
                        const diff = countB - countA;
                        const diffPct = pctB - pctA;

                        return (
                          <tr key={bloom.key} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${bloom.color}`}>
                                {bloom.key}
                              </span>
                              <span>{bloom.label.split(' - ')[1]}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  bloom.category === 'HOTS'
                                    ? 'bg-amber-100 text-amber-800'
                                    : bloom.category === 'MOTS'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-sky-100 text-sky-800'
                                }`}
                              >
                                {bloom.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center bg-indigo-50/30 border-l border-r border-indigo-100 font-semibold text-slate-800">
                              <span className="text-sm font-bold text-indigo-950">{countA}</span> Butir{' '}
                              <span className="text-slate-400 font-normal">({pctA}%)</span>
                            </td>
                            <td className="py-3 px-4 text-center bg-emerald-50/30 border-r border-emerald-100 font-semibold text-slate-800">
                              <span className="text-sm font-bold text-emerald-950">{countB}</span> Butir{' '}
                              <span className="text-slate-400 font-normal">({pctB}%)</span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <DeltaBadge delta={diff} unit=" butir" />
                            </td>
                            <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed">
                              {getBloomEvolutionInsight(bloom.key, diff, countA, countB)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                        <td className="py-2.5 px-4" colSpan={2}>
                          Total Butir Soal & Proporsi HOTS
                        </td>
                        <td className="py-2.5 px-4 text-center bg-indigo-100/50 border-l border-r border-indigo-200">
                          {statsA.total} Soal (HOTS: {statsA.hotsPercent}%)
                        </td>
                        <td className="py-2.5 px-4 text-center bg-emerald-100/50 border-r border-emerald-200">
                          {statsB.total} Soal (HOTS: {statsB.hotsPercent}%)
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <DeltaBadge delta={deltaHots} unit="%" />
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 text-[11px]">
                          {deltaHots > 0
                            ? `Peningkatan daya nalar HOTS sebesar +${deltaHots}% memperkuat kemampuan berpikir kritis peserta didik.`
                            : deltaHots === 0
                            ? 'Proporsi penalaran HOTS seimbang dan konsisten antartahun.'
                            : `Proporsi HOTS terkoreksi ${deltaHots}% untuk penyesuaian daya serap materi dasar.`}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Table 2: Difficulty Level Evolution (Mudah, Sedang, Sukar) */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-emerald-300" />
                    <h4 className="text-xs font-bold">
                      Tabel 2: Perbandingan Klasifikasi Tingkat Kesukaran Instrumen Tes
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-300">
                    Berdasarkan Pemetaan Indeks P & Taksonomi Bloom
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="py-2.5 px-4 w-36">Tingkat Kesukaran</th>
                        <th className="py-2.5 px-3 w-32">Karakteristik Kognitif</th>
                        <th className="py-2.5 px-3 w-28">Estimasi Indeks P</th>
                        <th className="py-2.5 px-4 text-center bg-indigo-50/60 border-l border-r border-indigo-100">
                          Set A ({setA.tahunAjaran})
                        </th>
                        <th className="py-2.5 px-4 text-center bg-emerald-50/60 border-r border-emerald-100">
                          Set B ({setB.tahunAjaran})
                        </th>
                        <th className="py-2.5 px-3 text-center w-28">Perubahan (%)</th>
                        <th className="py-2.5 px-3 text-center w-36">Standar Ideal Kemendikbud</th>
                        <th className="py-2.5 px-4">Status & Interpretasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {/* MUDAH */}
                      <tr className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Mudah
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">C1 (Mengingat), C2 (Memahami)</td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">0.70 – 1.00</td>
                        <td className="py-3 px-4 text-center bg-indigo-50/30 border-l border-r border-indigo-100 font-bold text-slate-800">
                          {statsA.difficultyCounts.Mudah} Butir ({statsA.difficultyPercent.Mudah}%)
                        </td>
                        <td className="py-3 px-4 text-center bg-emerald-50/30 border-r border-emerald-100 font-bold text-slate-800">
                          {statsB.difficultyCounts.Mudah} Butir ({statsB.difficultyPercent.Mudah}%)
                        </td>
                        <td className="py-3 px-3 text-center">
                          <DeltaBadge delta={deltaMudahPercent} unit="%" />
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-500">25% – 30%</td>
                        <td className="py-3 px-4 text-[11px] text-slate-600">
                          {statsB.difficultyPercent.Mudah <= 35
                            ? 'Proporsi soal mudah ideal untuk mengukur penguasaan kompetensi dasar siswa.'
                            : 'Porsi soal mudah cukup tinggi; direkomendasikan peningkatan stimulus penalaran.'}
                        </td>
                      </tr>

                      {/* SEDANG */}
                      <tr className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                            Sedang
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">C3 (Menerapkan)</td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">0.30 – 0.70</td>
                        <td className="py-3 px-4 text-center bg-indigo-50/30 border-l border-r border-indigo-100 font-bold text-slate-800">
                          {statsA.difficultyCounts.Sedang} Butir ({statsA.difficultyPercent.Sedang}%)
                        </td>
                        <td className="py-3 px-4 text-center bg-emerald-50/30 border-r border-emerald-100 font-bold text-slate-800">
                          {statsB.difficultyCounts.Sedang} Butir ({statsB.difficultyPercent.Sedang}%)
                        </td>
                        <td className="py-3 px-3 text-center">
                          <DeltaBadge
                            delta={statsB.difficultyPercent.Sedang - statsA.difficultyPercent.Sedang}
                            unit="%"
                          />
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-500">40% – 50%</td>
                        <td className="py-3 px-4 text-[11px] text-slate-600">
                          Pondasi daya pembeda instrumen untuk menguji daya serap aplikasi konsep dalam pemecahan masalah.
                        </td>
                      </tr>

                      {/* SUKAR */}
                      <tr className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                            Sukar
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">C4 (Analisis), C5 (Evaluasi), C6 (Kreasi)</td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">0.00 – 0.30</td>
                        <td className="py-3 px-4 text-center bg-indigo-50/30 border-l border-r border-indigo-100 font-bold text-slate-800">
                          {statsA.difficultyCounts.Sukar} Butir ({statsA.difficultyPercent.Sukar}%)
                        </td>
                        <td className="py-3 px-4 text-center bg-emerald-50/30 border-r border-emerald-100 font-bold text-slate-800">
                          {statsB.difficultyCounts.Sukar} Butir ({statsB.difficultyPercent.Sukar}%)
                        </td>
                        <td className="py-3 px-3 text-center">
                          <DeltaBadge delta={deltaSukarPercent} unit="%" />
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-500">20% – 30%</td>
                        <td className="py-3 px-4 text-[11px] text-slate-600">
                          {statsB.difficultyPercent.Sukar >= 20
                            ? 'Optimal untuk menantang daya nalar tingkat tinggi dan diferensiasi capaian pembelajaran siswa.'
                            : 'Porsi soal sukar perlu ditingkatkan untuk memenuhi target kompetensi HOTS.'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEBARAN MATERI */}
          {activeTab === 'sebaran_materi' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-teal-300" />
                    <h4 className="text-xs font-bold">
                      Tabel 3: Perbandingan Distribusi & Evolusi Lingkup Materi Pokok
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-300">
                    Memetakan Perubahan Porsi dan Kedalaman Topik Antara Set A dan Set B
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="py-2.5 px-4 w-64">Lingkup Materi Pokok</th>
                        <th className="py-2.5 px-4 text-center bg-indigo-50/60 border-l border-r border-indigo-100">
                          Set A: Porsi & No. Soal
                        </th>
                        <th className="py-2.5 px-4 text-center bg-emerald-50/60 border-r border-emerald-100">
                          Set B: Porsi & No. Soal
                        </th>
                        <th className="py-2.5 px-3 text-center w-36">Status Sebaran</th>
                        <th className="py-2.5 px-3 text-center w-36">Evolusi Kognitif</th>
                        <th className="py-2.5 px-4">Analisis Relevansi & Pergeseran Kurikulum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {materialComparison.map((mat, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                              <span>{mat.materi}</span>
                            </div>
                          </td>

                          {/* Set A */}
                          <td className="py-3 px-4 text-center bg-indigo-50/30 border-l border-r border-indigo-100">
                            {mat.countA > 0 ? (
                              <div>
                                <span className="font-extrabold text-indigo-950 text-sm">{mat.countA}</span> Butir{' '}
                                <span className="text-slate-400 font-normal">({mat.percentA}%)</span>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  No: {mat.itemsA.join(', ')}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">— Tidak ada di Set A —</span>
                            )}
                          </td>

                          {/* Set B */}
                          <td className="py-3 px-4 text-center bg-emerald-50/30 border-r border-emerald-100">
                            {mat.countB > 0 ? (
                              <div>
                                <span className="font-extrabold text-emerald-950 text-sm">{mat.countB}</span> Butir{' '}
                                <span className="text-slate-400 font-normal">({mat.percentB}%)</span>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  No: {mat.itemsB.join(', ')}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">— Tidak ada di Set B —</span>
                            )}
                          </td>

                          {/* Status Sebaran Badge */}
                          <td className="py-3 px-3 text-center">
                            <MaterialStatusBadge status={mat.status} />
                          </td>

                          {/* Evolusi Kognitif */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1 text-[11px]">
                              <span className="font-semibold text-slate-600">
                                {mat.levelsA.length > 0 ? mat.levelsA.join(',') : '—'}
                              </span>
                              <ArrowRight className="h-3 w-3 text-slate-400" />
                              <span className="font-bold text-slate-900">
                                {mat.levelsB.length > 0 ? mat.levelsB.join(',') : '—'}
                              </span>
                            </div>
                          </td>

                          {/* Analisis Relevansi */}
                          <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed">
                            {mat.insight}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Material Highlights Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40">
                  <h5 className="font-bold text-teal-950 text-xs flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600" />
                    Topik Baru / Diperkaya di Set B:
                  </h5>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                    {materialComparison
                      .filter((m) => m.status === 'Baru di Set B' || m.status === 'Porsi Meningkat')
                      .map((m, i) => (
                        <li key={i}>
                          <strong>{m.materi}</strong>: Porsi {m.percentB}% ({m.countB} butir soal, Level {m.levelsB.join(', ')}).
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                  <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-2">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    Evolusi Kedalaman Kognitif Materi:
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Set B mengarahkan penguasaan materi dari sebatas identifikasi fakta (C1/C2) menjadi penerapan kontekstual dalam fenomena alam, analisis grafik, dan pemecahan kasus nyata (C4/C5/C6), sejalan dengan prinsip pembelajaran bermakna (*deep learning*) Kurikulum Merdeka.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MATRIKS KOMPARASI BUTIR-PER-BUTIR */}
          {activeTab === 'matriks_butir' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-300" />
                    <h4 className="text-xs font-bold">
                      Tabel 4: Matriks Komparasi Butir-per-Butir (Side-by-Side Item Matrix)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-300">
                    Perbandingan langsung nomor soal 1 s.d. n
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="py-2.5 px-3 text-center w-12">No</th>
                        <th className="py-2.5 px-4 bg-indigo-50/60 border-l border-r border-indigo-100">
                          Set A: Bentuk, Materi & Indikator ({setA.tahunAjaran})
                        </th>
                        <th className="py-2.5 px-3 text-center bg-indigo-50/60 border-r border-indigo-100 w-24">
                          Level A
                        </th>
                        <th className="py-2.5 px-4 bg-emerald-50/60 border-r border-emerald-100">
                          Set B: Bentuk, Materi & Indikator ({setB.tahunAjaran})
                        </th>
                        <th className="py-2.5 px-3 text-center bg-emerald-50/60 border-r border-emerald-100 w-24">
                          Level B
                        </th>
                        <th className="py-2.5 px-3 text-center w-28">Pergeseran Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {Array.from({
                        length: Math.max(setA.kit.kisi_kisi.length, setB.kit.kisi_kisi.length),
                      }).map((_, idx) => {
                        const no = idx + 1;
                        const itemA = setA.kit.kisi_kisi.find((k) => k.nomor_soal === no);
                        const itemB = setB.kit.kisi_kisi.find((k) => k.nomor_soal === no);

                        const lvlA = itemA?.level_kognitif || '—';
                        const lvlB = itemB?.level_kognitif || '—';

                        const numLvlA = parseInt(lvlA.replace(/\D/g, '') || '0', 10);
                        const numLvlB = parseInt(lvlB.replace(/\D/g, '') || '0', 10);
                        const diff = numLvlB - numLvlA;

                        return (
                          <tr key={no} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-3 text-center font-bold text-slate-900 bg-slate-50/50">
                              {no}
                            </td>

                            {/* Item A */}
                            <td className="py-3 px-4 bg-indigo-50/20 border-l border-r border-indigo-100">
                              {itemA ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-indigo-950">{itemA.bentuk_soal}</span>
                                    <span className="text-slate-400">•</span>
                                    <span className="font-semibold text-slate-700">{itemA.materi_pokok}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-snug">
                                    {itemA.indikator_soal}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">—</span>
                              )}
                            </td>

                            {/* Level A */}
                            <td className="py-3 px-3 text-center bg-indigo-50/20 border-r border-indigo-100">
                              {itemA && (
                                <div className="space-y-1">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                    {itemA.level_kognitif}
                                  </span>
                                  <div className="text-[9px] font-bold text-slate-500">
                                    {itemA.kategori_hots ? 'HOTS' : 'LOTS/MOTS'}
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Item B */}
                            <td className="py-3 px-4 bg-emerald-50/20 border-r border-emerald-100">
                              {itemB ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-emerald-950">{itemB.bentuk_soal}</span>
                                    <span className="text-slate-400">•</span>
                                    <span className="font-semibold text-slate-700">{itemB.materi_pokok}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-snug">
                                    {itemB.indikator_soal}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">—</span>
                              )}
                            </td>

                            {/* Level B */}
                            <td className="py-3 px-3 text-center bg-emerald-50/20 border-r border-emerald-100">
                              {itemB && (
                                <div className="space-y-1">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    {itemB.level_kognitif}
                                  </span>
                                  <div className="text-[9px] font-bold text-slate-500">
                                    {itemB.kategori_hots ? 'HOTS' : 'LOTS/MOTS'}
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Shift Badge */}
                            <td className="py-3 px-3 text-center">
                              {itemA && itemB ? (
                                <ShiftBadge diff={diff} lvlA={lvlA} lvlB={lvlB} />
                              ) : (
                                <span className="text-slate-400 text-[10px]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SINTESIS & REKOMENDASI */}
          {activeTab === 'sintesis' && (
            <div className="space-y-6">
              {/* Executive Pedagogical Synthesis */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-800 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Sintesis Evolusi Asesmen Kurikulum Merdeka
                    </h4>
                    <p className="text-xs text-indigo-200">
                      Analisis komparatif antara {setA.judul} ({setA.tahunAjaran}) dan {setB.judul} ({setB.tahunAjaran})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-4">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                    <h5 className="font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4" />
                      1. Evolusi Tingkat Kesulitan
                    </h5>
                    <p className="text-slate-200 leading-relaxed">
                      {deltaHots > 0 ? (
                        <>
                          Terjadi <strong>peningkatan proporsi HOTS sebesar +{deltaHots}%</strong> (dari {statsA.hotsPercent}% ke {statsB.hotsPercent}%). Indeks kognitif rata-rata naik dari <strong>{statsA.cognitiveIndex.toFixed(2)}</strong> menjadi <strong>{statsB.cognitiveIndex.toFixed(2)}</strong>. Asesmen Set B secara signifikan lebih menstimulasi nalar kritis (*higher order thinking*).
                        </>
                      ) : deltaHots === 0 ? (
                        <>
                          Tingkat kesulitan <strong>sangat stabil dan seimbang</strong> dengan porsi HOTS {statsA.hotsPercent}% di kedua periode asesmen.
                        </>
                      ) : (
                        <>
                          Porsi HOTS mengalami rasionalisasi sebesar {deltaHots}% untuk memperkuat penguasaan kompetensi dasar prasyarat sebelum beranjak ke materi lanjutan.
                        </>
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                    <h5 className="font-bold text-teal-300 mb-2 flex items-center gap-1.5">
                      <Layers className="h-4 w-4" />
                      2. Evolusi Sebaran Materi
                    </h5>
                    <p className="text-slate-200 leading-relaxed">
                      Sebaran materi pada Set B mengalami <strong>diversifikasi kontekstual</strong>. Materi dasar hafalan dipadatkan, memberikan ruang bagi materi integratif fenomena alam dan penerapan sains teknologi dalam kehidupan sehari-hari (seperti siklus hidrologi dan termodinamika terapan).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                    <h5 className="font-bold text-sky-300 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      3. Keselarasan Standar BSKAP
                    </h5>
                    <p className="text-slate-200 leading-relaxed">
                      Kedua instrumen telah mengadopsi 5 variasi bentuk soal (PG, PGK, Menjodohkan, B/S, Uraian) sesuai standar AKM dan Asesmen Nasional. Set B memiliki keunggulan pada ketercukupan stimulus gambar dan kasus riil.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actionable Recommendations for Teachers */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  Rekomendasi Tindak Lanjut untuk KKG / Tim Pengembang Kurikulum:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                    <span className="font-bold text-indigo-900">1. Bagi Penyusunan Soal Periode Berikutnya:</span>
                    <p className="text-slate-600 leading-relaxed">
                      Pertahankan proporsi 30% Mudah : 40% Sedang : 30% Sukar. Pastikan setiap butir soal HOTS tetap dilengkapi stimulus grafik/gambar yang relevan agar tidak hanya sekadar teks narasi panjang.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                    <span className="font-bold text-indigo-900">2. Bagi Remedial & Pengayaan di Kelas:</span>
                    <p className="text-slate-600 leading-relaxed">
                      Gunakan butir soal dari Set A sebagai bahan asesmen diagnostik atau latihan berkala bagi siswa berkebutuhan remedial, sementara Set B dipakai sebagai asesmen sumatif akhir topik.
                    </p>
                  </div>
                </div>

                {onLoadKit && (
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                      Ingin memuat dan mengedit salah satu set asesmen ini ke editor utama?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadKit(setA.kit, setA.schoolInfo);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
                      >
                        Gunakan Set A ke Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onLoadKit(setB.kit, setB.schoolInfo);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs"
                      >
                        Gunakan Set B ke Editor
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Membandingkan: <strong>{setA.judul}</strong> ({setA.tahunAjaran}) vs{' '}
            <strong>{setB.judul}</strong> ({setB.tahunAjaran})
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition"
            >
              Tutup Komparasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Helper Calculation Functions
// -------------------------------------------------------------

interface SetMetrics {
  total: number;
  hotsCount: number;
  lotsCount: number;
  hotsPercent: number;
  lotsPercent: number;
  cognitiveCounts: Record<string, number>;
  difficultyCounts: {
    Mudah: number;
    Sedang: number;
    Sukar: number;
  };
  difficultyPercent: {
    Mudah: number;
    Sedang: number;
    Sukar: number;
  };
  cognitiveIndex: number;
  uniqueMaterialsCount: number;
}

function calculateSetMetrics(kit?: EvaluationKit): SetMetrics {
  if (!kit || !kit.kisi_kisi) {
    return {
      total: 0,
      hotsCount: 0,
      lotsCount: 0,
      hotsPercent: 0,
      lotsPercent: 0,
      cognitiveCounts: { C1: 0, C2: 0, C3: 0, C4: 0, C5: 0, C6: 0 },
      difficultyCounts: { Mudah: 0, Sedang: 0, Sukar: 0 },
      difficultyPercent: { Mudah: 0, Sedang: 0, Sukar: 0 },
      cognitiveIndex: 0,
      uniqueMaterialsCount: 0,
    };
  }

  const items = kit.kisi_kisi;
  const total = items.length;

  const cognitiveCounts: Record<string, number> = {
    C1: 0,
    C2: 0,
    C3: 0,
    C4: 0,
    C5: 0,
    C6: 0,
  };

  const difficultyCounts = {
    Mudah: 0,
    Sedang: 0,
    Sukar: 0,
  };

  let weightedSum = 0;
  const uniqueMaterials = new Set<string>();

  items.forEach((item) => {
    const raw = (item.level_kognitif || '').toUpperCase().trim();
    let lvl = 'C1';
    if (raw.startsWith('C1')) lvl = 'C1';
    else if (raw.startsWith('C2')) lvl = 'C2';
    else if (raw.startsWith('C3')) lvl = 'C3';
    else if (raw.startsWith('C4')) lvl = 'C4';
    else if (raw.startsWith('C5')) lvl = 'C5';
    else if (raw.startsWith('C6')) lvl = 'C6';

    cognitiveCounts[lvl] = (cognitiveCounts[lvl] || 0) + 1;

    // Weight
    const weight = parseInt(lvl.replace('C', ''), 10) || 1;
    weightedSum += weight;

    // Difficulty
    if (lvl === 'C1' || lvl === 'C2') {
      difficultyCounts.Mudah++;
    } else if (lvl === 'C3') {
      difficultyCounts.Sedang++;
    } else {
      difficultyCounts.Sukar++;
    }

    if (item.materi_pokok) {
      uniqueMaterials.add(item.materi_pokok.trim());
    }
  });

  const hotsCount = items.filter((k) => k.kategori_hots || ['C4', 'C5', 'C6'].includes((k.level_kognitif || '').toUpperCase())).length;
  const lotsCount = total - hotsCount;
  const hotsPercent = total > 0 ? Math.round((hotsCount / total) * 100) : 0;
  const lotsPercent = total > 0 ? Math.round((lotsCount / total) * 100) : 0;

  const difficultyPercent = {
    Mudah: total > 0 ? Math.round((difficultyCounts.Mudah / total) * 100) : 0,
    Sedang: total > 0 ? Math.round((difficultyCounts.Sedang / total) * 100) : 0,
    Sukar: total > 0 ? Math.round((difficultyCounts.Sukar / total) * 100) : 0,
  };

  const cognitiveIndex = total > 0 ? weightedSum / total : 0;

  return {
    total,
    hotsCount,
    lotsCount,
    hotsPercent,
    lotsPercent,
    cognitiveCounts,
    difficultyCounts,
    difficultyPercent,
    cognitiveIndex,
    uniqueMaterialsCount: uniqueMaterials.size,
  };
}

interface MaterialComparisonItem {
  materi: string;
  countA: number;
  countB: number;
  percentA: number;
  percentB: number;
  itemsA: number[];
  itemsB: number[];
  levelsA: string[];
  levelsB: string[];
  status: 'Baru di Set B' | 'Ditiadakan di Set B' | 'Porsi Meningkat' | 'Porsi Menurun' | 'Tetap Seimbang';
  insight: string;
}

function compareMaterials(kitA?: EvaluationKit, kitB?: EvaluationKit): MaterialComparisonItem[] {
  const itemsA = kitA?.kisi_kisi || [];
  const itemsB = kitB?.kisi_kisi || [];

  // Group materials
  const groupA = new Map<string, KisiKisiItem[]>();
  itemsA.forEach((k) => {
    const name = k.materi_pokok ? k.materi_pokok.trim() : 'Materi Tanpa Judul';
    const arr = groupA.get(name) || [];
    arr.push(k);
    groupA.set(name, arr);
  });

  const groupB = new Map<string, KisiKisiItem[]>();
  itemsB.forEach((k) => {
    const name = k.materi_pokok ? k.materi_pokok.trim() : 'Materi Tanpa Judul';
    const arr = groupB.get(name) || [];
    arr.push(k);
    groupB.set(name, arr);
  });

  // Collect all unique materials
  const allNames = Array.from(new Set([...groupA.keys(), ...groupB.keys()]));

  const result: MaterialComparisonItem[] = allNames.map((name) => {
    const listA = groupA.get(name) || [];
    const listB = groupB.get(name) || [];

    const countA = listA.length;
    const countB = listB.length;
    const percentA = itemsA.length > 0 ? Math.round((countA / itemsA.length) * 100) : 0;
    const percentB = itemsB.length > 0 ? Math.round((countB / itemsB.length) * 100) : 0;

    const noA = listA.map((i) => i.nomor_soal);
    const noB = listB.map((i) => i.nomor_soal);

    const levelsA = Array.from(new Set(listA.map((i) => i.level_kognitif)));
    const levelsB = Array.from(new Set(listB.map((i) => i.level_kognitif)));

    let status: MaterialComparisonItem['status'] = 'Tetap Seimbang';
    let insight = '';

    if (countA === 0 && countB > 0) {
      status = 'Baru di Set B';
      insight = 'Materi ini merupakan topik baru yang diintroduksi pada kurikulum berjalan untuk memperluas cakupan capaian pembelajaran.';
    } else if (countA > 0 && countB === 0) {
      status = 'Ditiadakan di Set B';
      insight = 'Materi diintegrasikan ke dalam topik lain atau dipadatkan pada tahun ajaran terkini.';
    } else if (countB > countA) {
      status = 'Porsi Meningkat';
      insight = `Porsi butir soal bertambah (+${countB - countA} butir) dengan pengayaan level kognitif ke tingkat ${levelsB.join(', ')}.`;
    } else if (countB < countA) {
      status = 'Porsi Menurun';
      insight = `Porsi butir soal disederhanakan (-${countA - countB} butir) untuk memberikan bobot lebih pada materi esensial baru.`;
    } else {
      status = 'Tetap Seimbang';
      insight = 'Alokasi butir soal stabil, mencerminkan materi pokok esensial yang konsisten diuji.';
    }

    return {
      materi: name,
      countA,
      countB,
      percentA,
      percentB,
      itemsA: noA,
      itemsB: noB,
      levelsA,
      levelsB,
      status,
      insight,
    };
  });

  return result;
}

function getBloomEvolutionInsight(
  key: string,
  diff: number,
  countA: number,
  countB: number
): string {
  if (diff > 0) {
    if (key === 'C4' || key === 'C5' || key === 'C6') {
      return `Peningkatan positif (+${diff} butir) pada level ${key}. Meningkatkan daya evaluasi kritis dan sintesis masalah siswa.`;
    }
    return `Bertambah +${diff} butir soal untuk memperkuat pemahaman konsep dasar.`;
  } else if (diff < 0) {
    if (key === 'C1' || key === 'C2') {
      return `Penurunan (${diff} butir) soal hafalan/ingatan murni. Dialihkan menuju pemecahan masalah aplikatif (C3-C6).`;
    }
    return `Koreksi (${diff} butir) untuk menjaga keseimbangan indeks kesukaran.`;
  }
  return `Stabil (${countA} butir). Bobot level ${key} dipertahankan konsisten antartahun.`;
}

// -------------------------------------------------------------
// Small UI Sub-components
// -------------------------------------------------------------

const DeltaBadge: React.FC<{
  delta: number;
  unit?: string;
  positiveIsGood?: boolean;
}> = ({ delta, unit = '', positiveIsGood = true }) => {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
        <Equal className="h-3 w-3" /> 0{unit}
      </span>
    );
  }

  const isPositive = delta > 0;
  const isGood = positiveIsGood ? isPositive : !isPositive;

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold border ${
        isGood
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-rose-50 text-rose-700 border-rose-200'
      }`}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isPositive ? `+${delta}` : delta}
      {unit}
    </span>
  );
};

const MaterialStatusBadge: React.FC<{
  status: MaterialComparisonItem['status'];
}> = ({ status }) => {
  switch (status) {
    case 'Baru di Set B':
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200">
          + Topik Baru
        </span>
      );
    case 'Porsi Meningkat':
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          ↗ Porsi Meningkat
        </span>
      );
    case 'Porsi Menurun':
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          ↘ Porsi Menurun
        </span>
      );
    case 'Ditiadakan di Set B':
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          - Ditiadakan
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          = Stabil
        </span>
      );
  }
};

const ShiftBadge: React.FC<{
  diff: number;
  lvlA: string;
  lvlB: string;
}> = ({ diff, lvlA, lvlB }) => {
  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <TrendingUp className="h-3 w-3" /> +{diff} Lvl ({lvlA} → {lvlB})
      </span>
    );
  } else if (diff < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
        <TrendingDown className="h-3 w-3" /> {diff} Lvl ({lvlA} → {lvlB})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      <Equal className="h-3 w-3" /> Tetap ({lvlA})
    </span>
  );
};

// -------------------------------------------------------------
// Textual Report Generator for Clipboard Copy
// -------------------------------------------------------------
function generateTextualReport(
  setA: AssessmentOption,
  setB: AssessmentOption,
  statsA: SetMetrics,
  statsB: SetMetrics,
  materials: MaterialComparisonItem[]
): string {
  const deltaHots = statsB.hotsPercent - statsA.hotsPercent;
  const deltaCognitive = (statsB.cognitiveIndex - statsA.cognitiveIndex).toFixed(2);

  return `LAPORAN PERBANDINGAN EVOLUSI ASESMEN BANK SOAL
=====================================================
Set Asesmen A : ${setA.judul} (${setA.tahunAjaran} - ${setA.semester})
Set Asesmen B : ${setB.judul} (${setB.tahunAjaran} - ${setB.semester})
Mata Pelajaran: ${setA.mataPelajaran} | Jenjang: ${setA.levelKelas}

1. RINGKASAN EVOLUSI TINGKAT KESULITAN & KOGNITIF (BLOOM):
- Total Butir Soal : Set A: ${statsA.total} butir | Set B: ${statsB.total} butir
- Proporsi HOTS    : Set A: ${statsA.hotsPercent}% (${statsA.hotsCount} butir) -> Set B: ${statsB.hotsPercent}% (${statsB.hotsCount} butir) [Delta: ${deltaHots >= 0 ? '+' : ''}${deltaHots}%]
- Indeks Kognitif  : Set A: ${statsA.cognitiveIndex.toFixed(2)} -> Set B: ${statsB.cognitiveIndex.toFixed(2)} [Delta: ${parseFloat(deltaCognitive) >= 0 ? '+' : ''}${deltaCognitive} poin]
- Proporsi Kesukaran (Mudah : Sedang : Sukar):
  * Set A: ${statsA.difficultyPercent.Mudah}% : ${statsA.difficultyPercent.Sedang}% : ${statsA.difficultyPercent.Sukar}%
  * Set B: ${statsB.difficultyPercent.Mudah}% : ${statsB.difficultyPercent.Sedang}% : ${statsB.difficultyPercent.Sukar}%

2. SEBARAN LINGKUP MATERI POKOK:
${materials
  .map(
    (m) =>
      `- ${m.materi}:
   Set A: ${m.countA} butir (${m.percentA}%) [Level: ${m.levelsA.join(',') || '—'}]
   Set B: ${m.countB} butir (${m.percentB}%) [Level: ${m.levelsB.join(',') || '—'}]
   Status: ${m.status}`
  )
  .join('\n')}

3. KESIMPULAN & REKOMENDASI:
- Asesmen Set B menunjukkan evolusi pedagogis positif dengan pengayaan stimulus kontekstual dan peningkatan daya nalar HOTS.
- Rekomendasi: Pertahankan keseimbangan proporsi kognitif dan integrasi butir soal pemecahan masalah kontekstual.
Dihasilkan oleh: Sistem Generator Asesmen Kurikulum Merdeka AI Studio.`;
}
