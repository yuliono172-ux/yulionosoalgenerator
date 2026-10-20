import {
  EvaluationKit,
  KisiKisiItem,
  KunciDanLembarJawabItem,
  SchoolMetadata,
  SoalEvaluasiItem,
} from '../types/assessment';
import { extractQuestionImageData } from './imageDetector';
import { getSubjectVectorDiagram } from './vectorDiagrams';

export type PrintableDocumentType =
  | 'cover'
  | 'naskah'
  | 'kisi-kisi'
  | 'kunci-rubrik'
  | 'lembar-jawab'
  | 'penilaian-siswa'
  | 'bundel-lengkap';

export interface PrintEngineConfig {
  docType: PrintableDocumentType;
  paperSize: 'A4' | 'F4';
  orientation: 'portrait' | 'landscape';
  fontSize: 'compact' | 'standard' | 'large';
  columns: 1 | 2;
  showKop: boolean;
  showStudentIdentity: boolean;
  showSignatures: boolean;
}

export const DEFAULT_PRINT_ENGINE_CONFIG: PrintEngineConfig = {
  docType: 'naskah',
  paperSize: 'A4',
  orientation: 'portrait',
  fontSize: 'standard',
  columns: 1,
  showKop: true,
  showStudentIdentity: true,
  showSignatures: true,
};

function getFontSizePx(size: 'compact' | 'standard' | 'large'): {
  body: string;
  soal: string;
  kop: string;
} {
  switch (size) {
    case 'compact':
      return { body: '10pt', soal: '10pt', kop: '12pt' };
    case 'large':
      return { body: '12pt', soal: '12.5pt', kop: '14pt' };
    case 'standard':
    default:
      return { body: '11pt', soal: '11pt', kop: '13pt' };
  }
}

function renderKopSuratHtml(school: SchoolMetadata, config: PrintEngineConfig): string {
  if (!config.showKop) return '';

  return `
    <div class="kop-surat">
      ${school.namaPemerintah ? `<div class="kop-pem">${school.namaPemerintah.toUpperCase()}</div>` : ''}
      ${school.dinasPendidikan ? `<div class="kop-dinas">${school.dinasPendidikan.toUpperCase()}</div>` : ''}
      <div class="kop-sekolah">${(school.namaSekolah || 'SEKOLAH DASAR').toUpperCase()}</div>
      <div class="kop-asesmen">${(school.namaAsesmen || 'ASESMEN SUMATIF').toUpperCase()}</div>
      <div class="kop-meta">Tahun Ajaran: ${school.tahunPelajaran || '2026/2027'} &bull; Semester: ${school.semester || 'Ganjil'}</div>
    </div>
  `;
}

function renderSignaturesHtml(school: SchoolMetadata, config: PrintEngineConfig): string {
  if (!config.showSignatures) return '';

  return `
    <div class="tanda-tangan-wrapper">
      <table class="tanda-tangan-table">
        <tr>
          <td style="width: 50%;">
            <div>Mengetahui,</div>
            <div style="font-weight: bold;">Kepala Sekolah</div>
            <div class="ttd-space"></div>
            <div class="ttd-nama">${school.namaKepalaSekolah || '...........................................'}</div>
            <div class="ttd-nip">NIP. ${school.nipKepalaSekolah || '...........................................'}</div>
          </td>
          <td style="width: 50%; text-align: right;">
            <div>Guru Mata Pelajaran,</div>
            <div style="font-weight: bold;">Penyusun Soal</div>
            <div class="ttd-space"></div>
            <div class="ttd-nama">${school.namaGuru || '...........................................'}</div>
            <div class="ttd-nip">NIP. ${school.nipGuru || '...........................................'}</div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

// 1. Generate Naskah Soal HTML
export function generateNaskahHtml(
  kit: EvaluationKit,
  school: SchoolMetadata,
  config: PrintEngineConfig
): string {
  const fontSizes = getFontSizePx(config.fontSize);

  const renderSoalItem = (soal: SoalEvaluasiItem, idx: number) => {
    let specificContent = '';

    if (soal.bentuk_soal === 'Pilihan Ganda' && soal.opsi_jawaban) {
      specificContent = `
        <div class="opsi-list">
          ${soal.opsi_jawaban
            .map((op) => `<div class="opsi-item">${op}</div>`)
            .join('')}
        </div>
      `;
    } else if (
      soal.bentuk_soal === 'Pilihan Ganda Kompleks' &&
      soal.opsi_jawaban
    ) {
      specificContent = `
        <table class="pgk-table">
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">Centang (✓)</th>
              <th>Pilihan Jawaban / Pernyataan</th>
            </tr>
          </thead>
          <tbody>
            ${soal.opsi_jawaban
              .map(
                (op) => `
              <tr>
                <td style="text-align: center;"><div class="checkbox-box"></div></td>
                <td>${op}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    } else if (soal.bentuk_soal === 'Menjodohkan' && soal.pasangan_menjodohkan) {
      const colA = soal.pasangan_menjodohkan.kolom_a || [];
      const colB = soal.pasangan_menjodohkan.kolom_b || [];
      const maxRows = Math.max(colA.length, colB.length);

      let rows = '';
      for (let i = 0; i < maxRows; i++) {
        rows += `
          <tr>
            <td>${colA[i] || ''}</td>
            <td style="width: 50px; text-align: center; border-left: 1px dashed #666; border-right: 1px dashed #666;">( ... )</td>
            <td>${colB[i] || ''}</td>
          </tr>
        `;
      }

      specificContent = `
        <table class="jodoh-table">
          <thead>
            <tr>
              <th style="width: 45%;">Pernyataan / Stimulus (Kolom A)</th>
              <th style="width: 10%; text-align: center;">Pasangan</th>
              <th style="width: 45%;">Pilihan Respon (Kolom B)</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    } else if (
      soal.bentuk_soal === 'Benar / Salah' &&
      soal.pernyataan_benar_salah
    ) {
      specificContent = `
        <table class="bs-table">
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">No</th>
              <th>Pernyataan / Informasi Konseptual</th>
              <th style="width: 70px; text-align: center;">Benar</th>
              <th style="width: 70px; text-align: center;">Salah</th>
            </tr>
          </thead>
          <tbody>
            ${soal.pernyataan_benar_salah
              .map(
                (p, pIdx) => `
              <tr>
                <td style="text-align: center;">${p.nomor || pIdx + 1}</td>
                <td>${p.kalimat}</td>
                <td style="text-align: center;"><div class="checkbox-box"></div></td>
                <td style="text-align: center;"><div class="checkbox-box"></div></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    } else if (soal.bentuk_soal === 'Uraian') {
      specificContent = `
        <div class="esai-space">
          <div class="esai-label">Jawab:</div>
          <div class="esai-line"></div>
          <div class="esai-line"></div>
          <div class="esai-line"></div>
          <div class="esai-line"></div>
        </div>
      `;
    }

    // Universal Image & Visual Context Detection
    const {
      hasImage,
      imageDescription,
      cleanedStimulus,
      cleanedPertanyaan,
      customImageUrl,
    } = extractQuestionImageData(soal);

    let imageFigureHtml = '';
    if (hasImage) {
      if (customImageUrl) {
        imageFigureHtml = `
          <figure class="soal-inline-figure" style="max-width: 250px; margin: 8px auto; text-align: center; page-break-inside: avoid;">
            <div style="background: #ffffff; border: 1px solid #475569; border-radius: 6px; padding: 4px; display: inline-block;">
              <img src="${customImageUrl}" alt="${imageDescription}" style="max-height: 140px; max-width: 100%; object-fit: contain; margin: auto; display: block;" />
            </div>
            <figcaption style="font-size: 8.5pt; font-style: italic; color: #1e293b; margin-top: 3px; font-weight: 600;">
              Gambar ${soal.nomor_soal}: ${imageDescription}
            </figcaption>
          </figure>
        `;
      } else {
        const diagram = getSubjectVectorDiagram(imageDescription || cleanedPertanyaan, soal.nomor_soal);
        imageFigureHtml = `
          <figure class="soal-inline-figure" style="max-width: 250px; margin: 8px auto; text-align: center; page-break-inside: avoid;">
            <div style="background: #ffffff; border: 1px solid #475569; border-radius: 6px; padding: 4px; display: inline-block;">
              ${diagram.svgString}
            </div>
            <figcaption style="font-size: 8.5pt; font-style: italic; color: #1e293b; margin-top: 3px; font-weight: 600;">
              ${diagram.caption}
            </figcaption>
          </figure>
        `;
      }
    }

    return `
      <div class="soal-card">
        <div class="soal-nomor">${soal.nomor_soal}.</div>
        <div class="soal-content">
          ${cleanedStimulus ? `<div class="soal-stimulus">${cleanedStimulus}</div>` : ''}
          ${imageFigureHtml}
          <div class="soal-pertanyaan">${cleanedPertanyaan}</div>
          ${soal.petunjuk_khusus ? `<div class="soal-petunjuk"><em>* ${soal.petunjuk_khusus}</em></div>` : ''}
          ${specificContent}
        </div>
      </div>
    `;
  };

  const studentIdentityHtml = config.showStudentIdentity
    ? `
    <div class="identitas-wrapper">
      <table class="identitas-table">
        <tr>
          <td style="width: 15%; font-weight: bold;">Mata Pelajaran</td>
          <td style="width: 35%;">: ${kit.paramsSnapshot?.mataPelajaran || school.namaAsesmen}</td>
          <td style="width: 15%; font-weight: bold;">Nama Peserta</td>
          <td style="width: 35%;">: .................................................</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Kelas / Fase</td>
          <td>: ${kit.paramsSnapshot?.levelKelas || 'Kurikulum Merdeka'}</td>
          <td style="font-weight: bold;">Nomor Absen</td>
          <td>: .................................................</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Alokasi Waktu</td>
          <td>: ${school.alokasiWaktu || '90 Menit'}</td>
          <td style="font-weight: bold;">Hari, Tanggal</td>
          <td>: .................................................</td>
        </tr>
      </table>
      <div class="petunjuk-umum">
        <b>PETUNJUK UMUM PENGERJAAN:</b>
        <ol style="margin: 4px 0 0 16px; padding: 0;">
          <li>Tuliskan identitas diri Anda pada kolom yang telah disediakan secara lengkap dan benar.</li>
          <li>Periksa dan bacalah setiap butir soal dengan saksama sebelum menjawab.</li>
          <li>Laporkan kepada pengawas apabila terdapat tulisan atau lembar soal yang kurang jelas atau rusak.</li>
          <li>Dahulukan menjawab soal-soal yang Anda anggap mudah.</li>
        </ol>
      </div>
    </div>
  `
    : '';

  const columnsClass = config.columns === 2 ? 'columns-2' : '';

  return `
    ${renderKopSuratHtml(school, config)}
    ${studentIdentityHtml}
    <div class="naskah-container ${columnsClass}">
      ${kit.soal_evaluasi.map((s, idx) => renderSoalItem(s, idx)).join('')}
    </div>
    ${renderSignaturesHtml(school, config)}
  `;
}

// 2. Generate Matriks Kisi-Kisi HTML
export function generateKisiKisiHtml(
  kit: EvaluationKit,
  school: SchoolMetadata,
  config: PrintEngineConfig
): string {
  const items = kit.kisi_kisi || [];

  return `
    ${renderKopSuratHtml(school, config)}
    <div class="doc-title">
      <h2>MATRIKS KISI-KISI PENULISAN SOAL TES EVALUASI</h2>
      <p>Standar Kurikulum Merdeka &bull; Berdasarkan Taksonomi Bloom Revisi</p>
    </div>

    <table class="meta-sub-table">
      <tr>
        <td style="width: 15%; font-weight: bold;">Mata Pelajaran</td>
        <td style="width: 35%;">: ${kit.paramsSnapshot?.mataPelajaran || '-'}</td>
        <td style="width: 15%; font-weight: bold;">Fase / Kelas</td>
        <td style="width: 35%;">: ${kit.paramsSnapshot?.levelKelas || '-'}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Total Butir Soal</td>
        <td>: ${items.length} Soal</td>
        <td style="font-weight: bold;">Proporsi HOTS</td>
        <td>: ${items.filter((k) => k.kategori_hots).length} Soal (${Math.round(
          (items.filter((k) => k.kategori_hots).length / Math.max(1, items.length)) * 100
        )}%)</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Capaian (CP)</td>
        <td colspan="3">: ${kit.paramsSnapshot?.capaianPembelajaran || '-'}</td>
      </tr>
    </table>

    <table class="grid-table">
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">No</th>
          <th style="width: 110px;">Bentuk Soal</th>
          <th style="width: 140px;">Materi Pokok</th>
          <th>Indikator Ketercapaian Butir Soal</th>
          <th style="width: 60px; text-align: center;">Level</th>
          <th style="width: 70px; text-align: center;">Kategori</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item) => `
          <tr>
            <td style="text-align: center; font-weight: bold;">${item.nomor_soal}</td>
            <td>${item.bentuk_soal}</td>
            <td style="font-weight: 600;">${item.materi_pokok}</td>
            <td style="line-height: 1.4;">${item.indikator_soal}</td>
            <td style="text-align: center; font-weight: bold;">${item.level_kognitif || '-'}</td>
            <td style="text-align: center;">
              <span class="badge ${item.kategori_hots ? 'badge-hots' : 'badge-lots'}">
                ${item.kategori_hots ? 'HOTS' : 'LOTS'}
              </span>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    ${renderSignaturesHtml(school, config)}
  `;
}

// 3. Generate Kunci Jawaban & Rubrik HTML
export function generateKunciRubrikHtml(
  kit: EvaluationKit,
  school: SchoolMetadata,
  config: PrintEngineConfig
): string {
  const kunciList = kit.kunci_dan_lembar_jawab || [];
  const uraianSoalList = kit.soal_evaluasi.filter((s) => s.bentuk_soal === 'Uraian');

  return `
    ${renderKopSuratHtml(school, config)}
    <div class="doc-title">
      <h2>KUNCI JAWABAN, PEMBAHASAN & RUBRIK PENSKORAN ANALITIK</h2>
      <p>Pedoman Guru & Korektor &bull; Asesmen Kurikulum Merdeka</p>
    </div>

    <div class="section-title">I. TABEL KUNCI JAWABAN OBJEKTIF & PEMBAHASAN</div>
    <table class="grid-table">
      <thead>
        <tr>
          <th style="width: 45px; text-align: center;">No</th>
          <th style="width: 120px;">Bentuk Soal</th>
          <th style="width: 180px;">Kunci Jawaban Benar</th>
          <th>Penjelasan Konsep & Pembahasan Ilmiah</th>
        </tr>
      </thead>
      <tbody>
        ${kunciList
          .map(
            (k) => `
          <tr>
            <td style="text-align: center; font-weight: bold;">${k.nomor_soal}</td>
            <td>${k.bentuk_soal}</td>
            <td style="font-weight: bold; color: #065f46;">${k.kunci_jawaban}</td>
            <td style="line-height: 1.4;">${k.pembahasan || '-'}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    ${
      uraianSoalList.length > 0
        ? `
      <div class="page-break"></div>
      <div class="section-title">II. RUBRIK PENSKORAN DETAIL SOAL URAIAN (ANALITIK)</div>
      ${uraianSoalList
        .map((soal) => {
          const matchingKunci = kunciList.find((k) => k.nomor_soal === soal.nomor_soal);
          const rubrik = matchingKunci?.rubrik_detail;

          return `
          <div class="rubrik-card">
            <div class="rubrik-header">
              <span class="rubrik-title">Butir Soal #${soal.nomor_soal} (Uraian)</span>
              <span class="rubrik-score">Skor Maksimal: ${rubrik?.skor_maksimal || 4} Poin</span>
            </div>
            <div class="rubrik-question">
              <b>Pertanyaan:</b> ${soal.pertanyaan}
              ${rubrik?.indikator_pencapaian ? `<br/><b>Indikator Capaian:</b> ${rubrik.indikator_pencapaian}` : ''}
            </div>

            <table class="grid-table rubrik-criteria-table">
              <thead>
                <tr>
                  <th style="width: 50px; text-align: center;">Skor</th>
                  <th style="width: 110px;">Predikat</th>
                  <th>Deskriptor Kriteria Capaian Jawaban Siswa</th>
                  <th style="width: 130px;">Kata Kunci Wajib</th>
                </tr>
              </thead>
              <tbody>
                ${(
                  rubrik?.kriteria || [
                    { skor: 4, predikat: 'Sangat Baik', deskriptor: 'Menjawab lengkap dan tepat dengan konsep ilmiah mendalam.', kata_kunci: [] },
                    { skor: 3, predikat: 'Baik', deskriptor: 'Menjawab sebagian besar benar dan sistematis.', kata_kunci: [] },
                    { skor: 2, predikat: 'Cukup', deskriptor: 'Menjawab benar secara umum namun kurang terperinci.', kata_kunci: [] },
                    { skor: 1, predikat: 'Perlu Bimbingan', deskriptor: 'Menjawab namun konsep belum tepat.', kata_kunci: [] },
                    { skor: 0, predikat: 'Tidak Menjawab', deskriptor: 'Tidak menuliskan jawaban atau tidak relevan.', kata_kunci: [] },
                  ]
                )
                  .map(
                    (kr) => `
                  <tr>
                    <td style="text-align: center; font-weight: bold;">${kr.skor}</td>
                    <td style="font-weight: bold;">${kr.predikat}</td>
                    <td>${kr.deskriptor}</td>
                    <td style="font-size: 9pt;">${kr.kata_kunci?.join(', ') || '-'}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>

            ${
              rubrik?.contoh_jawaban_ideal
                ? `
              <div class="model-answer">
                <b>Contoh Standar Jawaban Maksimal (Model Answer):</b><br/>
                ${rubrik.contoh_jawaban_ideal}
              </div>
            `
                : ''
            }
          </div>
        `;
        })
        .join('')}
    `
        : ''
    }

    ${renderSignaturesHtml(school, config)}
  `;
}

// 4. Generate Lembar Jawab Siswa (LJK Manual)
export function generateLembarJawabHtml(
  kit: EvaluationKit,
  school: SchoolMetadata,
  config: PrintEngineConfig
): string {
  const pgItems = kit.soal_evaluasi.filter((s) => s.bentuk_soal === 'Pilihan Ganda');
  const nonPgItems = kit.soal_evaluasi.filter((s) => s.bentuk_soal !== 'Pilihan Ganda');

  return `
    ${renderKopSuratHtml(school, config)}
    <div class="doc-title">
      <h2>LEMBAR JAWABAN SISWA (LJK ASESMEN)</h2>
      <p>${kit.paramsSnapshot?.mataPelajaran || 'Asesmen'} &bull; ${kit.paramsSnapshot?.levelKelas || 'Kurikulum Merdeka'}</p>
    </div>

    <table class="identitas-table">
      <tr>
        <td style="width: 15%; font-weight: bold;">Nama Lengkap</td>
        <td style="width: 35%;">: .................................................</td>
        <td style="width: 15%; font-weight: bold;">Kelas / No. Absen</td>
        <td style="width: 35%;">: ............. / .............</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Mata Pelajaran</td>
        <td>: ${kit.paramsSnapshot?.mataPelajaran || '-'}</td>
        <td style="font-weight: bold;">Hari, Tanggal</td>
        <td>: .................................................</td>
      </tr>
    </table>

    <div class="section-title">I. PILIHAN GANDA (Hitamkan atau Silang pada huruf yang dipilih)</div>
    <div class="ljk-bubbles-container">
      ${pgItems
        .map(
          (s) => `
        <div class="ljk-row">
          <span class="ljk-no">${s.nomor_soal}.</span>
          <span class="ljk-bubble">( A )</span>
          <span class="ljk-bubble">( B )</span>
          <span class="ljk-bubble">( C )</span>
          <span class="ljk-bubble">( D )</span>
          ${kit.paramsSnapshot?.jumlahOpsiPg?.includes('5') ? '<span class="ljk-bubble">( E )</span>' : ''}
        </div>
      `
        )
        .join('')}
    </div>

    ${
      nonPgItems.length > 0
        ? `
      <div class="section-title" style="margin-top: 18px;">II. ISIAN / URAIAN / BENTUK LAINNYA</div>
      <table class="grid-table">
        <thead>
          <tr>
            <th style="width: 50px; text-align: center;">No</th>
            <th style="width: 130px;">Bentuk Soal</th>
            <th>Ruang Jawaban Siswa</th>
            <th style="width: 80px; text-align: center;">Nilai Korektor</th>
          </tr>
        </thead>
        <tbody>
          ${nonPgItems
            .map(
              (s) => `
            <tr>
              <td style="text-align: center; font-weight: bold;">${s.nomor_soal}</td>
              <td>${s.bentuk_soal}</td>
              <td style="height: ${s.bentuk_soal === 'Uraian' ? '70px' : '45px'}; vertical-align: top;">
                <div style="font-size: 8pt; color: #888;">Tuliskan jawaban di sini...</div>
              </td>
              <td style="text-align: center;"></td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
        : ''
    }

    <div style="margin-top: 24px; text-align: right; font-size: 10pt;">
      Nilai Akhir: <span style="display: inline-block; width: 80px; border: 2px solid #000; height: 35px; vertical-align: middle;"></span>
      &nbsp;&nbsp;&nbsp;&nbsp;
      Paraf Korektor: <span style="display: inline-block; width: 80px; border-bottom: 1px solid #000; height: 35px; vertical-align: middle;"></span>
    </div>
  `;
}

// 5. Generate Halaman Sampul / Cover Asesmen
export function generateCoverHtml(
  kit: EvaluationKit,
  school: SchoolMetadata,
  config: PrintEngineConfig
): string {
  return `
    <div class="bundel-cover" style="min-height: 85vh; display: flex; flex-direction: column; justify-content: space-between; padding: 24px 16px;">
      ${renderKopSuratHtml(school, config)}
      <div style="text-align: center; margin-top: 50px; margin-bottom: 50px;">
        <div style="font-size: 11pt; letter-spacing: 2px; color: #475569; font-weight: bold; margin-bottom: 12px; text-transform: uppercase;">
          Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi
        </div>
        <h1 style="font-size: 20pt; text-transform: uppercase; margin-bottom: 12px; font-weight: 800; line-height: 1.25;">
          BUNDEL PERANGKAT ASESMEN PEMBELAJARAN
        </h1>
        <h2 style="font-size: 15pt; color: #1e293b; margin-bottom: 24px; font-weight: 600;">
          ${kit.paramsSnapshot?.mataPelajaran || 'Mata Pelajaran'} - ${kit.paramsSnapshot?.levelKelas || 'Kurikulum Merdeka'}
        </h2>
        <div style="display: inline-block; padding: 12px 28px; border: 2.5px solid #000; font-size: 13pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; background: #fafafa;">
          ${school.namaAsesmen || 'ASESMEN SUMATIF RESMI'}
        </div>
      </div>
      <div style="text-align: center; font-size: 11pt; border-top: 1.5px solid #000; padding-top: 20px;">
        <div style="margin-bottom: 4px;">Penyusun / Guru Mata Pelajaran: <b>${school.namaGuru}</b> (NIP. ${school.nipGuru || '-'})</div>
        <div style="margin-bottom: 4px;">Satuan Pendidikan: <b>${school.namaSekolah}</b></div>
        <div>Tahun Ajaran / Semester: <b>${school.tahunPelajaran} / ${school.semester}</b></div>
      </div>
    </div>
  `;
}

// 6. Generate Bundel Lengkap HTML
export function generateBundelLengkapHtml(
  kit: EvaluationKit,
  school: SchoolMetadata,
  config: PrintEngineConfig
): string {
  return generateMultiDocsHtml(
    ['cover', 'naskah', 'kisi-kisi', 'kunci-rubrik', 'lembar-jawab'],
    kit,
    school,
    config
  );
}

// 7. Multi-Document Combined Generator for Batch Printing
export function generateMultiDocsHtml(
  docTypes: PrintableDocumentType[],
  kit: EvaluationKit,
  school: SchoolMetadata,
  config: PrintEngineConfig
): string {
  if (!docTypes || docTypes.length === 0) {
    return `
      <div style="text-align: center; padding: 60px 20px; color: #64748b; font-family: sans-serif;">
        <div style="font-size: 16pt; font-weight: bold; color: #334155; margin-bottom: 8px;">Tidak Ada Dokumen yang Dipilih</div>
        <p style="font-size: 11pt;">Silakan centang satu atau beberapa dokumen pada panel di samping untuk pratinjau dan cetak sekaligus.</p>
      </div>
    `;
  }

  const sections: string[] = [];

  for (const type of docTypes) {
    let html = '';
    switch (type) {
      case 'cover':
        html = generateCoverHtml(kit, school, config);
        break;
      case 'naskah':
        html = generateNaskahHtml(kit, school, config);
        break;
      case 'kisi-kisi':
        html = generateKisiKisiHtml(kit, school, config);
        break;
      case 'kunci-rubrik':
        html = generateKunciRubrikHtml(kit, school, config);
        break;
      case 'lembar-jawab':
        html = generateLembarJawabHtml(kit, school, config);
        break;
      case 'bundel-lengkap':
        html = generateBundelLengkapHtml(kit, school, config);
        break;
      default:
        break;
    }

    if (html && html.trim()) {
      sections.push(html);
    }
  }

  // Join sections with clean page break
  return sections.join(`\n<div class="page-break preview-page-break"></div>\n`);
}

// Full Printable HTML Document Wrapper with Embedded CSS
export function wrapInPrintableDocument(
  bodyHtml: string,
  title: string,
  config: PrintEngineConfig
): string {
  const orientationRule = config.orientation === 'landscape' ? 'landscape' : 'portrait';
  const paperHeight = config.paperSize === 'F4' ? '330mm' : '297mm';
  const paperWidth = '210mm';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: ${config.paperSize === 'F4' ? '215mm 330mm' : 'A4'} ${orientationRule};
      margin: 15mm 15mm 15mm 15mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: ${config.fontSize === 'compact' ? '10pt' : config.fontSize === 'large' ? '12pt' : '11pt'};
      line-height: 1.35;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 0;
    }

    .kop-surat {
      text-align: center;
      border-bottom: 3px double #000;
      padding-bottom: 6px;
      margin-bottom: 14px;
    }

    .kop-pem {
      font-size: 11pt;
      font-weight: bold;
      letter-spacing: 0.5px;
    }

    .kop-dinas {
      font-size: 10.5pt;
      font-weight: bold;
    }

    .kop-sekolah {
      font-size: 14pt;
      font-weight: bold;
      letter-spacing: 1px;
      margin: 2px 0;
    }

    .kop-asesmen {
      font-size: 12pt;
      font-weight: bold;
      text-decoration: underline;
    }

    .kop-meta {
      font-size: 9.5pt;
      margin-top: 2px;
    }

    .identitas-wrapper {
      margin-bottom: 14px;
    }

    .identitas-table, .meta-sub-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      margin-bottom: 8px;
    }

    .identitas-table td, .meta-sub-table td {
      padding: 2px 4px;
      vertical-align: top;
    }

    .petunjuk-umum {
      border: 1px solid #000;
      padding: 6px 10px;
      font-size: 9.5pt;
      margin-bottom: 12px;
      line-height: 1.3;
    }

    .doc-title {
      text-align: center;
      margin-bottom: 14px;
    }

    .doc-title h2 {
      font-size: 13pt;
      font-weight: bold;
      margin: 0 0 2px 0;
    }

    .doc-title p {
      font-size: 9.5pt;
      margin: 0;
      color: #444;
    }

    .section-title {
      font-size: 11pt;
      font-weight: bold;
      margin: 14px 0 6px 0;
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
    }

    .columns-2 {
      column-count: 2;
      column-gap: 20px;
      column-rule: 1px solid #ccc;
    }

    .soal-card {
      display: flex;
      margin-bottom: 12px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .soal-nomor {
      width: 28px;
      font-weight: bold;
      flex-shrink: 0;
    }

    .soal-content {
      flex: 1;
    }

    .soal-stimulus {
      background: #f9f9f9;
      border-left: 3px solid #333;
      padding: 4px 8px;
      margin-bottom: 4px;
      font-style: italic;
      font-size: 10pt;
    }

    .soal-inline-figure {
      max-width: 250px;
      margin: 6px auto 8px auto;
      text-align: center;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .soal-inline-figure svg {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }

    .soal-inline-figure figcaption {
      font-size: 8.5pt;
      font-style: italic;
      color: #1e293b;
      margin-top: 3px;
      font-weight: 600;
    }

    .soal-pertanyaan {
      font-weight: normal;
      margin-bottom: 4px;
    }

    .soal-petunjuk {
      font-size: 9pt;
      color: #555;
      margin-bottom: 4px;
    }

    .opsi-list {
      margin-left: 8px;
    }

    .opsi-item {
      margin-bottom: 2px;
    }

    .checkbox-box {
      width: 14px;
      height: 14px;
      border: 1px solid #000;
      margin: 0 auto;
    }

    .grid-table, .pgk-table, .jodoh-table, .bs-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      margin-bottom: 10px;
      font-size: 9.5pt;
    }

    .grid-table th, .grid-table td,
    .pgk-table th, .pgk-table td,
    .jodoh-table th, .jodoh-table td,
    .bs-table th, .bs-table td {
      border: 1px solid #000;
      padding: 5px 7px;
      vertical-align: middle;
    }

    .grid-table th, .pgk-table th, .jodoh-table th, .bs-table th {
      background-color: #f0f0f0 !important;
      font-weight: bold;
      text-align: left;
    }

    .esai-space {
      margin-top: 6px;
      margin-bottom: 10px;
    }

    .esai-label {
      font-weight: bold;
      font-size: 9.5pt;
    }

    .esai-line {
      border-bottom: 1px dotted #888;
      height: 22px;
    }

    .badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 8.5pt;
      font-weight: bold;
    }

    .badge-hots {
      border: 1px solid #000;
      background: #eee;
    }

    .badge-lots {
      border: 1px solid #999;
      color: #333;
    }

    .rubrik-card {
      border: 1px solid #000;
      padding: 8px 12px;
      margin-bottom: 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .rubrik-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #000;
      padding-bottom: 4px;
      margin-bottom: 6px;
      font-weight: bold;
    }

    .rubrik-score {
      font-size: 9.5pt;
    }

    .rubrik-question {
      font-size: 10pt;
      margin-bottom: 8px;
    }

    .model-answer {
      background: #fafafa;
      border: 1px dashed #666;
      padding: 6px 10px;
      margin-top: 6px;
      font-size: 9.5pt;
    }

    .ljk-bubbles-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px 16px;
      margin-top: 10px;
    }

    .ljk-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 9.5pt;
      font-family: monospace;
    }

    .ljk-no {
      width: 24px;
      font-weight: bold;
    }

    .ljk-bubble {
      font-weight: bold;
    }

    .tanda-tangan-wrapper {
      margin-top: 30px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .tanda-tangan-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
    }

    .ttd-space {
      height: 60px;
    }

    .ttd-nama {
      font-weight: bold;
      text-decoration: underline;
    }

    .ttd-nip {
      font-size: 9pt;
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }

    .preview-page-break {
      page-break-before: always;
      break-before: page;
    }

    @media screen {
      body {
        padding: 20px;
        background: #e2e8f0;
      }
      .page-container {
        max-width: 800px;
        margin: 0 auto;
        background: #fff;
        padding: 40px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      .preview-page-break {
        border-top: 2px dashed #94a3b8;
        margin: 36px 0 28px 0;
        position: relative;
        text-align: center;
      }
      .preview-page-break::after {
        content: "--- Batas Halaman Dokumen Berikutnya (Page Break) ---";
        display: inline-block;
        background: #f1f5f9;
        color: #475569;
        font-size: 8.5pt;
        font-family: sans-serif;
        font-weight: 600;
        padding: 2px 14px;
        border-radius: 9999px;
        position: relative;
        top: -11px;
        border: 1px solid #cbd5e1;
      }
    }

    @media print {
      .preview-page-break {
        border: none !important;
        margin: 0 !important;
      }
      .preview-page-break::after {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
    ${bodyHtml}
  </div>
</body>
</html>`;
}

/**
 * Rock-solid hidden iframe print execution
 * Guaranteed to bypass parent iframe styling, hide UI, and execute print reliably.
 */
export function executeIframePrint(fullHtml: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Remove any existing print iframe
      const existing = document.getElementById('ai-studio-print-iframe');
      if (existing) {
        existing.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'ai-studio-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        // Fallback to window.print()
        window.print();
        resolve(true);
        return;
      }

      doc.open();
      doc.write(fullHtml);
      doc.close();

      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            resolve(true);
          } catch (err) {
            console.warn('Iframe print focus error, using window.print fallback:', err);
            window.print();
            resolve(false);
          } finally {
            setTimeout(() => {
              iframe.remove();
            }, 3000);
          }
        }, 400);
      };
    } catch (err) {
      console.error('executeIframePrint failed, triggering window.print:', err);
      window.print();
      resolve(false);
    }
  });
}

/**
 * Standalone clean print tab in new window
 */
export function openStandalonePrintTab(fullHtml: string, title = 'Cetak Dokumen Asesmen') {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    // Inject automatic print button inside
    const injected = fullHtml.replace(
      '</body>',
      `
      <div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; gap: 8px;" class="print-toolbar">
        <button onclick="window.print()" style="padding: 10px 18px; font-weight: bold; background: #0f172a; color: #fff; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
          🖨️ Cetak Halaman Ini
        </button>
        <button onclick="window.close()" style="padding: 10px 14px; font-weight: bold; background: #fff; color: #333; border: 1px solid #ccc; border-radius: 8px; cursor: pointer;">
          ✕ Tutup
        </button>
      </div>
      <style>
        @media print {
          .print-toolbar { display: none !important; }
        }
      </style>
      <script>
        window.addEventListener('load', () => {
          setTimeout(() => {
            window.print();
          }, 300);
        });
      </script>
      </body>
    `
    );
    printWindow.document.write(injected);
    printWindow.document.close();
  } else {
    // If popup blocked, execute via iframe
    executeIframePrint(fullHtml);
  }
}
