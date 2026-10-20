import React, { useState, useEffect } from 'react';
import {
  BankSoalRecord,
  fetchBankSoalList,
  deleteBankSoalRecord,
  saveAssessmentToBankSoal,
  updateBankSoalRecordKit,
} from '../services/bankSoalService';
import { EvaluationKit, SchoolMetadata } from '../types/assessment';
import { exportToWordDocument } from '../utils/exportUtils';
import { generateKunciDanRubrikOtomatis } from '../services/rubrikGeneratorService';
import {
  Archive,
  Search,
  Calendar,
  Layers,
  Trash2,
  FileDown,
  ArrowRight,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  X,
  PlusCircle,
  GitCompare,
  CheckSquare,
  Square,
  KeyRound,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { BankSoalComparisonView } from './BankSoalComparisonView';

interface BankSoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadKit: (kit: EvaluationKit, schoolInfo: SchoolMetadata, targetTab?: 'naskah' | 'kunci-rubrik') => void;
  currentKit?: EvaluationKit;
  currentSchoolInfo?: SchoolMetadata;
  onSavedNotification?: (msg: string) => void;
}

export const BankSoalModal: React.FC<BankSoalModalProps> = ({
  isOpen,
  onClose,
  onLoadKit,
  currentKit,
  currentSchoolInfo,
  onSavedNotification,
}) => {
  const [records, setRecords] = useState<BankSoalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMapel, setFilterMapel] = useState('Semua');

  // Comparison feature state
  const [isComparing, setIsComparing] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareInitialA, setCompareInitialA] = useState<string | undefined>();
  const [compareInitialB, setCompareInitialB] = useState<string | undefined>();

  const toggleSelectForCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleOpenComparison = (idA?: string, idB?: string) => {
    if (idA && idB) {
      setCompareInitialA(idA);
      setCompareInitialB(idB);
    } else if (selectedForCompare.length === 2) {
      setCompareInitialA(selectedForCompare[0]);
      setCompareInitialB(selectedForCompare[1]);
    } else if (selectedForCompare.length === 1 && records.length > 1) {
      setCompareInitialA(selectedForCompare[0]);
      const other = records.find((r) => r.id !== selectedForCompare[0]);
      setCompareInitialB(other ? other.id : undefined);
    } else if (records.length >= 2) {
      setCompareInitialA(records[0].id);
      setCompareInitialB(records[1].id);
    } else {
      setCompareInitialA(records[0]?.id);
      setCompareInitialB(undefined);
    }
    setIsComparing(true);
  };

  // New Save form state inside modal
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Rubric generation state for bank soal items
  const [generatingRubricId, setGeneratingRubricId] = useState<string | null>(null);

  const handleGenerateRubrikForRecord = async (record: BankSoalRecord) => {
    setGeneratingRubricId(record.id);
    try {
      const updatedKunci = await generateKunciDanRubrikOtomatis(
        record.kit.soal_evaluasi,
        record.kit.kisi_kisi,
        {
          mataPelajaran: record.mataPelajaran,
          levelKelas: record.levelKelas,
          skorMaksimalUraian: 4,
        }
      );

      const updatedKit: EvaluationKit = {
        ...record.kit,
        kunci_dan_lembar_jawab: updatedKunci,
      };

      await updateBankSoalRecordKit(record.id, updatedKit);

      setRecords((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, kit: updatedKit } : r))
      );

      onLoadKit(updatedKit, record.schoolInfo, 'kunci-rubrik');
      onClose();

      if (onSavedNotification) {
        onSavedNotification(
          `Kunci jawaban dan rubrik analitik untuk "${record.judul}" berhasil disusun dan dibuka di tab Kunci & Rubrik!`
        );
      }
    } catch (err: any) {
      console.error('Error generating rubric for bank record:', err);
      alert('Gagal menghasilkan kunci dan rubrik: ' + (err?.message || 'Terjadi kesalahan'));
    } finally {
      setGeneratingRubricId(null);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchBankSoalList();
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (currentKit && currentSchoolInfo) {
        setSaveTitle(
          `${currentKit.paramsSnapshot?.mataPelajaran || 'Asesmen'} - ${currentKit.paramsSnapshot?.levelKelas || 'Kurikulum Merdeka'} (${currentSchoolInfo.tahunPelajaran || '2026/2027'})`
        );
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrentKit = async () => {
    if (!currentKit || !currentSchoolInfo) return;
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const result = await saveAssessmentToBankSoal(
        currentKit,
        saveTitle.trim(),
        currentSchoolInfo
      );
      setStatusMsg({
        type: 'success',
        text: `Berhasil disimpan ke Bank Soal ${result.source === 'firestore' ? 'Firebase Cloud' : 'Lokal'}! Siap digunakan untuk tahun ajaran mendatang.`,
      });
      if (onSavedNotification) {
        onSavedNotification(
          `Perangkat "${saveTitle}" berhasil disimpan ke Bank Soal Firebase!`
        );
      }
      setShowSaveDialog(false);
      await loadData();
    } catch (e: any) {
      setStatusMsg({
        type: 'error',
        text: e.message || 'Gagal menyimpan ke Bank Soal.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, judul: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus "${judul}" dari Bank Soal?`)) {
      await deleteBankSoalRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Filter records
  const filtered = records.filter((r) => {
    const matchSearch =
      r.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.levelKelas.toLowerCase().includes(searchQuery.toLowerCase());
    const matchMapel = filterMapel === 'Semua' || r.mataPelajaran === filterMapel;
    return matchSearch && matchMapel;
  });

  const uniqueMapels = Array.from(new Set(records.map((r) => r.mataPelajaran).filter(Boolean)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Bank Soal Asesmen Kurikulum Merdeka
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Cloud className="h-3 w-3" />
                  Firebase Terkoneksi
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Koleksi naskah soal tersimpan untuk digunakan kembali di tahun ajaran mendatang.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenComparison()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-xs"
              title="Buka Komparator & Analisis Evolusi Tingkat Kesulitan serta Sebaran Materi"
            >
              <GitCompare className="h-3.5 w-3.5" />
              Bandingkan 2 Asesmen
            </button>

            {currentKit && (
              <button
                type="button"
                onClick={() => setShowSaveDialog(!showSaveDialog)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Simpan Naskah Aktif Ini
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`px-6 py-3 text-xs flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-b border-rose-200'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{statusMsg.text}</span>
          </div>
        )}

        {/* Form Simpan Naskah Baru (Drawer) */}
        {showSaveDialog && currentKit && currentSchoolInfo && (
          <div className="p-4 bg-emerald-50/70 border-b border-emerald-200 text-xs">
            <h4 className="font-bold text-emerald-950 mb-1.5 flex items-center gap-1.5">
              <Database className="h-4 w-4 text-emerald-700" />
              Simpan Naskah Asesmen ke Database Bank Soal Firebase:
            </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Judul / Nama Perangkat Bank Soal..."
                className="flex-1 p-2 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-slate-900"
              />
              <button
                type="button"
                disabled={isSaving || !saveTitle.trim()}
                onClick={handleSaveCurrentKit}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs transition"
              >
                {isSaving ? 'Menyimpan...' : 'Konfirmasi Simpan'}
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, mapel, atau kelas..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Filter Mapel:</span>
            <select
              aria-label="Filter Mapel Bank Soal"
              value={filterMapel}
              onChange={(e) => setFilterMapel(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium"
            >
              <option value="Semua">Semua Mapel</option>
              {uniqueMapels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <div className="inline-block animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full mb-2"></div>
              <p>Memuat Bank Soal dari Firebase Cloud...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Archive className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600 text-sm">Belum Ada Soal di Bank Soal</p>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                Gunakan tombol <strong>"Simpan ke Bank Soal"</strong> pada naskah aktif untuk menyimpan bank soal tahunan ke database Firebase Anda.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedForCompare.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-200'
                      : 'border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* Checkbox for comparison selection */}
                    <button
                      type="button"
                      onClick={() => toggleSelectForCompare(item.id)}
                      title={isSelected ? 'Batalkan pilihan komparasi' : 'Pilih untuk perbandingan evolusi'}
                      className={`p-1 mt-0.5 rounded-md transition shrink-0 ${
                        isSelected ? 'text-indigo-600 bg-indigo-100' : 'text-slate-300 hover:text-slate-600'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-indigo-600" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{item.judul}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.levelKelas}
                        </span>
                        {item.source === 'firestore' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Cloud
                          </span>
                        )}
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-indigo-600 text-white">
                            Siap Dibandingkan
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Layers className="h-3.5 w-3.5 text-slate-400" />
                          {item.mataPelajaran}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Tahun Ajaran: {item.tahunAjaran} ({item.semester})
                        </span>
                        <span>
                          Total: <strong>{item.totalSoal} Soal</strong> ({item.jumlahHots} HOTS)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const other = records.find((r) => r.id !== item.id);
                        handleOpenComparison(item.id, other?.id);
                      }}
                      title="Bandingkan asesmen ini di Komparator Evolusi"
                      className="p-2 rounded-lg text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 border border-slate-200 transition"
                    >
                      <GitCompare className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => exportToWordDocument(item.kit, item.schoolInfo)}
                      title="Ekspor ke Microsoft Word (.doc)"
                      className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
                    >
                      <FileDown className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.judul)}
                      title="Hapus dari Bank Soal"
                      className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      disabled={generatingRubricId === item.id}
                      onClick={() => handleGenerateRubrikForRecord(item)}
                      title="Hasilkan atau buka Kunci Jawaban & Rubrik Penskoran Detail Otomatis"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition shadow-2xs disabled:opacity-50"
                    >
                      {generatingRubricId === item.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                          <span>Menyusun...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Kunci & Rubrik</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadKit(item.kit, item.schoolInfo);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-emerald-700 text-white transition shadow-xs"
                    >
                      Gunakan Soal Ini
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Floating Bar for Compare Selection */}
        {selectedForCompare.length > 0 && (
          <div className="mx-6 mb-3 p-3 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl flex items-center justify-between shadow-xl border border-indigo-700/60 animate-fadeIn text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold">
                <GitCompare className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-white">
                  {selectedForCompare.length} Perangkat Asesmen Terpilih
                </span>
                <p className="text-[11px] text-indigo-200">
                  {selectedForCompare.length === 1
                    ? 'Pilih 1 lagi untuk perbandingan langsung, atau klik tombol untuk membandingkan otomatis.'
                    : 'Siap membandingkan evolusi tingkat kesulitan dan sebaran materi.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedForCompare([])}
                className="px-2.5 py-1 text-xs text-indigo-300 hover:text-white transition"
              >
                Reset Pilihan
              </button>
              <button
                type="button"
                onClick={() => handleOpenComparison()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-xs"
              >
                Buka Tabel Perbandingan
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Total Naskah Tersimpan: <strong>{records.length}</strong> Perangkat
          </span>
          <span>Proyek Firebase: <code>yuliononurokhimclassjournal</code></span>
        </div>
      </div>

      {/* Comparison Modal Overlay */}
      {isComparing && (
        <BankSoalComparisonView
          records={records}
          currentKit={currentKit}
          currentSchoolInfo={currentSchoolInfo}
          initialSetAId={compareInitialA}
          initialSetBId={compareInitialB}
          onClose={() => setIsComparing(false)}
          onLoadKit={onLoadKit}
        />
      )}
    </div>
  );
};
