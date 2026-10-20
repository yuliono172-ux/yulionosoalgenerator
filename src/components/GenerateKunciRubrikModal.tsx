import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  KeyRound,
  FileText,
  Archive,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  HelpCircle,
  Award,
  Sliders,
} from 'lucide-react';
import {
  EvaluationKit,
  KisiKisiItem,
  KunciDanLembarJawabItem,
  SchoolMetadata,
  SoalEvaluasiItem,
} from '../types/assessment';
import { BankSoalRecord, fetchBankSoalList } from '../services/bankSoalService';
import { generateKunciDanRubrikOtomatis } from '../services/rubrikGeneratorService';

interface GenerateKunciRubrikModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKit: EvaluationKit;
  currentSchoolInfo: SchoolMetadata;
  onSuccessGenerate: (
    updatedKunci: KunciDanLembarJawabItem[],
    sourceDescription: string,
    loadedKit?: EvaluationKit
  ) => void;
}

export const GenerateKunciRubrikModal: React.FC<GenerateKunciRubrikModalProps> = ({
  isOpen,
  onClose,
  currentKit,
  currentSchoolInfo,
  onSuccessGenerate,
}) => {
  const [sourceType, setSourceType] = useState<'current' | 'bank_soal'>('current');
  const [bankSoalList, setBankSoalList] = useState<BankSoalRecord[]>([]);
  const [selectedBankSoalId, setSelectedBankSoalId] = useState<string>('');
  const [isLoadingBankSoal, setIsLoadingBankSoal] = useState(false);
  const [skorMaxUraian, setSkorMaxUraian] = useState<number>(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepText, setCurrentStepText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && sourceType === 'bank_soal') {
      loadBankSoal();
    }
  }, [isOpen, sourceType]);

  const loadBankSoal = async () => {
    setIsLoadingBankSoal(true);
    try {
      const records = await fetchBankSoalList();
      setBankSoalList(records);
      if (records.length > 0 && !selectedBankSoalId) {
        setSelectedBankSoalId(records[0].id);
      }
    } catch (e) {
      console.error('Failed to load bank soal list:', e);
    } finally {
      setIsLoadingBankSoal(false);
    }
  };

  if (!isOpen) return null;

  const handleStartGenerate = async () => {
    setErrorMessage(null);
    setIsGenerating(true);

    try {
      let targetSoalList: SoalEvaluasiItem[] = [];
      let targetKisiList: KisiKisiItem[] = [];
      let targetSubject = currentKit.paramsSnapshot?.mataPelajaran || 'Mata Pelajaran';
      let targetLevel = currentKit.paramsSnapshot?.levelKelas || 'Fase B';
      let sourceDesc = 'Naskah Soal Aktif';
      let loadedKitRef: EvaluationKit | undefined = undefined;

      if (sourceType === 'current') {
        targetSoalList = currentKit.soal_evaluasi;
        targetKisiList = currentKit.kisi_kisi;
      } else {
        const found = bankSoalList.find((b) => b.id === selectedBankSoalId);
        if (!found || !found.kit || !found.kit.soal_evaluasi || found.kit.soal_evaluasi.length === 0) {
          throw new Error('Asesmen dari Bank Soal yang dipilih tidak memiliki butir soal evaluasi.');
        }
        targetSoalList = found.kit.soal_evaluasi;
        targetKisiList = found.kit.kisi_kisi || [];
        targetSubject = found.mataPelajaran || found.judul;
        targetLevel = found.levelKelas || 'Fase B';
        sourceDesc = `Bank Soal: "${found.judul}"`;
        loadedKitRef = found.kit;
      }

      if (!targetSoalList || targetSoalList.length === 0) {
        throw new Error('Tidak ditemukan butir soal untuk dianalisis.');
      }

      setCurrentStepText('Menelaah struktur naskah dan level kognitif soal...');
      await new Promise((r) => setTimeout(r, 600));

      setCurrentStepText('Menyusun kunci jawaban objektif & pembahasan konseptual...');
      await new Promise((r) => setTimeout(r, 700));

      setCurrentStepText('Menyusun matriks rubrik analitik bertingkat untuk soal Uraian...');

      const generatedResults = await generateKunciDanRubrikOtomatis(
        targetSoalList,
        targetKisiList,
        {
          mataPelajaran: targetSubject,
          levelKelas: targetLevel,
          skorMaksimalUraian: skorMaxUraian,
        }
      );

      setCurrentStepText('Finalisasi pedoman penskoran dan kriteria capaian...');
      await new Promise((r) => setTimeout(r, 400));

      onSuccessGenerate(generatedResults, sourceDesc, loadedKitRef);
      onClose();
    } catch (err: any) {
      console.error('Error generating rubrics & keys:', err);
      setErrorMessage(err?.message || 'Terjadi kesalahan saat menghasilkan kunci dan rubrik.');
    } finally {
      setIsGenerating(false);
      setCurrentStepText('');
    }
  };

  const selectedBankRecord = bankSoalList.find((b) => b.id === selectedBankSoalId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/20 backdrop-blur-xs text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold text-base">Hasilkan Kunci Jawaban & Rubrik Otomatis</h3>
              <p className="text-xs text-emerald-100">
                Penyusunan kunci valid & rubrik penskoran analitik siap pakai untuk soal uraian
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Source Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Pilih Sumber Butir Soal:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSourceType('current')}
                disabled={isGenerating}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition ${
                  sourceType === 'current'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <FileText
                  className={`h-5 w-5 shrink-0 mt-0.5 ${
                    sourceType === 'current' ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                />
                <div>
                  <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                    Naskah Soal Aktif
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {currentKit.soal_evaluasi.length} butir soal di lembar kerja saat ini
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('bank_soal')}
                disabled={isGenerating}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition ${
                  sourceType === 'bank_soal'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Archive
                  className={`h-5 w-5 shrink-0 mt-0.5 ${
                    sourceType === 'bank_soal' ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                />
                <div>
                  <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                    Dari Bank Soal
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Pilih arsip asesmen tersimpan
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* If Bank Soal Selected -> Show Bank Soal Dropdown */}
          {sourceType === 'bank_soal' && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Pilih Set Asesmen dari Bank Soal:
              </label>
              {isLoadingBankSoal ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  <span>Memuat arsip Bank Soal...</span>
                </div>
              ) : bankSoalList.length === 0 ? (
                <p className="text-xs text-amber-700">
                  Bank Soal masih kosong. Anda dapat menggunakan sumber "Naskah Soal Aktif".
                </p>
              ) : (
                <select
                  value={selectedBankSoalId}
                  onChange={(e) => setSelectedBankSoalId(e.target.value)}
                  disabled={isGenerating}
                  className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {bankSoalList.map((rec) => (
                    <option key={rec.id} value={rec.id}>
                      {rec.judul} ({rec.totalSoal} Soal - {rec.tahunAjaran})
                    </option>
                  ))}
                </select>
              )}

              {selectedBankRecord && (
                <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-3">
                  <span>Mata Pelajaran: <b>{selectedBankRecord.mataPelajaran}</b></span>
                  <span>&bull;</span>
                  <span>Kelas: <b>{selectedBankRecord.levelKelas}</b></span>
                  <span>&bull;</span>
                  <span>HOTS: <b>{selectedBankRecord.jumlahHots} Soal</b></span>
                </div>
              )}
            </div>
          )}

          {/* Configuration Options */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-600" />
                Skala Skor Maksimal Soal Uraian:
              </label>
              <div className="flex items-center gap-1.5">
                {[4, 5, 10].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSkorMaxUraian(val)}
                    disabled={isGenerating}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                      skorMaxUraian === val
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Skor {val}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              *Skor 4 adalah standar analitik Kurikulum Merdeka (Skor 4: Optimal, Skor 3: Baik, Skor 2: Cukup, Skor 1: Kurang, Skor 0: Kosong).
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              Komponen yang akan disusun secara otomatis:
            </span>
            <ul className="space-y-1 text-emerald-900/90 pl-5 list-disc">
              <li>
                <b>Kunci Jawaban Tervalidasi</b>: Huruf opsi, pasangan menjodohkan, centang PGK, dan status Benar/Salah.
              </li>
              <li>
                <b>Pembahasan Konseptual Ilmiah</b>: Penjelasan materi secara mendalam sesuai capaian pembelajaran.
              </li>
              <li>
                <b>Matriks Rubrik Analitik Uraian</b>: Pembagian skala skor bertingkat, daftar kata kunci wajib, contoh jawaban model ideal siswa, dan petunjuk koreksi guru.
              </li>
              <li>
                <b>Form Penilaian Langsung</b>: Terintegrasi dengan kalkulator skor dan narasi deskripsi rapor otomatis.
              </li>
            </ul>
          </div>

          {/* Progress / Step Indicator */}
          {isGenerating && (
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
                <span className="text-xs font-semibold text-emerald-300">
                  Sedang Memproses AI Evaluasi...
                </span>
              </div>
              <p className="text-xs text-slate-300 pl-6">{currentStepText}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200/70 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleStartGenerate}
            disabled={isGenerating || (sourceType === 'bank_soal' && bankSoalList.length === 0)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyusun Kunci & Rubrik...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Mulai Generate Otomatis</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
