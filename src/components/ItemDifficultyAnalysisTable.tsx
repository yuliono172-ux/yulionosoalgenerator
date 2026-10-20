import React, { useState, useMemo } from 'react';
import { EvaluationKit, KisiKisiItem, LevelKognitif } from '../types/assessment';
import {
  Gauge,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Filter,
  BarChart2,
  Scale,
  Brain,
  Info,
} from 'lucide-react';

export type TingkatKesukaran = 'Mudah' | 'Sedang' | 'Sukar';

export interface AnalisisButirItem {
  nomorSoal: number;
  bentukSoal: string;
  materiPokok: string;
  indikatorSoal: string;
  levelKognitif: string;
  tingkatKesukaran: TingkatKesukaran;
  kategoriBerpikir: 'LOTS' | 'MOTS' | 'HOTS';
  kunciJawaban: string;
  estimasiIndeksP: string;
  justifikasiPedagogis: string;
}

interface ItemDifficultyAnalysisTableProps {
  kit: EvaluationKit;
}

export const ItemDifficultyAnalysisTable: React.FC<ItemDifficultyAnalysisTableProps> = ({
  kit,
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  // Map each question to its difficulty classification based on Bloom Taxonomy
  const analyzedItems: AnalisisButirItem[] = useMemo(() => {
    return kit.kisi_kisi.map((kisi) => {
      const rawLvl = (kisi.level_kognitif || '').toUpperCase().trim();
      let lvl = 'C1';
      if (rawLvl.startsWith('C1')) lvl = 'C1';
      else if (rawLvl.startsWith('C2')) lvl = 'C2';
      else if (rawLvl.startsWith('C3')) lvl = 'C3';
      else if (rawLvl.startsWith('C4')) lvl = 'C4';
      else if (rawLvl.startsWith('C5')) lvl = 'C5';
      else if (rawLvl.startsWith('C6')) lvl = 'C6';

      // Find answer key if available
      const kunciItem = kit.kunci_dan_lembar_jawab.find(
        (k) => k.nomor_soal === kisi.nomor_soal
      );
      const kunciJawaban = kunciItem?.kunci_jawaban || '—';

      let tingkatKesukaran: TingkatKesukaran = 'Sedang';
      let kategoriBerpikir: 'LOTS' | 'MOTS' | 'HOTS' = 'MOTS';
      let estimasiIndeksP = '0.50';
      let justifikasiPedagogis = '';

      if (lvl === 'C1' || lvl === 'C2') {
        tingkatKesukaran = 'Mudah';
        kategoriBerpikir = 'LOTS';
        estimasiIndeksP = lvl === 'C1' ? '0.75 - 0.90' : '0.65 - 0.80';
        justifikasiPedagogis =
          lvl === 'C1'
            ? 'C1 Mengingat: Mengukur daya ingat langsung terhadap fakta, definisi, atau istilah pokok.'
            : 'C2 Memahami: Mengukur pemahaman makna konsep, klasifikasi fakta, atau penafsiran stimulus sederhana.';
      } else if (lvl === 'C3') {
        tingkatKesukaran = 'Sedang';
        kategoriBerpikir = 'MOTS';
        estimasiIndeksP = '0.40 - 0.65';
        justifikasiPedagogis =
          'C3 Menerapkan: Menguji kemampuan menerapkan konsep, rumus, atau prosedur pada pemecahan kasus terarah.';
      } else {
        tingkatKesukaran = 'Sukar';
        kategoriBerpikir = 'HOTS';
        estimasiIndeksP = lvl === 'C4' ? '0.25 - 0.40' : '0.15 - 0.30';
        justifikasiPedagogis =
          lvl === 'C4'
            ? 'C4 Menganalisis: Menguji daya urai analitis, perbandingan antar-unsur data/grafik, dan inferensi logis.'
            : lvl === 'C5'
            ? 'C5 Mengevaluasi: Menuntut pertimbangan kritis, validasi kebenaran, dan penarikan kesimpulan berdasar kriteria.'
            : 'C6 Menciptakan: Menuntut perancangan gagasan baru, sintesis solusi inovatif, atau kreasi model pemecahan.';
      }

      return {
        nomorSoal: kisi.nomor_soal,
        bentukSoal: kisi.bentuk_soal,
        materiPokok: kisi.materi_pokok,
        indikatorSoal: kisi.indikator_soal,
        levelKognitif: lvl,
        tingkatKesukaran,
        kategoriBerpikir,
        kunciJawaban,
        estimasiIndeksP,
        justifikasiPedagogis,
      };
    });
  }, [kit.kisi_kisi, kit.kunci_dan_lembar_jawab]);

  // Aggregate statistics
  const total = analyzedItems.length;
  const mudahItems = analyzedItems.filter((i) => i.tingkatKesukaran === 'Mudah');
  const sedangItems = analyzedItems.filter((i) => i.tingkatKesukaran === 'Sedang');
  const sukarItems = analyzedItems.filter((i) => i.tingkatKesukaran === 'Sukar');

  const countMudah = mudahItems.length;
  const countSedang = sedangItems.length;
  const countSukar = sukarItems.length;

  const pctMudah = total > 0 ? Math.round((countMudah / total) * 100) : 0;
  const pctSedang = total > 0 ? Math.round((countSedang / total) * 100) : 0;
  const pctSukar = total > 0 ? 100 - pctMudah - pctSedang : 0;

  // Filtered list
  const filteredList = useMemo(() => {
    if (filterDifficulty === 'Mudah') {
      return analyzedItems.filter((i) => i.tingkatKesukaran === 'Mudah');
    }
    if (filterDifficulty === 'Sedang') {
      return analyzedItems.filter((i) => i.tingkatKesukaran === 'Sedang');
    }
    if (filterDifficulty === 'Sukar') {
      return analyzedItems.filter((i) => i.tingkatKesukaran === 'Sukar');
    }
    if (filterDifficulty === 'HOTS') {
      return analyzedItems.filter((i) => i.kategoriBerpikir === 'HOTS');
    }
    return analyzedItems;
  }, [analyzedItems, filterDifficulty]);

  // Copy Analysis as Formatted Text
  const handleCopyAnalysis = () => {
    const lines = [
      'TABEL ANALISIS BUTIR SOAL & ESTIMASI TINGKAT KESUKARAN (TAKSONOMI BLOOM)',
      '========================================================================',
      `Mata Pelajaran: ${kit.paramsSnapshot?.mataPelajaran || '-'}`,
      `Kelas/Fase    : ${kit.paramsSnapshot?.levelKelas || '-'}`,
      `Total Soal    : ${total} Butir`,
      '------------------------------------------------------------------------',
      'REKAPITULASI PROPORSI TINGKAT KESUKARAN:',
      `- Kategori Mudah  (C1-C2): ${countMudah} Butir (${pctMudah}%) [Target Ideal: 25% - 30%]`,
      `- Kategori Sedang (C3)   : ${countSedang} Butir (${pctSedang}%) [Target Ideal: 45% - 55%]`,
      `- Kategori Sukar  (C4-C6): ${countSukar} Butir (${pctSukar}%) [Target Ideal: 20% - 25%]`,
      '------------------------------------------------------------------------',
      'DETAIL ANALISIS PER BUTIR SOAL:',
      ...analyzedItems.map(
        (i) =>
          `No. ${i.nomorSoal} | Bentuk: ${i.bentukSoal} | Bloom: ${i.levelKognitif} | Kesukaran: ${i.tingkatKesukaran} | Kategori: ${i.kategoriBerpikir} | Kunci: ${i.kunciJawaban}\n  Indikator: ${i.indikatorSoal}\n  Justifikasi: ${i.justifikasiPedagogis}`
      ),
      '========================================================================',
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Evaluation of difficulty distribution quality
  const getQualityAssessment = () => {
    if (total === 0) return { title: 'Belum Ada Butir Soal', desc: '', status: 'neutral' };
    if (pctSedang >= 40 && pctSedang <= 60 && pctSukar >= 20 && pctMudah >= 20) {
      return {
        title: 'Distribusi Kesukaran Normal & Proporsional (Sangat Baik)',
        desc: `Proporsi Mudah (${pctMudah}%), Sedang (${pctSedang}%), dan Sukar (${pctSukar}%) membentuk kurva distribusi standar evaluasi pendidikan (rasio seimbang ~3:5:2) yang ideal untuk mengukur ketuntasan belajar seluruh spektrum peserta didik.`,
        status: 'optimal',
      };
    }
    if (pctSukar > 45) {
      return {
        title: 'Dominan Soal Tingkat Sukar (HOTS Tinggi)',
        desc: `Proporsi soal sukar (${pctSukar}%) cukup dominan. Pastikan durasi waktu tes dan stimulus mencukupi agar peserta didik tidak mengalami kelelahan kognitif.`,
        status: 'warning',
      };
    }
    if (pctMudah > 45) {
      return {
        title: 'Didominasi Soal Tingkat Mudah (LOTS)',
        desc: `Proporsi soal mudah (${pctMudah}%) cukup tinggi. Disarankan menambah soal dengan tingkat penerapan (C3) atau analisis (C4) untuk menaikkan daya pembeda tes.`,
        status: 'warning',
      };
    }
    return {
      title: 'Distribusi Kesukaran Memenuhi Standar Asesmen',
      desc: `Komposisi soal memiliki perwakilan tingkat kognitif yang lengkap dari ranah mudah hingga sukar sesuai regulasi Kurikulum Merdeka.`,
      status: 'optimal',
    };
  };

  const qualityAssessment = getQualityAssessment();

  return (
    <div className="mt-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden print:border-none print:shadow-none">
      {/* Section Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/30 border border-indigo-400/40 text-indigo-300">
              <Gauge className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                Analisis Butir Soal & Estimasi Tingkat Kesukaran
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Pemetaan tingkat kesukaran (Mudah, Sedang, Sukar) berbasis Taksonomi Bloom Revisi & standar evaluasi Kurikulum Merdeka.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={handleCopyAnalysis}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-indigo-200" />
                <span>Salin Analisis Butir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metric Cards: Mudah, Sedang, Sukar */}
      <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Mudah */}
          <div className="bg-white p-4 rounded-xl border border-emerald-200/90 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Tingkat Mudah (C1 - C2)
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Target: 25% - 30%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{countMudah}</span>
                <span className="text-xs text-slate-500 font-medium">
                  Butir ({pctMudah}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Menguji ingatan fakta dasar (C1) dan pemahaman konsep (C2).
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">No. Soal:</span>
              <span className="font-semibold text-emerald-800">
                {mudahItems.length > 0
                  ? mudahItems.map((m) => m.nomorSoal).join(', ')
                  : 'Tidak ada'}
              </span>
            </div>
          </div>

          {/* Card 2: Sedang */}
          <div className="bg-white p-4 rounded-xl border border-sky-200/90 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                  Tingkat Sedang (C3)
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Target: 45% - 55%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{countSedang}</span>
                <span className="text-xs text-slate-500 font-medium">
                  Butir ({pctSedang}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Menguji aplikasi rumus, prosedur terarah, dan pemecahan kasus (C3).
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">No. Soal:</span>
              <span className="font-semibold text-sky-800">
                {sedangItems.length > 0
                  ? sedangItems.map((m) => m.nomorSoal).join(', ')
                  : 'Tidak ada'}
              </span>
            </div>
          </div>

          {/* Card 3: Sukar */}
          <div className="bg-white p-4 rounded-xl border border-rose-200/90 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  Tingkat Sukar (C4 - C6 / HOTS)
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Target: 20% - 25%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{countSukar}</span>
                <span className="text-xs text-slate-500 font-medium">
                  Butir ({pctSukar}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Menguji analisis kritis (C4), evaluasi (C5), dan kreasi solusi (C6).
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">No. Soal:</span>
              <span className="font-semibold text-rose-800">
                {sukarItems.length > 0
                  ? sukarItems.map((m) => m.nomorSoal).join(', ')
                  : 'Tidak ada'}
              </span>
            </div>
          </div>
        </div>

        {/* Quality note */}
        {total > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700">
            {qualityAssessment.status === 'optimal' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold text-slate-900 block">{qualityAssessment.title}</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{qualityAssessment.desc}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Table Tools */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400 mr-1" />
          <span className="font-bold text-slate-700 mr-1">Filter Tingkat:</span>

          <button
            type="button"
            onClick={() => setFilterDifficulty('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              filterDifficulty === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({total})
          </button>

          <button
            type="button"
            onClick={() => setFilterDifficulty('Mudah')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              filterDifficulty === 'Mudah'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Mudah ({countMudah})
          </button>

          <button
            type="button"
            onClick={() => setFilterDifficulty('Sedang')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              filterDifficulty === 'Sedang'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            Sedang ({countSedang})
          </button>

          <button
            type="button"
            onClick={() => setFilterDifficulty('Sukar')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              filterDifficulty === 'Sukar'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Sukar ({countSukar})
          </button>

          <button
            type="button"
            onClick={() => setFilterDifficulty('HOTS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              filterDifficulty === 'HOTS'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            HOTS (C4-C6)
          </button>
        </div>

        <span className="text-xs text-slate-500">
          Menampilkan {filteredList.length} dari {total} butir soal
        </span>
      </div>

      {/* Main Analysis Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase tracking-wider print:bg-slate-200 print:text-black">
              <th className="py-3 px-3 text-center w-12 border-r border-slate-700 print:border-black">No</th>
              <th className="py-3 px-3 w-36 border-r border-slate-700 print:border-black">Bentuk Soal</th>
              <th className="py-3 px-3 text-center w-20 border-r border-slate-700 print:border-black">Bloom</th>
              <th className="py-3 px-3.5 text-center w-28 border-r border-slate-700 print:border-black">
                Tingkat Kesukaran
              </th>
              <th className="py-3 px-3 text-center w-24 border-r border-slate-700 print:border-black">Kategori</th>
              <th className="py-3 px-3.5 w-60 border-r border-slate-700 print:border-black">Indikator Soal</th>
              <th className="py-3 px-3.5 border-r border-slate-700 print:border-black">
                Karakteristik & Justifikasi Pengukuran
              </th>
              <th className="py-3 px-3 text-center w-24">Kunci</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredList.map((item) => (
              <tr key={item.nomorSoal} className="hover:bg-slate-50/80 transition">
                <td className="py-3 px-3 text-center font-bold text-slate-800 border-r border-slate-200">
                  {item.nomorSoal}
                </td>

                <td className="py-3 px-3 font-medium text-slate-800 border-r border-slate-200">
                  {item.bentukSoal}
                </td>

                {/* Level Bloom */}
                <td className="py-3 px-3 text-center border-r border-slate-200">
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-black text-xs ${
                      item.levelKognitif.startsWith('C4') ||
                      item.levelKognitif.startsWith('C5') ||
                      item.levelKognitif.startsWith('C6')
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : item.levelKognitif.startsWith('C3')
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-sky-100 text-sky-800 border border-sky-300'
                    }`}
                  >
                    {item.levelKognitif}
                  </span>
                </td>

                {/* Tingkat Kesukaran Badge */}
                <td className="py-3 px-3.5 text-center border-r border-slate-200">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${
                      item.tingkatKesukaran === 'Mudah'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : item.tingkatKesukaran === 'Sedang'
                        ? 'bg-sky-50 text-sky-800 border-sky-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    {item.tingkatKesukaran}
                  </span>
                </td>

                {/* Kategori Berpikir */}
                <td className="py-3 px-3 text-center border-r border-slate-200">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.kategoriBerpikir === 'HOTS'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : item.kategoriBerpikir === 'MOTS'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-sky-100 text-sky-900 border border-sky-300'
                    }`}
                  >
                    {item.kategoriBerpikir}
                  </span>
                </td>

                {/* Indikator */}
                <td className="py-3 px-3.5 text-slate-700 leading-relaxed border-r border-slate-200">
                  <div className="font-semibold text-slate-900 mb-0.5">{item.materiPokok}</div>
                  <div className="text-[11px] text-slate-600">{item.indikatorSoal}</div>
                </td>

                {/* Justifikasi */}
                <td className="py-3 px-3.5 text-slate-600 leading-relaxed border-r border-slate-200 text-[11px]">
                  {item.justifikasiPedagogis}
                </td>

                {/* Kunci */}
                <td className="py-3 px-3 text-center font-bold text-slate-900">
                  <span className="inline-block max-w-[90px] truncate" title={item.kunciJawaban}>
                    {item.kunciJawaban}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

          {/* Table Footer: Summary of Difficulty */}
          <tfoot className="border-t-2 border-slate-300 bg-slate-50/90 text-xs font-semibold text-slate-800">
            <tr>
              <td colSpan={3} className="py-3 px-3.5 font-bold text-slate-900">
                Rekapitulasi Distribusi Tingkat Kesukaran
              </td>
              <td colSpan={2} className="py-3 px-3 text-center font-bold">
                <span className="text-emerald-700">Mudah: {pctMudah}%</span> •{' '}
                <span className="text-sky-700">Sedang: {pctSedang}%</span> •{' '}
                <span className="text-rose-700">Sukar: {pctSukar}%</span>
              </td>
              <td colSpan={3} className="py-3 px-3.5 text-[11px] text-slate-600 text-right">
                Total Instrumen: <strong>{total} Butir Soal</strong> (100%)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pedagogical Reference Note */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
        <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Rujukan Teori Evaluasi:</strong> Pengelompokan tingkat kesukaran pada tahap perancangan kisi-kisi (teoritis) mengacu pada kompleksitas kognitif Taksonomi Bloom: ranah C1-C2 (Mudah: mengenali & menjelaskan fakta), C3 (Sedang: aplikasi prosedur & perhitungan), dan C4-C6 (Sukar/HOTS: analisis kritis, evaluasi kriteria, dan kreasi gagasan).
        </p>
      </div>
    </div>
  );
};
