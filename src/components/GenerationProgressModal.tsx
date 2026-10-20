import React, { useState, useEffect } from 'react';
import { Wand2, Clock, CheckCircle2, Sparkles, X, Brain, Layers, Table2, ShieldCheck } from 'lucide-react';

interface GenerationProgressModalProps {
  isOpen: boolean;
  onCancel: () => void;
  totalSoal: number;
  mataPelajaran: string;
  levelKelas: string;
}

export const GenerationProgressModal: React.FC<GenerationProgressModalProps> = ({
  isOpen,
  onCancel,
  totalSoal,
  mataPelajaran,
  levelKelas,
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isOpen) {
      setSeconds(0);
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Derive progress steps based on elapsed seconds
  // With ThinkingLevel.MINIMAL/LOW, response typically takes 8-20 seconds
  const currentStep = seconds < 3 ? 1 : seconds < 8 ? 2 : seconds < 16 ? 3 : 4;
  const progressPercent = Math.min(95, Math.round(15 + seconds * 4.5));

  const steps = [
    {
      id: 1,
      title: 'Validasi Kurikulum & Capaian Pembelajaran',
      desc: `Menyelaraskan fase ${levelKelas} dengan Taksonomi Bloom`,
      icon: Brain,
    },
    {
      id: 2,
      title: 'Pembuatan Stimulus Kontekstual & Studi Kasus',
      desc: `Merancang narasi ilmiah dan penanganan visual untuk ${mataPelajaran}`,
      icon: Sparkles,
    },
    {
      id: 3,
      title: `Penyusunan ${totalSoal} Butir Soal Sesuai Layout Resmi`,
      desc: 'Membuat format Pilgan, Pilgan Kompleks, Menjodohkan, B/S & Uraian',
      icon: Layers,
    },
    {
      id: 4,
      title: 'Perumusan Matriks Kisi-Kisi & Rubrik Penskoran',
      desc: 'Menghitung alokasi skor analitik dan level kognitif HOTS',
      icon: Table2,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden p-6 sm:p-8">
        {/* Header Icon & Title */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <Wand2 className="h-6 w-6 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                AI Sedang Menyusun Perangkat Soal
              </h3>
              <p className="text-xs text-slate-500">
                {mataPelajaran} &bull; {levelKelas} ({totalSoal} butir)
              </p>
              {totalSoal > 12 && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Layers className="h-3 w-3" />
                  Multi-Batch Chunking Aktif ({Math.ceil(totalSoal / 10)} Klaster)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            {seconds}s
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mb-6 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-600 font-semibold">
            <span>Kemajuan Proses Generasi</span>
            <span className="text-emerald-700 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-600 to-teal-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          {totalSoal > 12 && (
            <p className="text-[11px] text-slate-500 italic text-center pt-1">
              Menyusun dan menggabungkan {totalSoal} butir soal secara berurutan agar lengkap tanpa terpotong...
            </p>
          )}
        </div>

        {/* Step-by-Step Status Items */}
        <div className="space-y-3 mb-6 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
          {steps.map((st) => {
            const isDone = currentStep > st.id;
            const isCurrent = currentStep === st.id;
            const Icon = st.icon;

            return (
              <div
                key={st.id}
                className={`flex items-start gap-3 p-2 rounded-xl transition ${
                  isCurrent
                    ? 'bg-white shadow-xs border border-emerald-200'
                    : isDone
                    ? 'opacity-80'
                    : 'opacity-40'
                }`}
              >
                <div
                  className={`mt-0.5 h-6 w-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-700 font-bold'
                      : isCurrent
                      ? 'bg-emerald-600 text-white font-bold animate-spin'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isCurrent ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-white"></span>
                  ) : (
                    <span>{st.id}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-emerald-950 font-extrabold'
                          : isDone
                          ? 'text-slate-800'
                          : 'text-slate-500'
                      }`}
                    >
                      {st.title}
                    </span>
                    {isCurrent && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                        Proses...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Helpful notice & Cancel button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 text-center sm:text-left">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Membuat 3 dokumen lengkap secara otomatis.</span>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200"
          >
            Batalkan Permintaan
          </button>
        </div>
      </div>
    </div>
  );
};
