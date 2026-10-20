import React, { useState } from 'react';
import {
  AssessmentParams,
  OpsiPgFormat,
  KonfigurasiPgkFormat,
  SchoolMetadata,
} from '../types/assessment';
import { CURRICULUM_PRESETS } from '../data/presets';
import {
  Sparkles,
  BookOpen,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  School,
  Layers,
  Wand2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ParameterFormProps {
  params: AssessmentParams;
  setParams: React.Dispatch<React.SetStateAction<AssessmentParams>>;
  onGenerate: () => void;
  isLoading: boolean;
  onLoadPreset: (presetId: string) => void;
}

export const ParameterForm: React.FC<ParameterFormProps> = ({
  params,
  setParams,
  onGenerate,
  isLoading,
  onLoadPreset,
}) => {
  const [showSchoolMeta, setShowSchoolMeta] = useState(false);

  const distributedSum =
    Number(params.jumlahPg) +
    Number(params.jumlahPgk) +
    Number(params.jumlahMenjodohkan) +
    Number(params.jumlahBs) +
    Number(params.jumlahUraian);

  const isSumValid = distributedSum === Number(params.totalSoal);
  const isHotsValid = Number(params.jumlahHots) <= Number(params.totalSoal);

  const autoBalance = () => {
    const diff = Number(params.totalSoal) - distributedSum;
    if (diff !== 0) {
      setParams((prev) => ({
        ...prev,
        jumlahPg: Math.max(0, Number(prev.jumlahPg) + diff),
      }));
    }
  };

  const setQuickQuota = (count: number) => {
    const hots = Math.round(count * 0.3);
    // Smart balanced distribution based on requested total
    let pg = Math.round(count * 0.6);
    let pgk = Math.max(1, Math.round(count * 0.125));
    let menjodohkan = Math.max(1, Math.round(count * 0.1));
    let bs = Math.max(1, Math.round(count * 0.075));
    let uraian = Math.max(1, Math.round(count * 0.1));

    // Ensure sum matches count exactly
    const currentSum = pg + pgk + menjodohkan + bs + uraian;
    pg += count - currentSum;

    setParams((prev) => ({
      ...prev,
      totalSoal: count,
      jumlahHots: hots,
      jumlahPg: Math.max(0, pg),
      jumlahPgk: pgk,
      jumlahMenjodohkan: menjodohkan,
      jumlahBs: bs,
      jumlahUraian: uraian,
    }));
  };

  const handleSchoolChange = (field: keyof SchoolMetadata, val: string) => {
    setParams((prev) => ({
      ...prev,
      schoolInfo: {
        ...prev.schoolInfo,
        [field]: val,
      },
    }));
  };

  const hotsPercent =
    params.totalSoal > 0
      ? Math.round((Number(params.jumlahHots) / Number(params.totalSoal)) * 100)
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 lg:p-8">
      {/* Header and Quick Presets */}
      <div className="border-b border-slate-100 pb-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Penyusun Evaluasi Berbasis AI & Regulasi BSKAP
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Parameter Asesmen Kurikulum Merdeka
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sesuaikan Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), dan sebaran butir soal HOTS / LOTS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Preset Cepat:</span>
            <select
              aria-label="Pilih Template Mata Pelajaran Kurikulum Merdeka"
              className="text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition cursor-pointer"
              onChange={(e) => {
                if (e.target.value) onLoadPreset(e.target.value);
              }}
              defaultValue=""
            >
              <option value="" disabled>
                -- Pilih Template Mapel --
              </option>
              {CURRICULUM_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isSumValid && isHotsValid) {
            onGenerate();
          }
        }}
        className="space-y-6"
      >
        {/* Section 1: Identitas Kurikulum & Kelas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Level Kelas & Fase Target *
            </label>
            <select
              aria-label="Level Kelas dan Fase Target"
              value={params.levelKelas}
              onChange={(e) => {
                const val = e.target.value;
                setParams((prev) => ({
                  ...prev,
                  levelKelas: val,
                  // Auto-switch PG options: SMA default to 5 options, SD/SMP to 4 options
                  jumlahOpsiPg: val.includes('SMA') ? '5 Opsi [A-E]' : '4 Opsi [A-D]',
                }));
              }}
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              required
            >
              <option value="Kelas 1 SD (Fase A)">Kelas 1 SD (Fase A)</option>
              <option value="Kelas 2 SD (Fase A)">Kelas 2 SD (Fase A)</option>
              <option value="Kelas 3 SD (Fase B)">Kelas 3 SD (Fase B)</option>
              <option value="Kelas 4 SD (Fase B)">Kelas 4 SD (Fase B)</option>
              <option value="Kelas 5 SD (Fase C)">Kelas 5 SD (Fase C)</option>
              <option value="Kelas 6 SD (Fase C)">Kelas 6 SD (Fase C)</option>
              <option value="Kelas 7 SMP (Fase D)">Kelas 7 SMP (Fase D)</option>
              <option value="Kelas 8 SMP (Fase D)">Kelas 8 SMP (Fase D)</option>
              <option value="Kelas 9 SMP (Fase D)">Kelas 9 SMP (Fase D)</option>
              <option value="Kelas 10 SMA/SMK (Fase E)">Kelas 10 SMA/SMK (Fase E)</option>
              <option value="Kelas 11 SMA/SMK (Fase F)">Kelas 11 SMA/SMK (Fase F)</option>
              <option value="Kelas 12 SMA/SMK (Fase F)">Kelas 12 SMA/SMK (Fase F)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Mata Pelajaran *
            </label>
            <input
              type="text"
              value={params.mataPelajaran}
              onChange={(e) => setParams((prev) => ({ ...prev, mataPelajaran: e.target.value }))}
              placeholder="Contoh: Ilmu Pengetahuan Alam dan Sosial (IPAS)"
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              required
            />
          </div>
        </div>

        {/* Section 2: CP dan TP */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                Capaian Pembelajaran (CP) *
              </label>
              <span className="text-[11px] text-slate-400">Deskripsi kompetensi esensial fase</span>
            </div>
            <textarea
              rows={3}
              value={params.capaianPembelajaran}
              onChange={(e) => setParams((prev) => ({ ...prev, capaianPembelajaran: e.target.value }))}
              placeholder="Salin atau ketikkan Capaian Pembelajaran (CP) sesuai dokumen resmi Kemendikbudristek..."
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition leading-relaxed"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-emerald-600" />
                Tujuan Pembelajaran (TP) *
              </label>
              <span className="text-[11px] text-slate-400">Turunan indikator pencapaian kompetensi</span>
            </div>
            <textarea
              rows={3}
              value={params.tujuanPembelajaran}
              onChange={(e) => setParams((prev) => ({ ...prev, tujuanPembelajaran: e.target.value }))}
              placeholder="1. Peserta didik dapat menganalisis...\n2. Peserta didik dapat mengevaluasi..."
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition leading-relaxed"
              required
            />
          </div>
        </div>

        {/* Section 3: Kuota Soal, HOTS, dan Penggunaan Gambar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Pilihan Cepat Kuota Soal:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[10, 20, 25, 30, 40, 50].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuickQuota(count)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-2xs ${
                    params.totalSoal === count
                      ? 'bg-emerald-700 text-white border border-emerald-700'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-emerald-50 hover:border-emerald-300'
                  }`}
                >
                  {count === 40 ? '40 Soal (Ujian Lengkap)' : `${count} Soal`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Total Jumlah Soal *
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={params.totalSoal}
                onChange={(e) => setParams((prev) => ({ ...prev, totalSoal: Number(e.target.value) }))}
                className="w-full text-sm font-bold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                ✓ Mendukung permintaan berkapasitas besar (40, 50, dst.) via multi-batch otomatis.
              </span>
            </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Jumlah Soal HOTS *
              </label>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                {hotsPercent}% (C4-C6)
              </span>
            </div>
            <input
              type="number"
              min={0}
              max={params.totalSoal}
              value={params.jumlahHots}
              onChange={(e) => setParams((prev) => ({ ...prev, jumlahHots: Number(e.target.value) }))}
              className={`w-full text-sm font-bold bg-white border rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 ${
                isHotsValid ? 'border-slate-300 focus:ring-emerald-500' : 'border-rose-400 focus:ring-rose-500'
              }`}
              required
            />
            {!isHotsValid && (
              <span className="text-[10px] text-rose-600 block mt-1">
                HOTS tidak boleh melebihi total soal!
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Penggunaan Gambar / Visual *
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setParams((prev) => ({ ...prev, gunakanGambar: 'Ya' }))}
                className={`py-2 text-xs font-semibold rounded-lg border transition ${
                  params.gunakanGambar === 'Ya'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                ✓ Ya (Aktif)
              </button>
              <button
                type="button"
                onClick={() => setParams((prev) => ({ ...prev, gunakanGambar: 'Tidak' }))}
                className={`py-2 text-xs font-semibold rounded-lg border transition ${
                  params.gunakanGambar === 'Tidak'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                ✕ Tidak
              </button>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              Menghasilkan tag <code>[KOTAK GAMBAR: ...]</code>
            </span>
          </div>
        </div>
      </div>

        {/* Section 4: Distribusi Bentuk & Konfigurasi Soal */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-emerald-600" />
              Distribusi Bentuk & Konfigurasi Soal
            </h3>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                  isSumValid
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {isSumValid ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5" />
                )}
                Total Terdistribusi: {distributedSum} / {params.totalSoal} Soal
              </span>

              {!isSumValid && (
                <button
                  type="button"
                  onClick={autoBalance}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-100/80 px-2 py-1 rounded border border-emerald-300 transition"
                >
                  Seimbangkan Otomatis
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Pilihan Ganda */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="block text-[11px] font-bold text-slate-700 uppercase">
                1. Pilihan Ganda
              </span>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={params.jumlahPg}
                  onChange={(e) => setParams((prev) => ({ ...prev, jumlahPg: Number(e.target.value) }))}
                  className="w-16 text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-center text-slate-900"
                />
                <span className="text-xs text-slate-500 font-medium">butir</span>
              </div>
              <div className="mt-2">
                <label className="text-[10px] text-slate-500 block mb-1">Format Opsi:</label>
                <select
                  aria-label="Format Opsi Pilihan Ganda"
                  value={params.jumlahOpsiPg}
                  onChange={(e) =>
                    setParams((prev) => ({ ...prev, jumlahOpsiPg: e.target.value as OpsiPgFormat }))
                  }
                  className="w-full text-[11px] bg-slate-50 border border-slate-300 rounded p-1 text-slate-700 font-medium"
                >
                  <option value="4 Opsi [A-D]">4 Opsi [A-D] (SD/SMP)</option>
                  <option value="5 Opsi [A-E]">5 Opsi [A-E] (SMA/SMK)</option>
                </select>
              </div>
            </div>

            {/* Pilihan Ganda Kompleks */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="block text-[11px] font-bold text-slate-700 uppercase">
                2. PG Kompleks (PGK)
              </span>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={params.jumlahPgk}
                  onChange={(e) => setParams((prev) => ({ ...prev, jumlahPgk: Number(e.target.value) }))}
                  className="w-16 text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-center text-slate-900"
                />
                <span className="text-xs text-slate-500 font-medium">butir</span>
              </div>
              <div className="mt-2">
                <label className="text-[10px] text-slate-500 block mb-1">Konfigurasi Jawaban:</label>
                <select
                  aria-label="Konfigurasi Jawaban PG Kompleks"
                  value={params.konfigurasiPgk}
                  onChange={(e) =>
                    setParams((prev) => ({
                      ...prev,
                      konfigurasiPgk: e.target.value as KonfigurasiPgkFormat,
                    }))
                  }
                  className="w-full text-[10px] bg-slate-50 border border-slate-300 rounded p-1 text-slate-700 font-medium"
                >
                  <option value="3 opsi dengan 2 jawaban benar">3 opsi (2 benar)</option>
                  <option value="4 opsi dengan 3 jawaban benar">4 opsi (3 benar)</option>
                  <option value="5 opsi dengan 3 jawaban benar">5 opsi (3 benar)</option>
                </select>
              </div>
            </div>

            {/* Menjodohkan */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="block text-[11px] font-bold text-slate-700 uppercase">
                3. Menjodohkan
              </span>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={params.jumlahMenjodohkan}
                  onChange={(e) =>
                    setParams((prev) => ({ ...prev, jumlahMenjodohkan: Number(e.target.value) }))
                  }
                  className="w-16 text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-center text-slate-900"
                />
                <span className="text-xs text-slate-500 font-medium">butir</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">
                Pasangan stimulus Kolom A & respon Kolom B (termasuk distraktor).
              </p>
            </div>

            {/* Benar / Salah */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="block text-[11px] font-bold text-slate-700 uppercase">
                4. Benar / Salah
              </span>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={params.jumlahBs}
                  onChange={(e) => setParams((prev) => ({ ...prev, jumlahBs: Number(e.target.value) }))}
                  className="w-16 text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-center text-slate-900"
                />
                <span className="text-xs text-slate-500 font-medium">butir</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">
                Pernyataan analitis validasi fakta / konsep sains / sosial.
              </p>
            </div>

            {/* Uraian */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="block text-[11px] font-bold text-slate-700 uppercase">
                5. Soal Uraian
              </span>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={params.jumlahUraian}
                  onChange={(e) => setParams((prev) => ({ ...prev, jumlahUraian: Number(e.target.value) }))}
                  className="w-16 text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-center text-slate-900"
                />
                <span className="text-xs text-slate-500 font-medium">butir</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5">
                Pertanyaan terbuka esai + rubrik penskoran analitik kriteria.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Metadata Kop Sekolah (Accordion) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSchoolMeta(!showSchoolMeta)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 text-left transition"
          >
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-emerald-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Pengaturan Kop Sekolah & Lembar Ujian (Opsional)
              </span>
            </div>
            {showSchoolMeta ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {showSchoolMeta && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-white border-t border-slate-200 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nama Satuan Pendidikan / Sekolah</label>
                <input
                  type="text"
                  value={params.schoolInfo.namaSekolah}
                  onChange={(e) => handleSchoolChange('namaSekolah', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  placeholder="SD Negeri Sukamaju 01"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Dinas Pendidikan / Instansi</label>
                <input
                  type="text"
                  value={params.schoolInfo.dinasPendidikan || ''}
                  onChange={(e) => handleSchoolChange('dinasPendidikan', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  placeholder="Dinas Pendidikan & Kebudayaan"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Nama Asesmen</label>
                <input
                  type="text"
                  value={params.schoolInfo.namaAsesmen}
                  onChange={(e) => handleSchoolChange('namaAsesmen', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  placeholder="Asesmen Sumatif Akhir Lingkup Materi"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Nama Guru Penyusun</label>
                <input
                  type="text"
                  value={params.schoolInfo.namaGuru}
                  onChange={(e) => handleSchoolChange('namaGuru', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  placeholder="Yuliono, S.Pd."
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">NIP Guru Penyusun</label>
                <input
                  type="text"
                  value={params.schoolInfo.nipGuru}
                  onChange={(e) => handleSchoolChange('nipGuru', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  placeholder="19880415 201101 1 002"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Alokasi Waktu Pengerjaan</label>
                <input
                  type="text"
                  value={params.schoolInfo.alokasiWaktu}
                  onChange={(e) => handleSchoolChange('alokasiWaktu', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  placeholder="90 Menit"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button & Status */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium text-slate-700">
                Mode Kilat Aktif: Dioptimalkan dengan model AI berlatensi rendah untuk generasi instan.
              </span>
            </div>
            {params.totalSoal > 15 && (
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block w-fit">
                ℹ Total {params.totalSoal} butir soal (paket besar): AI akan menyusun seluruh kisi-kisi & rubrik secara lengkap.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !isSumValid || !isHotsValid}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition ${
              isLoading || !isSumValid || !isHotsValid
                ? 'bg-slate-400 cursor-not-allowed opacity-80'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-emerald-600/25'
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sedang Menyusun Naskah AI...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Susun Perangkat Soal Sekarang
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
