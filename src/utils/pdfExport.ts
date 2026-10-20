import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  filename?: string;
  onProgress?: (status: string) => void;
}

/**
 * Exports an HTML element directly to a multi-page A4 PDF file
 * without opening the browser's print dialog.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<void> {
  const {
    filename = 'Naskah-Soal-Evaluasi.pdf',
    onProgress,
  } = options;

  onProgress?.('Mempersiapkan dokumen...');

  // Save original styles if we need to adjust temporary width/background
  const originalBackground = element.style.backgroundColor;
  const originalColor = element.style.color;

  try {
    onProgress?.('Merender lembar naskah (Resolusi Tinggi)...');

    // Render DOM to high-resolution canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 2x scale for crisp 300dpi-like printing quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      onclone: (clonedDoc) => {
        // Ensure all elements in the cloned document are visible for print
        const clonedEl = clonedDoc.getElementById(element.id) || clonedDoc.body;
        if (clonedEl) {
          clonedEl.style.backgroundColor = '#ffffff';
          clonedEl.style.color = '#000000';
        }
      },
    });

    onProgress?.('Menyusun halaman PDF A4...');

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 8; // 8mm margin
    const contentWidth = imgWidth - (margin * 2); // 194mm
    const contentHeight = pageHeight - (margin * 2); // 281mm

    // Aspect ratio calculations
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Height of one page in canvas pixels
    const pageCanvasHeight = Math.floor((contentHeight / contentWidth) * canvasWidth);
    const totalPages = Math.ceil(canvasHeight / pageCanvasHeight);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage('a4', 'portrait');
      }

      onProgress?.(`Memproses halaman ${page + 1} dari ${totalPages}...`);

      const sourceY = page * pageCanvasHeight;
      const currentSectionHeight = Math.min(pageCanvasHeight, canvasHeight - sourceY);

      // Create a temporary canvas for this page section
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvasWidth;
      pageCanvas.height = currentSectionHeight;

      const pageCtx = pageCanvas.getContext('2d');
      if (pageCtx) {
        // Fill white background
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        // Draw cropped section from the main canvas
        pageCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvasWidth,
          currentSectionHeight,
          0,
          0,
          canvasWidth,
          currentSectionHeight
        );

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        const sectionHeightMm = (currentSectionHeight / canvasWidth) * contentWidth;

        // Add image to PDF page
        pdf.addImage(
          pageImgData,
          'JPEG',
          margin,
          margin,
          contentWidth,
          sectionHeightMm,
          undefined,
          'FAST'
        );

        // Add subtle footer with page number
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text(
          `Halaman ${page + 1} dari ${totalPages}`,
          imgWidth - margin - 25,
          pageHeight - 4
        );
      }
    }

    onProgress?.('Mengunduh berkas PDF...');
    pdf.save(filename);
  } finally {
    element.style.backgroundColor = originalBackground;
    element.style.color = originalColor;
  }
}
