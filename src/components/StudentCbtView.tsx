import React, { useState } from 'react';
import { EvaluationKit } from '../types/assessment';
import { VisualDiagramBox } from './VisualDiagramBox';
import { extractQuestionImageData } from '../utils/imageDetector';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Award,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface StudentCbtViewProps {
  kit: EvaluationKit;
}

export const StudentCbtView: React.FC<StudentCbtViewProps> = ({ kit }) => {
  // Student answer state
  const [studentAnswers, setStudentAnswers] = useState<Record<number, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [essayScores, setEssayScores] = useState<Record<number, number>>({});

  const handlePgSelect = (nomorSoal: number, optionLetter: string) => {
    if (isSubmitted) return;
    setStudentAnswers((prev) => ({
      ...prev,
      [nomorSoal]: optionLetter,
    }));
  };

  const handlePgkToggle = (nomorSoal: number, optionLetter: string) => {
    if (isSubmitted) return;
    const current: string[] = studentAnswers[nomorSoal] || [];
    const exists = current.includes(optionLetter);
    const updated = exists
      ? current.filter((x) => x !== optionLetter)
      : [...current, optionLetter];
    setStudentAnswers((prev) => ({
      ...prev,
      [nomorSoal]: updated,
    }));
  };

  const handleBsSelect = (nomorSoal: number, val: 'Benar' | 'Salah') => {
    if (isSubmitted) return;
    setStudentAnswers((prev) => ({
      ...prev,
      [nomorSoal]: val,
    }));
  };

  const handleMatchingSelect = (
    nomorSoal: number,
    colAIndex: number,
    selectedB: string
  ) => {
    if (isSubmitted) return;
    const current = studentAnswers[nomorSoal] || {};
    setStudentAnswers((prev) => ({
      ...prev,
      [nomorSoal]: {
        ...current,
        [colAIndex]: selectedB,
      },
    }));
  };

  const handleEssayChange = (nomorSoal: number, text: string) => {
    if (isSubmitted) return;
    setStudentAnswers((prev) => ({
      ...prev,
      [nomorSoal]: text,
    }));
  };

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    // Fire celebratory confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleResetExam = () => {
    setStudentAnswers({});
    setEssayScores({});
    setIsSubmitted(false);
  };

  // Calculate scores
  let objectiveTotalItems = 0;
  let objectiveCorrectItems = 0;

  kit.soal_evaluasi.forEach((soal) => {
    if (soal.bentuk_soal !== 'Uraian') {
      objectiveTotalItems++;
      const userAns = studentAnswers[soal.nomor_soal];
      const keyObj = kit.kunci_dan_lembar_jawab.find(
        (k) => k.nomor_soal === soal.nomor_soal
      );
      const keyText = keyObj?.kunci_jawaban || '';

      if (soal.bentuk_soal === 'Pilihan Ganda') {
        const correctLetter = keyText.trim().charAt(0).toUpperCase();
        if (userAns && userAns.toUpperCase() === correctLetter) {
          objectiveCorrectItems++;
        }
      } else if (soal.bentuk_soal.includes('Kompleks')) {
        // Check if chosen array matches letters in key
        const lettersInKey = ['A', 'B', 'C', 'D', 'E'].filter((char) =>
          keyText.toUpperCase().includes(char)
        );
        const userArr = (userAns as string[]) || [];
        const isMatch =
          lettersInKey.length > 0 &&
          userArr.length === lettersInKey.length &&
          lettersInKey.every((l) => userArr.includes(l));
        if (isMatch) objectiveCorrectItems++;
      } else if (soal.bentuk_soal === 'Benar / Salah') {
        const isTrue = keyText.toLowerCase().includes('benar');
        const expected = isTrue ? 'Benar' : 'Salah';
        if (userAns === expected) objectiveCorrectItems++;
      } else if (soal.bentuk_soal === 'Menjodohkan') {
        // Approximate matching
        if (userAns && Object.keys(userAns).length > 0) {
          objectiveCorrectItems += 0.5; // partial credit representation
        }
      }
    }
  });

  const estimatedScore =
    objectiveTotalItems > 0
      ? Math.round((objectiveCorrectItems / objectiveTotalItems) * 100)
      : 100;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <GraduationCap className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Simulasi Ujian Peserta Didik (CBT Mode Interaktif)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Uji coba langsung pengerjaan soal secara interaktif dengan sistem koreksi dan pembahasan instan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSubmitted ? (
            <button
              type="button"
              onClick={handleResetExam}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Ulangi Simulasi
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitExam}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              Selesai & Kumpulkan Jawaban
            </button>
          )}
        </div>
      </div>

      {/* Result Card when Submitted */}
      {isSubmitted && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-lg animate-fadeIn">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Award className="h-8 w-8 text-amber-300" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Hasil Evaluasi Belajar Peserta Didik
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  Skor Asesmen: {estimatedScore} / 100
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Benar {Math.floor(objectiveCorrectItems)} dari {objectiveTotalItems} butir soal objektif.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold">
                Status Capaian: {estimatedScore >= 75 ? '✓ Tuntas Kriteria' : 'Perlu Bimbingan Remedial'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Question Items in CBT Mode */}
      <div className="space-y-6">
        {kit.soal_evaluasi.map((soal) => {
          const userAns = studentAnswers[soal.nomor_soal];
          const keyObj = kit.kunci_dan_lembar_jawab.find(
            (k) => k.nomor_soal === soal.nomor_soal
          );

          // Universal Image & Visual Context Detection
          const {
            hasImage,
            imageDescription,
            cleanedStimulus,
            cleanedPertanyaan,
            customImageUrl,
          } = extractQuestionImageData(soal);

          return (
            <div
              key={soal.nomor_soal}
              className={`p-5 sm:p-6 rounded-xl border transition ${
                isSubmitted
                  ? 'border-slate-300 bg-white'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              } shadow-2xs`}
            >
              {/* Soal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs">
                    {soal.nomor_soal}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {soal.bentuk_soal}
                  </span>
                </div>

                {isSubmitted && keyObj && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    Kunci: {keyObj.kunci_jawaban.length > 20 ? keyObj.kunci_jawaban.substring(0, 18) + '...' : keyObj.kunci_jawaban}
                  </span>
                )}
              </div>

              {/* Stimulus */}
              {cleanedStimulus && (
                <div className="p-3 bg-slate-50 border-l-4 border-emerald-500 rounded-r-lg text-xs sm:text-sm text-slate-800 mb-3 leading-relaxed">
                  {cleanedStimulus}
                </div>
              )}

              {/* Diagram Ilustrasi Nyaman Dilihat */}
              {hasImage && (
                <VisualDiagramBox
                  description={imageDescription || cleanedPertanyaan}
                  nomorSoal={soal.nomor_soal}
                  imageUrl={customImageUrl}
                  size="medium"
                />
              )}

              {/* Question */}
              <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-4 leading-relaxed">
                {cleanedPertanyaan}
              </p>

              {/* Interactive Inputs based on Bentuk Soal */}
              {soal.bentuk_soal === 'Pilihan Ganda' && soal.opsi_jawaban && (
                <div className="space-y-2">
                  {soal.opsi_jawaban.map((opsi, optIdx) => {
                    const letter = opsi.trim().charAt(0).toUpperCase();
                    const isSelected = userAns === letter;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => handlePgSelect(soal.nomor_soal, letter)}
                        className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-medium'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold border transition ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 text-slate-500'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="leading-snug">{opsi}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {soal.bentuk_soal.includes('Kompleks') && soal.opsi_jawaban && (
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-slate-800 mb-1">
                    {soal.petunjuk_khusus || 'Berilah tanda centang () pada 3 jawaban yang tepat!'}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-300 text-xs sm:text-sm">
                      <tbody>
                        {soal.opsi_jawaban.map((opsi, optIdx) => {
                          const letter = opsi.trim().charAt(0).toUpperCase();
                          const currentArr: string[] = userAns || [];
                          const isChecked = currentArr.includes(letter);
                          return (
                            <tr
                              key={optIdx}
                              onClick={() => !isSubmitted && handlePgkToggle(soal.nomor_soal, letter)}
                              className={`border border-slate-300 cursor-pointer transition ${
                                isChecked ? 'bg-amber-50/70 font-semibold' : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="w-12 border-r border-slate-300 p-2.5 text-center align-middle bg-white">
                                <span
                                  className={`inline-flex items-center justify-center w-5 h-5 border rounded text-xs font-bold transition ${
                                    isChecked
                                      ? 'border-amber-600 bg-amber-600 text-white'
                                      : 'border-slate-400 bg-white'
                                  }`}
                                >
                                  {isChecked ? '✓' : ''}
                                </span>
                              </td>
                              <td className="p-2.5 text-slate-900 align-middle">
                                {opsi}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {soal.bentuk_soal === 'Benar / Salah' && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-300 text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="p-2.5 border border-slate-300 text-center w-3/4">
                          Kalimat/Pernyataan
                        </th>
                        <th className="p-2.5 border border-slate-300 text-center w-1/4">
                          Benar atau Salah
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {soal.pernyataan_benar_salah && soal.pernyataan_benar_salah.length > 0 ? (
                        soal.pernyataan_benar_salah.map((row, rIdx) => {
                          const currentAns = userAns && userAns[row.nomor];
                          return (
                            <tr key={rIdx} className="border border-slate-300">
                              <td className="p-2.5 border border-slate-300 text-slate-900 font-medium">
                                {row.nomor}. {row.kalimat}
                              </td>
                              <td className="p-2.5 border border-slate-300 text-center">
                                <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
                                  <button
                                    type="button"
                                    disabled={isSubmitted}
                                    onClick={() =>
                                      handleBsSelect(soal.nomor_soal, {
                                        ...(userAns || {}),
                                        [row.nomor]: 'Benar',
                                      } as any)
                                    }
                                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                                      currentAns === 'Benar'
                                        ? 'bg-emerald-600 text-white shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    Benar
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isSubmitted}
                                    onClick={() =>
                                      handleBsSelect(soal.nomor_soal, {
                                        ...(userAns || {}),
                                        [row.nomor]: 'Salah',
                                      } as any)
                                    }
                                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                                      currentAns === 'Salah'
                                        ? 'bg-rose-600 text-white shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    Salah
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr className="border border-slate-300">
                          <td className="p-2.5 border border-slate-300 text-slate-900 font-medium">
                            1. {soal.pertanyaan.replace(/^Pernyataan:\s*/i, '')}
                          </td>
                          <td className="p-2.5 border border-slate-300 text-center">
                            <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
                              <button
                                type="button"
                                disabled={isSubmitted}
                                onClick={() => handleBsSelect(soal.nomor_soal, 'Benar')}
                                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                                  userAns === 'Benar'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Benar
                              </button>
                              <button
                                type="button"
                                disabled={isSubmitted}
                                onClick={() => handleBsSelect(soal.nomor_soal, 'Salah')}
                                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                                  userAns === 'Salah'
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Salah
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {soal.bentuk_soal === 'Menjodohkan' && soal.pasangan_menjodohkan && (
                <div className="mt-3 space-y-3">
                  <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-block">
                    Pilih pasangan yang cocok untuk setiap baris di Kolom A:
                  </span>
                  <div className="space-y-2.5">
                    {soal.pasangan_menjodohkan.kolom_a.map((itemA, idxA) => {
                      const selectedVal = (userAns && userAns[idxA]) || '';
                      return (
                        <div
                          key={idxA}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200"
                        >
                          <span className="text-xs sm:text-sm font-medium text-slate-800 sm:w-1/2">
                            {itemA}
                          </span>
                          <div className="flex items-center gap-1.5 sm:w-1/2">
                            <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0 hidden sm:block" />
                            <select
                              disabled={isSubmitted}
                              value={selectedVal}
                              onChange={(e) =>
                                handleMatchingSelect(
                                  soal.nomor_soal,
                                  idxA,
                                  e.target.value
                                )
                              }
                              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                            >
                              <option value="">-- Pasangkan Pilihan --</option>
                              {soal.pasangan_menjodohkan?.kolom_b.map(
                                (itemB, idxB) => (
                                  <option key={idxB} value={itemB}>
                                    {itemB}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {soal.bentuk_soal === 'Uraian' && (
                <div className="mt-3">
                  <textarea
                    rows={4}
                    disabled={isSubmitted}
                    value={userAns || ''}
                    onChange={(e) => handleEssayChange(soal.nomor_soal, e.target.value)}
                    placeholder="Tuliskan analisis atau jawaban uraian Anda di sini..."
                    className="w-full p-3 border border-slate-300 rounded-xl text-xs sm:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>
              )}

              {/* Feedback and Explanation when Submitted */}
              {isSubmitted && keyObj && (
                <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50 p-3.5 rounded-xl text-xs space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    Pembahasan Kunci Jawaban:
                  </div>
                  <p className="text-slate-700 leading-relaxed font-sans">{keyObj.pembahasan}</p>
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="font-bold text-indigo-900 block mb-0.5">
                      Rubrik Penilaian:
                    </span>
                    <p className="text-slate-600 whitespace-pre-line">{keyObj.rubrik_penskoran}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
