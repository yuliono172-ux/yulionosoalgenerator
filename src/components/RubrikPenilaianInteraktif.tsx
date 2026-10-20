import React, { useState, useMemo } from 'react';
import {
  EvaluationKit,
  KunciDanLembarJawabItem,
  SchoolMetadata,
  SoalEvaluasiItem,
} from '../types/assessment';
import {
  CheckCircle2,
  Award,
  Calculator,
  User,
  Printer,
  Sparkles,
  FileText,
  Copy,
  RotateCcw,
  Tag,
  BookOpen,
  HelpCircle,
  ClipboardList,
  Check,
} from 'lucide-react';

interface RubrikPenilaianInteraktifProps {
  kit: EvaluationKit;
  schoolInfo: SchoolMetadata;
  onPrint?: () => void;
}

interface StudentGradeState {
  studentName: string;
  studentId: string;
  className: string;
  notes: string;
  scores: Record<number, number>; // nomor_soal -> score obtained
  checkedKeywords: Record<number, string[]>; // nomor_soal -> checked keyword strings
}

export const RubrikPenilaianInteraktif: React.FC<RubrikPenilaianInteraktifProps> = ({
  kit,
  schoolInfo,
}) => {
  // Filter for Uraian questions first
  const uraianSoalList = useMemo(() => {
    return kit.soal_evaluasi.filter((s) => s.bentuk_soal === 'Uraian');
  }, [kit.soal_evaluasi]);

  // All questions
  const allSoalList = kit.soal_evaluasi;

  // Find matching kunci/rubrik
  const getKunciItem = (nomor: number): KunciDanLembarJawabItem | undefined => {
    return kit.kunci_dan_lembar_jawab.find((k) => k.nomor_soal === nomor);
  };

  // Student grading form state
  const [student, setStudent] = useState<StudentGradeState>({
    studentName: 'Ahmad Raihan Pratama',
    studentId: '04',
    className: kit.paramsSnapshot?.levelKelas || 'Kelas 4A',
    notes: 'Pemahaman konsep fotosintesis dan rantai makanan sangat runtut.',
    scores: {},
    checkedKeywords: {},
  });

  const [activeTabMode, setActiveTabMode] = useState<'koreksi' | 'matriks'>('koreksi');
  const [copiedNarasi, setCopiedNarasi] = useState(false);

  // Initialize default scores for Uraian if empty
  const uraianMaxScores = useMemo(() => {
    const map: Record<number, number> = {};
    uraianSoalList.forEach((soal) => {
      const kunci = getKunciItem(soal.nomor_soal);
      map[soal.nomor_soal] = kunci?.rubrik_detail?.skor_maksimal || 4;
    });
    return map;
  }, [uraianSoalList, kit.kunci_dan_lembar_jawab]);

  // Objective questions max scores
  const objectiveMaxScores = useMemo(() => {
    const map: Record<number, number> = {};
    allSoalList.forEach((soal) => {
      if (soal.bentuk_soal !== 'Uraian') {
        if (soal.bentuk_soal === 'Pilihan Ganda') map[soal.nomor_soal] = 1;
        else if (soal.bentuk_soal === 'Pilihan Ganda Kompleks') map[soal.nomor_soal] = 2;
        else if (soal.bentuk_soal === 'Menjodohkan') {
          map[soal.nomor_soal] = soal.pasangan_menjodohkan?.kolom_a.length || 4;
        } else if (soal.bentuk_soal === 'Benar / Salah') {
          map[soal.nomor_soal] = soal.pernyataan_benar_salah?.length || 3;
        } else {
          map[soal.nomor_soal] = 1;
        }
      }
    });
    return map;
  }, [allSoalList]);

  // Total Max Score for the entire assessment
  const totalMaxScore = useMemo(() => {
    let sum = 0;
    allSoalList.forEach((soal) => {
      if (soal.bentuk_soal === 'Uraian') {
        sum += uraianMaxScores[soal.nomor_soal] || 4;
      } else {
        sum += objectiveMaxScores[soal.nomor_soal] || 1;
      }
    });
    return Math.max(sum, 1);
  }, [allSoalList, uraianMaxScores, objectiveMaxScores]);

  // Current Total Score Obtained
  const totalScoreObtained = useMemo(() => {
    let sum = 0;
    Object.entries(student.scores).forEach(([_, val]) => {
      if (typeof val === 'number') sum += val;
    });
    return sum;
  }, [student.scores]);

  // Nilai Akhir (0 - 100)
  const nilaiAkhir = useMemo(() => {
    const val = (totalScoreObtained / totalMaxScore) * 100;
    return Math.min(100, Math.max(0, Math.round(val)));
  }, [totalScoreObtained, totalMaxScore]);

  // Capaian Predikat
  const predikatCapaian = useMemo(() => {
    if (nilaiAkhir >= 88) {
      return {
        level: 'Sangat Baik (Optimal)',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        deskripsi: 'Menunjukkan penguasaan sangat baik dalam seluruh kompetensi materi yang diujikan.',
      };
    }
    if (nilaiAkhir >= 75) {
      return {
        level: 'Baik (Tercapai)',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
        deskripsi: 'Telah mencapai tujuan pembelajaran dengan baik, perlu pemantapan pada rincian konsep sekunder.',
      };
    }
    if (nilaiAkhir >= 60) {
      return {
        level: 'Cukup',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        deskripsi: 'Cukup menguasai kompetensi dasar, membutuhkan penguatan pada pemecahan masalah bertahap.',
      };
    }
    return {
      level: 'Perlu Bimbingan',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      deskripsi: 'Belum mencapai ketuntasan tujuan pembelajaran, memerlukan pendampingan remedial intensif.',
    };
  }, [nilaiAkhir]);

  // Generated Narasi e-Rapor
  const narasiRapor = useMemo(() => {
    const mapel = kit.paramsSnapshot?.mataPelajaran || 'Mata Pelajaran';
    const sName = student.studentName || 'Peserta didik';
    return `${sName} menunjukkan pencapaian ${predikatCapaian.level.toLowerCase()} pada asesmen ${mapel}. ${predikatCapaian.deskripsi} ${
      student.notes ? `Catatan pendidik: "${student.notes}"` : ''
    }`;
  }, [student.studentName, student.notes, predikatCapaian, kit.paramsSnapshot]);

  // Handler to set score for a question
  const handleSetScore = (nomor: number, score: number) => {
    setStudent((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        [nomor]: score,
      },
    }));
  };

  // Handler to toggle keyword
  const handleToggleKeyword = (nomor: number, keyword: string) => {
    setStudent((prev) => {
      const currentList = prev.checkedKeywords[nomor] || [];
      const updated = currentList.includes(keyword)
        ? currentList.filter((k) => k !== keyword)
        : [...currentList, keyword];
      return {
        ...prev,
        checkedKeywords: {
          ...prev.checkedKeywords,
          [nomor]: updated,
        },
      };
    });
  };

  // Quick set full score for all objective questions
  const handleFillAllObjectiveMax = () => {
    const updated = { ...student.scores };
    allSoalList.forEach((soal) => {
      if (soal.bentuk_soal !== 'Uraian') {
        updated[soal.nomor_soal] = objectiveMaxScores[soal.nomor_soal] || 1;
      }
    });
    setStudent((prev) => ({ ...prev, scores: updated }));
  };

  // Reset form
  const handleResetForm = () => {
    setStudent({
      studentName: '',
      studentId: '',
      className: kit.paramsSnapshot?.levelKelas || '',
      notes: '',
      scores: {},
      checkedKeywords: {},
    });
  };

  const handleCopyNarasi = () => {
    navigator.clipboard.writeText(narasiRapor);
    setCopiedNarasi(true);
    setTimeout(() => setCopiedNarasi(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-indigo-50 via-teal-50/50 to-emerald-50 border border-indigo-200/80 rounded-2xl print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
              <ClipboardList className="h-4 w-4" />
            </span>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              Rubrik Analitik & Form Penilaian Interaktif
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Gunakan pedoman kriteria bertingkat (Skor 0-4) untuk menilai lembar jawaban uraian siswa secara cepat, objektif, dan terstandar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-white border border-slate-300 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTabMode('koreksi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTabMode === 'koreksi'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              Koreksi & Nilai Siswa
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMode('matriks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTabMode === 'matriks'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              Matriks Kriteria Lengkap
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-2xs transition"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak Rubrik
          </button>
        </div>
      </div>

      {/* MODE 1: FORM KOREKSI & PENILAIAN LANGSUNG */}
      {activeTabMode === 'koreksi' && (
        <div className="space-y-6">
          {/* Identity & Live Score Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Student Info Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 print:border-black">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-indigo-600" />
                  Identitas Peserta Didik
                </span>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition print:hidden"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Form
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Nama Siswa:</label>
                  <input
                    type="text"
                    value={student.studentName}
                    onChange={(e) =>
                      setStudent((prev) => ({ ...prev, studentName: e.target.value }))
                    }
                    placeholder="Contoh: Ahmad Raihan"
                    className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">NISN / No. Absen:</label>
                  <input
                    type="text"
                    value={student.studentId}
                    onChange={(e) =>
                      setStudent((prev) => ({ ...prev, studentId: e.target.value }))
                    }
                    placeholder="Contoh: 04"
                    className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Kelas / Fase:</label>
                  <input
                    type="text"
                    value={student.className}
                    onChange={(e) =>
                      setStudent((prev) => ({ ...prev, className: e.target.value }))
                    }
                    placeholder="Contoh: Kelas 4A"
                    className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Catatan Observasi Guru / Umpan Balik Kualitatif:
                </label>
                <textarea
                  rows={2}
                  value={student.notes}
                  onChange={(e) => setStudent((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Tuliskan catatan khusus atau kekuatan/kelemahan respon siswa..."
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Live KPI & Rapor Summary Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-indigo-200 border-b border-indigo-800/60 pb-2">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="h-4 w-4 text-emerald-400" />
                    Kalkulator Nilai Akhir (NA)
                  </span>
                  <span className="text-[11px] bg-indigo-900/80 px-2 py-0.5 rounded text-indigo-300">
                    Kurikulum Merdeka
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-indigo-300 block">Total Skor Perolehan</span>
                    <span className="text-3xl font-extrabold text-white tracking-tight">
                      {totalScoreObtained}{' '}
                      <span className="text-sm font-normal text-indigo-300">
                        / {totalMaxScore}
                      </span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-indigo-300 block">Nilai Akhir (NA)</span>
                    <span className="text-4xl font-black text-emerald-400">{nilaiAkhir}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, nilaiAkhir))}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-indigo-200 text-[11px]">Kategori Capaian TP:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${predikatCapaian.badgeColor}`}
                  >
                    {predikatCapaian.level}
                  </span>
                </div>
              </div>

              {/* Quick Auto Rapor Button */}
              <div className="pt-3 border-t border-indigo-800/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                    Narasi Rapor Otomatis:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNarasi}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-semibold transition"
                  >
                    {copiedNarasi ? (
                      <>
                        <Check className="h-3 w-3" />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Salin Narasi
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-indigo-100 bg-white/10 p-2.5 rounded-xl leading-relaxed italic border border-white/5">
                  "{narasiRapor}"
                </p>
              </div>
            </div>
          </div>

          {/* Section: Penilaian Butir Soal Uraian Menggunakan Rubrik Detail */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Penilaian Butir Soal Uraian (Rubrik Analitik Bertingkat)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klik kartu kriteria skor yang sesuai dengan kualitas jawaban siswa. Skor perolehan akan otomatis terhitung.
                </p>
              </div>

              {allSoalList.some((s) => s.bentuk_soal !== 'Uraian') && (
                <button
                  type="button"
                  onClick={handleFillAllObjectiveMax}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
                >
                  Set Soal Objektif Penuh
                </button>
              )}
            </div>

            {uraianSoalList.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
                Tidak ada butir soal Uraian dalam naskah asesmen ini.
              </div>
            ) : (
              uraianSoalList.map((soal) => {
                const kunci = getKunciItem(soal.nomor_soal);
                const rubrik = kunci?.rubrik_detail;
                const maxScore = rubrik?.skor_maksimal || 4;
                const currentScore = student.scores[soal.nomor_soal];
                const checkedKws = student.checkedKeywords[soal.nomor_soal] || [];

                return (
                  <div
                    key={soal.nomor_soal}
                    className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-4 hover:border-slate-300 transition"
                  >
                    {/* Header Butir Soal */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs">
                          {soal.nomor_soal}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 text-sm">
                            Soal Uraian #{soal.nomor_soal}
                          </span>
                          <span className="text-xs text-slate-400 ml-2">
                            (Skor Maksimal: {maxScore})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Skor Perolehan:</span>
                        <div className="flex items-center gap-1 font-bold">
                          {[0, 1, 2, 3, 4].filter((s) => s <= maxScore).map((sVal) => (
                            <button
                              key={sVal}
                              type="button"
                              onClick={() => handleSetScore(soal.nomor_soal, sVal)}
                              className={`h-8 w-8 rounded-lg text-xs font-extrabold border transition ${
                                currentScore === sVal
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {sVal}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 space-y-1">
                      {soal.stimulus && (
                        <p className="text-slate-600 text-xs italic leading-relaxed">
                          "{soal.stimulus}"
                        </p>
                      )}
                      <p className="font-semibold text-slate-900">{soal.pertanyaan}</p>
                    </div>

                    {/* Keywords Checklist */}
                    {rubrik?.kata_kunci_wajib && rubrik.kata_kunci_wajib.length > 0 && (
                      <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-amber-700" />
                          Checklist Kata Kunci Esensial (Klik untuk menandai):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {rubrik.kata_kunci_wajib.map((kw, kwIdx) => {
                            const isChecked = checkedKws.includes(kw);
                            return (
                              <button
                                key={kwIdx}
                                type="button"
                                onClick={() => handleToggleKeyword(soal.nomor_soal, kw)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition inline-flex items-center gap-1 ${
                                  isChecked
                                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                {isChecked && <Check className="h-3 w-3" />}
                                {kw}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Clickable Rubric Criteria Cards (0 to 4) */}
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                        Pilih Kriteria Capaian Jawaban Siswa:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                        {(rubrik?.kriteria || [
                          {
                            skor: 4,
                            predikat: 'Sangat Baik',
                            deskriptor: 'Menjawab lengkap seluruh konsep esensial dengan runtut.',
                          },
                          {
                            skor: 3,
                            predikat: 'Baik',
                            deskriptor: 'Menjawab sebagian besar konsep dengan benar.',
                          },
                          {
                            skor: 2,
                            predikat: 'Cukup',
                            deskriptor: 'Menjawab sebagian konsep dasar namun masih terdapat kekeliruan.',
                          },
                          {
                            skor: 1,
                            predikat: 'Kurang',
                            deskriptor: 'Hanya menyebutkan istilah tanpa penjelasan konsep.',
                          },
                          {
                            skor: 0,
                            predikat: 'Belum Menjawab',
                            deskriptor: 'Kosong atau tidak relevan sama sekali.',
                          },
                        ]).map((krit) => {
                          const isSelected = currentScore === krit.skor;
                          return (
                            <button
                              key={krit.skor}
                              type="button"
                              onClick={() => handleSetScore(soal.nomor_soal, krit.skor)}
                              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/30 shadow-xs'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                                      isSelected
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-slate-100 text-slate-800'
                                    }`}
                                  >
                                    Skor {krit.skor}
                                  </span>
                                  {isSelected && (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  )}
                                </div>
                                <span className="font-bold text-xs text-slate-900 block mt-1">
                                  {krit.predikat}
                                </span>
                                <p className="text-[11px] text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                                  {krit.deskriptor}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Model Ideal Answer preview toggle */}
                    {rubrik?.contoh_jawaban_ideal && (
                      <details className="text-xs bg-slate-50 rounded-xl p-3 border border-slate-200 cursor-pointer">
                        <summary className="font-bold text-indigo-900 flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                          Lihat Standar Contoh Jawaban Siswa (Kunci Maksimal)
                        </summary>
                        <p className="mt-2 text-slate-700 whitespace-pre-line leading-relaxed pl-5 border-l-2 border-indigo-400">
                          {rubrik.contoh_jawaban_ideal}
                        </p>
                      </details>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Section: Penilaian Soal Objektif Cepat */}
          {allSoalList.some((s) => s.bentuk_soal !== 'Uraian') && (
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-700" />
                  Koreksi Cepat Butir Soal Objektif (PG, PGK, Menjodohkan, Benar/Salah)
                </span>
                <span className="text-xs text-slate-500">
                  Total {allSoalList.filter((s) => s.bentuk_soal !== 'Uraian').length} Butir Soal
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {allSoalList
                  .filter((s) => s.bentuk_soal !== 'Uraian')
                  .map((soal) => {
                    const max = objectiveMaxScores[soal.nomor_soal] || 1;
                    const val = student.scores[soal.nomor_soal] ?? 0;
                    const isFull = val === max;

                    return (
                      <div
                        key={soal.nomor_soal}
                        className={`p-3 rounded-xl border text-center transition ${
                          isFull
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : val > 0
                            ? 'bg-amber-50/60 border-amber-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="text-[10px] font-bold text-slate-500 uppercase">
                          No. {soal.nomor_soal}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mb-1">
                          {soal.bentuk_soal}
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() => handleSetScore(soal.nomor_soal, 0)}
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              val === 0 ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            0
                          </button>
                          {max > 1 && (
                            <button
                              type="button"
                              onClick={() => handleSetScore(soal.nomor_soal, Math.round(max / 2))}
                              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                val > 0 && val < max
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {Math.round(max / 2)}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSetScore(soal.nomor_soal, max)}
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              val === max
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {max}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: MATRIKS KRITERIA LENGKAP SIAP CETAK */}
      {activeTabMode === 'matriks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6 print:border-black print:p-0 print:shadow-none">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Matriks Rubrik Penskoran Analitik Soal Uraian Kurikulum Merdeka
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pedoman kriteria penskoran bertingkat untuk penilaian autentik, validitas asesmen, dan lampiran resmi kurikulum.
              </p>
            </div>

            {uraianSoalList.map((soal) => {
              const kunci = getKunciItem(soal.nomor_soal);
              const rubrik = kunci?.rubrik_detail;
              const maxScore = rubrik?.skor_maksimal || 4;

              return (
                <div
                  key={soal.nomor_soal}
                  className="rounded-xl border border-slate-300 overflow-hidden space-y-3 p-4 bg-white print:break-inside-avoid print:border-black"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-sm text-slate-900">
                      Butir Soal #{soal.nomor_soal} (Uraian)
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Skor Maksimal: {maxScore} Poin
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-1">Pertanyaan Soal:</p>
                    <p>{soal.pertanyaan}</p>
                    {rubrik?.indikator_pencapaian && (
                      <p className="text-indigo-900 font-medium mt-1">
                        <b>Indikator Ketercapaian:</b> {rubrik.indikator_pencapaian}
                      </p>
                    )}
                  </div>

                  {/* Kriteria Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                          <th className="p-2.5 border border-slate-300 w-16 text-center">Skor</th>
                          <th className="p-2.5 border border-slate-300 w-36">Predikat</th>
                          <th className="p-2.5 border border-slate-300">Deskriptor Kriteria Capaian Jawaban Siswa</th>
                          <th className="p-2.5 border border-slate-300 w-44">Kata Kunci Esensial</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(rubrik?.kriteria || []).map((krit) => (
                          <tr key={krit.skor} className="border-b border-slate-200 hover:bg-slate-50/50">
                            <td className="p-2.5 border border-slate-300 text-center font-bold text-slate-900 bg-slate-50">
                              {krit.skor}
                            </td>
                            <td className="p-2.5 border border-slate-300 font-semibold text-slate-800">
                              {krit.predikat}
                            </td>
                            <td className="p-2.5 border border-slate-300 text-slate-700 leading-relaxed">
                              {krit.deskriptor}
                            </td>
                            <td className="p-2.5 border border-slate-300 text-slate-600 text-[11px]">
                              {krit.kata_kunci && krit.kata_kunci.length > 0
                                ? krit.kata_kunci.join(', ')
                                : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Contoh Jawaban Ideal */}
                  {rubrik?.contoh_jawaban_ideal && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs">
                      <span className="font-bold text-emerald-950 block mb-1">
                        Contoh Standar Jawaban Maksimal (Model Answer):
                      </span>
                      <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                        {rubrik.contoh_jawaban_ideal}
                      </p>
                    </div>
                  )}

                  {/* Petunjuk Penilai */}
                  {rubrik?.petunjuk_penilai && (
                    <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg text-[11px] text-amber-950">
                      <b>Petunjuk Bagi Penilai:</b> {rubrik.petunjuk_penilai}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
