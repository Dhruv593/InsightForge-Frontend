import { dashboardReport } from './dashboardReport.js';
import { deriveKpis } from './resultFormatting.js';
import { chartFigure } from '../components/charts/chartFigure.js';

const C = {
  ink: [29, 29, 31], secondary: [81, 81, 84], muted: [110, 110, 115],
  line: [229, 229, 234], soft: [247, 247, 249], brand: [67, 56, 202],
  brandSoft: [241, 240, 255], green: [22, 122, 77], white: [255, 255, 255],
};

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
  const margin = 52;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const safe = (value) => String(value ?? '').replace(/₹/g, 'INR ').replace(/[–—]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, '...').replace(/·/g, '|').replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
  const wrapped = (value, width, size = 10, style = 'normal') => { pdf.setFont('helvetica', style); pdf.setFontSize(size); return pdf.splitTextToSize(safe(value), width); };

  function continuationPage() {
    pdf.addPage();
    if (brandLogo) pdf.addImage(brandLogo, 'PNG', margin, 20, 18, 18);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.setTextColor(...C.ink); pdf.text('TATPARYA', margin + (brandLogo ? 26 : 0), 32);
    pdf.setFont('helvetica', 'normal'); pdf.setTextColor(...C.muted); pdf.text('Business analysis report', pageWidth - margin, 32, { align: 'right' });
    pdf.setDrawColor(...C.line); pdf.line(margin, 50, pageWidth - margin, 50);
    y = 78;
  }
  function ensureSpace(height) { if (y + height > pageHeight - 58) continuationPage(); }
  function sectionTitle(title, number) {
    ensureSpace(54);
    y += 12;
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.setTextColor(...C.brand); pdf.text(String(number).padStart(2, '0'), margin, y);
    pdf.setDrawColor(...C.line); pdf.line(margin + 25, y - 2, pageWidth - margin, y - 2);
    y += 23;
    pdf.setFontSize(17); pdf.setTextColor(...C.ink); pdf.text(safe(title), margin, y);
    y += 20;
  }
  function findingList(items) {
    items.forEach((item, index) => {
      const lines = wrapped(item, contentWidth - 42, 10);
      const height = Math.max(35, lines.length * 14 + 17);
      ensureSpace(height);
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.setTextColor(...C.brand); pdf.text(String(index + 1).padStart(2, '0'), margin, y + 13);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10); pdf.setTextColor(...C.secondary); pdf.text(lines, margin + 34, y + 13);
      pdf.setDrawColor(...C.line); pdf.line(margin + 34, y + height - 4, pageWidth - margin, y + height - 4);
      y += height;
    });
  }
  function recommendationList(items) {
    items.forEach((item, index) => {
      const lines = wrapped(item, contentWidth - 52, 10);
      const height = Math.max(52, lines.length * 14 + 26);
      ensureSpace(height + 8);
      pdf.setFillColor(...C.soft); pdf.roundedRect(margin, y, contentWidth, height, 10, 10, 'F');
      pdf.setFillColor(...C.brand); pdf.circle(margin + 22, y + 24, 10, 'F');
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.setTextColor(...C.white); pdf.text(String(index + 1), margin + 22, y + 26.5, { align: 'center' });
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10); pdf.setTextColor(...C.ink); pdf.text(lines, margin + 43, y + 20);
      y += height + 8;
    });
  }

  if (brandLogo) pdf.addImage(brandLogo, 'PNG', margin, 30, 24, 24);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(...C.ink); pdf.text('TATPARYA', margin + (brandLogo ? 33 : 0), 46);
  pdf.setFillColor(...C.brand); pdf.roundedRect(pageWidth - margin - 69, 31, 69, 22, 11, 11, 'F');
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.5); pdf.setTextColor(...C.white); pdf.text('DATA REPORT', pageWidth - margin - 34.5, 45, { align: 'center' });
  pdf.setFontSize(30); pdf.setTextColor(...C.ink); pdf.text('Business analysis', margin, 105);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(12); pdf.setTextColor(...C.secondary); pdf.text('A clear view of the results, evidence, and recommended next steps.', margin, 130);
  pdf.setFontSize(9); pdf.setTextColor(...C.muted); pdf.text(`Prepared ${new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date())}`, margin, 157);
  pdf.setDrawColor(...C.line); pdf.line(margin, 178, pageWidth - margin, 178); y = 204;

  const summary = reportSummary(report);
  if (summary) {
    const lines = wrapped(summary, contentWidth - 38, 11);
    const height = Math.max(72, lines.length * 16 + 34); ensureSpace(height);
    pdf.setFillColor(...C.brandSoft); pdf.roundedRect(margin, y, contentWidth, height, 12, 12, 'F');
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.setTextColor(...C.brand); pdf.text('EXECUTIVE SUMMARY', margin + 18, y + 22);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11); pdf.setTextColor(...C.ink); pdf.text(lines, margin + 18, y + 45); y += height + 22;
  }

  const kpis = deriveKpis(charts).slice(0, 4);
  if (kpis.length) {
    sectionTitle('At a glance', 1);
    const gap = 10; const width = (contentWidth - gap) / 2; const height = 68;
    kpis.forEach((kpi, index) => {
      if (index % 2 === 0) ensureSpace(height + 10);
      const x = margin + (index % 2) * (width + gap);
      pdf.setFillColor(...C.soft); pdf.roundedRect(x, y, width, height, 10, 10, 'F');
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(...C.muted); pdf.text(safe(kpi.title), x + 15, y + 21);
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(18); pdf.setTextColor(...C.ink); pdf.text(safe(kpi.value), x + 15, y + 48);
      if (index % 2 === 1 || index === kpis.length - 1) y += height + 10;
    });
    y += 2;
  }

  let sectionNumber = kpis.length ? 2 : 1;
  if (report.key_findings.length) { sectionTitle('Key findings', sectionNumber); sectionNumber += 1; findingList(report.key_findings.slice(0, 8)); }

  if (charts.length) {
    sectionTitle('Supporting visuals', sectionNumber); sectionNumber += 1;
    const { default: Plotly } = await import('plotly.js-dist-min');
    for (const chart of charts) {
      const image = await chartImage(Plotly, chart);
      const imageHeight = contentWidth * 500 / 960; ensureSpace(imageHeight + 52);
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11); pdf.setTextColor(...C.ink); pdf.text(safe(chart.title || 'Supporting chart'), margin, y + 12); y += 23;
      pdf.setDrawColor(...C.line); pdf.roundedRect(margin, y, contentWidth, imageHeight + 10, 10, 10, 'S');
      pdf.addImage(image, 'PNG', margin + 5, y + 5, contentWidth - 10, imageHeight); y += imageHeight + 30;
    }
  }

  if (report.recommendations?.length) { sectionTitle('Recommended next steps', sectionNumber); recommendationList(report.recommendations.slice(0, 5)); }

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page); pdf.setDrawColor(...C.line); pdf.line(margin, pageHeight - 38, pageWidth - margin, pageHeight - 38);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(...C.muted); pdf.text('Tatparya  /  Business analysis', margin, pageHeight - 22); pdf.text(`${page} / ${pageCount}`, pageWidth - margin, pageHeight - 22, { align: 'right' });
  }
  const id = rawReport?.analysis_run_id || rawReport?.id || 'analysis';
  return { pdf, filename: `tatparya-report-${String(id).replace(/[^a-zA-Z0-9_-]/g, '')}.pdf` };
}

function reportSummary(report) {
  const raw = String(report.executive_summary || '').trim();
  const looksLikeRows = (raw.match(/;/g) || []).length >= 2 || /first \d+ result rows|(?:date|region|product|revenue):[^.]+(?:date|region|product|revenue):/i.test(raw);
  if (!looksLikeRows && raw) return raw;
  return (report.key_findings || []).slice(0, 2).join(' ');
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
