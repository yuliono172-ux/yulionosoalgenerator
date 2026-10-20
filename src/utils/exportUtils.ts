import { EvaluationKit, SchoolMetadata } from '../types/assessment';
export { exportElementToPdf, type PdfExportOptions } from './pdfExport';

export function downloadJsonFile(data: EvaluationKit, filename = 'perangkat-evaluasi-kurikulum-merdeka.json') {
  // Strip out paramsSnapshot so that the downloaded JSON matches the exact raw schema requested by user
  const cleanExport = {
    kisi_kisi: data.kisi_kisi,
    soal_evaluasi: data.soal_evaluasi,
    kunci_dan_lembar_jawab: data.kunci_dan_lembar_jawab,
  };
  const jsonStr = JSON.stringify(cleanExport, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      textArea.remove();
      return Promise.resolve();
    } catch (error) {
      textArea.remove();
      return Promise.reject(error);
    }
  }
}

export function exportToWordDocument(kit: EvaluationKit, school: SchoolMetadata) {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${school.namaAsesmen} - ${school.namaSekolah}</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.3; color: #000; }
        .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 18px; }
        .kop h2 { margin: 2px 0; font-size: 14pt; text-transform: uppercase; font-weight: bold; }
        .kop h3 { margin: 2px 0; font-size: 12pt; font-weight: normal; }
        .kop p { margin: 2px 0; font-size: 10pt; font-style: italic; }
        .identitas-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11pt; }
        .identitas-table td { padding: 3px 6px; }
        .petunjuk { border: 1px solid #000; padding: 8px 12px; margin-bottom: 16px; font-size: 10.5pt; }
        .section-header { font-size: 13pt; font-weight: bold; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #000; }
        .soal-item { margin-bottom: 16px; page-break-inside: avoid; }
        .stimulus { margin-bottom: 6px; font-style: normal; }
        .opsi-list { list-style-type: none; padding-left: 18px; margin: 4px 0; }
        .opsi-list li { margin-bottom: 3px; }
        .kotak-gambar { border: 1px dashed #666; background-color: #fafafa; padding: 8px; margin: 6px 0; font-size: 10pt; color: #444; }
        table.tabel-kisi { width: 100%; border-collapse: collapse; font-size: 10pt; margin-top: 10px; }
        table.tabel-kisi th, table.tabel-kisi td { border: 1px solid #000; padding: 5px; text-align: left; vertical-align: top; }
        table.tabel-kisi th { background-color: #eee; text-align: center; font-weight: bold; }
        .page-break { page-break-before: always; }
      </style>
    </head>
    <body>
      <!-- KOP SEKOLAH -->
      <div class="kop">
        <h3>${school.dinasPendidikan || 'DINAS PENDIDIKAN DAN KEBUDAYAAN'}</h3>
        <h2>${school.namaSekolah || 'SEKOLAH DASAR NEGERI'}</h2>
        <p>${school.namaPemerintah || 'KABUPATEN / KOTA'}</p>
        <hr style="border: 1px solid #000; margin-top: 4px;"/>
      </div>

      <table class="identitas-table">
        <tr>
          <td width="18%"><strong>Mata Pelajaran</strong></td>
          <td width="32%">: ${kit.paramsSnapshot?.mataPelajaran || 'Ilmu Pengetahuan Alam dan Sosial'}</td>
          <td width="18%"><strong>Hari / Tanggal</strong></td>
          <td width="32%">: .......................................</td>
        </tr>
        <tr>
          <td><strong>Kelas / Semester</strong></td>
          <td>: ${kit.paramsSnapshot?.levelKelas || 'Fase B'} / ${school.semester}</td>
          <td><strong>Waktu</strong></td>
          <td>: ${school.alokasiWaktu}</td>
        </tr>
        <tr>
          <td><strong>Nama Siswa</strong></td>
          <td>: .......................................</td>
          <td><strong>Nomor Absen</strong></td>
          <td>: ..............</td>
        </tr>
      </table>

      <div class="petunjuk">
        <strong>PETUNJUK UMUM PENGERJAAN:</strong><br/>
        1. Berdoalah sebelum memulai mengerjakan soal evaluasi.<br/>
        2. Tuliskan identitas nama lengkap dan nomor absen pada lembar jawab.<br/>
        3. Bacalah stimulus dan pertanyaan dengan cermat sebelum menentukan jawaban.<br/>
        4. Periksa kembali seluruh jawaban sebelum diserahkan kepada guru pengawas.
      </div>

      <div class="section-header">KOMPONEN 1: NASKAH SOAL EVALUASI</div>
      ${kit.soal_evaluasi
        .map((soal) => {
          const type = soal.bentuk_soal.toLowerCase();
          const isPilganKompleks = type.includes('kompleks');
          const isPilgan = type.includes('ganda') && !isPilganKompleks;
          const isMenjodohkan = type.includes('jodoh') || type.includes('menjodohkan');
          const isBenarSalah = type.includes('benar') || type.includes('salah');
          const isUraian = type.includes('uraian') || type.includes('esai');

          const categoryTitle = isPilganKompleks
            ? 'SOAL PILGAN KOMPLEKS'
            : isPilgan
            ? 'SOAL PILIHAN GANDA'
            : isMenjodohkan
            ? 'SOAL MENJODOHKAN'
            : isBenarSalah
            ? 'SOAL BENAR SALAH'
            : isUraian
            ? 'SOAL URAIAN'
            : `SOAL ${soal.bentuk_soal.toUpperCase()}`;

          return `
          <div class="soal-item">
            ${
              soal.stimulus
                ? `<div class="stimulus">${soal.stimulus.replace(
                    /\[KOTAK GAMBAR: (.*?)\]/g,
                    '<div class="kotak-gambar"><strong>[ILUSTRASI GAMBAR]:</strong> $1</div>'
                  )}</div>`
                : ''
            }
            <p style="margin: 4px 0;"><strong>${soal.nomor_soal}. ${soal.pertanyaan}</strong></p>

            ${
              isPilganKompleks
                ? `<p style="margin: 4px 0; font-size: 10.5pt;">${soal.petunjuk_khusus || 'Berilah tanda centang (✓) pada 3 jawaban yang tepat!'}</p>
                   <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-top: 4px;">
                     ${soal.opsi_jawaban
                       ?.map(
                         (op) => `<tr><td width="35" align="center" style="border: 1px solid #000;">[ &nbsp; ]</td><td style="border: 1px solid #000;">${op}</td></tr>`
                       )
                       .join('')}
                   </table>`
                : ''
            }

            ${
              isPilgan && soal.opsi_jawaban
                ? `<div style="padding-left: 18px; margin: 4px 0;">
                    ${soal.opsi_jawaban.map((op) => `<p style="margin: 2px 0;">${op}</p>`).join('')}
                   </div>`
                : ''
            }

            ${
              isMenjodohkan && soal.pasangan_menjodohkan
                ? (() => {
                    const maxRows = Math.max(
                      soal.pasangan_menjodohkan.kolom_a.length,
                      soal.pasangan_menjodohkan.kolom_b.length
                    );
                    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                    let rowsHtml = '';
                    for (let i = 0; i < maxRows; i++) {
                      const a = soal.pasangan_menjodohkan.kolom_a[i];
                      const b = soal.pasangan_menjodohkan.kolom_b[i];
                      const dispA = a ? (a.startsWith(`${i + 1}.`) ? a : `${i + 1}. ${a}`) : '';
                      const dispB = b ? (b.startsWith(`${letters[i]}.`) ? b : `${letters[i]}. ${b}`) : '';

                      const dotA = a ? '&#9679;' : '&nbsp;';
                      const dotB = b ? '&#9679;' : '&nbsp;';

                      rowsHtml += `
                        <tr>
                          ${
                            a
                              ? `<td style="border: 1px solid #000; padding: 6px 8px; vertical-align: middle; width: 43%;">${dispA}</td>`
                              : `<td style="border: none; width: 43%;"></td>`
                          }
                          <td width="14%" align="center" style="border: none; vertical-align: middle; font-size: 14pt; padding: 4px 6px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: none;">
                              <tr>
                                <td align="left" style="border: none; font-size: 14pt;">${dotA}</td>
                                <td align="right" style="border: none; font-size: 14pt;">${dotB}</td>
                              </tr>
                            </table>
                          </td>
                          ${
                            b
                              ? `<td style="border: 1px solid #000; padding: 6px 8px; vertical-align: middle; width: 43%;">${dispB}</td>`
                              : `<td style="border: none; width: 43%;"></td>`
                          }
                        </tr>
                      `;
                    }

                    return `
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-top: 8px;">
                        <thead>
                          <tr style="background-color: #f2f2f2;">
                            <th align="center" style="border: 1px solid #000; padding: 6px; width: 43%;"><strong>Pernyataan</strong></th>
                            <th width="14%" align="center" style="border: none; font-size: 8.5pt; color: #888;">(Tarik Garis)</th>
                            <th align="center" style="border: 1px solid #000; padding: 6px; width: 43%;"><strong>Pasangan jawaban</strong></th>
                          </tr>
                        </thead>
                        <tbody>
                          ${rowsHtml}
                        </tbody>
                      </table>
                    `;
                  })()
                : ''
            }

            ${
              isBenarSalah
                ? `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-top: 6px;">
                    <tr style="background-color: #eee;">
                      <th width="75%" align="center"><strong>Kalimat/Pernyataan</strong></th>
                      <th width="25%" align="center"><strong>Benar atau Salah</strong></th>
                    </tr>
                    ${
                      soal.pernyataan_benar_salah && soal.pernyataan_benar_salah.length > 0
                        ? soal.pernyataan_benar_salah
                            .map(
                              (p) => `<tr><td>${p.nomor}. ${p.kalimat}</td><td align="center">Benar / Salah</td></tr>`
                            )
                            .join('')
                        : `<tr><td>1. ${soal.pertanyaan}</td><td align="center">Benar / Salah</td></tr>`
                    }
                   </table>`
                : ''
            }

            ${
              isUraian
                ? `<div style="border: 1px solid #000; padding: 10px; margin-top: 6px;">
                    <p style="margin: 0 0 8px 0; font-weight: bold;">Jawab:</p>
                    <div style="border-bottom: 1px solid #000; height: 24px;"></div>
                    <div style="border-bottom: 1px solid #000; height: 24px;"></div>
                    <div style="border-bottom: 1px solid #000; height: 24px;"></div>
                    <div style="border-bottom: 1px solid #000; height: 24px;"></div>
                    <div style="border-bottom: 1px solid #000; height: 24px;"></div>
                   </div>`
                : ''
            }
          </div>
        `;
        })
        .join('')}

      <div class="page-break"></div>

      <div class="section-header">KOMPONEN 2: MATRIKS KISI-KISI SOAL</div>
      <table class="tabel-kisi">
        <thead>
          <tr>
            <th width="6%">No</th>
            <th width="18%">Bentuk Soal</th>
            <th width="24%">Materi Pokok</th>
            <th width="34%">Indikator Soal</th>
            <th width="10%">Level Kognitif</th>
            <th width="8%">Kategori HOTS</th>
          </tr>
        </thead>
        <tbody>
          ${kit.kisi_kisi
            .map(
              (k) => `
            <tr>
              <td align="center">${k.nomor_soal}</td>
              <td>${k.bentuk_soal}</td>
              <td>${k.materi_pokok}</td>
              <td>${k.indikator_soal}</td>
              <td align="center"><strong>${k.level_kognitif}</strong></td>
              <td align="center">${k.kategori_hots ? 'HOTS' : 'LOTS/MOTS'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <div class="page-break"></div>

      <div class="section-header">KOMPONEN 3: LEMBAR KUNCI JAWABAN & RUBRIK PENILAIAN</div>
      ${kit.kunci_dan_lembar_jawab
        .map(
          (k) => `
        <div class="soal-item">
          <p><strong>Nomor ${k.nomor_soal} (${k.bentuk_soal})</strong></p>
          <p><strong>Kunci Jawaban:</strong><br/>${k.kunci_jawaban.replace(/\n/g, '<br/>')}</p>
          <p><strong>Pembahasan:</strong><br/>${k.pembahasan.replace(/\n/g, '<br/>')}</p>
          <p><strong>Rubrik Penskoran:</strong><br/>${k.rubrik_penskoran.replace(/\n/g, '<br/>')}</p>
          <hr style="border: 0.5px dashed #aaa;"/>
        </div>
      `
        )
        .join('')}

      <table style="width: 100%; margin-top: 40px; text-align: center;">
        <tr>
          <td width="50%">
            Mengetahui,<br/>
            Kepala Sekolah<br/><br/><br/><br/>
            <strong><u>${school.namaKepalaSekolah || 'Dr. H. Ahmad Fauzi, M.Pd.'}</u></strong><br/>
            NIP. ${school.nipKepalaSekolah || '19750812 200003 1 004'}
          </td>
          <td width="50%">
            Guru Mata Pelajaran,<br/><br/><br/><br/>
            <strong><u>${school.namaGuru || 'Yuliono, S.Pd.'}</u></strong><br/>
            NIP. ${school.nipGuru || '19880415 201101 1 002'}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + content], {
    type: 'application/msword',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Perangkat_Evaluasi_${(kit.paramsSnapshot?.mataPelajaran || 'Asesmen').replace(/\s+/g, '_')}_${school.namaSekolah.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
