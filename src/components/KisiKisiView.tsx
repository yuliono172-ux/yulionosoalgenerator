import React, { useState } from 'react';
import { EvaluationKit, KisiKisiItem, LevelKognitif, SchoolMetadata } from '../types/assessment';
import { CognitiveDistributionCharts } from './CognitiveDistributionCharts';
import { ItemDifficultyAnalysisTable } from './ItemDifficultyAnalysisTable';
import { TestReliabilityCalculator } from './TestReliabilityCalculator';
import {
  Table2,
  Printer,
  Sparkles,
  PieChart,
  Brain,
  CheckCircle,
  Edit3,
  BarChart3,
} from 'lucide-react';

interface KisiKisiViewProps {
  kit: EvaluationKit;
  schoolInfo: SchoolMetadata;
  onUpdateKisiKisi?: (updated: KisiKisiItem[]) => void;
  onPrint: () => void;
}

export const KisiKisiView: React.FC<KisiKisiViewProps> = ({
  kit,
  schoolInfo,
  onUpdateKisiKisi,
  onPrint,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  const [kisiKisiList, setKisiKisiList] = useState<KisiKisiItem[]>(kit.kisi_kisi);

  const handleCellChange = (
    index: number,
    field: keyof KisiKisiItem,
    value: any
  ) => {
    const updated = [...kisiKisiList];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setKisiKisiList(updated);
    if (onUpdateKisiKisi) {
      onUpdateKisiKisi(updated);
    }
  };

  // Compute analytics
  const totalItems = kisiKisiList.length;
  const hotsCount = kisiKisiList.filter((k) => k.kategori_hots).length;
  const lotsCount = totalItems - hotsCount;
  const hotsPercent = totalItems > 0 ? Math.round((hotsCount / totalItems) * 100) : 0;

  // Level Kognitif counts
  const cognitiveCounts: Record<string, number> = {
    C1: 0,
    C2: 0,
    C3: 0,
    C4: 0,
    C5: 0,
    C6: 0,
  };

  kisiKisiList.forEach((k) => {
    const lvl = k.level_kognitif?.toUpperCase();
    if (cognitiveCounts[lvl] !== undefined) {
      cognitiveCounts[lvl]++;
    }
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 lg:p-10 print:p-0 print:border-none print:shadow-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5 mb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <Table2 className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Komponen 2: Matriks Kisi-Kisi Penulisan Soal
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Matriks penyusunan butir tes evaluasi sesuai standar BSKAP Kemendikbudristek & Taksonomi Bloom Revisi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCharts(!showCharts)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              showCharts
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Tampilkan atau sembunyikan visualisasi grafik Recharts"
          >
            <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{showCharts ? 'Tutup Grafik' : 'Visualisasi Recharts'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isEditing
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isEditing ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />
                Selesai Edit
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5" />
                Edit Matriks
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-xs transition"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak Matriks
          </button>
        </div>
      </div>

      {/* Statistical Summary Cards (hidden in print) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6 print:hidden">
        <div className="bg-gradient-to-br from-indigo-50/60 to-white p-4 rounded-xl border border-indigo-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">
              Total Soal
            </span>
            <div className="text-xl font-extrabold text-slate-900">
              {totalItems} <span className="text-xs font-normal text-slate-500">Butir</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50/60 to-white p-4 rounded-xl border border-amber-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
              Soal HOTS (C4-C6)
            </span>
            <div className="text-xl font-extrabold text-amber-800">
              {hotsCount} Butir ({hotsPercent}%)
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50/60 to-white p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
              Soal LOTS / MOTS (C1-C3)
            </span>
            <div className="text-xl font-extrabold text-emerald-800">
              {lotsCount} Butir ({100 - hotsPercent}%)
            </div>
          </div>
        </div>
      </div>

      {/* Visualisasi Data Recharts: Grafik Donat Persentase HOTS & Distribusi Kognitif (C1-C6) */}
      {showCharts && <CognitiveDistributionCharts kisiKisiList={kisiKisiList} />}

      {/* School Kop in Print */}
      <div className="hidden print:block text-center border-b-2 border-black pb-3 mb-4">
        <h3 className="text-xs font-semibold uppercase">{schoolInfo.dinasPendidikan || 'DINAS PENDIDIKAN'}</h3>
        <h2 className="text-base font-bold uppercase">{schoolInfo.namaSekolah}</h2>
        <h1 className="text-sm font-extrabold uppercase">
          MATRIKS KISI-KISI PENULISAN SOAL EVALUASI
        </h1>
        <p className="text-xs">
          Mata Pelajaran: {kit.paramsSnapshot?.mataPelajaran} | Kelas: {kit.paramsSnapshot?.levelKelas} | TP: {schoolInfo.tahunPelajaran}
        </p>
      </div>

      {/* Table of Kisi-Kisi */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold print:bg-slate-200 print:text-black">
              <th className="p-3 text-center w-12 border-r border-slate-700 print:border-black">No</th>
              <th className="p-3 w-36 border-r border-slate-700 print:border-black">Bentuk Soal</th>
              <th className="p-3 w-48 border-r border-slate-700 print:border-black">Materi Pokok</th>
              <th className="p-3 border-r border-slate-700 print:border-black">Indikator Soal</th>
              <th className="p-3 text-center w-24 border-r border-slate-700 print:border-black">Level</th>
              <th className="p-3 text-center w-24">Kategori</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {kisiKisiList.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70 transition">
                <td className="p-3 text-center font-bold text-slate-800 border-r border-slate-200">
                  {item.nomor_soal}
                </td>

                <td className="p-3 border-r border-slate-200 font-medium text-slate-800">
                  {isEditing ? (
                    <input
                      type="text"
                      value={item.bentuk_soal}
                      onChange={(e) => handleCellChange(idx, 'bentuk_soal', e.target.value)}
                      className="w-full text-xs p-1 border rounded"
                    />
                  ) : (
                    item.bentuk_soal
                  )}
                </td>

                <td className="p-3 border-r border-slate-200 font-semibold text-slate-900">
                  {isEditing ? (
                    <input
                      type="text"
                      value={item.materi_pokok}
                      onChange={(e) => handleCellChange(idx, 'materi_pokok', e.target.value)}
                      className="w-full text-xs p-1 border rounded"
                    />
                  ) : (
                    item.materi_pokok
                  )}
                </td>

                <td className="p-3 border-r border-slate-200 text-slate-700 leading-relaxed">
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={item.indikator_soal}
                      onChange={(e) => handleCellChange(idx, 'indikator_soal', e.target.value)}
                      className="w-full text-xs p-1 border rounded"
                    />
                  ) : (
                    item.indikator_soal
                  )}
                </td>

                <td className="p-3 text-center border-r border-slate-200">
                  {isEditing ? (
                    <select
                      aria-label="Level Kognitif Soal"
                      value={item.level_kognitif}
                      onChange={(e) =>
                        handleCellChange(idx, 'level_kognitif', e.target.value as LevelKognitif)
                      }
                      className="text-xs p-1 border rounded font-bold"
                    >
                      <option value="C1">C1</option>
                      <option value="C2">C2</option>
                      <option value="C3">C3</option>
                      <option value="C4">C4</option>
                      <option value="C5">C5</option>
                      <option value="C6">C6</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-extrabold ${
                        item.level_kognitif?.startsWith('C4') ||
                        item.level_kognitif?.startsWith('C5') ||
                        item.level_kognitif?.startsWith('C6')
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {item.level_kognitif}
                    </span>
                  )}
                </td>

                <td className="p-3 text-center">
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => handleCellChange(idx, 'kategori_hots', !item.kategori_hots)}
                      className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                        item.kategori_hots ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.kategori_hots ? 'HOTS' : 'LOTS'}
                    </button>
                  ) : item.kategori_hots ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      HOTS
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      LOTS/MOTS
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fitur Analisis Butir Soal & Tingkat Kesukaran (Mudah, Sedang, Sukar) */}
      <ItemDifficultyAnalysisTable kit={kit} />

      {/* Fitur Kalkulasi Estimasi Reliabilitas Soal (KR-20 & Alpha Cronbach) */}
      <TestReliabilityCalculator kit={kit} />

      {/* Compact Rekapitulasi Table for Print (Sesuai Standar Pengawas Kurikulum Merdeka) */}
      <div className="hidden print:block mt-6 mb-4 break-inside-avoid">
        <h4 className="text-xs font-bold uppercase mb-1.5 text-black">
          Rekapitulasi Sebaran Tingkat Kognitif & Rasio HOTS
        </h4>
        <table className="w-full border-collapse border border-black text-[11px] text-center">
          <thead>
            <tr className="bg-slate-100 border border-black font-bold text-black">
              <th className="border border-black p-1">C1 (Mengingat)</th>
              <th className="border border-black p-1">C2 (Memahami)</th>
              <th className="border border-black p-1">C3 (Menerapkan)</th>
              <th className="border border-black p-1">C4 (Menganalisis)</th>
              <th className="border border-black p-1">C5 (Mengevaluasi)</th>
              <th className="border border-black p-1">C6 (Menciptakan)</th>
              <th className="border border-black p-1 bg-slate-200">Total Soal</th>
              <th className="border border-black p-1 bg-slate-200">Rasio HOTS (C4-C6)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1">{cognitiveCounts.C1} butir</td>
              <td className="border border-black p-1">{cognitiveCounts.C2} butir</td>
              <td className="border border-black p-1">{cognitiveCounts.C3} butir</td>
              <td className="border border-black p-1">{cognitiveCounts.C4} butir</td>
              <td className="border border-black p-1">{cognitiveCounts.C5} butir</td>
              <td className="border border-black p-1">{cognitiveCounts.C6} butir</td>
              <td className="border border-black p-1 font-bold bg-slate-50">{totalItems} butir</td>
              <td className="border border-black p-1 font-bold bg-slate-50">{hotsPercent}% ({hotsCount} butir)</td>
            </tr>
          </tbody>
        </table>

        <h4 className="text-xs font-bold uppercase mt-3 mb-1.5 text-black">
          Rekapitulasi Tingkat Kesukaran Soal (Analisis Taksonomi Bloom)
        </h4>
        <table className="w-full border-collapse border border-black text-[11px] text-center">
          <thead>
            <tr className="bg-slate-100 border border-black font-bold text-black">
              <th className="border border-black p-1">Mudah (C1 - C2)</th>
              <th className="border border-black p-1">Sedang (C3)</th>
              <th className="border border-black p-1">Sukar (C4 - C6)</th>
              <th className="border border-black p-1 bg-slate-200">Total Soal</th>
              <th className="border border-black p-1">Kurva Proporsi (Target ~3:5:2)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1">
                {cognitiveCounts.C1 + cognitiveCounts.C2} butir ({totalItems > 0 ? Math.round(((cognitiveCounts.C1 + cognitiveCounts.C2) / totalItems) * 100) : 0}%)
              </td>
              <td className="border border-black p-1">
                {cognitiveCounts.C3} butir ({totalItems > 0 ? Math.round((cognitiveCounts.C3 / totalItems) * 100) : 0}%)
              </td>
              <td className="border border-black p-1">
                {cognitiveCounts.C4 + cognitiveCounts.C5 + cognitiveCounts.C6} butir ({totalItems > 0 ? Math.round(((cognitiveCounts.C4 + cognitiveCounts.C5 + cognitiveCounts.C6) / totalItems) * 100) : 0}%)
              </td>
              <td className="border border-black p-1 font-bold bg-slate-50">
                {totalItems} butir (100%)
              </td>
              <td className="border border-black p-1 text-slate-700 font-medium">
                {totalItems > 0 && Math.round((cognitiveCounts.C3 / totalItems) * 100) >= 40
                  ? 'Proporsional (Sesuai Standar BSKAP)'
                  : 'Distribusi Terdistribusi Sesuai Rancangan Asesmen'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signature Section in Print */}
      <div className="hidden print:grid grid-cols-2 mt-8 text-center text-xs">
        <div>
          <p>Mengetahui,</p>
          <p className="font-semibold">Kepala {schoolInfo.namaSekolah}</p>
          <div className="h-14"></div>
          <p className="font-bold underline">{schoolInfo.namaKepalaSekolah}</p>
          <p>NIP. {schoolInfo.nipKepalaSekolah}</p>
        </div>
        <div>
          <p>Guru Mata Pelajaran,</p>
          <div className="h-16"></div>
          <p className="font-bold underline">{schoolInfo.namaGuru}</p>
          <p>NIP. {schoolInfo.nipGuru}</p>
        </div>
      </div>
    </div>
  );
};
