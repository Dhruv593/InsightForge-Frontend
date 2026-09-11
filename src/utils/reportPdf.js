import { presentReport } from './reportLanguage';
import { chartFigure } from '../components/charts/chartFigure';

export async function downloadReportPdf(report, charts = []) {
  report = presentReport(report);
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let y = 52;

  function ensureSpace(height) {
    if (y + height <= pageHeight - 48) return;
    pdf.addPage();
    y = 48;
  }

  function text(value, { size = 10, style = 'normal', color = [58, 58, 60], indent = 0, gap = 7 } = {}) {
    const normalized = String(value || '').trim();
    if (!normalized) return;
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(normalized, contentWidth - indent);
    for (const line of lines) {
      ensureSpace(size * 1.35);
      pdf.text(line, margin + indent, y);
      y += size * 1.35;
    }
    y += gap;
  }

  function section(title, items) {
    if (!items?.length) return;
    ensureSpace(32);
    y += 5;
    text(title, { size: 12, style: 'bold', color: [29, 29, 31], gap: 8 });
    items.forEach((item) => text(`- ${item}`, { size: 9.5, indent: 8, gap: 5 }));
  }

  pdf.setFillColor(79, 70, 229);
  pdf.rect(0, 0, pageWidth, 8, 'F');
  text('InsightForge analysis report', { size: 20, style: 'bold', color: [29, 29, 31], gap: 4 });
  text('Grounded in verified dataset evidence', { size: 9, color: [110, 110, 115], gap: 16 });
  if (!report.key_findings.length) text(report.executive_summary, { size: 11, color: [44, 44, 46], gap: 14 });

  section('Key findings', report.key_findings);
  section('Statistical findings', report.statistical_findings || []);

  if (charts.length) {
    ensureSpace(36);
    y += 5;
    text('Supporting visuals', { size: 12, style: 'bold', color: [29, 29, 31], gap: 10 });
    const { default: Plotly } = await import('plotly.js-dist-min');
    for (const chart of charts) {
      const image = await chartImage(Plotly, chart);
      const imageHeight = contentWidth * 560 / 960;
      const titleHeight = pdf.splitTextToSize(chart.title || 'Chart', contentWidth).length * 15;
      ensureSpace(imageHeight + titleHeight + 24);
      text(chart.title, { size: 10.5, style: 'bold', color: [44, 44, 46], gap: 5 });
      pdf.addImage(image, 'PNG', margin, y, contentWidth, imageHeight);
      y += imageHeight + 16;
    }
  }

  section('Data notes', report.data_notes || []);
  section('Limitations', report.limitations || []);
  section('Recommendations', report.recommendations || []);

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(134, 134, 139);
    pdf.text(`InsightForge · Page ${page} of ${pageCount}`, margin, pageHeight - 24);
  }

  const id = report.analysis_run_id || report.id || 'analysis';
  pdf.save(`insightforge-report-${String(id).replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`);
}

async function chartImage(Plotly, chart) {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  Object.assign(host.style, { position: 'fixed', left: '-10000px', top: '0', width: '960px', height: '560px', pointerEvents: 'none' });
  document.body.appendChild(host);
  try {
    const figure = chartFigure(chart);
    if (!figure.data.length) throw new Error('Chart data is unavailable for PDF export.');
    await Plotly.newPlot(host, figure.data, { ...figure.layout, autosize: false, width: 960, height: 560 }, { staticPlot: true, displayModeBar: false });
    return await Plotly.toImage(host, { format: 'png', width: 960, height: 560, scale: 2 });
  } finally {
    Plotly.purge(host);
    host.remove();
  }
}
