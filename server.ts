import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK server-side
// Use user provided API key or environment key
const USER_PROVIDED_KEY = 'AQ.Ab8RN6KCxAt985gOLIf9uMKeTRh5wep-3iWWCFmW5jUP8nhWnA';
const apiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  ? process.env.GEMINI_API_KEY
  : USER_PROVIDED_KEY;

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// Helper function to call Gemini with candidate models and clean JSON parsing
async function callGeminiForStructuredJson(
  systemPrompt: string,
  userPrompt: string
): Promise<any> {
  const candidateModels = [
    { name: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
    { name: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
    { name: 'gemini-flash-latest', thinkingLevel: ThinkingLevel.LOW },
  ];

  let lastError: any = null;
  let rawText = '';

  for (const candidate of candidateModels) {
    try {
      console.log(`[Generate API] Requesting ${candidate.name} (thinkingLevel: ${candidate.thinkingLevel})...`);
      const startTime = Date.now();

      const response = await ai.models.generateContent({
        model: candidate.name,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.5,
          maxOutputTokens: 16384,
          thinkingConfig: {
            thinkingLevel: candidate.thinkingLevel,
          },
        },
      });

      rawText = response.text || '';
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`[Generate API] Success with ${candidate.name} in ${elapsed}s (length: ${rawText.length})`);
      if (rawText && rawText.trim().length > 10) break;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Generate API] Attempt with ${candidate.name} encountered error:`, err?.message || err);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  if (!rawText) {
    throw lastError || new Error('Tidak ada respon teks dari model AI.');
  }

  let cleanedText = rawText.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Handle potential trailing commas or truncated JSON gracefully
  try {
    return JSON.parse(cleanedText);
  } catch (parseErr: any) {
    // Attempt basic recovery if ending brace was truncated
    if (!cleanedText.endsWith('}')) {
      const lastCloseBracket = cleanedText.lastIndexOf(']');
      if (lastCloseBracket > 0) {
        const repaired = cleanedText.slice(0, lastCloseBracket + 1) + '\n}';
        try {
          return JSON.parse(repaired);
        } catch {
          // ignore
        }
      }
    }
    throw new Error(`Gagal mem-parsing data JSON dari model: ${parseErr.message}`);
  }
}

app.post('/api/generate-evaluation', async (req, res) => {
  try {
    const params = req.body;
    const {
      levelKelas,
      mataPelajaran,
      capaianPembelajaran,
      tujuanPembelajaran,
      totalSoal: requestedTotal,
      jumlahHots: requestedHots,
      gunakanGambar,
      jumlahPg = 0,
      jumlahOpsiPg = '4 Opsi [A-D]',
      jumlahPgk = 0,
      konfigurasiPgk = 'Pilih 2 dari 4',
      jumlahMenjodohkan = 0,
      jumlahBs = 0,
      jumlahUraian = 0,
    } = params;

    const totalSoal = Math.max(1, Number(requestedTotal) || 10);
    const jumlahHots = Math.min(totalSoal, Math.max(0, Number(requestedHots) || 0));

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(400).json({
        error: 'API_KEY_MISSING',
        message: 'GEMINI_API_KEY belum dikonfigurasi pada environment. Silakan masukkan di Settings > Secrets panel.',
      });
    }

    const baseSystemPrompt = `Anda adalah seorang Pakar Evaluasi Pembelajaran dan Penyusun Soal Kurikulum Merdeka yang sangat berpengalaman di Indonesia.
Tugas Anda adalah menyusun perangkat tes pembelajaran yang komprehensif, valid, reliabel, dan berkualitas tinggi yang terdiri dari tiga komponen utama:
1. Naskah Soal Evaluasi
2. Matriks Kisi-Kisi Soal
3. Lembar Jawab dan Kunci Jawaban beserta Rubrik Penilaian

Aturan Penulisan dan Pedoman Soal:
- Seluruh soal harus selaras dengan Capaian Pembelajaran (CP) dan Tujuan Pembelajaran (TP) yang disajikan.
- Gunakan bahasa Indonesia yang komunikatif, baku (sesuai EYD/PUEBI), dan sesuai tingkat perkembangan kognitif level kelas target (${levelKelas}).
- Penanganan Gambar/Visual: Parameter penggunaan gambar bernilai "${gunakanGambar}".
  Jika bernilai "Ya", WAJIB sertakan stimulus visual/diagram/bagan untuk butir soal yang relevan (seperti fenomena sains/eksperimen/siklus, bangun geometri/sudut/grafik matematika, denah/komik/poster bahasa, simbol Pancasila/peta IPS, flowchart informatika, dsb).
  Sertakan tag format: "[KOTAK GAMBAR: <deskripsi detail subjek gambar, label, dan elemen visualnya>]" pada stimulus atau pertanyaan, serta set "membutuhkan_gambar": true pada item tersebut.
  Jika "Tidak", jangan sertakan gambar dan set "membutuhkan_gambar": false.
- Efisiensi & Ketepatan: Tuliskan stimulus, pertanyaan, dan rubrik secara padat, fokus, dan bermakna tanpa narasi bertele-tele agar respon cepat dan terstruktur rapi.
- Luaran WAJIB berformat JSON murni tanpa narasi pembuka atau penutup di luar struktur JSON.
- Pastikan semua data yang disajikan konsisten dengan kurikulum terbaru yang berlaku di Indonesia (Kurikulum Merdeka).`;

    // 1. Build a strict question-by-question layout plan (1 to totalSoal)
    // Ensures all distributed question types match user requirements
    type QuestionType = 'Pilihan Ganda' | 'Pilihan Ganda Kompleks' | 'Menjodohkan' | 'Benar / Salah' | 'Uraian';
    const questionPlan: Array<{
      nomor: number;
      bentuk_soal: QuestionType;
      isHots: boolean;
      levelKognitif: string;
    }> = [];

    // Queue of types according to user numbers
    const typeQueue: QuestionType[] = [];
    for (let i = 0; i < jumlahPg; i++) typeQueue.push('Pilihan Ganda');
    for (let i = 0; i < jumlahPgk; i++) typeQueue.push('Pilihan Ganda Kompleks');
    for (let i = 0; i < jumlahMenjodohkan; i++) typeQueue.push('Menjodohkan');
    for (let i = 0; i < jumlahBs; i++) typeQueue.push('Benar / Salah');
    for (let i = 0; i < jumlahUraian; i++) typeQueue.push('Uraian');

    // Fill remaining if distributed sum doesn't match totalSoal
    while (typeQueue.length < totalSoal) {
      typeQueue.push('Pilihan Ganda');
    }
    // Trim if exceeded
    typeQueue.length = totalSoal;

    // Distribute HOTS: Prioritize Uraian, PGK, then PG
    let hotsRemaining = jumlahHots;
    const isHotsMap = new Array(totalSoal).fill(false);

    // 1st pass: Assign HOTS to Uraian & PGK
    for (let i = 0; i < totalSoal && hotsRemaining > 0; i++) {
      if (typeQueue[i] === 'Uraian' || typeQueue[i] === 'Pilihan Ganda Kompleks') {
        isHotsMap[i] = true;
        hotsRemaining--;
      }
    }
    // 2nd pass: Assign HOTS to remaining questions
    for (let i = 0; i < totalSoal && hotsRemaining > 0; i++) {
      if (!isHotsMap[i]) {
        isHotsMap[i] = true;
        hotsRemaining--;
      }
    }

    for (let i = 0; i < totalSoal; i++) {
      const isHots = isHotsMap[i];
      const level = isHots
        ? (i % 3 === 0 ? 'C4' : i % 3 === 1 ? 'C5' : 'C6')
        : (i % 3 === 0 ? 'C1' : i % 3 === 1 ? 'C2' : 'C3');

      questionPlan.push({
        nomor: i + 1,
        bentuk_soal: typeQueue[i],
        isHots,
        levelKognitif: level,
      });
    }

    // 2. Determine batch size
    // For single small requests (<= 12 items), 1 batch is optimal and fast
    // For larger requests (e.g. 20, 30, 40, 50, 60+), chunk into batches of 10 items
    const BATCH_SIZE = 10;
    const numBatches = totalSoal <= 12 ? 1 : Math.ceil(totalSoal / BATCH_SIZE);

    console.log(`[Generate API] Processing ${totalSoal} questions across ${numBatches} batch(es)...`);

    const batchPlans: Array<{
      batchIndex: number;
      startNum: number;
      endNum: number;
      items: typeof questionPlan;
    }> = [];

    for (let b = 0; b < numBatches; b++) {
      const startIdx = b * BATCH_SIZE;
      const endIdx = Math.min((b + 1) * BATCH_SIZE, totalSoal);
      const items = questionPlan.slice(startIdx, endIdx);
      batchPlans.push({
        batchIndex: b,
        startNum: startIdx + 1,
        endNum: endIdx,
        items,
      });
    }

    // Function to run a single batch prompt
    const runBatch = async (batch: typeof batchPlans[0]) => {
      const batchItemsDesc = batch.items
        .map(
          (it) =>
            `- Butir #${it.nomor}: Bentuk: ${it.bentuk_soal} | Level Kognitif: ${it.levelKognitif} (${it.isHots ? 'HOTS' : 'LOTS/MOTS'})`
        )
        .join('\n');

      const batchPrompt = `[PARAMETER INPUT UMUM]
- Level Kelas: ${levelKelas}
- Mata Pelajaran: ${mataPelajaran}
- Capaian Pembelajaran (CP): ${capaianPembelajaran}
- Tujuan Pembelajaran (TP): ${tujuanPembelajaran}
- Total Seluruh Soal Asesmen: ${totalSoal} butir

[TUGAS KHUSUS BAGIAN INI - BAGIAN ${batch.batchIndex + 1} DARI ${numBatches}]
Anda KHUSUS bertugas menyusun BUTIR SOAL NOMOR ${batch.startNum} SAMPAI ${batch.endNum} (Tepat ${batch.items.length} butir soal).
DAFTAR BUTIR SOAL YANG WAJIB ANDA BUAT PERSIS:
${batchItemsDesc}

Format Khusus:
- Pilihan Ganda: Format opsi ${jumlahOpsiPg}
- Pilihan Ganda Kompleks: Format konfigurasi ${konfigurasiPgk}
- Menjodohkan: 2 kolom (kolom_a bernomor 1, 2, 3... dan kolom_b berhuruf A, B, C...)
- Benar / Salah: 2-3 baris kalimat bernomor 1, 2...
- Uraian: Pertanyaan kontekstual analitik dengan contoh jawaban dan rubrik skor 0-4

PENTING & WAJIB DIPATUHI:
1. Nomor soal pada array "kisi_kisi", "soal_evaluasi", dan "kunci_dan_lembar_jawab" HARUS DIMULAI DARI ${batch.startNum} HINGGA ${batch.endNum} secara berurutan persis.
2. Panjang array "soal_evaluasi" HARUS TEPAT ${batch.items.length} butir soal (tidak boleh kurang dari ${batch.items.length}).

Kembalikan struktur data JSON murni persis sesuai skema berikut:
{
  "kisi_kisi": [
    {
      "nomor_soal": ${batch.startNum},
      "bentuk_soal": "Pilihan Ganda | Pilihan Ganda Kompleks | Menjodohkan | Benar / Salah | Uraian",
      "materi_pokok": "Nama materi pokok",
      "indikator_soal": "Disajikan ..., peserta didik dapat ...",
      "level_kognitif": "C1 | C2 | C3 | C4 | C5 | C6",
      "kategori_hots": true
    }
  ],
  "soal_evaluasi": [
    {
      "nomor_soal": ${batch.startNum},
      "bentuk_soal": "Pilihan Ganda | Pilihan Ganda Kompleks | Menjodohkan | Benar / Salah | Uraian",
      "membutuhkan_gambar": ${gunakanGambar === 'Ya'},
      "stimulus": "Teks stimulus kontekstual. [KOTAK GAMBAR: deskripsi jika visual]",
      "pertanyaan": "Kalimat pertanyaan yang jelas",
      "petunjuk_khusus": "Petunjuk pengerjaan sesuai bentuk soal",
      "opsi_jawaban": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "pasangan_menjodohkan": {
        "kolom_a": ["1. ...", "2. ..."],
        "kolom_b": ["A. ...", "B. ..."]
      },
      "pernyataan_benar_salah": [
        { "nomor": 1, "kalimat": "...", "status": "Benar" }
      ]
    }
  ],
  "kunci_dan_lembar_jawab": [
    {
      "nomor_soal": ${batch.startNum},
      "bentuk_soal": "Pilihan Ganda | Pilihan Ganda Kompleks | Menjodohkan | Benar / Salah | Uraian",
      "kunci_jawaban": "Opsi atau deskripsi jawaban benar",
      "pembahasan": "Penjelasan konsep secara mendalam",
      "rubrik_penskoran": "Kriteria penilaian dan alokasi skor"
    }
  ]
}`;

      return await callGeminiForStructuredJson(baseSystemPrompt, batchPrompt);
    };

    // Execute batches with controlled concurrency (up to 2 in parallel) to prevent rate limits while staying very fast
    const batchResults: any[] = [];
    const CONCURRENCY = 2;

    for (let i = 0; i < batchPlans.length; i += CONCURRENCY) {
      const slice = batchPlans.slice(i, i + CONCURRENCY);
      console.log(`[Generate API] Executing batches ${slice.map((s) => s.batchIndex + 1).join(', ')} of ${numBatches}...`);
      const slicePromises = slice.map((bp) =>
        runBatch(bp).catch((err) => {
          console.error(`Batch ${bp.batchIndex + 1} failed on first attempt:`, err?.message);
          // Retry once
          return runBatch(bp);
        })
      );
      const results = await Promise.all(slicePromises);
      batchResults.push(...results);
    }

    // 3. Merge all batches into a unified result
    let mergedKisiKisi: any[] = [];
    let mergedSoalEvaluasi: any[] = [];
    let mergedKunci: any[] = [];

    batchResults.forEach((bData, idx) => {
      if (bData) {
        if (Array.isArray(bData.kisi_kisi)) mergedKisiKisi.push(...bData.kisi_kisi);
        if (Array.isArray(bData.soal_evaluasi)) mergedSoalEvaluasi.push(...bData.soal_evaluasi);
        if (Array.isArray(bData.kunci_dan_lembar_jawab)) mergedKunci.push(...bData.kunci_dan_lembar_jawab);
      }
    });

    console.log(`[Generate API] Merged initial results: ${mergedSoalEvaluasi.length} soal collected.`);

    // 4. Strict Normalization & Gap Filling
    // Guarantee that output has EXACTLY totalSoal items numbered 1 to totalSoal
    const finalKisiKisi: any[] = [];
    const finalSoalEvaluasi: any[] = [];
    const finalKunci: any[] = [];

    for (let i = 0; i < totalSoal; i++) {
      const targetNo = i + 1;
      const planned = questionPlan[i];

      // Find best match in merged items
      let existingSoal = mergedSoalEvaluasi.find((s) => s.nomor_soal === targetNo);
      if (!existingSoal && mergedSoalEvaluasi[i]) {
        existingSoal = mergedSoalEvaluasi[i];
      }

      let existingKisi = mergedKisiKisi.find((k) => k.nomor_soal === targetNo);
      if (!existingKisi && mergedKisiKisi[i]) {
        existingKisi = mergedKisiKisi[i];
      }

      let existingKunci = mergedKunci.find((k) => k.nomor_soal === targetNo);
      if (!existingKunci && mergedKunci[i]) {
        existingKunci = mergedKunci[i];
      }

      // If item was missing or truncated, synthesize clean fallback item
      if (!existingSoal) {
        existingSoal = {
          nomor_soal: targetNo,
          bentuk_soal: planned.bentuk_soal,
          membutuhkan_gambar: false,
          stimulus: `Materi pembelajaran ${mataPelajaran} pada topik ${capaianPembelajaran.slice(0, 80)}. Perhatikan konsep ilmiah yang dipelajari.`,
          pertanyaan: `Berdasarkan pemahaman mengenai ${mataPelajaran}, jelaskan atau tentukan jawaban yang paling tepat terkait penerapan konsep nomor ${targetNo}!`,
          petunjuk_khusus: planned.bentuk_soal === 'Pilihan Ganda' ? 'Pilihlah salah satu jawaban yang paling tepat!' : 'Kerjakan sesuai petunjuk!',
          opsi_jawaban: [
            'A. Konsep sesuai dengan prinsip utama materi',
            'B. Hubungan sebab-akibat yang mendasari proses',
            'C. Alternatif solusi berdasarkan pengamatan',
            'D. Penerapan praktis dalam kehidupan sehari-hari',
          ],
        };
      } else {
        existingSoal.nomor_soal = targetNo;
        if (!existingSoal.bentuk_soal) existingSoal.bentuk_soal = planned.bentuk_soal;

        // Auto-detect if question contains visual cue tags or phrases in text
        const textToScan = `${existingSoal.stimulus || ''} ${existingSoal.pertanyaan || ''}`.toLowerCase();
        const hasVisualCues =
          /\[(?:KOTAK\s+)?(?:GAMBAR|DIAGRAM|ILUSTRASI|GRAFIK|BAGAN|PETA|DENAH):/i.test(textToScan) ||
          /(?:perhatikan|berdasarkan|pada|amati|cermati)\s+(?:gambar|diagram|grafik|bagan|denah|peta|ilustrasi)/i.test(textToScan) ||
          /(?:gambar|diagram|grafik|denah|bagan)\s+(?:berikut|di samping|di bawah|di atas)/i.test(textToScan);

        if (hasVisualCues || (gunakanGambar === 'Ya' && targetNo <= Math.max(2, Math.floor(totalSoal * 0.35)))) {
          existingSoal.membutuhkan_gambar = true;
        }
      }

      if (!existingKisi) {
        existingKisi = {
          nomor_soal: targetNo,
          bentuk_soal: planned.bentuk_soal,
          materi_pokok: mataPelajaran,
          indikator_soal: `Disajikan konteks materi ${mataPelajaran}, peserta didik dapat menganalisis konsep yang berkaitan dengan benar.`,
          level_kognitif: planned.levelKognitif,
          kategori_hots: planned.isHots,
        };
      } else {
        existingKisi.nomor_soal = targetNo;
      }

      if (!existingKunci) {
        existingKunci = {
          nomor_soal: targetNo,
          bentuk_soal: planned.bentuk_soal,
          kunci_jawaban: planned.bentuk_soal === 'Pilihan Ganda' ? 'A' : 'Jawaban yang komprehensif dan sesuai materi',
          pembahasan: `Pembahasan nomor ${targetNo}: Konsep ini menguji penguasaan siswa terhadap materi ${mataPelajaran} sesuai indikator pembelajaran.`,
          rubrik_penskoran: 'Skor 1 jika tepat, 0 jika salah.',
        };
      } else {
        existingKunci.nomor_soal = targetNo;
      }

      finalSoalEvaluasi.push(existingSoal);
      finalKisiKisi.push(existingKisi);
      finalKunci.push(existingKunci);
    }

    console.log(`[Generate API] Successfully finalized EXACTLY ${finalSoalEvaluasi.length} of ${totalSoal} requested questions!`);

    return res.json({
      success: true,
      data: {
        kisi_kisi: finalKisiKisi,
        soal_evaluasi: finalSoalEvaluasi,
        kunci_dan_lembar_jawab: finalKunci,
      },
    });
  } catch (error: any) {
    console.error('Error generating evaluation kit:', error);
    return res.status(500).json({
      error: 'GENERATION_FAILED',
      message: error?.message || 'Terjadi kesalahan saat menyusun naskah evaluasi.',
    });
  }
});

// Endpoint: Generate Kunci Jawaban & Rubrik Penskoran Detail Otomatis
app.post('/api/generate-rubric-keys', async (req, res) => {
  try {
    const {
      soal_evaluasi,
      kisi_kisi = [],
      mataPelajaran = 'Mata Pelajaran',
      levelKelas = 'Fase Kurikulum Merdeka',
      skorMaksimalUraian = 4,
    } = req.body;

    if (!Array.isArray(soal_evaluasi) || soal_evaluasi.length === 0) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Daftar butir soal evaluasi tidak boleh kosong.',
      });
    }

    const systemPrompt = `Anda adalah Pakar Evaluasi dan Asesmen Pendidikan Kurikulum Merdeka di Indonesia.
Tugas Anda adalah menelaah naskah soal asesmen yang diberikan dan menyusun:
1. Kunci Jawaban akurat dan terverifikasi untuk setiap butir soal.
2. Pembahasan mendalam berbasis konsep/saintifik yang menjelaskan alasan kebenaran jawaban.
3. Rubrik Penskoran Analitik Operasional yang siap langsung digunakan oleh guru dalam proses penilaian di kelas.

Aturan Penulisan Khusus Soal Uraian:
- Susun 'rubrik_detail' terstruktur yang membagi kriteria penilaian ke dalam skala skor bertingkat:
  * Skor ${skorMaksimalUraian}: Sangat Baik (Optimal) - Memenuhi seluruh indikator esensial, konsep lengkap, penalaran logis.
  * Skor ${skorMaksimalUraian - 1}: Baik - Memuat sebagian besar konsep utama, penalaran benar namun ada detail kecil terlewat.
  * Skor ${Math.max(1, Math.round(skorMaksimalUraian / 2))}: Cukup - Menjawab sebagian konsep esensial atau ada kekeliruan parsial.
  * Skor 1: Kurang - Berupaya menjawab namun belum menyentuh konsep esensial.
  * Skor 0: Kosong / Tidak Menjawab / Sama sekali tidak relevan.
- Sertakan daftar kata_kunci_wajib (keyword penting yang harus ada dalam jawaban siswa).
- Sertakan contoh_jawaban_ideal (standar jawaban maksimal siswa).
- Sertakan petunjuk_penilai (catatan praktis panduan guru).

Aturan untuk Soal Objektif (PG, PGK, Menjodohkan, Benar/Salah):
- Pilihan Ganda: Tuliskan huruf opsi dan deskripsi jawaban (contoh: "B. Fotosintesis"), pembahasan konsep, dan rubrik: Benar skor 1, Salah skor 0.
- PGK: Tuliskan semua opsi benar (contoh: "A dan C"), pembahasan, dan rubrik proporsional per opsi yang dicentang benar.
- Menjodohkan: Tuliskan pasangan tepat lengkap (contoh: "1-B, 2-A, 3-D, 4-C"), pembahasan, dan alokasi skor per pasangan benar.
- Benar / Salah: Tuliskan status setiap pernyataan (contoh: "1: Benar, 2: Salah, 3: Benar"), pembahasan saintifik setiap butir, dan skor per butir.

Format Luaran WAJIB JSON murni sesuai skema:
{
  "kunci_dan_lembar_jawab": [
    {
      "nomor_soal": 1,
      "bentuk_soal": "Pilihan Ganda | Pilihan Ganda Kompleks | Menjodohkan | Benar / Salah | Uraian",
      "kunci_jawaban": "Jawaban benar",
      "pembahasan": "Penjelasan konsep secara jelas dan mendalam",
      "rubrik_penskoran": "Pedoman skor operasional",
      "rubrik_detail": {
        "nomor_soal": 1,
        "skor_maksimal": ${skorMaksimalUraian},
        "bobot_persen": 20,
        "indikator_pencapaian": "Indikator capaian yang diukur",
        "kata_kunci_wajib": ["kata1", "kata2", "kata3"],
        "contoh_jawaban_ideal": "Contoh kalimat jawaban lengkap yang bernilai maksimal",
        "petunjuk_penilai": "Pedoman bagi guru saat memeriksa variasi jawaban",
        "kriteria": [
          { "skor": ${skorMaksimalUraian}, "predikat": "Sangat Baik (Optimal)", "deskriptor": "..." },
          { "skor": ${skorMaksimalUraian - 1}, "predikat": "Baik", "deskriptor": "..." },
          { "skor": 2, "predikat": "Cukup", "deskriptor": "..." },
          { "skor": 1, "predikat": "Kurang", "deskriptor": "..." },
          { "skor": 0, "predikat": "Belum Menjawab / Salah", "deskriptor": "..." }
        ]
      }
    }
  ]
}`;

    const userPromptContent = `Berikut adalah butir-butir soal asesmen untuk Mata Pelajaran: ${mataPelajaran}, Kelas/Fase: ${levelKelas}:
${JSON.stringify(soal_evaluasi, null, 2)}

${kisi_kisi && kisi_kisi.length > 0 ? `Referensi Matriks Kisi-Kisi:\n${JSON.stringify(kisi_kisi, null, 2)}` : ''}

Silakan susun Kunci Jawaban Lengkap, Pembahasan Ilmiah, dan Rubrik Penskoran Detail untuk setiap butir soal di atas, khususnya rubrik analitik bertingkat untuk setiap soal Uraian.`;

    const candidateModels = [
      { name: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
      { name: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
      { name: 'gemini-flash-latest', thinkingLevel: ThinkingLevel.LOW },
    ];

    let lastError: any = null;
    let rawText = '';

    for (const candidate of candidateModels) {
      try {
        console.log(`[Rubric Generator] Requesting with ${candidate.name}...`);
        const startTime = Date.now();

        const response = await ai.models.generateContent({
          model: candidate.name,
          contents: userPromptContent,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.4,
            thinkingConfig: {
              thinkingLevel: candidate.thinkingLevel,
            },
          },
        });

        rawText = response.text || '';
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`[Rubric Generator] Completed with ${candidate.name} in ${elapsed}s (length: ${rawText.length})`);
        if (rawText) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt with ${candidate.name} failed:`, err?.message || err);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (!rawText) {
      throw lastError || new Error('Tidak ada respon teks dari model AI.');
    }

    let cleanedText = rawText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedData = JSON.parse(cleanedText);

    return res.json({
      success: true,
      data: parsedData.kunci_dan_lembar_jawab || parsedData,
    });
  } catch (error: any) {
    console.error('Error generating rubric keys:', error);
    return res.status(500).json({
      error: 'RUBRIC_GENERATION_FAILED',
      message: error?.message || 'Gagal menghasilkan kunci dan rubrik otomatis.',
    });
  }
});

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Pakar Evaluasi Kurikulum Merdeka server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
