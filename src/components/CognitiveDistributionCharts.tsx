import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { KisiKisiItem } from '../types/assessment';
import {
  Brain,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TableProperties,
  Copy,
  Check,
  TrendingUp,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface CognitiveDistributionChartsProps {
  kisiKisiList: KisiKisiItem[];
}

interface CognitiveLevelDetail {
  level: 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';
  namaIndo: string;
  namaInggris: string;
  definisi: string;
  category: 'LOTS' | 'MOTS' | 'HOTS';
  kko: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

const BLOOM_LEVELS: CognitiveLevelDetail[] = [
  {
    level: 'C1',
    namaIndo: 'Mengingat',
    namaInggris: 'Remembering',
    definisi: 'Mengingat atau mengenali kembali fakta, istilah, dan konsep dasar dari ingatan.',
    category: 'LOTS',
    kko: 'Mengidentifikasi, menyebutkan, menghafal, mendaftar, mencocokkan',
    color: '#0284c7', // Sky-600
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800',
    badgeBorder: 'border-sky-300',
  },
  {
    level: 'C2',
    namaIndo: 'Memahami',
    namaInggris: 'Understanding',
    definisi: 'Membangun pemahaman dan makna dari pesan instruksional lisan, tulisan, maupun grafis.',
    category: 'LOTS',
    kko: 'Menjelaskan, mengklasifikasikan, merangkum, menguraikan, membedakan',
    color: '#2563eb', // Blue-600
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-300',
  },
  {
    level: 'C3',
    namaIndo: 'Menerapkan',
    namaInggris: 'Applying',
    definisi: 'Menggunakan prosedur, rumus, atau konsep untuk menyelesaikan masalah pada situasi baru.',
    category: 'MOTS',
    kko: 'Menghitung, menerapkan, mendemonstrasikan, mengoperasikan, mempraktikkan',
    color: '#059669', // Emerald-600
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
  },
  {
    level: 'C4',
    namaIndo: 'Menganalisis',
    namaInggris: 'Analyzing',
    definisi: 'Memecah materi menjadi bagian-bagian pokok serta menentukan keterkaitan antar bagian.',
    category: 'HOTS',
    kko: 'Menganalisis, menghubungkan, membandingkan, menelaah diagram/data, meneliti',
    color: '#d97706', // Amber-600
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
  },
  {
    level: 'C5',
    namaIndo: 'Mengevaluasi',
    namaInggris: 'Evaluating',
    definisi: 'Membuat pertimbangan, penilaian, atau keputusan berdasarkan kriteria dan standar yang logis.',
    category: 'HOTS',
    kko: 'Menilai, mengkritisi, memutuskan, memvalidasi, membuktikan, menyimpulkan',
    color: '#ea580c', // Orange-600
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    badgeBorder: 'border-orange-300',
  },
  {
    level: 'C6',
    namaIndo: 'Menciptakan',
    namaInggris: 'Creating',
    definisi: 'Memadukan bagian-bagian menjadi satu kesatuan baru yang utuh, orisinil, atau solutif.',
    category: 'HOTS',
    kko: 'Merancang, mengonstruksi, mengembangkan gagasan, mengkreasikan, menyusun solusi',
    color: '#e11d48', // Rose-600
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-300',
  },
];

export const CognitiveDistributionCharts: React.FC<CognitiveDistributionChartsProps> = ({
  kisiKisiList,
}) => {
  // Chart view modes for difficulty and cognitive dimension charts
  const [difficultyChartType, setDifficultyChartType] = useState<'donut' | 'bar'>('donut');
  const [cognitiveChartType, setCognitiveChartType] = useState<'bar' | 'donut'>('bar');
  const [copiedSummary, setCopiedSummary] = useState(false);

  const totalItems = kisiKisiList.length;
  const hotsCount = kisiKisiList.filter((k) => k.kategori_hots).length;
  const lotsCount = totalItems - hotsCount;
  const hotsPercent = totalItems > 0 ? Math.round((hotsCount / totalItems) * 100) : 0;
  const lotsPercent = totalItems > 0 ? 100 - hotsPercent : 0;

  // Level Kognitif Counts & Question Number Mapping (C1 - C6)
  const counts: Record<string, number> = {
    C1: 0,
    C2: 0,
    C3: 0,
    C4: 0,
    C5: 0,
    C6: 0,
  };

  const questionNumbersByLevel: Record<string, number[]> = {
    C1: [],
    C2: [],
    C3: [],
    C4: [],
    C5: [],
    C6: [],
  };

  kisiKisiList.forEach((item) => {
    const rawLvl = (item.level_kognitif || '').toUpperCase().trim();
    let norm = 'C1';
    if (rawLvl.startsWith('C1')) norm = 'C1';
    else if (rawLvl.startsWith('C2')) norm = 'C2';
    else if (rawLvl.startsWith('C3')) norm = 'C3';
    else if (rawLvl.startsWith('C4')) norm = 'C4';
    else if (rawLvl.startsWith('C5')) norm = 'C5';
    else if (rawLvl.startsWith('C6')) norm = 'C6';

    if (counts[norm] !== undefined) {
      counts[norm]++;
      questionNumbersByLevel[norm].push(item.nomor_soal);
    }
  });

  // Question numbers by tier
  const lotsQuestions = [...questionNumbersByLevel.C1, ...questionNumbersByLevel.C2].sort((a, b) => a - b);
  const motsQuestions = [...questionNumbersByLevel.C3].sort((a, b) => a - b);
  const hotsQuestions = [
    ...questionNumbersByLevel.C4,
    ...questionNumbersByLevel.C5,
    ...questionNumbersByLevel.C6,
  ].sort((a, b) => a - b);

  // Grouped Subtotals for Recap
  const lotsSubtotalCount = counts.C1 + counts.C2;
  const lotsSubtotalPercent = totalItems > 0 ? Math.round((lotsSubtotalCount / totalItems) * 100) : 0;

  const motsSubtotalCount = counts.C3;
  const motsSubtotalPercent = totalItems > 0 ? Math.round((motsSubtotalCount / totalItems) * 100) : 0;

  const hotsSubtotalCount = counts.C4 + counts.C5 + counts.C6;
  const hotsSubtotalPercent = totalItems > 0 ? Math.round((hotsSubtotalCount / totalItems) * 100) : 0;

  // 1. Data for Difficulty / Cognitive Hierarchy (LOTS, MOTS, HOTS)
  const difficultyDistributionData = [
    {
      category: 'LOTS',
      label: 'LOTS (C1-C2)',
      fullName: 'Tingkat Rendah / LOTS (C1-C2)',
      desc: 'Mengingat & Memahami (Fakta Dasar)',
      count: lotsSubtotalCount,
      percentage: lotsSubtotalPercent,
      color: '#059669', // Emerald
      questions: lotsQuestions,
    },
    {
      category: 'MOTS',
      label: 'MOTS (C3)',
      fullName: 'Tingkat Sedang / MOTS (C3)',
      desc: 'Menerapkan / Prosedural Praktis',
      count: motsSubtotalCount,
      percentage: motsSubtotalPercent,
      color: '#2563eb', // Blue
      questions: motsQuestions,
    },
    {
      category: 'HOTS',
      label: 'HOTS (C4-C6)',
      fullName: 'Tingkat Tinggi / HOTS (C4-C6)',
      desc: 'Menganalisis, Mengevaluasi, & Mencipta',
      count: hotsSubtotalCount,
      percentage: hotsSubtotalPercent,
      color: '#f59e0b', // Amber
      questions: hotsQuestions,
    },
  ];

  const activeDifficultyDonut = difficultyDistributionData.filter((d) => d.count > 0);

  // 2. Data for 6 Cognitive Dimensions (C1 - C6)
  const cognitiveData = BLOOM_LEVELS.map((bloom) => {
    const count = counts[bloom.level];
    const percentage = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
    const questions = questionNumbersByLevel[bloom.level];
    return {
      ...bloom,
      count,
      percentage,
      questions,
      label: `${bloom.level} - ${bloom.namaIndo}`,
      shortLabel: `${bloom.level} ${bloom.namaIndo}`,
    };
  });

  const activeCognitiveDonut = cognitiveData.filter((d) => d.count > 0);

  // Quality Evaluation Criteria
  const getQualityAssessment = () => {
    if (totalItems === 0) return { status: 'none', message: 'Belum ada butir soal.' };
    if (hotsPercent >= 30 && hotsPercent <= 60) {
      return {
        status: 'optimal',
        title: 'Komposisi Soal Sangat Baik (Optimal)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: CheckCircle2,
        message: `Proporsi soal HOTS (${hotsPercent}%) memenuhi standar ideal asesmen kurikulum (30% - 50%) untuk menguji daya nalar kritis peserta didik.`,
      };
    } else if (hotsPercent < 30) {
      return {
        status: 'lots_dominant',
        title: 'Didominasi Soal LOTS/MOTS',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: AlertTriangle,
        message: `Proporsi HOTS (${hotsPercent}%) tergolong rendah. Disarankan menambah butir soal analisis (C4), evaluasi (C5), atau kreasi (C6) untuk asesmen sumatif.`,
      };
    } else {
      return {
        status: 'hots_high',
        title: 'Proporsi HOTS Sangat Tinggi',
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
        icon: Sparkles,
        message: `Proporsi HOTS (${hotsPercent}%) tinggi. Pastikan stimulus dan alokasi waktu pengerjaan cukup representatif untuk tingkat kelas target.`,
      };
    }
  };

  const quality = getQualityAssessment();
  const QualityIcon = quality.icon || CheckCircle2;

  // Master layout presets
  const handleSetMasterView = (mode: 'both_bars' | 'both_donuts' | 'combo') => {
    if (mode === 'both_bars') {
      setDifficultyChartType('bar');
      setCognitiveChartType('bar');
    } else if (mode === 'both_donuts') {
      setDifficultyChartType('donut');
      setCognitiveChartType('donut');
    } else {
      setDifficultyChartType('donut');
      setCognitiveChartType('bar');
    }
  };

  // Copy Recap Summary as Formatted Text
  const handleCopySummary = () => {
    const lines = [
      'REKAPITULASI SEBARAN TINGKAT KESULITAN & DIMENSI KOGNITIF (BSKAP)',
      '====================================================================',
      `Total Butir Soal : ${totalItems} Butir`,
      `1. Tingkat Rendah (LOTS C1-C2) : ${lotsSubtotalCount} Butir (${lotsSubtotalPercent}%)`,
      `2. Tingkat Sedang (MOTS C3)    : ${motsSubtotalCount} Butir (${motsSubtotalPercent}%)`,
      `3. Tingkat Tinggi (HOTS C4-C6) : ${hotsSubtotalCount} Butir (${hotsSubtotalPercent}%)`,
      '--------------------------------------------------------------------',
      'Rincian Berdasarkan 6 Dimensi Kognitif Taksonomi Bloom:',
      ...cognitiveData.map(
        (c) =>
          `- ${c.level} (${c.namaIndo} - ${c.category}): ${c.count} butir (${c.percentage}%) | No. Soal: ${
            c.questions.length > 0 ? c.questions.join(', ') : 'Tidak ada'
          }`
      ),
      '====================================================================',
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Custom Tooltip for Difficulty (LOTS vs MOTS vs HOTS)
  const CustomDifficultyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 min-w-[210px] z-50">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
            <span className="font-bold flex items-center gap-1.5" style={{ color: data.color }}>
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }} />
              {data.fullName || data.label}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/20 text-white font-mono font-bold">
              {data.percentage}%
            </span>
          </div>
          <p className="text-slate-200">
            Jumlah: <strong className="text-white text-sm">{data.count} butir soal</strong>
          </p>
          <p className="text-[11px] text-slate-300 mt-1 italic leading-snug">{data.desc}</p>
          {data.questions && data.questions.length > 0 && (
            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
              Nomor Soal: <span className="text-emerald-300 font-semibold">{data.questions.join(', ')}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for C1-C6 Cognitive Levels
  const CustomCognitiveTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 min-w-[240px] z-50">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
            <div className="flex items-center gap-1.5 font-bold" style={{ color: data.color }}>
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }} />
              <span>{data.label}</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                data.category === 'HOTS'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                  : data.category === 'MOTS'
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                  : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
              }`}
            >
              {data.category}
            </span>
          </div>
          <p className="text-slate-200">
            Jumlah: <strong className="text-white text-sm">{data.count} butir soal</strong> ({data.percentage}%)
          </p>
          <p className="text-[11px] text-slate-300 mt-1 italic leading-snug">{data.definisi}</p>
          <p className="text-[10px] text-slate-400 mt-1.5">
            KKO: <span className="text-slate-300">{data.kko}</span>
          </p>
          {data.questions && data.questions.length > 0 && (
            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
              Nomor Soal: <span className="text-amber-300 font-semibold">{data.questions.join(', ')}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-8 p-5 sm:p-6 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 shadow-2xs print:hidden">
      {/* Top Header & Chart Layout Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
              <BarChart3 className="h-4 w-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Visualisasi Data Recharts: Sebaran Tingkat Kesulitan & Dimensi Kognitif
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Grafik interaktif proporsi HOTS vs LOTS serta distribusi 6 level Taksonomi Bloom (C1-C6) sesuai standar kurikulum.
          </p>
        </div>

        {/* Global Master Preset Switcher */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => handleSetMasterView('both_bars')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              difficultyChartType === 'bar' && cognitiveChartType === 'bar'
                ? 'bg-white text-emerald-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Tampilkan kedua grafik dalam bentuk Diagram Batang (Bar Chart)"
          >
            <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Grafik Batang</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetMasterView('both_donuts')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              difficultyChartType === 'donut' && cognitiveChartType === 'donut'
                ? 'bg-white text-emerald-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Tampilkan kedua grafik dalam bentuk Diagram Lingkaran (Pie Chart)"
          >
            <PieIcon className="h-3.5 w-3.5 text-emerald-600" />
            <span>Pie Chart</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetMasterView('combo')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              difficultyChartType === 'donut' && cognitiveChartType === 'bar'
                ? 'bg-white text-emerald-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Kombinasi: Pie Chart untuk Tingkat Kesulitan & Bar Chart untuk Dimensi Kognitif"
          >
            <Layers className="h-3.5 w-3.5 text-emerald-600" />
            <span>Kombinasi</span>
          </button>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* =========================================================================
            CHART 1: Sebaran Tingkat Kesulitan Soal (LOTS vs MOTS vs HOTS)
           ========================================================================= */}
        <div className="lg:col-span-5 bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            {/* Header Card 1 with Toggle */}
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-amber-500" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Tingkat Kesulitan (LOTS vs HOTS)
                  </h4>
                  <p className="text-[10px] text-slate-400">Hierarki Kemampuan Berpikir Siswa</p>
                </div>
              </div>

              {/* Local Toggle for Chart 1: Donut vs Bar */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDifficultyChartType('donut')}
                  className={`p-1 rounded text-xs transition ${
                    difficultyChartType === 'donut'
                      ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Diagram Lingkaran (Pie Chart)"
                  aria-label="Tampilkan Diagram Lingkaran"
                >
                  <PieIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDifficultyChartType('bar')}
                  className={`p-1 rounded text-xs transition ${
                    difficultyChartType === 'bar'
                      ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grafik Batang (Bar Chart)"
                  aria-label="Tampilkan Grafik Batang"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 mb-3 text-[11px]">
              <span className="font-semibold text-slate-600">Rasio HOTS Asesmen:</span>
              <span className="font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                {hotsPercent}% HOTS ({hotsCount} Butir)
              </span>
            </div>

            {/* Chart Area */}
            <div className="relative w-full h-60 flex items-center justify-center">
              {totalItems > 0 ? (
                difficultyChartType === 'donut' ? (
                  // DONUT / PIE CHART FOR DIFFICULTY
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomDifficultyTooltip />} />
                      <Pie
                        data={activeDifficultyDonut}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={82}
                        paddingAngle={4}
                        dataKey="count"
                        nameKey="label"
                        animationDuration={800}
                      >
                        {activeDifficultyDonut.map((entry, index) => (
                          <Cell
                            key={`diff-cell-${index}`}
                            fill={entry.color}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="bottom"
                        height={40}
                        formatter={(value, entry: any) => (
                          <span className="text-[11px] font-semibold text-slate-700">
                            {value}: {entry.payload.count} btr ({entry.payload.percentage}%)
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  // BAR CHART FOR DIFFICULTY
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={difficultyDistributionData}
                      margin={{ top: 20, right: 15, left: -15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 11, fontWeight: 'bold', fill: '#334155' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                      />
                      <Tooltip content={<CustomDifficultyTooltip />} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
                        {difficultyDistributionData.map((entry, index) => (
                          <Cell key={`diff-bar-${index}`} fill={entry.color} />
                        ))}
                        <LabelList
                          dataKey="count"
                          position="top"
                          formatter={(val: any) => (Number(val) > 0 ? `${val} btr` : '0')}
                          style={{ fontSize: '11px', fontWeight: 'bold', fill: '#1e293b' }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )
              ) : (
                <p className="text-xs text-slate-400">Tidak ada butir soal untuk divisualisasikan.</p>
              )}

              {/* Center Stat on Donut Mode */}
              {totalItems > 0 && difficultyChartType === 'donut' && (
                <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 tracking-tight block">
                    {hotsPercent}%
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 block">
                    HOTS
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Legend Pills below Chart 1 */}
          <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-slate-100 text-center">
            <div className="bg-emerald-50/70 border border-emerald-200/80 p-1.5 rounded-lg">
              <span className="text-[10px] font-bold text-emerald-800 block">LOTS</span>
              <span className="text-xs font-extrabold text-emerald-900">{lotsSubtotalCount} ({lotsSubtotalPercent}%)</span>
            </div>
            <div className="bg-blue-50/70 border border-blue-200/80 p-1.5 rounded-lg">
              <span className="text-[10px] font-bold text-blue-800 block">MOTS</span>
              <span className="text-xs font-extrabold text-blue-900">{motsSubtotalCount} ({motsSubtotalPercent}%)</span>
            </div>
            <div className="bg-amber-50/70 border border-amber-200/80 p-1.5 rounded-lg">
              <span className="text-[10px] font-bold text-amber-800 block">HOTS</span>
              <span className="text-xs font-extrabold text-amber-900">{hotsSubtotalCount} ({hotsSubtotalPercent}%)</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CHART 2: Sebaran 6 Dimensi Kognitif Bloom (C1 - C6)
           ========================================================================= */}
        <div className="lg:col-span-7 bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            {/* Header Card 2 with Toggle */}
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Sebaran Dimensi Kognitif (C1 - C6)
                  </h4>
                  <p className="text-[10px] text-slate-400">Taksonomi Bloom Revisi Kemendikbudristek</p>
                </div>
              </div>

              {/* Local Toggle for Chart 2: Bar vs Donut */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCognitiveChartType('bar')}
                  className={`p-1 rounded text-xs transition ${
                    cognitiveChartType === 'bar'
                      ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grafik Batang (Bar Chart)"
                  aria-label="Tampilkan Grafik Batang"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCognitiveChartType('donut')}
                  className={`p-1 rounded text-xs transition ${
                    cognitiveChartType === 'donut'
                      ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Diagram Lingkaran (Pie Chart)"
                  aria-label="Tampilkan Diagram Lingkaran"
                >
                  <PieIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Sub-header info badge */}
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 mb-3 text-[11px]">
              <span className="font-semibold text-slate-600">Total Butir Soal Terpetakan:</span>
              <span className="font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                {totalItems} Butir Soal
              </span>
            </div>

            {/* Chart Area */}
            <div className="w-full h-60">
              {cognitiveChartType === 'bar' ? (
                // BAR CHART FOR COGNITIVE LEVELS
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cognitiveData}
                    margin={{ top: 20, right: 15, left: -15, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="level"
                      tick={{ fontSize: 11, fontWeight: 'bold', fill: '#334155' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <Tooltip content={<CustomCognitiveTooltip />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
                      {cognitiveData.map((entry, index) => (
                        <Cell key={`cog-bar-${index}`} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="count"
                        position="top"
                        formatter={(val: any) => (Number(val) > 0 ? `${val} btr` : '0')}
                        style={{ fontSize: '11px', fontWeight: 'bold', fill: '#1e293b' }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                // PIE / DONUT CHART FOR COGNITIVE LEVELS
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomCognitiveTooltip />} />
                    <Pie
                      data={activeCognitiveDonut}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="shortLabel"
                      animationDuration={800}
                    >
                      {activeCognitiveDonut.map((entry, index) => (
                        <Cell
                          key={`cog-pie-${index}`}
                          fill={entry.color}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      height={40}
                      formatter={(value, entry: any) => (
                        <span className="text-[10px] font-semibold text-slate-700">
                          {value.split(' ')[0]}: {entry.payload.count}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Quick Bloom level badge footer */}
          <div className="grid grid-cols-6 gap-1 pt-3 border-t border-slate-100 text-center">
            {cognitiveData.map((lvl) => (
              <div
                key={lvl.level}
                className="bg-slate-50 border border-slate-200/80 p-1 rounded-md"
                title={`${lvl.namaIndo} (${lvl.category}): ${lvl.count} butir`}
              >
                <span
                  className="text-[10px] font-black block"
                  style={{ color: lvl.color }}
                >
                  {lvl.level}
                </span>
                <span className="text-[11px] font-bold text-slate-800">
                  {lvl.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quality Evaluation Summary Card */}
      {totalItems > 0 && quality.title && (
        <div className={`mt-5 p-3.5 rounded-xl border flex items-start gap-3 transition ${quality.badgeClass}`}>
          <QualityIcon className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-slate-900 block">{quality.title}</span>
            <p className="mt-0.5 leading-relaxed text-slate-700">{quality.message}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono shrink-0">
            <span className="px-2 py-0.5 rounded bg-white/70 border border-current font-bold text-emerald-800">
              LOTS: {lotsSubtotalCount}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/70 border border-current font-bold text-blue-800">
              MOTS: {motsSubtotalCount}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/70 border border-current font-bold text-amber-800">
              HOTS: {hotsSubtotalCount}
            </span>
          </div>
        </div>
      )}

      {/* Rekapitulasi Tabel Dimensi Kognitif (C1 - C6) */}
      <div className="mt-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Table Top Header Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
              <TableProperties className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                Tabel Rincian Dimensi Kognitif Soal (C1 - C6)
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Taksonomi Bloom Revisi
                </span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Pemetaan jumlah soal, persentase, KKO representatif, dan nomor butir soal pada naskah tes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-2xs"
              title="Salin rekapitulasi teks untuk laporan administrasi atau modul ajar"
            >
              {copiedSummary ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Salin Rekap</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* The Rekapitulasi Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-2.5 px-3 text-center w-16">Level</th>
                <th className="py-2.5 px-3.5 w-44">Dimensi Proses Kognitif</th>
                <th className="py-2.5 px-3 text-center w-24">Klasifikasi</th>
                <th className="py-2.5 px-3.5">Kata Kerja Operasional (KKO) Representatif</th>
                <th className="py-2.5 px-3 text-center w-24">Jumlah Soal</th>
                <th className="py-2.5 px-3.5 w-36">Proporsi (%)</th>
                <th className="py-2.5 px-3.5 w-44">Nomor Butir Soal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {cognitiveData.map((row) => {
                const hasQuestions = row.count > 0;
                return (
                  <tr
                    key={row.level}
                    className={`transition hover:bg-slate-50/80 ${
                      hasQuestions ? 'bg-white' : 'bg-slate-50/30 text-slate-400'
                    }`}
                  >
                    {/* Level Badge */}
                    <td className="py-2.5 px-3 text-center align-middle">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-extrabold border ${row.badgeBg} ${row.badgeText} ${row.badgeBorder}`}
                      >
                        {row.level}
                      </span>
                    </td>

                    {/* Dimensi Kognitif */}
                    <td className="py-2.5 px-3.5 align-middle">
                      <div className="font-bold text-slate-900 text-xs">
                        {row.namaIndo}
                      </div>
                      <div className="text-[10px] text-slate-500 italic">
                        {row.namaInggris}
                      </div>
                    </td>

                    {/* Kategori Klasifikasi */}
                    <td className="py-2.5 px-3 text-center align-middle">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          row.category === 'HOTS'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : row.category === 'MOTS'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {row.category}
                      </span>
                    </td>

                    {/* KKO */}
                    <td className="py-2.5 px-3.5 text-slate-600 align-middle text-[11px]">
                      {row.kko}
                    </td>

                    {/* Jumlah Soal */}
                    <td className="py-2.5 px-3 text-center align-middle">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {row.count}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1">butir</span>
                    </td>

                    {/* Proporsi Bar */}
                    <td className="py-2.5 px-3.5 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${row.percentage}%`,
                              backgroundColor: row.color,
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-700 w-9 text-right">
                          {row.percentage}%
                        </span>
                      </div>
                    </td>

                    {/* Nomor Butir Soal */}
                    <td className="py-2.5 px-3.5 align-middle">
                      {row.questions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {row.questions.map((no) => (
                            <span
                              key={no}
                              className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px] font-bold border border-slate-300"
                            >
                              No.{no}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Total Footer Row */}
            <tfoot>
              <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-slate-900">
                <td colSpan={4} className="py-2.5 px-4 text-right uppercase text-[11px] tracking-wider">
                  Total Seluruh Butir Soal:
                </td>
                <td className="py-2.5 px-3 text-center text-sm font-black text-emerald-800">
                  {totalItems} butir
                </td>
                <td className="py-2.5 px-3.5 font-mono text-[11px]">
                  100%
                </td>
                <td className="py-2.5 px-3.5 text-xs text-slate-600">
                  {hotsSubtotalPercent}% HOTS &bull; {lotsSubtotalPercent + motsSubtotalPercent}% LOTS/MOTS
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
