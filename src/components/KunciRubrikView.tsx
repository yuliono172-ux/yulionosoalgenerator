import React, { useState, useEffect } from 'react';
import {
  EvaluationKit,
  KunciDanLembarJawabItem,
  SchoolMetadata,
} from '../types/assessment';
import {
  KeyRound,
  Printer,
  CheckCircle2,
  FileCheck,
  Calculator,
  Edit3,
  BookmarkCheck,
  Sparkles,
  ClipboardList,
  Layers,
  Award,
  BookOpen,
} from 'lucide-react';
import { GenerateKunciRubrikModal } from './GenerateKunciRubrikModal';
import { RubrikPenilaianInteraktif } from './RubrikPenilaianInteraktif';
import { generateHeuristicRubricAndKey } from '../services/rubrikGeneratorService';

interface KunciRubrikViewProps {
  kit: EvaluationKit;
  schoolInfo: SchoolMetadata;
  onUpdateKunci?: (updated: KunciDanLembarJawabItem[]) => void;
  onPrint: () => void;
  onLoadKit?: (loadedKit: EvaluationKit, loadedSchoolInfo: SchoolMetadata) => void;
}

export const KunciRubrikView: React.FC<KunciRubrikViewProps> = ({
  kit,
  schoolInfo,
  onUpdateKunci,
  onPrint,
  onLoadKit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'kunci_pembahasan' | 'rubrik_interaktif'>(
    'kunci_pembahasan'
  );
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  // Initialize or enrich kunciList with rubrik_detail if missing
  const [kunciList, setKunciList] = useState<KunciDanLembarJawabItem[]>(() => {
    return kit.kunci_dan_lembar_jawab.map((k) => {
      if (k.bentuk_soal === 'Uraian' && !k.rubrik_detail) {
        const matchingSoal = kit.soal_evaluasi.find((s) => s.nomor_soal === k.nomor_soal);
        const matchingKisi = kit.kisi_kisi.find((ks) => ks.nomor_soal === k.nomor_soal);
        if (matchingSoal) {
          const heuristic = generateHeuristicRubricAndKey(matchingSoal, matchingKisi, 4);
          return {
            ...k,
            rubrik_detail: heuristic.rubrik_detail,
          };
        }
      }
      return k;
    });
  });

  // Keep in sync if kit changes
  useEffect(() => {
    const enriched = kit.kunci_dan_lembar_jawab.map((k) => {
      if (k.bentuk_soal === 'Uraian' && !k.rubrik_detail) {
        const matchingSoal = kit.soal_evaluasi.find((s) => s.nomor_soal === k.nomor_soal);
        const matchingKisi = kit.kisi_kisi.find((ks) => ks.nomor_soal === k.nomor_soal);
        if (matchingSoal) {
          const heuristic = generateHeuristicRubricAndKey(matchingSoal, matchingKisi, 4);
          return {
            ...k,
            rubrik_detail: heuristic.rubrik_detail,
          };
        }
      }
      return k;
    });
    setKunciList(enriched);
  }, [kit.kunci_dan_lembar_jawab, kit.soal_evaluasi, kit.kisi_kisi]);

  const handleCellChange = (
    index: number,
    field: keyof KunciDanLembarJawabItem,
    value: string
  ) => {
    const updated = [...kunciList];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setKunciList(updated);
    if (onUpdateKunci) {
      onUpdateKunci(updated);
    }
  };

  const handleSuccessGenerate = (
    updatedKunci: KunciDanLembarJawabItem[],
    sourceDesc: string,
    loadedKitRef?: EvaluationKit
  ) => {
    setKunciList(updatedKunci);
    if (onUpdateKunci) {
      onUpdateKunci(updatedKunci);
    }

    if (loadedKitRef && onLoadKit) {
      onLoadKit(
        {
          ...loadedKitRef,
          kunci_dan_lembar_jawab: updatedKunci,
        },
        schoolInfo
      );
    }

    setGenerationNotice(
      `Kunci jawaban dan rubrik penskoran detail berhasil dihasilkan dari ${sourceDesc}! Siap digunakan untuk penilaian autentik.`
    );
    setTimeout(() => setGenerationNotice(null), 8000);
  };

  const totalUraianCount = kit.soal_evaluasi.filter((s) => s.bentuk_soal === 'Uraian').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 lg:p-10 print:p-0 print:border-none print:shadow-none space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xs">
              <KeyRound className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Komponen 3: Kunci Jawaban, Pembahasan & Rubrik Penskoran
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kunci jawaban objektif, pembahasan konsep ilmiah, dan rubrik analitik Kurikulum Merdeka siap pakai untuk penilaian guru.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* GENERATE AUTOMATIC RUBRIC BUTTON */}
          <button
            type="button"
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 shadow-sm shadow-emerald-700/20 transition active:scale-95"
            title="Hasilkan kunci jawaban dan rubrik penskoran analitik secara otomatis dari naskah atau Bank Soal"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-200 animate-pulse" />
            <span>Generate Kunci & Rubrik Otomatis</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isEditing
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isEditing ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Selesai Edit
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5" />
                Edit Kunci & Rubrik
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-2xs transition"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak Dokumen
          </button>
        </div>
      </div>

      {/* Generation Success Notification Banner */}
      {generationNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5 shadow-2xs animate-fadeIn print:hidden">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{generationNotice}</div>
          <button
            type="button"
            onClick={() => setGenerationNotice(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('kunci_pembahasan')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
              activeSubTab === 'kunci_pembahasan'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
            Kunci Jawaban & Pembahasan Lengkap ({kunciList.length} Butir)
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('rubrik_interaktif')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
              activeSubTab === 'rubrik_interaktif'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5 text-indigo-600" />
            Rubrik Analitik & Form Penilaian Uraian ({totalUraianCount} Soal)
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Mata Pelajaran: <b className="text-slate-800">{kit.paramsSnapshot?.mataPelajaran || schoolInfo.namaAsesmen}</b>
        </div>
      </div>

      {/* SUB-TAB 1: KUNCI JAWABAN & PEMBAHASAN */}
      {activeSubTab === 'kunci_pembahasan' && (
        <div className="space-y-6">
          {/* Quick Summary Answer Key Strip */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 print:hidden">
            <div className="flex items-center justify-between mb-2.5">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <BookmarkCheck className="h-4 w-4 text-emerald-600" />
                Tabel Ringkasan Kunci Jawaban Cepat
              </span>
              <span className="text-[11px] text-slate-500">
                Total {kunciList.length} Butir Soal
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
              {kunciList.map((k) => (
                <div
                  key={k.nomor_soal}
                  className="bg-white p-2 rounded-lg border border-slate-200 text-center shadow-2xs hover:border-emerald-300 transition"
                >
                  <span className="block text-[10px] font-bold text-slate-400">
                    No. {k.nomor_soal}
                  </span>
                  <span className="text-xs font-extrabold text-slate-800 truncate block" title={k.kunci_jawaban}>
                    {k.kunci_jawaban.length > 8
                      ? k.kunci_jawaban.substring(0, 7) + '...'
                      : k.kunci_jawaban}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pedoman Penskoran & Formula Nilai Akhir Card */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:border-black print:bg-white print:text-black">
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900 print:text-black">
                <Calculator className="h-4 w-4 text-emerald-700 print:hidden" />
                Pedoman Konversi Nilai Akhir (NA) Kurikulum Merdeka:
              </div>
              <p className="text-slate-600 print:text-black text-xs">
                Nilai Akhir dihitung berdasarkan akumulasi skor perolehan dari seluruh bentuk soal objektif dan uraian analitik.
              </p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-emerald-300 font-mono font-bold text-emerald-800 text-center shadow-xs print:border print:border-black print:text-black">
              NA = (Skor Perolehan / Skor Total Maksimal) × 100
            </div>
          </div>

          {/* Detail Kunci Jawaban, Pembahasan, dan Rubrik per Butir Soal */}
          <div className="space-y-6">
            {kunciList.map((item, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-2xs print:border-b print:border-slate-300 print:shadow-none print:break-inside-avoid space-y-3.5"
              >
                {/* Header Nomor & Bentuk */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs">
                      {item.nomor_soal}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      Butir Soal #{item.nomor_soal} ({item.bentuk_soal})
                    </span>
                  </div>

                  {item.bentuk_soal === 'Uraian' && item.rubrik_detail && (
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('rubrik_interaktif')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 print:hidden"
                    >
                      <Award className="h-3 w-3" />
                      Lihat Rubrik Analitik & Form Koreksi &rarr;
                    </button>
                  )}
                </div>

                {/* Kunci Jawaban */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                    Kunci Jawaban Benar:
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={item.kunci_jawaban}
                      onChange={(e) => handleCellChange(idx, 'kunci_jawaban', e.target.value)}
                      className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded font-semibold text-slate-900 bg-slate-50"
                    />
                  ) : (
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs sm:text-sm font-bold text-emerald-950 leading-relaxed print:bg-white print:border-black print:text-black">
                      {item.kunci_jawaban}
                    </div>
                  )}
                </div>

                {/* Pembahasan Konseptual */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Pembahasan Konsep & Alasan Ilmiah:
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={item.pembahasan}
                      onChange={(e) => handleCellChange(idx, 'pembahasan', e.target.value)}
                      className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded text-slate-800 bg-slate-50"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 leading-relaxed font-sans print:bg-white print:border-slate-300">
                      {item.pembahasan}
                    </div>
                  )}
                </div>

                {/* Rubrik Penskoran Analitik */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block mb-1">
                    Rubrik Penskoran & Kriteria Penilaian:
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={item.rubrik_penskoran}
                      onChange={(e) => handleCellChange(idx, 'rubrik_penskoran', e.target.value)}
                      className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded text-indigo-950 bg-slate-50"
                    />
                  ) : (
                    <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg text-xs sm:text-sm text-indigo-950 font-medium whitespace-pre-line leading-relaxed print:bg-white print:border-slate-400 print:text-black">
                      {item.rubrik_penskoran}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RUBRIK ANALITIK & FORM PENILAIAN INTERAKTIF */}
      {activeSubTab === 'rubrik_interaktif' && (
        <RubrikPenilaianInteraktif
          kit={{
            ...kit,
            kunci_dan_lembar_jawab: kunciList,
          }}
          schoolInfo={schoolInfo}
          onPrint={onPrint}
        />
      )}

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

      {/* GENERATE KUNCI & RUBRIK MODAL */}
      <GenerateKunciRubrikModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        currentKit={kit}
        currentSchoolInfo={schoolInfo}
        onSuccessGenerate={handleSuccessGenerate}
      />
    </div>
  );
};
