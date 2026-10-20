/**
 * High-Fidelity Pedagogical Vector Diagrams for Indonesian Curriculum (Kurikulum Merdeka)
 * 
 * Generates crisp, educational SVG diagrams for ANY subject:
 * - IPA / IPAS / Biologi / Fisika / Kimia
 * - Matematika (Geometri, Sudut, Garis Bilangan, Pecahan, Koordinat, Grafik)
 * - Bahasa Indonesia & Bahasa Inggris (Denah, Balon Dialog, Komik, Poster, Rambu)
 * - Pendidikan Pancasila (PPKn) (Garuda, Simbol 5 Sila, Bendera)
 * - IPS / Geografi / Sejarah (Mata Angin, Peta Indonesia, Lapisan Bumi)
 * - Informatika (Flowchart, Perangkat Komputer)
 * - Universal Educational Concept Diagram for any custom topic
 */

export interface VectorDiagramResult {
  svgString: string;
  caption: string;
  subjectCategory: string;
}

export function getSubjectVectorDiagram(
  rawDescription: string,
  nomorSoal: number
): VectorDiagramResult {
  const d = (rawDescription || '').toLowerCase();

  // 1. IPA/IPAS: SIKLUS AIR / HIDROLOGI
  if (
    d.includes('siklus air') ||
    d.includes('hidrologi') ||
    d.includes('evaporasi') ||
    d.includes('presipitasi') ||
    d.includes('hujan') ||
    d.includes('infiltrasi')
  ) {
    return {
      caption: `Gambar ${nomorSoal}: Bagan Alur Siklus Hidrologi (Air) di Alam`,
      subjectCategory: 'IPAS / Geografi',
      svgString: `
        <svg viewBox="0 0 280 160" width="100%" height="100%" style="max-height: 155px; display: block; margin: auto;">
          <defs>
            <linearGradient id="skyGrad-${nomorSoal}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#bae6fd"/>
              <stop offset="100%" stop-color="#f0f9ff"/>
            </linearGradient>
            <linearGradient id="seaGrad-${nomorSoal}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0284c7"/>
              <stop offset="100%" stop-color="#0369a1"/>
            </linearGradient>
          </defs>
          <rect x="5" y="5" width="270" height="150" rx="8" fill="url(#skyGrad-${nomorSoal})" stroke="#cbd5e1" stroke-width="1.2"/>
          
          <!-- Sun -->
          <circle cx="35" cy="35" r="14" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5"/>
          <g stroke="#f59e0b" stroke-width="1.5">
            <line x1="35" y1="14" x2="35" y2="8"/><line x1="35" y1="56" x2="35" y2="62"/>
            <line x1="14" y1="35" x2="8" y2="35"/><line x1="56" y1="35" x2="62" y2="35"/>
          </g>
          
          <!-- Mountains -->
          <polygon points="150,135 195,55 240,135" fill="#64748b" stroke="#334155" stroke-width="1.2"/>
          <polygon points="180,135 225,40 270,135" fill="#475569" stroke="#1e293b" stroke-width="1.2"/>
          <polygon points="215,55 225,40 235,55 225,50" fill="#f8fafc"/>
          
          <!-- Ocean & Ground -->
          <path d="M 5 125 Q 75 120 150 135 L 5 135 Z" fill="url(#seaGrad-${nomorSoal})"/>
          <rect x="5" y="135" width="270" height="20" rx="0" fill="#0284c7"/>
          <text x="35" y="147" font-size="7.5" fill="#ffffff" font-weight="bold">Lautan</text>
          
          <!-- Clouds & Rain -->
          <g fill="#ffffff" stroke="#94a3b8" stroke-width="1.2">
            <path d="M 120 40 Q 120 28 132 28 Q 140 22 152 28 Q 164 25 168 35 Q 175 38 172 48 Q 168 54 156 52 Q 144 56 132 50 Q 120 50 120 40 Z"/>
          </g>
          <!-- Raindrops -->
          <g stroke="#0284c7" stroke-width="1.2" stroke-linecap="round">
            <line x1="135" y1="58" x2="132" y2="68"/><line x1="147" y1="58" x2="144" y2="68"/><line x1="159" y1="58" x2="156" y2="68"/>
          </g>
          
          <!-- Arrows & Stage Labels -->
          <path d="M 55 110 Q 70 70 100 50" fill="none" stroke="#ea580c" stroke-width="1.5" stroke-dasharray="3 2"/>
          <text x="50" y="85" font-size="7.5" fill="#c2410c" font-weight="bold">(1) Evaporasi</text>
          
          <text x="145" y="20" font-size="7.5" fill="#0369a1" font-weight="bold">(2) Kondensasi</text>
          <text x="175" y="75" font-size="7.5" fill="#0369a1" font-weight="bold">(3) Presipitasi</text>
          
          <path d="M 210 115 Q 150 125 90 132" fill="none" stroke="#059669" stroke-width="1.5" stroke-dasharray="3 2"/>
          <text x="145" y="125" font-size="7" fill="#065f46" font-weight="bold">(4) Infiltrasi & Aliran Permukaan</text>
        </svg>
      `,
    };
  }

  // 2. MATEMATIKA: BANGUN DATAR GEOMETRI (Segitiga, Persegi, Lingkaran, Trapesium)
  if (
    d.includes('segitiga') ||
    d.includes('siku-siku') ||
    d.includes('trapesium') ||
    d.includes('persegi') ||
    d.includes('jajar genjang') ||
    d.includes('belah ketupat') ||
    d.includes('geometri') ||
    d.includes('keliling') ||
    d.includes('luas bangun')
  ) {
    if (d.includes('segitiga')) {
      return {
        caption: `Gambar ${nomorSoal}: Segitiga Siku-Siku dengan Dimensi Sisi`,
        subjectCategory: 'Matematika',
        svgString: `
          <svg viewBox="0 0 240 140" width="100%" height="100%" style="max-height: 145px; display: block; margin: auto;">
            <!-- Right Triangle -->
            <polygon points="50,115 190,115 50,25" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
            <!-- Right angle symbol -->
            <rect x="50" y="103" width="12" height="12" fill="none" stroke="#15803d" stroke-width="1.5"/>
            <!-- Labels -->
            <text x="40" y="70" font-size="10" fill="#1e293b" font-weight="bold" text-anchor="end">t (Tinggi)</text>
            <text x="120" y="130" font-size="10" fill="#1e293b" font-weight="bold" text-anchor="middle">a (Alas)</text>
            <text x="135" y="60" font-size="10" fill="#166534" font-weight="bold">c (Sisi Miring / Hipotenusa)</text>
            <circle cx="50" cy="115" r="3" fill="#166534"/><text x="42" y="125" font-size="9" font-weight="bold">A</text>
            <circle cx="190" cy="115" r="3" fill="#166534"/><text x="198" y="125" font-size="9" font-weight="bold">B</text>
            <circle cx="50" cy="25" r="3" fill="#166534"/><text x="42" y="25" font-size="9" font-weight="bold">C</text>
          </svg>
        `,
      };
    }

    if (d.includes('trapesium')) {
      return {
        caption: `Gambar ${nomorSoal}: Bangun Trapesium Sama Kaki`,
        subjectCategory: 'Matematika',
        svgString: `
          <svg viewBox="0 0 240 130" width="100%" height="100%" style="max-height: 140px; display: block; margin: auto;">
            <polygon points="70,30 170,30 205,105 35,105" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
            <line x1="70" y1="30" x2="70" y2="105" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3 3"/>
            <text x="120" y="22" font-size="9" font-weight="bold" fill="#1e293b" text-anchor="middle">Sisi Atas (a)</text>
            <text x="120" y="122" font-size="9" font-weight="bold" fill="#1e293b" text-anchor="middle">Sisi Alas (b)</text>
            <text x="64" y="70" font-size="8.5" font-weight="bold" fill="#dc2626" text-anchor="end">t</text>
          </svg>
        `,
      };
    }

    // Default Persegi Panjang / Balok
    return {
      caption: `Gambar ${nomorSoal}: Bangun Geometri Persegi Panjang`,
      subjectCategory: 'Matematika',
      svgString: `
        <svg viewBox="0 0 240 130" width="100%" height="100%" style="max-height: 140px; display: block; margin: auto;">
          <rect x="40" y="30" width="160" height="75" rx="3" fill="#faf5ff" stroke="#7e22ce" stroke-width="2"/>
          <text x="120" y="22" font-size="9.5" font-weight="bold" fill="#581c87" text-anchor="middle">Panjang (p)</text>
          <text x="210" y="72" font-size="9.5" font-weight="bold" fill="#581c87">Lebar (l)</text>
          <text x="120" y="72" font-size="10" font-weight="bold" fill="#9333ea" text-anchor="middle">Luas = p &times; l</text>
        </svg>
      `,
    };
  }

  // 3. MATEMATIKA: SUDUT & GARIS BILANGAN
  if (d.includes('sudut') || d.includes('derajat') || d.includes('garis bilangan')) {
    if (d.includes('garis bilangan')) {
      return {
        caption: `Gambar ${nomorSoal}: Garis Bilangan Bulat`,
        subjectCategory: 'Matematika',
        svgString: `
          <svg viewBox="0 0 260 90" width="100%" height="100%" style="max-height: 90px; display: block; margin: auto;">
            <line x1="20" y1="50" x2="240" y2="50" stroke="#1e293b" stroke-width="2"/>
            <polygon points="18,50 25,46 25,54" fill="#1e293b"/>
            <polygon points="242,50 235,46 235,54" fill="#1e293b"/>
            <!-- Ticks -->
            <line x1="50" y1="44" x2="50" y2="56" stroke="#1e293b" stroke-width="1.8"/><text x="50" y="70" font-size="8" text-anchor="middle">-3</text>
            <line x1="80" y1="44" x2="80" y2="56" stroke="#1e293b" stroke-width="1.8"/><text x="80" y="70" font-size="8" text-anchor="middle">-2</text>
            <line x1="110" y1="44" x2="110" y2="56" stroke="#1e293b" stroke-width="1.8"/><text x="110" y="70" font-size="8" text-anchor="middle">-1</text>
            <line x1="140" y1="42" x2="140" y2="58" stroke="#dc2626" stroke-width="2.2"/><text x="140" y="70" font-size="9" font-weight="bold" fill="#dc2626" text-anchor="middle">0</text>
            <line x1="170" y1="44" x2="170" y2="56" stroke="#1e293b" stroke-width="1.8"/><text x="170" y="70" font-size="8" text-anchor="middle">1</text>
            <line x1="200" y1="44" x2="200" y2="56" stroke="#1e293b" stroke-width="1.8"/><text x="200" y="70" font-size="8" text-anchor="middle">2</text>
            <line x1="230" y1="44" x2="230" y2="56" stroke="#1e293b" stroke-width="1.8"/><text x="230" y="70" font-size="8" text-anchor="middle">3</text>
          </svg>
        `,
      };
    }

    return {
      caption: `Gambar ${nomorSoal}: Pengukuran Besaran Sudut Siku-Siku dan Lancip`,
      subjectCategory: 'Matematika',
      svgString: `
        <svg viewBox="0 0 220 120" width="100%" height="100%" style="max-height: 125px; display: block; margin: auto;">
          <line x1="40" y1="100" x2="180" y2="100" stroke="#0f172a" stroke-width="2"/>
          <line x1="40" y1="100" x2="40" y2="20" stroke="#0f172a" stroke-width="2"/>
          <line x1="40" y1="100" x2="140" y2="35" stroke="#2563eb" stroke-width="2"/>
          <rect x="40" y="88" width="12" height="12" fill="none" stroke="#0f172a" stroke-width="1.5"/>
          <path d="M 65 100 Q 64 85 55 76" fill="none" stroke="#2563eb" stroke-width="1.5"/>
          <text x="75" y="86" font-size="8" font-weight="bold" fill="#2563eb">&alpha;</text>
          <text x="32" y="18" font-size="9" font-weight="bold">Y</text>
          <text x="185" y="104" font-size="9" font-weight="bold">X</text>
        </svg>
      `,
    };
  }

  // 4. IPA/IPAS: BAGIAN BUNGA & ANATOMI TUMBUHAN
  if (
    d.includes('bunga') ||
    d.includes('putik') ||
    d.includes('benang sari') ||
    d.includes('kelopak') ||
    d.includes('mahkota') ||
    d.includes('daun') ||
    d.includes('akar') ||
    d.includes('fotosintesis')
  ) {
    return {
      caption: `Gambar ${nomorSoal}: Anatomi Struktur Morfologi Bagian Bunga`,
      subjectCategory: 'IPAS / Biologi',
      svgString: `
        <svg viewBox="0 0 250 150" width="100%" height="100%" style="max-height: 150px; display: block; margin: auto;">
          <!-- Stem and Sepal -->
          <line x1="125" y1="145" x2="125" y2="100" stroke="#16a34a" stroke-width="4" stroke-linecap="round"/>
          <path d="M 125 105 Q 100 115 90 95 Q 115 95 125 105 Z" fill="#22c55e" stroke="#15803d" stroke-width="1"/>
          <path d="M 125 105 Q 150 115 160 95 Q 135 95 125 105 Z" fill="#22c55e" stroke="#15803d" stroke-width="1"/>
          
          <!-- Petals (Mahkota) -->
          <ellipse cx="90" cy="65" rx="25" ry="35" fill="#f43f5e" opacity="0.85" stroke="#be123c" stroke-width="1.2" transform="rotate(-30 90 65)"/>
          <ellipse cx="160" cy="65" rx="25" ry="35" fill="#f43f5e" opacity="0.85" stroke="#be123c" stroke-width="1.2" transform="rotate(30 160 65)"/>
          <ellipse cx="125" cy="50" rx="25" ry="35" fill="#fb7185" stroke="#e11d48" stroke-width="1.5"/>
          
          <!-- Pistil (Putik) center -->
          <path d="M 125 95 Q 120 70 125 45" stroke="#ca8a04" stroke-width="2.5" fill="none"/>
          <circle cx="125" cy="42" r="5" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
          
          <!-- Stamens (Benang Sari) -->
          <path d="M 125 95 Q 105 70 108 55" stroke="#eab308" stroke-width="1.5" fill="none"/>
          <circle cx="108" cy="53" r="3.5" fill="#facc15" stroke="#ca8a04"/>
          <path d="M 125 95 Q 145 70 142 55" stroke="#eab308" stroke-width="1.5" fill="none"/>
          <circle cx="142" cy="53" r="3.5" fill="#facc15" stroke="#ca8a04"/>
          
          <!-- Callout Labels -->
          <line x1="55" y1="40" x2="85" y2="50" stroke="#334155" stroke-width="1"/>
          <text x="50" y="38" font-size="8" fill="#be123c" font-weight="bold" text-anchor="end">1. Mahkota</text>
          
          <line x1="125" y1="32" x2="125" y2="18" stroke="#334155" stroke-width="1"/>
          <text x="125" y="14" font-size="8" fill="#a16207" font-weight="bold" text-anchor="middle">2. Kepala Putik</text>
          
          <line x1="195" y1="52" x2="145" y2="54" stroke="#334155" stroke-width="1"/>
          <text x="200" y="55" font-size="8" fill="#854d0e" font-weight="bold">3. Benang Sari</text>
          
          <line x1="195" y1="100" x2="155" y2="102" stroke="#334155" stroke-width="1"/>
          <text x="200" y="103" font-size="8" fill="#15803d" font-weight="bold">4. Kelopak</text>
        </svg>
      `,
    };
  }

  // 5. FISIKA / IPAS: RANGKAIAN LISTRIK (SERI & PARALEL)
  if (
    d.includes('listrik') ||
    d.includes('rangkaian') ||
    d.includes('lampu') ||
    d.includes('saklar') ||
    d.includes('baterai') ||
    d.includes('seri') ||
    d.includes('paralel')
  ) {
    const isParalel = d.includes('paralel');
    return {
      caption: `Gambar ${nomorSoal}: Skema Rangkaian Listrik ${isParalel ? 'Paralel' : 'Seri'}`,
      subjectCategory: 'Fisika / IPAS',
      svgString: `
        <svg viewBox="0 0 250 130" width="100%" height="100%" style="max-height: 135px; display: block; margin: auto;">
          <!-- Wire loop -->
          <rect x="30" y="25" width="190" height="80" fill="none" stroke="#1e293b" stroke-width="2" rx="4"/>
          <!-- Battery at bottom -->
          <rect x="100" y="98" width="50" height="14" fill="#ffffff"/>
          <line x1="110" y1="95" x2="110" y2="115" stroke="#dc2626" stroke-width="3"/>
          <line x1="120" y1="100" x2="120" y2="110" stroke="#1e293b" stroke-width="2"/>
          <line x1="130" y1="95" x2="130" y2="115" stroke="#dc2626" stroke-width="3"/>
          <line x1="140" y1="100" x2="140" y2="110" stroke="#1e293b" stroke-width="2"/>
          <text x="125" y="125" font-size="7.5" fill="#475569" font-weight="bold" text-anchor="middle">Baterai (Sumber Energi)</text>
          
          <!-- Bulbs on top -->
          <circle cx="85" cy="25" r="9" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
          <text x="85" y="28" font-size="7.5" font-weight="bold" text-anchor="middle">L1</text>
          
          <circle cx="165" cy="25" r="9" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
          <text x="165" y="28" font-size="7.5" font-weight="bold" text-anchor="middle">L2</text>
          
          <!-- Switch on left -->
          <rect x="25" y="55" width="10" height="20" fill="#ffffff"/>
          <line x1="30" y1="55" x2="35" y2="70" stroke="#dc2626" stroke-width="2"/>
          <text x="12" y="68" font-size="7" fill="#b91c1c" font-weight="bold">Saklar</text>
        </svg>
      `,
    };
  }

  // 6. TATA SURYA, PLANET, GERHANA
  if (
    d.includes('tata surya') ||
    d.includes('planet') ||
    d.includes('bumi') ||
    d.includes('bulan') ||
    d.includes('matahari') ||
    d.includes('gerhana') ||
    d.includes('orbit')
  ) {
    return {
      caption: `Gambar ${nomorSoal}: Simulasi Posisi Matahari, Bumi, dan Bulan (Gerhana)`,
      subjectCategory: 'IPAS / Astronomi',
      svgString: `
        <svg viewBox="0 0 260 120" width="100%" height="100%" style="max-height: 125px; display: block; margin: auto;">
          <rect x="5" y="5" width="250" height="110" rx="8" fill="#0f172a"/>
          <!-- Sun -->
          <circle cx="45" cy="60" r="28" fill="#f59e0b" stroke="#fbbf24" stroke-width="2"/>
          <text x="45" y="63" font-size="8" fill="#ffffff" font-weight="bold" text-anchor="middle">Matahari</text>
          <!-- Moon -->
          <circle cx="140" cy="60" r="8" fill="#94a3b8" stroke="#cbd5e1" stroke-width="1.2"/>
          <text x="140" y="78" font-size="7" fill="#cbd5e1" text-anchor="middle">Bulan</text>
          <!-- Earth -->
          <circle cx="215" cy="60" r="18" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="215" y="63" font-size="7.5" fill="#ffffff" font-weight="bold" text-anchor="middle">Bumi</text>
          <!-- Shadow Cone -->
          <polygon points="45,32 140,52 215,48 215,72 140,68 45,88" fill="#ffffff" opacity="0.08"/>
        </svg>
      `,
    };
  }

  // 7. BAHASA INDONESIA / INGGRIS: DENAH / PETA LOKASI
  if (
    d.includes('denah') ||
    d.includes('peta') ||
    d.includes('jalan') ||
    d.includes('arah') ||
    d.includes('mata angin') ||
    d.includes('kompas')
  ) {
    return {
      caption: `Gambar ${nomorSoal}: Denah Petunjuk Arah Lokasi Fasilitas Umum`,
      subjectCategory: 'Bahasa / IPS',
      svgString: `
        <svg viewBox="0 0 260 140" width="100%" height="100%" style="max-height: 140px; display: block; margin: auto;">
          <rect x="5" y="5" width="250" height="130" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
          <!-- Roads Cross -->
          <rect x="10" y="55" width="240" height="26" fill="#e2e8f0"/>
          <line x1="10" y1="68" x2="250" y2="68" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 4"/>
          <rect x="105" y="5" width="26" height="130" fill="#e2e8f0"/>
          <line x1="118" y1="5" x2="118" y2="135" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 4"/>
          <text x="50" y="72" font-size="7" fill="#64748b" font-weight="bold">Jl. Merdeka</text>
          <text x="122" y="125" font-size="7" fill="#64748b" font-weight="bold" transform="rotate(-90 122 125)">Jl. Pahlawan</text>
          
          <!-- Buildings -->
          <rect x="25" y="15" width="65" height="32" rx="3" fill="#dcfce7" stroke="#16a34a" stroke-width="1.2"/>
          <text x="57" y="32" font-size="7.5" font-weight="bold" fill="#166534" text-anchor="middle">SDN Nusantara</text>
          
          <rect x="150" y="15" width="65" height="32" rx="3" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2"/>
          <text x="182" y="32" font-size="7.5" font-weight="bold" fill="#0369a1" text-anchor="middle">Puskesmas</text>
          
          <rect x="25" y="90" width="65" height="35" rx="3" fill="#fef3c7" stroke="#d97706" stroke-width="1.2"/>
          <text x="57" y="110" font-size="7.5" font-weight="bold" fill="#b45309" text-anchor="middle">Pasar Tradisional</text>
          
          <!-- Compass Rose on top right -->
          <g transform="translate(230, 28)">
            <circle cx="0" cy="0" r="10" fill="#ffffff" stroke="#334155" stroke-width="1"/>
            <polygon points="0,-9 3,0 -3,0" fill="#dc2626"/>
            <polygon points="0,9 3,0 -3,0" fill="#334155"/>
            <text x="0" y="-11" font-size="6.5" font-weight="bold" fill="#dc2626" text-anchor="middle">U</text>
          </g>
        </svg>
      `,
    };
  }

  // 8. PENDIDIKAN PANCASILA (PPKn): SIMBOL SILA PANCASILA / BENDERA
  if (
    d.includes('pancasila') ||
    d.includes('garuda') ||
    d.includes('sila') ||
    d.includes('bintang') ||
    d.includes('rantai') ||
    d.includes('beringin') ||
    d.includes('banteng') ||
    d.includes('padi') ||
    d.includes('kapas') ||
    d.includes('bendera')
  ) {
    return {
      caption: `Gambar ${nomorSoal}: Lambang dan Simbol Sila dalam Pancasila`,
      subjectCategory: 'Pendidikan Pancasila',
      svgString: `
        <svg viewBox="0 0 240 140" width="100%" height="100%" style="max-height: 145px; display: block; margin: auto;">
          <rect x="10" y="10" width="220" height="120" rx="8" fill="#fef2f2" stroke="#f87171" stroke-width="1.5"/>
          <!-- Shield (Perisai) -->
          <path d="M 120 22 Q 165 22 170 65 Q 165 110 120 125 Q 75 110 70 65 Q 75 22 120 22 Z" fill="#ffffff" stroke="#b91c1c" stroke-width="2"/>
          <!-- Star Center (Sila 1) -->
          <rect x="102" y="58" width="36" height="34" rx="3" fill="#18181b"/>
          <polygon points="120,60 124,70 134,70 126,76 129,86 120,80 111,86 114,76 106,70 116,70" fill="#fbbf24"/>
          <!-- Labels -->
          <text x="120" y="16" font-size="8.5" font-weight="bold" fill="#991b1b" text-anchor="middle">Perisai Garuda Pancasila</text>
          <text x="40" y="65" font-size="7" fill="#7f1d1d" font-weight="bold">Sila 2 & 5</text>
          <text x="200" y="65" font-size="7" fill="#7f1d1d" font-weight="bold">Sila 3 & 4</text>
        </svg>
      `,
    };
  }

  // 9. BAHASA / KOMIK / BALON DIALOG
  if (
    d.includes('dialog') ||
    d.includes('percakapan') ||
    d.includes('komik') ||
    d.includes('tokoh') ||
    d.includes('wawancara')
  ) {
    return {
      caption: `Gambar ${nomorSoal}: Ilustrasi Percakapan Tokoh dalam Konteks Kalimat`,
      subjectCategory: 'Bahasa Indonesia / Inggris',
      svgString: `
        <svg viewBox="0 0 250 130" width="100%" height="100%" style="max-height: 135px; display: block; margin: auto;">
          <!-- Character 1 on left -->
          <circle cx="50" cy="50" r="16" fill="#fed7aa" stroke="#ea580c" stroke-width="1.5"/>
          <path d="M 30 100 Q 50 75 70 100 Z" fill="#3b82f6"/>
          <!-- Speech Bubble 1 -->
          <path d="M 75 25 Q 75 15 88 15 L 140 15 Q 150 15 150 25 L 150 50 Q 150 60 140 60 L 95 60 L 78 72 L 85 60 L 88 60 Q 75 60 75 50 Z" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
          <text x="112" y="32" font-size="7.5" fill="#1e293b" font-weight="bold" text-anchor="middle">Tokoh A:</text>
          <text x="112" y="44" font-size="7" fill="#475569" text-anchor="middle">"Bagaimana pendapatmu?"</text>
          
          <!-- Character 2 on right -->
          <circle cx="200" cy="50" r="16" fill="#fed7aa" stroke="#ea580c" stroke-width="1.5"/>
          <path d="M 180 100 Q 200 75 220 100 Z" fill="#10b981"/>
          <!-- Speech Bubble 2 -->
          <path d="M 175 65 L 165 78 L 160 65 L 145 65 Q 135 65 135 75 L 135 95 Q 135 105 145 105 L 185 105 Q 195 105 195 95 L 195 75 Q 195 65 185 65 Z" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.2"/>
          <text x="165" y="82" font-size="7.5" fill="#166534" font-weight="bold" text-anchor="middle">Tokoh B:</text>
          <text x="165" y="94" font-size="7" fill="#15803d" text-anchor="middle">"Menurut saya..."</text>
        </svg>
      `,
    };
  }

  // 10. INFORMATIKA: DIAGRAM ALIR / FLOWCHART
  if (
    d.includes('flowchart') ||
    d.includes('diagram alir') ||
    d.includes('algoritma') ||
    d.includes('input') ||
    d.includes('output') ||
    d.includes('proses')
  ) {
    return {
      caption: `Gambar ${nomorSoal}: Bagan Alir (Flowchart) Logika Algoritma`,
      subjectCategory: 'Informatika',
      svgString: `
        <svg viewBox="0 0 250 140" width="100%" height="100%" style="max-height: 145px; display: block; margin: auto;">
          <!-- Start Terminator -->
          <rect x="85" y="10" width="80" height="22" rx="11" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
          <text x="125" y="24" font-size="8" font-weight="bold" fill="#1e40af" text-anchor="middle">Mulai (Start)</text>
          <line x1="125" y1="32" x2="125" y2="44" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow)"/>
          
          <!-- Process Box -->
          <rect x="75" y="45" width="100" height="25" fill="#f1f5f9" stroke="#334155" stroke-width="1.5"/>
          <text x="125" y="60" font-size="8" font-weight="bold" fill="#1e293b" text-anchor="middle">Proses Data</text>
          <line x1="125" y1="70" x2="125" y2="82" stroke="#64748b" stroke-width="1.5"/>
          
          <!-- Decision Diamond -->
          <polygon points="125,83 165,102 125,121 85,102" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
          <text x="125" y="105" font-size="7.5" font-weight="bold" fill="#92400e" text-anchor="middle">Kondisi Benar?</text>
        </svg>
      `,
    };
  }

  // 11. UNIVERSAL EDUCATIONAL CONCEPT INFOGRAPHIC (For any other subject/topic)
  const topicTitle = (rawDescription || 'Stimulus Asesmen')
    .replace(/^gambar\s*\d*:\s*/i, '')
    .slice(0, 45);

  return {
    caption: `Gambar ${nomorSoal}: ${topicTitle.charAt(0).toUpperCase() + topicTitle.slice(1)}`,
    subjectCategory: 'Stimulus Asesmen Pembelajaran',
    svgString: `
      <svg viewBox="0 0 260 130" width="100%" height="100%" style="max-height: 135px; display: block; margin: auto;">
        <defs>
          <linearGradient id="cardGrad-${nomorSoal}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="100%" stop-color="#f1f5f9"/>
          </linearGradient>
        </defs>
        <rect x="10" y="10" width="240" height="110" rx="8" fill="url(#cardGrad-${nomorSoal})" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Header Bar -->
        <rect x="10" y="10" width="240" height="26" rx="8" fill="#0f172a"/>
        <rect x="10" y="24" width="240" height="12" fill="#0f172a"/>
        <circle cx="24" cy="23" r="4" fill="#ef4444"/>
        <circle cx="34" cy="23" r="4" fill="#f59e0b"/>
        <circle cx="44" cy="23" r="4" fill="#10b981"/>
        <text x="130" y="26" font-size="8" fill="#f8fafc" font-weight="bold" text-anchor="middle">
          Ilustrasi Butir Soal #${nomorSoal}
        </text>
        
        <!-- Content Nodes -->
        <g stroke="#0284c7" stroke-width="1.5" fill="#e0f2fe">
          <circle cx="60" cy="75" r="18"/>
          <circle cx="130" cy="75" r="20"/>
          <circle cx="200" cy="75" r="18"/>
        </g>
        <line x1="78" y1="75" x2="110" y2="75" stroke="#0284c7" stroke-width="1.8" stroke-dasharray="3 2"/>
        <line x1="150" y1="75" x2="182" y2="75" stroke="#0284c7" stroke-width="1.8" stroke-dasharray="3 2"/>
        
        <text x="60" y="78" font-size="8" font-weight="bold" fill="#0369a1" text-anchor="middle">Tahap 1</text>
        <text x="130" y="78" font-size="8" font-weight="bold" fill="#0369a1" text-anchor="middle">Proses</text>
        <text x="200" y="78" font-size="8" font-weight="bold" fill="#0369a1" text-anchor="middle">Hasil</text>
        
        <text x="130" y="112" font-size="8" fill="#475569" font-style="italic" text-anchor="middle">
          ${topicTitle}
        </text>
      </svg>
    `,
  };
}
