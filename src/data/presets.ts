import { EvaluationKit, PresetCurriculum } from '../types/assessment';

export const CURRICULUM_PRESETS: PresetCurriculum[] = [
  {
    id: 'sd-4-ipas',
    title: 'SD Kelas 4 - IPAS (Wujud Zat & Perubahannya)',
    fase: 'Fase B',
    levelKelas: 'Kelas 4 SD (Fase B)',
    mataPelajaran: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    capaianPembelajaran:
      'Peserta didik mengidentifikasi proses perubahan wujud zat dan perubahan bentuk energi dalam kehidupan sehari-hari, serta memanfaatkan gejala kemagnetan dan kelistrikan untuk menyelesaikan tantangan yang dihadapi dalam kehidupan sehari-hari.',
    tujuanPembelajaran:
      '1. Peserta didik dapat menganalisis karakteristik wujud zat (padat, cair, dan gas).\n2. Peserta didik dapat mengidentifikasi proses perubahan wujud zat (mencair, membeku, menguap, mengembun, menyublim, dan mengkristal) melalui pengamatan fenomena sehari-hari.\n3. Peserta didik dapat merancang penyelidikan sederhana untuk membuktikan peristiwa pelepasan atau penyerapan kalor pada perubahan wujud zat.',
    distribution: {
      totalSoal: 10,
      jumlahHots: 4,
      gunakanGambar: 'Ya',
      jumlahPg: 4,
      jumlahOpsiPg: '4 Opsi [A-D]',
      jumlahPgk: 2,
      konfigurasiPgk: '4 opsi dengan 3 jawaban benar',
      jumlahMenjodohkan: 1,
      jumlahBs: 2,
      jumlahUraian: 1,
    },
  },
  {
    id: 'sd-5-matematika',
    title: 'SD Kelas 5 - Matematika (Operasi Pecahan & Desimal)',
    fase: 'Fase C',
    levelKelas: 'Kelas 5 SD (Fase C)',
    mataPelajaran: 'Matematika',
    capaianPembelajaran:
      'Peserta didik dapat membandingkan dan mengurutkan berbagai pecahan termasuk pecahan campuran, melakukan operasi penjumlahan dan pengurangan pecahan, serta melakukan operasi perkalian dan pembagian pecahan dengan bilangan asli.',
    tujuanPembelajaran:
      '1. Peserta didik dapat menyelesaikan permasalahan kontekstual penjumlahan dan pengurangan pecahan berpenyebut berbeda.\n2. Peserta didik dapat menganalisis perbandingan nilai pecahan dan desimal dalam transaksi jual-beli dan resep masakan.\n3. Peserta didik dapat mengevaluasi ketepatan penghitungan pembagian pecahan dengan bilangan asli dalam pembagian takaran bahan.',
    distribution: {
      totalSoal: 8,
      jumlahHots: 3,
      gunakanGambar: 'Ya',
      jumlahPg: 3,
      jumlahOpsiPg: '4 Opsi [A-D]',
      jumlahPgk: 2,
      konfigurasiPgk: '3 opsi dengan 2 jawaban benar',
      jumlahMenjodohkan: 1,
      jumlahBs: 1,
      jumlahUraian: 1,
    },
  },
  {
    id: 'sd-6-bahasa-indonesia',
    title: 'SD Kelas 6 - Bahasa Indonesia (Teks Eksplanasi Fenomena Alam)',
    fase: 'Fase C',
    levelKelas: 'Kelas 6 SD (Fase C)',
    mataPelajaran: 'Bahasa Indonesia',
    capaianPembelajaran:
      'Peserta didik mampu memahami ide pokok dan ide pendukung pada teks informatif, mengevaluasi informasi berupa gagasan, pikiran, atau pesan dari teks eksplanasi, serta menyusun simpulan berbasis fakta.',
    tujuanPembelajaran:
      '1. Peserta didik dapat mengidentifikasi struktur teks eksplanasi (pernyataan umum, deretan penjelas, dan simpulan/interpretasi).\n2. Peserta didik dapat menganalisis hubungan sebab-akibat fenomena alam (banjir, gempa, siklus hidrologi) dalam teks bacaan.\n3. Peserta didik dapat menyusun rangkuman kritis terhadap solusi penanggulangan bencana berdasarkan data kontekstual.',
    distribution: {
      totalSoal: 10,
      jumlahHots: 4,
      gunakanGambar: 'Ya',
      jumlahPg: 4,
      jumlahOpsiPg: '4 Opsi [A-D]',
      jumlahPgk: 2,
      konfigurasiPgk: '4 opsi dengan 3 jawaban benar',
      jumlahMenjodohkan: 1,
      jumlahBs: 2,
      jumlahUraian: 1,
    },
  },
  {
    id: 'smp-7-ipa',
    title: 'SMP Kelas 7 - IPA Terpadu (Ekosistem & Interaksi Makhluk Hidup)',
    fase: 'Fase D',
    levelKelas: 'Kelas 7 SMP (Fase D)',
    mataPelajaran: 'Ilmu Pengetahuan Alam (IPA)',
    capaianPembelajaran:
      'Peserta didik mengidentifikasi interaksi antarmakhluk hidup dan lingkungannya, merancang upaya-upaya mencegah dan mengatasi pencemaran dan perubahan iklim, serta menganalisis dampak aktivitas manusia terhadap keanekaragaman hayati.',
    tujuanPembelajaran:
      '1. Peserta didik dapat menganalisis dinamika rantai makanan dan jaring-jaring makanan pada suatu ekosistem persawahan/hutan mangrove.\n2. Peserta didik dapat mengevaluasi dampak kepunahan salah satu tingkat trofik terhadap keseimbangan populasi lain.\n3. Peserta didik dapat merumuskan rekomendasi pemecahan masalah pencemaran limbah terhadap kelangsungan hidup organisme perairan.',
    distribution: {
      totalSoal: 10,
      jumlahHots: 5,
      gunakanGambar: 'Ya',
      jumlahPg: 4,
      jumlahOpsiPg: '4 Opsi [A-D]',
      jumlahPgk: 2,
      konfigurasiPgk: '4 opsi dengan 3 jawaban benar',
      jumlahMenjodohkan: 1,
      jumlahBs: 2,
      jumlahUraian: 1,
    },
  },
  {
    id: 'sma-10-biologi',
    title: 'SMA Kelas 10 - Biologi (Keanekaragaman Hayati & Konservasi)',
    fase: 'Fase E',
    levelKelas: 'Kelas 10 SMA (Fase E)',
    mataPelajaran: 'Biologi',
    capaianPembelajaran:
      'Peserta didik memiliki kemampuan menciptakan solusi atas permasalahan-permasalahan berdasarkan isu lokal, nasional atau global terkait pemahaman keanekaragaman makhluk hidup dan peranannya dalam menjaga kestabilan biosfer.',
    tujuanPembelajaran:
      '1. Peserta didik dapat membedakan tingkatan keanekaragaman hayati (gen, jenis, dan ekosistem) di Indonesia.\n2. Peserta didik dapat menganalisis biogeografi flora dan fauna Indonesia berdasarkan garis Wallace dan Weber.\n3. Peserta didik dapat mengevaluasi efektivitas metode konservasi in-situ dan ex-situ dalam mencegah ancaman kepunahan satwa endemik.',
    distribution: {
      totalSoal: 10,
      jumlahHots: 5,
      gunakanGambar: 'Ya',
      jumlahPg: 4,
      jumlahOpsiPg: '5 Opsi [A-E]',
      jumlahPgk: 2,
      konfigurasiPgk: '5 opsi dengan 3 jawaban benar',
      jumlahMenjodohkan: 1,
      jumlahBs: 2,
      jumlahUraian: 1,
    },
  },
];

export const INITIAL_SAMPLE_KIT: EvaluationKit = {
  kisi_kisi: [
    {
      nomor_soal: 1,
      bentuk_soal: 'Pilihan Ganda',
      materi_pokok: 'Wujud Zat dan Sifat Partikel',
      indikator_soal:
        'Disajikan narasi percobaan memasukkan air ke dalam berbagai wadah, peserta didik dapat menyimpulkan sifat bentuk dan volume zat cair dengan tepat.',
      level_kognitif: 'C2',
      kategori_hots: false,
    },
    {
      nomor_soal: 2,
      bentuk_soal: 'Pilihan Ganda',
      materi_pokok: 'Perubahan Wujud Zat (Menyublim)',
      indikator_soal:
        'Disajikan kasus kapur barus di dalam lemari pakaian yang mengecil seiring waktu, peserta didik dapat mengidentifikasi jenis perubahan wujud dan peran kalor dengan tepat.',
      level_kognitif: 'C3',
      kategori_hots: false,
    },
    {
      nomor_soal: 3,
      bentuk_soal: 'Pilihan Ganda',
      materi_pokok: 'Perubahan Wujud Zat dan Kalor (Mengembun)',
      indikator_soal:
        'Disajikan gambar gelas berisi es batu yang dinding luarnya basah oleh butiran air, peserta didik dapat menganalisis asal-usul titik air berdasarkan peristiwa perpindahan kalor di udara sekitar.',
      level_kognitif: 'C4',
      kategori_hots: true,
    },
    {
      nomor_soal: 4,
      bentuk_soal: 'Pilihan Ganda',
      materi_pokok: 'Pemanfaatan Perubahan Wujud Zat',
      indikator_soal:
        'Disajikan kasus pengeringan pakaian basah saat cuaca mendung berangin dibanding cuaca panas terik, peserta didik dapat mengevaluasi faktor yang memengaruhi kecepatan penguapan.',
      level_kognitif: 'C5',
      kategori_hots: true,
    },
    {
      nomor_soal: 5,
      bentuk_soal: 'Pilihan Ganda Kompleks',
      materi_pokok: 'Proses Perubahan Wujud yang Membutuhkan Kalor',
      indikator_soal:
        'Disajikan daftar berbagai peristiwa perubahan wujud zat dalam kehidupan sehari-hari, peserta didik dapat memilih 3 peristiwa yang menyerap kalor dari lingkungan.',
      level_kognitif: 'C4',
      kategori_hots: true,
    },
    {
      nomor_soal: 6,
      bentuk_soal: 'Pilihan Ganda Kompleks',
      materi_pokok: 'Karakteristik Partikel Zat Padat, Cair, dan Gas',
      indikator_soal:
        'Disajikan 4 pernyataan mengenai pergerakan dan susunan partikel zat, peserta didik dapat menentukan 3 pernyataan yang benar terkait zat gas.',
      level_kognitif: 'C4',
      kategori_hots: true,
    },
    {
      nomor_soal: 7,
      bentuk_soal: 'Menjodohkan',
      materi_pokok: 'Istilah Perubahan Wujud Zat',
      indikator_soal:
        'Disajikan nama proses perubahan wujud zat pada Kolom A, peserta didik dapat menjodohkannya dengan contoh peristiwa nyata yang sesuai pada Kolom B.',
      level_kognitif: 'C3',
      kategori_hots: false,
    },
    {
      nomor_soal: 8,
      bentuk_soal: 'Benar / Salah',
      materi_pokok: 'Konsep Massa dan Volume Zat',
      indikator_soal:
        'Disajikan pernyataan bahwa volume gas di dalam balon akan tetap sama meskipun dipindahkan ke tabung yang lebih besar, peserta didik dapat menganalisis kebenaran pernyataan tersebut.',
      level_kognitif: 'C3',
      kategori_hots: false,
    },
    {
      nomor_soal: 9,
      bentuk_soal: 'Benar / Salah',
      materi_pokok: 'Perubahan Fisika pada Lilin yang Menyala',
      indikator_soal:
        'Disajikan pernyataan analisis bahwa melelehnya batang lilin merupakan perubahan fisika sedangkan sumbu yang terbakar menghasilkan zat baru, peserta didik dapat menentukan status kebenarannya.',
      level_kognitif: 'C4',
      kategori_hots: true,
    },
    {
      nomor_soal: 10,
      bentuk_soal: 'Uraian',
      materi_pokok: 'Penyelidikan Ilmiah Perubahan Wujud Zat & Siklus Air',
      indikator_soal:
        'Disajikan narasi pembuatan es lilin dan peristiwa terbentuknya hujan, peserta didik dapat menjelaskan peranan kalor dalam perubahan wujud pada siklus air serta mengusulkan solusi pencegahan embun berlebih pada kaca kacamata saat memakai masker.',
      level_kognitif: 'C6',
      kategori_hots: true,
    },
  ],
  soal_evaluasi: [
    {
      nomor_soal: 1,
      bentuk_soal: 'Pilihan Ganda',
      membutuhkan_gambar: false,
      stimulus:
        'Siti melakukan percobaan di laboratorium kelas. Ia menuangkan 200 ml susu cair dari gelas ukur silinder ke dalam mangkuk bundar, lalu memindahkannya lagi ke dalam botol minum yang berbentuk pipih. Setelah diukur kembali menggunakan neraca dan gelas ukur, volume susu tetap 200 ml.',
      pertanyaan:
        'Berdasarkan pengamatan Siti, bagaimanakah sifat bentuk dan volume dari zat cair?',
      opsi_jawaban: [
        'A. Bentuknya tetap dan volumenya selalu berubah-ubah mengikuti wadah.',
        'B. Bentuknya berubah mengikuti bentuk wadah, tetapi volumenya tetap.',
        'C. Bentuk dan volumenya selalu tetap di mana pun diletakkan.',
        'D. Bentuk dan volumenya selalu membesar memenuhi seluruh ruangan.',
      ],
    },
    {
      nomor_soal: 2,
      bentuk_soal: 'Pilihan Ganda',
      membutuhkan_gambar: false,
      stimulus:
        'Ibu meletakkan beberapa butir kapur barus (kamper) wangi di dalam lemari pakaian tertutup. Setelah tiga minggu, kapur barus tersebut tidak meninggalkan tetesan air sama sekali, namun ukurannya menjadi sangat kecil dan seisi lemari beraroma harum.',
      pertanyaan:
        'Peristiwa yang terjadi pada kapur barus tersebut dinamakan ...',
      opsi_jawaban: [
        'A. Mengkristal karena terjadi pelepasan kalor oleh udara dingin.',
        'B. Menguap karena zat cair berubah menjadi gas karena suhu hangat.',
        'C. Menyublim karena zat padat berubah langsung menjadi gas dengan menyerap kalor.',
        'D. Mengembun karena uap di dalam lemari menempel pada permukaan kapur.',
      ],
    },
    {
      nomor_soal: 3,
      bentuk_soal: 'Pilihan Ganda',
      membutuhkan_gambar: true,
      stimulus:
        'Budi menuangkan teh hangat ke dalam gelas kaca, lalu memasukkan 5 bongkah es batu ke dalamnya. Selang beberapa menit, bagian dinding luar gelas kaca tampak basah dan dipenuhi titik-titik air.\n\n[KOTAK GAMBAR: Diagram penampang sebuah gelas kaca bening berisi bongkahan es batu berwarna biru muda. Di permukaan luar dinding gelas tampak butiran-butiran embun air (kondensasi) dengan panah udara luar bersuhu hangat yang menyentuh permukaan gelas bersuhu dingin]',
      pertanyaan:
        'Mengapa butiran air tersebut muncul di bagian dinding luar gelas, padahal gelas tidak bocor?',
      opsi_jawaban: [
        'A. Es batu merembes keluar melalui pori-pori mikroskopis kaca gelas.',
        'B. Uap air yang berada di udara sekitar melepaskan kalor ketika bersentuhan dengan dinding gelas yang dingin sehingga mengembun.',
        'C. Udara di dalam gelas mengalami pemuaian dan mendorong air menembus dinding gelas.',
        'D. Air teh mendidih akibat suhu es dan menghasilkan uap yang langsung menjadi titik air di luar.',
      ],
    },
    {
      nomor_soal: 4,
      bentuk_soal: 'Pilihan Ganda',
      membutuhkan_gambar: false,
      stimulus:
        'Andi menjemur seragam basah di teras rumah. Hari ini matahari tidak terlalu terik karena tertutup mendung tipis, namun angin bertiup cukup kencang. Sore harinya, baju Andi ternyata sudah kering sempurna.',
      pertanyaan:
        'Faktor utama yang mempercepat proses penguapan air pada pakaian Andi meskipun tanpa panas matahari terik adalah ...',
      opsi_jawaban: [
        'A. Gerakan udara (angin) mempercepat pelepasan molekul uap air dari permukaan pakaian.',
        'B. Pakaian menyerap udara lembap dari mendung di langit.',
        'C. Serat kain otomatis mengering karena dinginnya hembusan angin.',
        'D. Warna pakaian menjadi lebih gelap sehingga memproduksi kalor sendiri.',
      ],
    },
    {
      nomor_soal: 5,
      bentuk_soal: 'Pilihan Ganda Kompleks',
      membutuhkan_gambar: false,
      petunjuk_khusus: 'Berilah tanda centang (✓) pada 3 jawaban yang tepat!',
      stimulus:
        'Dalam hukum termodinamika sederhana pada zat, beberapa perubahan wujud memerlukan penyerapan kalor (membutuhkan panas dari lingkungan), sedangkan perubahan wujud lainnya melepaskan kalor ke lingkungan.',
      pertanyaan:
        'Pilihlah 3 peristiwa berikut yang merupakan proses perubahan wujud zat yang MENYERAP KALOR (membutuhkan panas)!',
      opsi_jawaban: [
        'A. Mentega yang meleleh saat ditaruh di atas wajan penggorengan yang panas.',
        'B. Air yang direbus terus-menerus hingga volumenya berkurang dan mengeluarkan uap.',
        'C. Air di dalam kantong plastik yang dimasukkan ke freezer menjadi es batu keras.',
        'D. Kamper (kapur barus) di sudut ruangan yang lama-kelamaan mengecil dan habis.',
        'E. Lilin cair yang mengeras kembali setelah api padam.',
      ],
    },
    {
      nomor_soal: 6,
      bentuk_soal: 'Pilihan Ganda Kompleks',
      membutuhkan_gambar: true,
      petunjuk_khusus: 'Berilah tanda centang (✓) pada 3 jawaban yang tepat!',
      stimulus:
        'Setiap zat tersusun dari partikel-partikel penyusun yang memiliki jarak, susunan, dan gaya tarik antarpartikel yang khas.\n\n[KOTAK GAMBAR: Ilustrasi mikroskopis 3 wadah kubus yang menampilkan partikel zat padat (tersusun rapat beraturan), partikel zat cair (renggang bebas), dan partikel gas (sangat berjauhan bergerak acak ke segala arah dengan panah kecepatan)]',
      pertanyaan:
        'Berdasarkan pemahaman mengenai zat gas, tentukan 3 pernyataan berikut yang BENAR!',
      opsi_jawaban: [
        'A. Jarak antarpartikel zat gas sangat berjauhan dibandingkan zat padat dan cair.',
        'B. Gaya tarik-menarik antarpartikel gas sangat lemah sehingga bebas bergerak ke segala arah.',
        'C. Partikel zat gas memiliki susunan yang sangat rapat dan terikat kuat pada kisi kristal.',
        'D. Gas dapat menekan ke segala arah dan mengisi seluruh ruang yang ditempatinya.',
      ],
    },
    {
      nomor_soal: 7,
      bentuk_soal: 'Menjodohkan',
      membutuhkan_gambar: false,
      stimulus:
        'Hubungkan istilah perubahan wujud zat pada Kolom A dengan contoh penerapannya dalam kehidupan nyata pada Kolom B secara tepat!',
      pertanyaan:
        'Pasangkanlah nama proses perubahan wujud di Kolom A dengan contoh yang sesuai di Kolom B:',
      pasangan_menjodohkan: {
        kolom_a: [
          '1. Membeku',
          '2. Mengembun',
          '3. Menyublim',
          '4. Mengkristal (Deposisi)',
        ],
        kolom_b: [
          'A. Pembuatan agar-agar cair yang mendingin menjadi padat kenyal',
          'B. Terbentuknya titik air pada daun di pagi hari yang cerah',
          'C. Gas karbon dioksida padat (dry ice) yang berubah menjadi kabut putih di panggung',
          'D. Terbentuknya salju atau bunga es pada dinding freezer lemari es',
        ],
      },
    },
    {
      nomor_soal: 8,
      bentuk_soal: 'Benar / Salah',
      membutuhkan_gambar: false,
      stimulus:
        'Rani meniup balon karet hingga mengembang dengan volume 1 liter. Kemudian udara di dalam balon tersebut dialirkan seluruhnya ke dalam tabung kaca tertutup yang memiliki volume 3 liter.',
      pertanyaan:
        'Tentukan kebenaran dari setiap kalimat/pernyataan berikut dengan memberi tanda centang atau melingkari pilihan Benar atau Salah!',
      pernyataan_benar_salah: [
        { nomor: 1, kalimat: 'Volume gas di dalam tabung kaca tetap bernilai 1 liter karena partikel gas tidak mengalami perubahan jumlah materi.', status: 'Salah' },
        { nomor: 2, kalimat: 'Bentuk gas berubah mengikuti bentuk ruang bagian dalam tabung kaca.', status: 'Benar' },
        { nomor: 3, kalimat: 'Partikel gas bergerak bebas memenuhi seluruh ruangan tabung 3 liter tersebut.', status: 'Benar' },
      ],
      opsi_jawaban: ['Benar', 'Salah'],
    },
    {
      nomor_soal: 9,
      bentuk_soal: 'Benar / Salah',
      membutuhkan_gambar: true,
      stimulus:
        'Ketika sebatang lilin dinyalakan, bagian batang lilin yang berada di dekat sumbu tampak meleleh menjadi cairan. Sebagian cairan lilin meresap ke sumbu dan terbakar menghasilkan cahaya, jelaga hitam, dan gas karbon dioksida.\n\n[KOTAK GAMBAR: Sketsa lilin yang sedang menyala memperlihatkan zona lelehan parafin di puncak lilin dan sumbu kapas yang menyala dengan nyala api bertingkat]',
      pertanyaan:
        'Tentukan nilai kebenaran dari kalimat/pernyataan berikut:',
      pernyataan_benar_salah: [
        { nomor: 1, kalimat: 'Pencairan lilin pada batang merupakan perubahan fisika karena parafin dapat kembali membeku menjadi zat asal.', status: 'Benar' },
        { nomor: 2, kalimat: 'Pembakaran sumbu kapas yang menghasilkan jelaga hitam dan gas CO2 merupakan perubahan kimia.', status: 'Benar' },
        { nomor: 3, kalimat: 'Asap lilin yang padam dapat diubah kembali menjadi sumbu kapas utuh dengan cara didinginkan.', status: 'Salah' },
      ],
      opsi_jawaban: ['Benar', 'Salah'],
    },
    {
      nomor_soal: 10,
      bentuk_soal: 'Uraian',
      membutuhkan_gambar: true,
      petunjuk_khusus: 'Tuliskan jawaban Anda secara runtut dan jelas pada kolom yang telah disediakan!',
      stimulus:
        'Dina dan kelompok belajarnya diminta membuat laporan penyelidikan bertema "Perjalanan Setetes Air di Bumi". Mereka mempelajari bahwa air laut yang luas dapat berubah menjadi awan, lalu turun kembali menjadi air hujan yang menyirami sawah petani.\n\n[KOTAK GAMBAR: Diagram siklus air alami (siklus hidrologi) memperlihatkan proses evaporasi dari laut, kondensasi membentuk awan di pegunungan, presipitasi berupa hujan, dan infiltrasi air ke tanah]',
      pertanyaan:
        'Berdasarkan stimulus di atas:\na. Jelaskan dua perubahan wujud zat yang terjadi dalam siklus air serta sebutkan apakah proses tersebut menyerap atau melepaskan kalor!\nb. Ketika memakai masker di ruangan dingin, kaca mata Dina sering kali buram berembun. Analisislah mengapa hal itu terjadi dan berikan satu cara praktis untuk mengatasinya!',
    },
  ],
  kunci_dan_lembar_jawab: [
    {
      nomor_soal: 1,
      bentuk_soal: 'Pilihan Ganda',
      kunci_jawaban:
        'B. Bentuknya berubah mengikuti bentuk wadah, tetapi volumenya tetap.',
      pembahasan:
        'Ciri khas zat cair adalah ikatan antarpartikelnya yang cukup longgar sehingga partikel dapat meluncur saling melewati, menyebabkan bentuknya dapat berubah menyesuaikan wadah yang ditempatinya. Namun jarak antarpartikel masih relatif konstan sehingga volume zat cair tetap (incompressible).',
      rubrik_penskoran:
        'Skor 1: Memilih opsi B.\nSkor 0: Memilih opsi selain B atau tidak menjawab.',
    },
    {
      nomor_soal: 2,
      bentuk_soal: 'Pilihan Ganda',
      kunci_jawaban:
        'C. Menyublim karena zat padat berubah langsung menjadi gas dengan menyerap kalor.',
      pembahasan:
        'Menyublim adalah perubahan wujud zat dari padat langsung menjadi gas tanpa melewati fase cair. Hal ini terjadi karena tekanan uap zat padat cukup tinggi pada suhu ruang, menyerap kalor dari lingkungan di sekitarnya.',
      rubrik_penskoran:
        'Skor 1: Memilih opsi C.\nSkor 0: Memilih opsi selain C atau tidak menjawab.',
    },
    {
      nomor_soal: 3,
      bentuk_soal: 'Pilihan Ganda',
      kunci_jawaban:
        'B. Uap air yang berada di udara sekitar melepaskan kalor ketika bersentuhan dengan dinding gelas yang dingin sehingga mengembun.',
      pembahasan:
        'Gelas tidak bocor. Di udara sekitar terdapat molekul uap air (gas). Saat uap air menyentuh permukaan dinding luar gelas yang bersuhu rendah (karena es batu di dalamnya), uap air tersebut melepaskan kalor ke dinding gelas dan mengalami penurunan suhu hingga berubah wujud menjadi tetesan air (kondensasi/mengembun).',
      rubrik_penskoran:
        'Skor 1: Memilih opsi B.\nSkor 0: Memilih opsi selain B.',
    },
    {
      nomor_soal: 4,
      bentuk_soal: 'Pilihan Ganda',
      kunci_jawaban:
        'A. Gerakan udara (angin) mempercepat pelepasan molekul uap air dari permukaan pakaian.',
      pembahasan:
        'Faktor-faktor yang memengaruhi kecepatan penguapan zat cair meliputi suhu, luas permukaan, kelembapan udara, dan aliran udara (angin). Angin bertiup membawa molekul air yang telah menguap menjauh dari permukaan pakaian, menjaga perbedaan tekanan uap tetap tinggi sehingga molekul air di kain terus terlepas dengan cepat.',
      rubrik_penskoran:
        'Skor 1: Memilih opsi A.\nSkor 0: Memilih opsi selain A.',
    },
    {
      nomor_soal: 5,
      bentuk_soal: 'Pilihan Ganda Kompleks',
      kunci_jawaban:
        'A (Mentega meleleh), B (Air mendidih dan menguap), D (Kamper menyublim)',
      pembahasan:
        'Perubahan wujud yang menyerap kalor (endotermik) adalah: Mencair (mentega meleleh), Menguap (air direbus menjadi uap), dan Menyublim (kamper menjadi gas). Sedangkan membeku (opsi C) merupakan proses yang melepaskan kalor (eksotermik).',
      rubrik_penskoran:
        'Skor 3: Memilih ketiga opsi benar (A, B, D) tanpa memilih C.\nSkor 2: Memilih 2 opsi benar tanpa opsi salah.\nSkor 1: Memilih 1 opsi benar tanpa opsi salah.\nSkor 0: Memilih opsi C atau jawaban keliru.',
    },
    {
      nomor_soal: 6,
      bentuk_soal: 'Pilihan Ganda Kompleks',
      kunci_jawaban: 'A, B, dan D',
      pembahasan:
        'Karakteristik partikel zat gas: (1) Jarak antarpartikel sangat renggang, (2) Gaya tarik antarpartikel sangat lemah sehingga bergerak acak cepat, (3) Bentuk dan volume berubah memenuhi ruangan dan menekan ke segala arah. Pernyataan C keliru karena menggambarkan sifat kristal zat padat.',
      rubrik_penskoran:
        'Skor 3: Memilih A, B, dan D secara tepat.\nSkor 2: Memilih 2 jawaban benar.\nSkor 1: Memilih 1 jawaban benar.\nSkor 0: Memilih C atau tidak menjawab.',
    },
    {
      nomor_soal: 7,
      bentuk_soal: 'Menjodohkan',
      kunci_jawaban:
        '1 -> C (Membeku -> Agar-agar mendingin jadi padat)\n2 -> B (Mengembun -> Titik air pada daun pagi hari)\n3 -> D (Menyublim -> Dry ice jadi kabut gas)\n4 -> A (Mengkristal/Deposisi -> Salju / bunga es di freezer)',
      pembahasan:
        'Membeku: cair ke padat (agar-agar). Mengembun: gas ke cair (embun pagi). Menyublim: padat ke gas (dry ice). Mengkristal/deposisi: gas ke padat (bunga es di dinding freezer). Opsi E adalah distraktor pemuaian termal.',
      rubrik_penskoran:
        'Skor 4: Benar 4 pasangan.\nSkor 3: Benar 3 pasangan.\nSkor 2: Benar 2 pasangan.\nSkor 1: Benar 1 pasangan.\nSkor 0: Tidak ada pasangan yang benar.',
    },
    {
      nomor_soal: 8,
      bentuk_soal: 'Benar / Salah',
      kunci_jawaban: 'Salah',
      pembahasan:
        'Pernyataan SALAH. Sifat gas adalah volumenya selalu berubah-ubah menyesuaikan volume wadah tertutup yang ditempatinya. Ketika dipindahkan ke wadah 3 liter, partikel gas akan menyebar dan mengisi seluruh ruang sehingga volume gas kini menjadi 3 liter (meskipun massa atau jumlah partikelnya tetap).',
      rubrik_penskoran:
        'Skor 1: Menjawab Salah.\nSkor 0: Menjawab Benar atau kosong.',
    },
    {
      nomor_soal: 9,
      bentuk_soal: 'Benar / Salah',
      kunci_jawaban: 'Benar',
      pembahasan:
        'Pernyataan BENAR. Melelehnya lilin merupakan perubahan fisika karena parafin cair jika didinginkan akan kembali membeku menjadi parafin padat dengan rumus kimia yang identik. Sedangkan pembakaran sumbu kapas dan uap parafin yang menghasilkan gas CO2, air, dan jelaga karbon merupakan reaksi pembakaran kimia yang tidak dapat kembali ke bentuk semula.',
      rubrik_penskoran:
        'Skor 1: Menjawab Benar.\nSkor 0: Menjawab Salah atau kosong.',
    },
    {
      nomor_soal: 10,
      bentuk_soal: 'Uraian',
      kunci_jawaban:
        'a. Dua perubahan wujud pada siklus air:\n1) Menguap (Evaporasi): Air laut/sungai berubah menjadi uap air akibat panas matahari (MENYERAP KALOR).\n2) Mengembun (Kondensasi): Uap air di atmosfer mendingin menjadi titik-titik air pembentuk awan (MELEPASKAN KALOR).\n(Siswa juga boleh menyebutkan membeku menjadi kristal es saat suhu sangat dingin).\n\nb. Analisis kacamata berembun: Udara hangat hasil hembusan napas mengandung uap air yang keluar melalui celah atas masker. Saat uap air tersebut mengenai lensa kacamata yang suhunya lebih dingin, uap air melepaskan kalor dan mengembun menjadi titik air halus pada kaca.\nSolusi praktis: Menekan kawat hidung masker agar rapat ke hidung sehingga tidak ada celah udara naik ke atas, atau meletakkan kacamata sedikit di atas lipatan masker.',
      pembahasan:
        'Jawaban mengintegrasikan pemahaman konsep siklus hidrologi, termodinamika pelepasan/penyerapan kalor, serta penalaran kritis untuk mengatasi permasalahan sehari-hari.',
      rubrik_penskoran:
        'Skor Maksimal: 6 poin.\n- Bagian (a) Skor 3: Menyebutkan 2 perubahan wujud dengan tepat (skor 1) dan mengaitkan status menyerap/melepas kalor dengan benar (skor 2).\n- Bagian (b) Skor 3: Menjelaskan alasan pengembunan karena uap napas bertemu lensa dingin (skor 2) dan memberikan solusi praktis yang logis (skor 1).\n- Skor 1-2 jika penjelasan hanya sebagian benar.\n- Skor 0 jika tidak menjawab atau keliru total.',
    },
  ],
};
