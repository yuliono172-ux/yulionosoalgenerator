export interface SpellcheckIssue {
  id: string;
  nomorSoal: number;
  field: 'pertanyaan' | 'stimulus' | 'opsi_jawaban' | 'petunjuk_khusus' | 'pernyataan_benar_salah' | 'pasangan_menjodohkan';
  fieldLabel: string;
  subIndex?: number;
  originalText: string;
  suggestedText: string;
  wordFound: string;
  replacementWord: string;
  category: 'istilah_tidak_baku' | 'kaidah_di' | 'tanda_baca' | 'kata_berulang' | 'spasi_ganda';
  categoryLabel: string;
  ruleExplanation: string;
  severity: 'warning' | 'info' | 'critical';
}

// Kamus kata tidak baku dan padanan bakunya menurut KBBI / PUEBI / EYD V
export const DICTIONARY_KATA_TIDAK_BAKU: Record<string, { baku: string; alasan: string }> = {
  merubah: { baku: 'mengubah', alasan: "Bentuk dasar 'ubah' mendapat awalan meN- menjadi 'mengubah', bukan 'merubah'." },
  aktifitas: { baku: 'aktivitas', alasan: "Kata serapan berakhiran -ity menjadi -itas dengan huruf 'v' (aktivitas)." },
  kreatifitas: { baku: 'kreativitas', alasan: "Kata serapan baku menggunakan huruf 'v': 'kreativitas'." },
  efektip: { baku: 'efektif', alasan: "Kata serapan baku berakhiran -if: 'efektif'." },
  positip: { baku: 'positif', alasan: "Kata serapan baku berakhiran -if: 'positif'." },
  negatip: { baku: 'negatif', alasan: "Kata serapan baku berakhiran -if: 'negatif'." },
  praktek: { baku: 'praktik', alasan: "Baku menurut KBBI menggunakan huruf 'i': 'praktik'." },
  analisa: { baku: 'analisis', alasan: "Kata serapan baku berakhiran -is: 'analisis'." },
  kwitansi: { baku: 'kuitansi', alasan: "Kaidah ejaan baku menggunakan huruf vokal rangkap 'ui': 'kuitansi'." },
  antri: { baku: 'antre', alasan: "Baku menurut KBBI menggunakan huruf 'e': 'antre' (antrean)." },
  apotik: { baku: 'apotek', alasan: "Baku menurut KBBI menggunakan huruf 'e': 'apotek' (apoteker)." },
  jadual: { baku: 'jadwal', alasan: "Kaidah ejaan baku PUEBI: 'jadwal'." },
  ijasah: { baku: 'ijazah', alasan: "Baku menurut KBBI menggunakan huruf 'z': 'ijazah'." },
  karir: { baku: 'karier', alasan: "Baku menurut KBBI: 'karier'." },
  nasehat: { baku: 'nasihat', alasan: "Baku menurut KBBI menggunakan huruf 'i': 'nasihat'." },
  obyek: { baku: 'objek', alasan: "Kata serapan baku menggunakan konsonan 'j': 'objek'." },
  subyek: { baku: 'subjek', alasan: "Kata serapan baku menggunakan konsonan 'j': 'subjek'." },
  silahkan: { baku: 'silakan', alasan: "Baku menurut KBBI tanpa huruf 'h': 'silakan'." },
  sekedar: { baku: 'sekadar', alasan: "Berasal dari kata dasar 'kadar', bentuk baku adalah 'sekadar'." },
  resiko: { baku: 'risiko', alasan: "Baku menurut KBBI menggunakan huruf 'i': 'risiko'." },
  sistim: { baku: 'sistem', alasan: "Baku menurut KBBI menggunakan huruf 'e': 'sistem'." },
  tehnik: { baku: 'teknik', alasan: "Baku menurut KBBI tanpa huruf 'h': 'teknik'." },
  standarisasi: { baku: 'standardisasi', alasan: "Serapan dari 'standardization' membentuk kata berimbuhan 'standardisasi'." },
  katagori: { baku: 'kategori', alasan: "Baku menurut KBBI menggunakan huruf 'e': 'kategori'." },
  difinisi: { baku: 'definisi', alasan: "Baku menurut KBBI menggunakan huruf 'e': 'definisi'." },
  frekwensi: { baku: 'frekuensi', alasan: "Kaidah penulisan ejaan baku menggunakan 'ku': 'frekuensi'." },
  kongkrit: { baku: 'konkret', alasan: "Baku menurut KBBI: 'konkret'." },
  ekstrim: { baku: 'ekstrem', alasan: "Baku menurut KBBI: 'ekstrem'." },
  kwalitas: { baku: 'kualitas', alasan: "Kaidah penulisan baku menggunakan 'ku': 'kualitas'." },
  kwantitas: { baku: 'kuantitas', alasan: "Kaidah penulisan baku menggunakan 'ku': 'kuantitas'." },
  fotosintesa: { baku: 'fotosintesis', alasan: "Istilah biologi/sains baku menurut KBBI: 'fotosintesis'." },
  metoda: { baku: 'metode', alasan: "Baku menurut KBBI menggunakan huruf 'e': 'metode'." },
  hipotesa: { baku: 'hipotesis', alasan: "Istilah ilmiah baku menurut KBBI: 'hipotesis'." },
  diagnosa: { baku: 'diagnosis', alasan: "Istilah medis/ilmiah baku: 'diagnosis'." },
  sintesa: { baku: 'sintesis', alasan: "Istilah sains baku menurut KBBI: 'sintesis'." },
  hakekat: { baku: 'hakikat', alasan: "Baku menurut KBBI menggunakan huruf 'i': 'hakikat'." },
  cendikiawan: { baku: 'cendekiawan', alasan: "Baku menurut KBBI: 'cendekiawan'." },
  hirarki: { baku: 'hierarki', alasan: "Baku menurut KBBI: 'hierarki'." },
  pondasi: { baku: 'fondasi', alasan: "Baku menurut KBBI menggunakan huruf 'f': 'fondasi'." },
  azas: { baku: 'asas', alasan: "Baku menurut KBBI menggunakan huruf 's': 'asas'." },
  kharisma: { baku: 'karisma', alasan: "Baku menurut KBBI tanpa 'h': 'karisma'." },
  lobang: { baku: 'lubang', alasan: "Baku menurut KBBI menggunakan huruf 'u': 'lubang'." },
  nafas: { baku: 'napas', alasan: "Baku menurut KBBI menggunakan huruf 'p': 'napas'." },
  faham: { baku: 'paham', alasan: "Baku menurut KBBI menggunakan huruf 'p': 'paham'." },
  fikir: { baku: 'pikir', alasan: "Baku menurut KBBI menggunakan huruf 'p': 'pikir'." },
  jaman: { baku: 'zaman', alasan: "Baku menurut KBBI menggunakan huruf 'z': 'zaman'." },
  prosentase: { baku: 'persentase', alasan: "Berasal dari kata 'persen', bentuk baku adalah 'persentase'." },
  ekosistim: { baku: 'ekosistem', alasan: "Baku menurut KBBI: 'ekosistem'." },
  trampil: { baku: 'terampil', alasan: "Baku menurut KBBI: 'terampil'." },
  teoritis: { baku: 'teoretis', alasan: "Baku menurut KBBI: 'teoretis'." },
  propinsi: { baku: 'provinsi', alasan: "Baku menurut KBBI menggunakan huruf 'v': 'provinsi'." },
};

// Kaidah awalan di- yang salah sambung (Preposisi tempat harus dipisah)
export const PREPOSISI_DI_SALAH_SAMBUNG: Record<string, string> = {
  dirumah: 'di rumah',
  disekolah: 'di sekolah',
  didalam: 'di dalam',
  diluar: 'di luar',
  diatas: 'di atas',
  dibawah: 'di bawah',
  dikelas: 'di kelas',
  ditengah: 'di tengah',
  dilingkungan: 'di lingkungan',
  disekitar: 'di sekitar',
  disamping: 'di samping',
  didepan: 'di depan',
  dibelakang: 'di belakang',
  disini: 'di sini',
  disana: 'di sana',
  dimana: 'di mana',
};

// Kaidah awalan di- yang salah pisah (Kata kerja pasif harus digabung)
export const KATA_KERJA_DI_SALAH_PISAH = [
  'baca', 'tulis', 'buat', 'amati', 'hitung', 'lakukan', 'gunakan', 'pilih',
  'jelaskan', 'berikan', 'sebut', 'tentukan', 'ketahui', 'peroleh', 'butuhkan',
  'hasilkan', 'perhatikan', 'simpulkan', 'kelompokkan', 'bedakan', 'bandingkan',
  'jawab', 'pasangkan', 'tunjukkan', 'identifikasi', 'uraikan', 'sebutkan'
];

/**
 * Memeriksa sebuah teks dan mengembalikan daftar isu tata bahasa/ejaan
 */
export const checkTextForIssues = (
  text: string,
  nomorSoal: number,
  field: SpellcheckIssue['field'],
  fieldLabel: string,
  subIndex?: number
): SpellcheckIssue[] => {
  if (!text || typeof text !== 'string') return [];
  const issues: SpellcheckIssue[] = [];

  // 1. Periksa Kata Tidak Baku
  for (const [nonBaku, data] of Object.entries(DICTIONARY_KATA_TIDAK_BAKU)) {
    const regex = new RegExp(`\\b${nonBaku}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const originalWord = match[0];
      // Pertahankan kapitalisasi awal
      let replacement = data.baku;
      if (originalWord[0] === originalWord[0].toUpperCase()) {
        replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }

      issues.push({
        id: `${nomorSoal}-${field}-${subIndex ?? 0}-nonbaku-${nonBaku}-${match.index}`,
        nomorSoal,
        field,
        fieldLabel,
        subIndex,
        originalText: text,
        suggestedText: text.replace(regex, replacement),
        wordFound: originalWord,
        replacementWord: replacement,
        category: 'istilah_tidak_baku',
        categoryLabel: 'Istilah Tidak Baku',
        ruleExplanation: data.alasan,
        severity: 'warning',
      });
    }
  }

  // 2. Periksa Preposisi 'di-' yang salah sambung
  for (const [gabung, pisah] of Object.entries(PREPOSISI_DI_SALAH_SAMBUNG)) {
    const regex = new RegExp(`\\b${gabung}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const originalWord = match[0];
      let replacement = pisah;
      if (originalWord[0] === originalWord[0].toUpperCase()) {
        replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }

      issues.push({
        id: `${nomorSoal}-${field}-${subIndex ?? 0}-dipisah-${gabung}-${match.index}`,
        nomorSoal,
        field,
        fieldLabel,
        subIndex,
        originalText: text,
        suggestedText: text.replace(regex, replacement),
        wordFound: originalWord,
        replacementWord: replacement,
        category: 'kaidah_di',
        categoryLabel: 'Kata Depan "di"',
        ruleExplanation: `Kata depan penunjuk tempat/posisi '${pisah}' harus ditulis terpisah dengan spasi, bukan disambung.`,
        severity: 'warning',
      });
    }
  }

  // 3. Periksa Kata Kerja Pasif 'di ' yang salah pisah
  for (const verb of KATA_KERJA_DI_SALAH_PISAH) {
    const regex = new RegExp(`\\bdi\\s+${verb}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const originalWord = match[0];
      const isUpper = originalWord[0] === 'D';
      const replacement = (isUpper ? 'Di' : 'di') + verb;

      issues.push({
        id: `${nomorSoal}-${field}-${subIndex ?? 0}-disambung-${verb}-${match.index}`,
        nomorSoal,
        field,
        fieldLabel,
        subIndex,
        originalText: text,
        suggestedText: text.replace(regex, replacement),
        wordFound: originalWord,
        replacementWord: replacement,
        category: 'kaidah_di',
        categoryLabel: 'Awalan Pasif "di-"',
        ruleExplanation: `Awalan pembentuk kata kerja pasif '${replacement}' harus ditulis serangkai (tanpa spasi).`,
        severity: 'warning',
      });
    }
  }

  // 4. Periksa Spasi Ganda yang Tidak Disengaja
  if (/\s{2,}/.test(text)) {
    issues.push({
      id: `${nomorSoal}-${field}-${subIndex ?? 0}-spasiganda`,
      nomorSoal,
      field,
      fieldLabel,
      subIndex,
      originalText: text,
      suggestedText: text.replace(/\s{2,}/g, ' '),
      wordFound: 'Spasi Ganda',
      replacementWord: 'Spasi Tunggal',
      category: 'spasi_ganda',
      categoryLabel: 'Tipografi Spasi',
      ruleExplanation: 'Terdapat dua spasi atau lebih berurutan dalam teks, disarankan menggunakan spasi tunggal.',
      severity: 'info',
    });
  }

  // 5. Periksa Kata Berulang yang Tidak Disengaja (cth: "yang yang", "pada pada")
  const repeatRegex = /\b(yang|pada|dan|adalah|untuk|dari|dalam|dengan|ke|atau)\s+\1\b/gi;
  let repMatch;
  while ((repMatch = repeatRegex.exec(text)) !== null) {
    const originalWord = repMatch[0];
    const singleWord = repMatch[1];
    issues.push({
      id: `${nomorSoal}-${field}-${subIndex ?? 0}-repetisi-${repMatch.index}`,
      nomorSoal,
      field,
      fieldLabel,
      subIndex,
      originalText: text,
      suggestedText: text.replace(repeatRegex, singleWord),
      wordFound: originalWord,
      replacementWord: singleWord,
      category: 'kata_berulang',
      categoryLabel: 'Kata Berulang / Tipografi',
      ruleExplanation: `Ditemukan pengulangan kata '${originalWord}' yang kemungkinan merupakan kesalahan ketik (typo).`,
      severity: 'warning',
    });
  }

  // 6. Periksa Tanda Tanya pada Kalimat Tanya
  if (field === 'pertanyaan') {
    const isInterrogative = /^(apakah|bagaimanakah|berapakah|mengapakah|mengapa|siapakah|kapan|dimanakah|di mana|kenapa|manakah)\b/i.test(text.trim());
    if (isInterrogative && !text.trim().endsWith('?')) {
      issues.push({
        id: `${nomorSoal}-${field}-missing-question-mark`,
        nomorSoal,
        field,
        fieldLabel,
        subIndex,
        originalText: text,
        suggestedText: text.trim().replace(/[.,;:]+$/, '') + '?',
        wordFound: 'Akhiran Kalimat',
        replacementWord: 'Tanda Tanya (?)',
        category: 'tanda_baca',
        categoryLabel: 'Tanda Baca Kalimat Tanya',
        ruleExplanation: "Kalimat yang diawali kata tanya harus diakhiri dengan tanda tanya '?' sesuai kaidah PUEBI.",
        severity: 'info',
      });
    }
  }

  return issues;
};
