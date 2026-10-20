import React, { useState, useMemo } from 'react';
import { SoalEvaluasiItem } from '../types/assessment';
import { SpellcheckIssue, checkTextForIssues } from '../utils/smartSpellcheck';
import {
  SpellCheck2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight,
  Check,
  X,
  RefreshCw,
  Wand2,
  BookOpen,
} from 'lucide-react';

interface SmartSpellcheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  soalList: SoalEvaluasiItem[];
  onApplyFix: (updatedSoalList: SoalEvaluasiItem[]) => void;
}

export const SmartSpellcheckModal: React.FC<SmartSpellcheckModalProps> = ({
  isOpen,
  onClose,
  soalList,
  onApplyFix,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Scan all questions for issues
  const allIssues = useMemo(() => {
    const list: SpellcheckIssue[] = [];

    soalList.forEach((soal) => {
      // 1. Pertanyaan
      if (soal.pertanyaan) {
        list.push(...checkTextForIssues(soal.pertanyaan, soal.nomor_soal, 'pertanyaan', 'Pertanyaan Soal'));
      }

      // 2. Stimulus
      if (soal.stimulus) {
        list.push(...checkTextForIssues(soal.stimulus, soal.nomor_soal, 'stimulus', 'Stimulus Bacaan'));
      }

      // 3. Petunjuk khusus
      if (soal.petunjuk_khusus) {
        list.push(...checkTextForIssues(soal.petunjuk_khusus, soal.nomor_soal, 'petunjuk_khusus', 'Petunjuk Khusus'));
      }

      // 4. Opsi jawaban
      if (soal.opsi_jawaban && soal.opsi_jawaban.length > 0) {
        soal.opsi_jawaban.forEach((opsi, optIdx) => {
          list.push(
            ...checkTextForIssues(
              opsi,
              soal.nomor_soal,
              'opsi_jawaban',
              `Opsi Jawaban #${optIdx + 1}`,
              optIdx
            )
          );
        });
      }

      // 5. Pernyataan Benar/Salah
      if (soal.pernyataan_benar_salah && soal.pernyataan_benar_salah.length > 0) {
        soal.pernyataan_benar_salah.forEach((p, pIdx) => {
          list.push(
            ...checkTextForIssues(
              p.kalimat,
              soal.nomor_soal,
              'pernyataan_benar_salah',
              `Pernyataan #${p.nomor}`,
              pIdx
            )
          );
        });
      }

      // 6. Pasangan Menjodohkan
      if (soal.pasangan_menjodohkan) {
        soal.pasangan_menjodohkan.kolom_a.forEach((itemA, aIdx) => {
          list.push(
            ...checkTextForIssues(
              itemA,
              soal.nomor_soal,
              'pasangan_menjodohkan',
              `Kolom Pernyataan #${aIdx + 1}`,
              aIdx
            )
          );
        });
        soal.pasangan_menjodohkan.kolom_b.forEach((itemB, bIdx) => {
          list.push(
            ...checkTextForIssues(
              itemB,
              soal.nomor_soal,
              'pasangan_menjodohkan',
              `Kolom Jawaban #${bIdx + 1}`,
              bIdx + 100 // offset subIndex
            )
          );
        });
      }
    });

    return list;
  }, [soalList]);

  // Filtered issues
  const filteredIssues = useMemo(() => {
    if (filterCategory === 'all') return allIssues;
    return allIssues.filter((issue) => issue.category === filterCategory);
  }, [allIssues, filterCategory]);

  // Fix single issue
  const handleFixSingle = (issue: SpellcheckIssue) => {
    const updated = soalList.map((soal) => {
      if (soal.nomor_soal !== issue.nomorSoal) return soal;

      const newSoal = { ...soal };
      const fixText = (current: string) => {
        if (!current) return current;
        // Exact word or regex replace
        const escaped = issue.wordFound.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return current.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), issue.replacementWord);
      };

      if (issue.field === 'pertanyaan') {
        newSoal.pertanyaan = fixText(newSoal.pertanyaan);
      } else if (issue.field === 'stimulus') {
        newSoal.stimulus = fixText(newSoal.stimulus);
      } else if (issue.field === 'petunjuk_khusus') {
        newSoal.petunjuk_khusus = fixText(newSoal.petunjuk_khusus || '');
      } else if (issue.field === 'opsi_jawaban' && issue.subIndex !== undefined && newSoal.opsi_jawaban) {
        const curOpts = [...newSoal.opsi_jawaban];
        curOpts[issue.subIndex] = fixText(curOpts[issue.subIndex]);
        newSoal.opsi_jawaban = curOpts;
      } else if (issue.field === 'pernyataan_benar_salah' && issue.subIndex !== undefined && newSoal.pernyataan_benar_salah) {
        const curPernyataan = [...newSoal.pernyataan_benar_salah];
        curPernyataan[issue.subIndex] = {
          ...curPernyataan[issue.subIndex],
          kalimat: fixText(curPernyataan[issue.subIndex].kalimat),
        };
        newSoal.pernyataan_benar_salah = curPernyataan;
      } else if (issue.field === 'pasangan_menjodohkan' && issue.subIndex !== undefined && newSoal.pasangan_menjodohkan) {
        const menj = { ...newSoal.pasangan_menjodohkan };
        if (issue.subIndex >= 100) {
          const bIdx = issue.subIndex - 100;
          const curB = [...menj.kolom_b];
          curB[bIdx] = fixText(curB[bIdx]);
          menj.kolom_b = curB;
        } else {
          const curA = [...menj.kolom_a];
          curA[issue.subIndex] = fixText(curA[issue.subIndex]);
          menj.kolom_a = curA;
        }
        newSoal.pasangan_menjodohkan = menj;
      }

      return newSoal;
    });

    onApplyFix(updated);
    setSuccessToast(`Berhasil memperbaiki '${issue.wordFound}' menjadi '${issue.replacementWord}'.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Fix ALL issues in 1 click
  const handleFixAll = () => {
    let updated = [...soalList];

    allIssues.forEach((issue) => {
      updated = updated.map((soal) => {
        if (soal.nomor_soal !== issue.nomorSoal) return soal;

        const newSoal = { ...soal };
        const fixText = (current: string) => {
          if (!current) return current;
          const escaped = issue.wordFound.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return current.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), issue.replacementWord);
        };

        if (issue.field === 'pertanyaan') {
          newSoal.pertanyaan = fixText(newSoal.pertanyaan);
        } else if (issue.field === 'stimulus') {
          newSoal.stimulus = fixText(newSoal.stimulus);
        } else if (issue.field === 'petunjuk_khusus') {
          newSoal.petunjuk_khusus = fixText(newSoal.petunjuk_khusus || '');
        } else if (issue.field === 'opsi_jawaban' && issue.subIndex !== undefined && newSoal.opsi_jawaban) {
          const curOpts = [...newSoal.opsi_jawaban];
          curOpts[issue.subIndex] = fixText(curOpts[issue.subIndex]);
          newSoal.opsi_jawaban = curOpts;
        } else if (issue.field === 'pernyataan_benar_salah' && issue.subIndex !== undefined && newSoal.pernyataan_benar_salah) {
          const curPernyataan = [...newSoal.pernyataan_benar_salah];
          curPernyataan[issue.subIndex] = {
            ...curPernyataan[issue.subIndex],
            kalimat: fixText(curPernyataan[issue.subIndex].kalimat),
          };
          newSoal.pernyataan_benar_salah = curPernyataan;
        } else if (issue.field === 'pasangan_menjodohkan' && issue.subIndex !== undefined && newSoal.pasangan_menjodohkan) {
          const menj = { ...newSoal.pasangan_menjodohkan };
          if (issue.subIndex >= 100) {
            const bIdx = issue.subIndex - 100;
            const curB = [...menj.kolom_b];
            curB[bIdx] = fixText(curB[bIdx]);
            menj.kolom_b = curB;
          } else {
            const curA = [...menj.kolom_a];
            curA[issue.subIndex] = fixText(curA[issue.subIndex]);
            menj.kolom_a = curA;
          }
          newSoal.pasangan_menjodohkan = menj;
        }

        return newSoal;
      });
    });

    onApplyFix(updated);
    setSuccessToast(`Semua ${allIssues.length} kata tidak baku berhasil diperbaiki secara otomatis.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  if (!isOpen) return null;

  const score = Math.max(0, 100 - allIssues.length * 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/10 rounded-xl">
              <SpellCheck2 className="h-5 w-5 text-white" />
            </span>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Smart Spellcheck & Pengecekan Tata Bahasa
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/20 font-medium">
                  KBBI & PUEBI
                </span>
              </h3>
              <p className="text-xs text-emerald-100">
                Pemeriksaan kata tidak baku, ejaan awalan & preposisi 'di', tanda baca, dan tipografi naskah soal.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Score Banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center h-10 w-10 rounded-xl font-bold text-sm ${
                score >= 90
                  ? 'bg-emerald-100 text-emerald-800'
                  : score >= 75
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {score}%
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {allIssues.length === 0
                  ? 'Tata Bahasa & Ejaan Sempurna'
                  : `${allIssues.length} Potensi Perbaikan Ditemukan`}
              </p>
              <p className="text-[11px] text-slate-500">
                {allIssues.length === 0
                  ? 'Seluruh butir soal telah memenuhi kaidah ejaan baku bahasa Indonesia.'
                  : 'Ditemukan istilah tidak baku atau kaidah ejaan yang perlu disempurnakan.'}
              </p>
            </div>
          </div>

          {allIssues.length > 0 && (
            <button
              type="button"
              onClick={handleFixAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Perbaiki Semua Otomatis
            </button>
          )}
        </div>

        {/* Toast alert */}
        {successToast && (
          <div className="mx-6 mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Category Tabs */}
        {allIssues.length > 0 && (
          <div className="px-6 pt-3 flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`pb-2.5 px-3 font-semibold border-b-2 transition ${
                filterCategory === 'all'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua ({allIssues.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('istilah_tidak_baku')}
              className={`pb-2.5 px-3 font-semibold border-b-2 transition ${
                filterCategory === 'istilah_tidak_baku'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Kata Tidak Baku ({allIssues.filter((i) => i.category === 'istilah_tidak_baku').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('kaidah_di')}
              className={`pb-2.5 px-3 font-semibold border-b-2 transition ${
                filterCategory === 'kaidah_di'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Kaidah 'di' ({allIssues.filter((i) => i.category === 'kaidah_di').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('tanda_baca')}
              className={`pb-2.5 px-3 font-semibold border-b-2 transition ${
                filterCategory === 'tanda_baca'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Tanda Baca ({allIssues.filter((i) => i.category === 'tanda_baca').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('spasi_ganda')}
              className={`pb-2.5 px-3 font-semibold border-b-2 transition ${
                filterCategory === 'spasi_ganda'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Spasi / Tipografi ({allIssues.filter((i) => i.category === 'spasi_ganda').length})
            </button>
          </div>
        )}

        {/* Issue List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-12">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                Naskah Soal Bersih & Baku
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tidak ditemukan kesalahan ejaan, istilah tidak baku, atau kesalahan penulisan awalan 'di' pada naskah soal ini.
              </p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-2xs transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      Soal #{issue.nomorSoal}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {issue.fieldLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                      {issue.categoryLabel}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFixSingle(issue)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition"
                  >
                    <Check className="h-3 w-3" />
                    Perbaiki
                  </button>
                </div>

                {/* Word Comparison */}
                <div className="flex items-center gap-2 my-2 p-2.5 bg-slate-50 rounded-lg text-xs">
                  <span className="line-through text-rose-600 font-semibold px-2 py-0.5 bg-rose-50 rounded">
                    {issue.wordFound}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="text-emerald-700 font-bold px-2 py-0.5 bg-emerald-100 rounded">
                    {issue.replacementWord}
                  </span>
                </div>

                {/* Explanation */}
                <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{issue.ruleExplanation}</span>
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Kamus baku disesuaikan dengan Pedoman Umum Ejaan Bahasa Indonesia (PUEBI) & KBBI Kemendikbudristek.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
