export type LevelKognitif = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';

export type BentukSoal =
  | 'Pilihan Ganda'
  | 'Pilihan Ganda Kompleks'
  | 'Menjodohkan'
  | 'Benar / Salah'
  | 'Uraian';

export type OpsiPgFormat = '4 Opsi [A-D]' | '5 Opsi [A-E]';

export type KonfigurasiPgkFormat =
  | '3 opsi dengan 2 jawaban benar'
  | '4 opsi dengan 3 jawaban benar'
  | '5 opsi dengan 3 jawaban benar';

export interface SchoolMetadata {
  namaSekolah: string;
  namaPemerintah?: string;
  dinasPendidikan?: string;
  namaAsesmen: string;
  tahunPelajaran: string;
  semester: 'Ganjil' | 'Genap';
  alokasiWaktu: string;
  namaGuru: string;
  nipGuru: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
}

export interface AssessmentParams {
  levelKelas: string;
  mataPelajaran: string;
  capaianPembelajaran: string;
  tujuanPembelajaran: string;
  totalSoal: number;
  jumlahHots: number;
  gunakanGambar: 'Ya' | 'Tidak';
  jumlahPg: number;
  jumlahOpsiPg: OpsiPgFormat;
  jumlahPgk: number;
  konfigurasiPgk: KonfigurasiPgkFormat;
  jumlahMenjodohkan: number;
  jumlahBs: number;
  jumlahUraian: number;
  schoolInfo: SchoolMetadata;
}

export interface KisiKisiItem {
  nomor_soal: number;
  bentuk_soal: BentukSoal | string;
  materi_pokok: string;
  indikator_soal: string;
  level_kognitif: LevelKognitif | string;
  kategori_hots: boolean;
}

export interface SoalEvaluasiItem {
  nomor_soal: number;
  bentuk_soal: BentukSoal | string;
  membutuhkan_gambar: boolean;
  stimulus: string;
  pertanyaan: string;
  petunjuk_khusus?: string;
  opsi_jawaban?: string[];
  pasangan_menjodohkan?: {
    kolom_a: string[];
    kolom_b: string[];
  };
  pernyataan_benar_salah?: {
    nomor: number;
    kalimat: string;
    status?: string;
  }[];
}

export interface RubrikKriteriaUraian {
  skor: number;
  predikat: string;
  deskriptor: string;
  kata_kunci?: string[];
}

export interface RubrikDetailUraian {
  nomor_soal: number;
  skor_maksimal: number;
  bobot_persen?: number;
  indikator_pencapaian?: string;
  kata_kunci_wajib?: string[];
  kriteria: RubrikKriteriaUraian[];
  contoh_jawaban_ideal?: string;
  petunjuk_penilai?: string;
}

export interface KunciDanLembarJawabItem {
  nomor_soal: number;
  bentuk_soal: BentukSoal | string;
  kunci_jawaban: string;
  pembahasan: string;
  rubrik_penskoran: string;
  rubrik_detail?: RubrikDetailUraian;
}

export interface EvaluationKit {
  kisi_kisi: KisiKisiItem[];
  soal_evaluasi: SoalEvaluasiItem[];
  kunci_dan_lembar_jawab: KunciDanLembarJawabItem[];
  paramsSnapshot?: AssessmentParams;
}

export interface PresetCurriculum {
  id: string;
  title: string;
  fase: string;
  levelKelas: string;
  mataPelajaran: string;
  capaianPembelajaran: string;
  tujuanPembelajaran: string;
  distribution: {
    totalSoal: number;
    jumlahHots: number;
    gunakanGambar: 'Ya' | 'Tidak';
    jumlahPg: number;
    jumlahOpsiPg: OpsiPgFormat;
    jumlahPgk: number;
    konfigurasiPgk: KonfigurasiPgkFormat;
    jumlahMenjodohkan: number;
    jumlahBs: number;
    jumlahUraian: number;
  };
}
