import React, { useState, useRef } from 'react';
import {
  AssessmentParams,
  EvaluationKit,
  KisiKisiItem,
  KunciDanLembarJawabItem,
  SoalEvaluasiItem,
  SchoolMetadata,
} from './types/assessment';
import { CURRICULUM_PRESETS, INITIAL_SAMPLE_KIT } from './data/presets';
import { Navbar, ActiveTab } from './components/Navbar';
import { ParameterForm } from './components/ParameterForm';
import { NaskahSoalView } from './components/NaskahSoalView';
import { KisiKisiView } from './components/KisiKisiView';
import { KunciRubrikView } from './components/KunciRubrikView';
import { StudentCbtView } from './components/StudentCbtView';
import { JsonViewModal } from './components/JsonViewModal';
import { BankSoalModal } from './components/BankSoalModal';
import { GenerationProgressModal } from './components/GenerationProgressModal';
import { MenuCetakModal } from './components/MenuCetakModal';
import { PrintableDocumentType } from './utils/printEngine';
import { saveAssessmentToBankSoal } from './services/bankSoalService';
import { exportToWordDocument } from './utils/exportUtils';
import {
  CheckCircle,
  AlertCircle,
  Wand2,
  Layers,
  FileText,
  Table2,
  KeyRound,
  Download,
  Info,
  Sparkles,
  Archive,
  BookmarkPlus,
} from 'lucide-react';

export default function App() {
  const initialPreset = CURRICULUM_PRESETS[0];

  const [params, setParams] = useState<AssessmentParams>({
    levelKelas: initialPreset.levelKelas,
    mataPelajaran: initialPreset.mataPelajaran,
    capaianPembelajaran: initialPreset.capaianPembelajaran,
    tujuanPembelajaran: initialPreset.tujuanPembelajaran,
    totalSoal: initialPreset.distribution.totalSoal,
    jumlahHots: initialPreset.distribution.jumlahHots,
    gunakanGambar: initialPreset.distribution.gunakanGambar,
    jumlahPg: initialPreset.distribution.jumlahPg,
    jumlahOpsiPg: initialPreset.distribution.jumlahOpsiPg,
    jumlahPgk: initialPreset.distribution.jumlahPgk,
    konfigurasiPgk: initialPreset.distribution.konfigurasiPgk,
    jumlahMenjodohkan: initialPreset.distribution.jumlahMenjodohkan,
    jumlahBs: initialPreset.distribution.jumlahBs,
    jumlahUraian: initialPreset.distribution.jumlahUraian,
    schoolInfo: {
      namaSekolah: 'SD Negeri Cerdas Bangsa 01',
      dinasPendidikan: 'Dinas Pendidikan dan Kebudayaan',
      namaPemerintah: 'Kabupaten / Kota',
      namaAsesmen: 'Asesmen Sumatif Lingkup Materi',
      tahunPelajaran: '2026/2027',
      semester: 'Ganjil',
      alokasiWaktu: '90 Menit',
      namaGuru: 'Yuliono, S.Pd.',
      nipGuru: '19880415 201101 1 002',
      namaKepalaSekolah: 'Dr. H. Ahmad Fauzi, M.Pd.',
      nipKepalaSekolah: '19750812 200003 1 004',
    },
  });

  const [kit, setKit] = useState<EvaluationKit>({
    ...INITIAL_SAMPLE_KIT,
    paramsSnapshot: { ...params },
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('parameter');
  const [showAllComponents, setShowAllComponents] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBankSoalOpen, setIsBankSoalOpen] = useState(false);
  const [isSavingBankSoal, setIsSavingBankSoal] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printDocType, setPrintDocType] = useState<PrintableDocumentType>('naskah');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>({
    type: 'info',
    message:
      'Perangkat contoh Kurikulum Merdeka Fase B (IPAS Kelas 4) telah dimuat. Anda dapat langsung mengedit, mencetak, atau menyusun naskah baru dengan tombol di bawah.',
  });

  const handleSaveToBankSoal = async () => {
    setIsSavingBankSoal(true);
    try {
      const title = `${params.mataPelajaran} - ${params.levelKelas} (${params.schoolInfo.tahunPelajaran})`;
      const result = await saveAssessmentToBankSoal(kit, title, params.schoolInfo);
      setNotification({
        type: 'success',
        message: `Naskah "${title}" berhasil disimpan ke Bank Soal ${result.source === 'firestore' ? 'Firebase Cloud' : 'Lokal'}! Siap digunakan untuk tahun ajaran mendatang.`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Gagal menyimpan ke Bank Soal.',
      });
    } finally {
      setIsSavingBankSoal(false);
    }
  };

  const handleLoadFromBankSoal = (
    loadedKit: EvaluationKit,
    loadedSchoolInfo: SchoolMetadata,
    targetTab: ActiveTab = 'naskah'
  ) => {
    setKit(loadedKit);
    if (loadedKit.paramsSnapshot) {
      setParams({
        ...loadedKit.paramsSnapshot,
        schoolInfo: loadedSchoolInfo || loadedKit.paramsSnapshot.schoolInfo,
      });
    }
    setActiveTab(targetTab);
    setNotification({
      type: 'success',
      message:
        targetTab === 'kunci-rubrik'
          ? 'Kunci jawaban dan rubrik penskoran analitik berhasil dimuat dan siap digunakan dalam penilaian!'
          : 'Perangkat asesmen berhasil dimuat dari Bank Soal!',
    });
  };

  const handleLoadPreset = (presetId: string) => {
    const found = CURRICULUM_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setParams((prev) => ({
        ...prev,
        levelKelas: found.levelKelas,
        mataPelajaran: found.mataPelajaran,
        capaianPembelajaran: found.capaianPembelajaran,
        tujuanPembelajaran: found.tujuanPembelajaran,
        totalSoal: found.distribution.totalSoal,
        jumlahHots: found.distribution.jumlahHots,
        gunakanGambar: found.distribution.gunakanGambar,
        jumlahPg: found.distribution.jumlahPg,
        jumlahOpsiPg: found.distribution.jumlahOpsiPg,
        jumlahPgk: found.distribution.jumlahPgk,
        konfigurasiPgk: found.distribution.konfigurasiPgk,
        jumlahMenjodohkan: found.distribution.jumlahMenjodohkan,
        jumlahBs: found.distribution.jumlahBs,
        jumlahUraian: found.distribution.jumlahUraian,
      }));
      setNotification({
        type: 'success',
        message: `Template "${found.title}" berhasil dimuat. Parameter telah disesuaikan.`,
      });
    }
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleCancelGenerate = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setNotification({
      type: 'info',
      message: 'Proses penyusunan soal telah dibatalkan.',
    });
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setNotification(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/generate-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Gagal menghasilkan perangkat evaluasi dari model AI.'
        );
      }

      const generatedData = result.data;

      // Validate core elements
      if (
        !generatedData.kisi_kisi ||
        !generatedData.soal_evaluasi ||
        !generatedData.kunci_dan_lembar_jawab
      ) {
        throw new Error('Format respon model tidak lengkap.');
      }

      const updatedKit: EvaluationKit = {
        kisi_kisi: generatedData.kisi_kisi,
        soal_evaluasi: generatedData.soal_evaluasi,
        kunci_dan_lembar_jawab: generatedData.kunci_dan_lembar_jawab,
        paramsSnapshot: { ...params },
      };

      setKit(updatedKit);
      setActiveTab('naskah');
      setNotification({
        type: 'success',
        message: `Berhasil menyusun ${params.totalSoal} butir soal Kurikulum Merdeka beserta Matriks Kisi-Kisi dan Lembar Rubrik!`,
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted by user');
        return;
      }
      console.error('Error generating evaluation kit:', err);
      setNotification({
        type: 'error',
        message:
          err.message ||
          'Terjadi kesalahan saat memproses permintaan. Periksa koneksi API Anda.',
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleExportWord = () => {
    exportToWordDocument(kit, params.schoolInfo);
    setNotification({
      type: 'success',
      message: 'Dokumen Word (.doc) berhasil diekspor dengan Kop Surat Sekolah.',
    });
  };

  const handleOpenPrintModal = (docType?: PrintableDocumentType) => {
    if (docType) {
      setPrintDocType(docType);
    } else if (activeTab === 'kisi-kisi') {
      setPrintDocType('kisi-kisi');
    } else if (activeTab === 'kunci-rubrik') {
      setPrintDocType('kunci-rubrik');
    } else {
      setPrintDocType('bundel-lengkap');
    }
    setIsPrintModalOpen(true);
  };

  const handlePrint = () => {
    handleOpenPrintModal();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportWord={handleExportWord}
        onPrint={handlePrint}
        onOpenBankSoal={() => setIsBankSoalOpen(true)}
        onSaveToBankSoal={handleSaveToBankSoal}
        hasKit={Boolean(kit && kit.soal_evaluasi.length > 0)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0 print:m-0">
        {/* Notification Toast Banner (hidden when printing) */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-start gap-3 shadow-2xs print:hidden animate-fadeIn ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : notification.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-sky-50 border-sky-200 text-sky-900'
            }`}
          >
            {notification.type === 'success' && (
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            {notification.type === 'error' && (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            {notification.type === 'info' && (
              <Info className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
              {notification.message}
            </div>

            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-xs font-bold opacity-60 hover:opacity-100 px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Global Toolbar for quick toggling view all components */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Mata Pelajaran:</span>
            <span className="font-bold text-slate-800">
              {params.mataPelajaran} ({params.levelKelas})
            </span>
            <span className="text-slate-300">|</span>
            <span>Total:</span>
            <span className="font-bold text-slate-800">{kit.soal_evaluasi.length} Soal</span>
            <span className="text-slate-300">|</span>
            <span>HOTS:</span>
            <span className="font-bold text-amber-700">
              {kit.kisi_kisi.filter((k) => k.kategori_hots).length} Soal
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAllComponents(!showAllComponents)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg border transition ${
              showAllComponents
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            {showAllComponents ? 'Tutup Tampilan Lengkap' : 'Lihat 3 Komponen Sekaligus'}
          </button>
        </div>

        {/* Multi-Component View if user wants to see everything at once */}
        {showAllComponents ? (
          <div className="space-y-12">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between print:hidden">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-700" />
                Mode Tinjauan Lengkap: Menampilkan Komponen 1 (Naskah), Komponen 2 (Kisi-Kisi), dan Komponen 3 (Kunci & Rubrik) secara berurutan.
              </span>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1 bg-amber-700 text-white rounded font-bold hover:bg-amber-800"
              >
                Cetak Seluruh Perangkat
              </button>
            </div>

            <section>
              <NaskahSoalView
                kit={kit}
                schoolInfo={params.schoolInfo}
                onPrint={handlePrint}
                onSaveToBankSoal={handleSaveToBankSoal}
                isSavingBankSoal={isSavingBankSoal}
                onNavigateToKunciRubrik={() => setActiveTab('kunci-rubrik')}
                onUpdateSoal={(updated) => setKit((prev) => ({ ...prev, soal_evaluasi: updated }))}
              />
            </section>

            <section className="print:break-before-page">
              <KisiKisiView
                kit={kit}
                schoolInfo={params.schoolInfo}
                onPrint={handlePrint}
                onUpdateKisiKisi={(updated) => setKit((prev) => ({ ...prev, kisi_kisi: updated }))}
              />
            </section>

            <section className="print:break-before-page">
              <KunciRubrikView
                kit={kit}
                schoolInfo={params.schoolInfo}
                onPrint={handlePrint}
                onLoadKit={handleLoadFromBankSoal}
                onUpdateKunci={(updated) =>
                  setKit((prev) => ({ ...prev, kunci_dan_lembar_jawab: updated }))
                }
              />
            </section>
          </div>
        ) : (
          /* Single Tab Views */
          <div>
            {activeTab === 'parameter' && (
              <ParameterForm
                params={params}
                setParams={setParams}
                onGenerate={handleGenerate}
                isLoading={isLoading}
                onLoadPreset={handleLoadPreset}
              />
            )}

            {activeTab === 'naskah' && (
              <NaskahSoalView
                kit={kit}
                schoolInfo={params.schoolInfo}
                onPrint={() => handleOpenPrintModal('naskah')}
                onSaveToBankSoal={handleSaveToBankSoal}
                isSavingBankSoal={isSavingBankSoal}
                onNavigateToKunciRubrik={() => setActiveTab('kunci-rubrik')}
                onUpdateSoal={(updated) =>
                  setKit((prev) => ({ ...prev, soal_evaluasi: updated }))
                }
              />
            )}

            {activeTab === 'kisi-kisi' && (
              <KisiKisiView
                kit={kit}
                schoolInfo={params.schoolInfo}
                onPrint={() => handleOpenPrintModal('kisi-kisi')}
                onUpdateKisiKisi={(updated) =>
                  setKit((prev) => ({ ...prev, kisi_kisi: updated }))
                }
              />
            )}

            {activeTab === 'kunci-rubrik' && (
              <KunciRubrikView
                kit={kit}
                schoolInfo={params.schoolInfo}
                onPrint={() => handleOpenPrintModal('kunci-rubrik')}
                onLoadKit={handleLoadFromBankSoal}
                onUpdateKunci={(updated) =>
                  setKit((prev) => ({ ...prev, kunci_dan_lembar_jawab: updated }))
                }
              />
            )}

            {activeTab === 'simulasi' && <StudentCbtView kit={kit} />}

            {activeTab === 'json' && (
              <JsonViewModal
                kit={kit}
                onImportJson={(imported) => {
                  setKit({
                    ...imported,
                    paramsSnapshot: { ...params },
                  });
                  setNotification({
                    type: 'success',
                    message: 'JSON perangkat evaluasi berhasil diimpor ke aplikasi!',
                  });
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Bank Soal Modal */}
      <BankSoalModal
        isOpen={isBankSoalOpen}
        onClose={() => setIsBankSoalOpen(false)}
        onLoadKit={handleLoadFromBankSoal}
        currentKit={kit}
        currentSchoolInfo={params.schoolInfo}
        onSavedNotification={(msg) =>
          setNotification({ type: 'success', message: msg })
        }
      />

      {/* Real-time Generation Progress Modal */}
      <GenerationProgressModal
        isOpen={isLoading}
        onCancel={handleCancelGenerate}
        totalSoal={params.totalSoal}
        mataPelajaran={params.mataPelajaran}
        levelKelas={params.levelKelas}
      />

      {/* Official Exam Document Print Center Modal */}
      <MenuCetakModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        kit={kit}
        schoolInfo={params.schoolInfo}
        initialDocType={printDocType}
      />

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Pakar Evaluasi Pembelajaran &bull; Standar Kurikulum Merdeka Kemendikbudristek RI
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Taksonomi Bloom Revisi (C1-C6)</span>
            <span>&bull;</span>
            <span>HOTS & Formatif/Sumatif</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
