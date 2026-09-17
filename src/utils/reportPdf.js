import { dashboardReport } from './dashboardReport.js';
import { deriveKpis } from './resultFormatting.js';
import { chartFigure } from '../components/charts/chartFigure.js';

const C = { ink: [24, 28, 43], muted: [96, 103, 120], line: [222, 226, 234], soft: [246, 247, 251], brand: [67, 56, 202], brandSoft: [240, 239, 255], green: [22, 122, 77] };

export async function prepareReportPdf(rawReport, charts = []) {
  const { pdf, filename } = await buildReportPdf(rawReport, charts);
  return { blob: pdf.output('blob'), filename };
}

export async function buildReportPdf(rawReport, charts = []) {
  const report = dashboardReport(rawReport, charts);
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', compress: true });
  const brandLogo = await loadBrandLogo();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 46;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const safe = (value) => String(value ?? '').replace(/₹/g, 'INR ').replace(/[–—]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, '...').replace(/·/g, '|').replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
  const wrapped = (value, width, size = 10, style = 'normal') => { pdf.setFont('helvetica', style); pdf.setFontSize(size); return pdf.splitTextToSize(safe(value), width); };

  function continuationPage() {
    pdf.addPage();
    pdf.setFillColor(...C.brand); pdf.rect(0, 0, 7, pageHeight, 'F');
    if (brandLogo) pdf.addImage(brandLogo, 'PNG', margin, 15, 22, 22);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(...C.brand); pdf.text('TATPARYA', margin + (brandLogo ? 30 : 0), 30);
    pdf.setDrawColor(...C.line); pdf.line(margin, 43, pageWidth - margin, 43);
    y = 66;
  }
  function ensureSpace(height) { if (y + height > pageHeight - 50) continuationPage(); }
  function sectionTitle(title, kicker) {
    ensureSpace(42); y += 8;
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.setTextColor(...C.brand); pdf.text(safe(kicker).toUpperCase(), margin, y); y += 17;
    pdf.setFontSize(15); pdf.setTextColor(...C.ink); pdf.text(safe(title), margin, y); y += 16;
  }
  function bulletList(items, { numbered = false, accent = C.brand } = {}) {
    items.forEach((item, index) => {
      const lines = wrapped(item, contentWidth - 38, 9.5);
      const height = Math.max(22, lines.length * 13 + 10);
      ensureSpace(height);
      pdf.setFillColor(...(numbered ? C.brandSoft : C.soft)); pdf.roundedRect(margin, y, contentWidth, height - 3, 5, 5, 'F');
      pdf.setFillColor(...accent); pdf.circle(margin + 15, y + 13, numbered ? 8 : 2.5, 'F');
      if (numbered) { pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.5); pdf.setTextColor(255, 255, 255); pdf.text(String(index + 1), margin + 15, y + 15.5, { align: 'center' }); }
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5); pdf.setTextColor(...C.ink); pdf.text(lines, margin + 32, y + 14);
      y += height + 5;
    });
  }

  pdf.setFillColor(...C.ink); pdf.rect(0, 0, pageWidth, 154, 'F');
  pdf.setFillColor(...C.brand); pdf.rect(0, 0, 8, 154, 'F');
  if (brandLogo) pdf.addImage(brandLogo, 'PNG', margin, 18, 24, 24);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(194, 190, 255); pdf.text('TATPARYA', margin + (brandLogo ? 33 : 0), 34);
  pdf.setFontSize(23); pdf.setTextColor(255, 255, 255); pdf.text('Business analysis report', margin, 72);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5); pdf.setTextColor(207, 211, 222); pdf.text(`Prepared ${new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date())}`, margin, 95);
  pdf.setFontSize(8); pdf.text('VERIFIED DATASET EVIDENCE', margin, 126); y = 180;

  if (report.executive_summary) {
    const lines = wrapped(report.executive_summary, contentWidth - 28, 10.5);
    const height = Math.max(58, lines.length * 15 + 28); ensureSpace(height);
    pdf.setFillColor(...C.soft); pdf.roundedRect(margin, y, contentWidth, height, 7, 7, 'F');
    pdf.setFillColor(...C.brand); pdf.roundedRect(margin, y, 5, height, 2, 2, 'F');
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10.5); pdf.setTextColor(...C.ink); pdf.text(lines, margin + 19, y + 22); y += height + 20;
  }

  const kpis = deriveKpis(charts).slice(0, 4);
  if (kpis.length) {
    const gap = 10; const width = (contentWidth - gap) / 2; const height = 62;
    kpis.forEach((kpi, index) => {
      if (index % 2 === 0) ensureSpace(height + 10);
      const x = margin + (index % 2) * (width + gap);
      pdf.setDrawColor(...C.line); pdf.setFillColor(255, 255, 255); pdf.roundedRect(x, y, width, height, 6, 6, 'FD');
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(...C.muted); pdf.text(safe(kpi.title).toUpperCase(), x + 13, y + 19);
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(16); pdf.setTextColor(...C.ink); pdf.text(safe(kpi.value), x + 13, y + 43);
      if (index % 2 === 1 || index === kpis.length - 1) y += height + 10;
    });
    y += 5;
  }

  if (report.key_findings.length) { sectionTitle('Key findings', 'What the data shows'); bulletList(report.key_findings.slice(0, 8)); }

  if (charts.length) {
    sectionTitle('Supporting visuals', 'Visual evidence');
    const { default: Plotly } = await import('plotly.js-dist-min');
    for (const chart of charts) {
      const image = await chartImage(Plotly, chart);
      const imageHeight = contentWidth * 520 / 960; ensureSpace(imageHeight + 48);
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10.5); pdf.setTextColor(...C.ink); pdf.text(safe(chart.title || 'Supporting chart'), margin, y + 12); y += 23;
      pdf.setDrawColor(...C.line); pdf.setFillColor(255, 255, 255); pdf.roundedRect(margin, y, contentWidth, imageHeight + 12, 7, 7, 'FD');
      pdf.addImage(image, 'PNG', margin + 6, y + 6, contentWidth - 12, imageHeight); y += imageHeight + 28;
    }
  }

  if (report.recommendations?.length) { sectionTitle('Recommended next steps', 'Action plan'); bulletList(report.recommendations.slice(0, 5), { numbered: true, accent: C.green }); }

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page); pdf.setDrawColor(...C.line); pdf.line(margin, pageHeight - 38, pageWidth - margin, pageHeight - 38);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(...C.muted); pdf.text('Tatparya | Business analysis', margin, pageHeight - 22); pdf.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 22, { align: 'right' });
  }
  const id = rawReport?.analysis_run_id || rawReport?.id || 'analysis';
  return { pdf, filename: `tatparya-report-${String(id).replace(/[^a-zA-Z0-9_-]/g, '')}.pdf` };
}

function loadBrandLogo() {
  return new Promise((resolve) => {
    const logo = new window.Image();
    logo.onload = () => resolve(logo);
    logo.onerror = () => resolve(null);
    logo.src = '/brand/logo1.png';
  });
}

async function chartImage(Plotly, chart) {
  const host = document.createElement('div'); host.setAttribute('aria-hidden', 'true');
  Object.assign(host.style, { position: 'fixed', left: '-10000px', top: '0', width: '960px', height: '520px', pointerEvents: 'none' }); document.body.appendChild(host);
  try {
    const figure = chartFigure(chart); if (!figure.data.length) throw new Error('Chart data is unavailable for PDF export.');
    await Plotly.newPlot(host, figure.data, { ...figure.layout, autosize: false, width: 960, height: 520, paper_bgcolor: '#ffffff', plot_bgcolor: '#ffffff', margin: { l: 75, r: 30, t: 30, b: 70 } }, { staticPlot: true, displayModeBar: false });
    return await Plotly.toImage(host, { format: 'png', width: 960, height: 520, scale: 2 });
  } finally { Plotly.purge(host); host.remove(); }
}
