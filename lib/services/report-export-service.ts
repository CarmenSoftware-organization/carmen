import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  filename?: string;
  includeCharts?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
}

export interface ReportData {
  title: string;
  subtitle?: string;
  data: any[];
  charts?: ChartData[];
  summary?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
}

export class ReportExportService {
  /**
   * Export report data to specified format
   */
  async exportReport(reportData: ReportData, options: ExportOptions): Promise<Blob> {
    switch (options.format) {
      case 'excel':
        return this.exportToExcel(reportData, options);
      case 'pdf':
        return this.exportToPDF(reportData, options);
      case 'csv':
        return this.exportToCSV(reportData, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export to Excel format with multiple sheets and charts
   */
  private async exportToExcel(reportData: ReportData, options: ExportOptions): Promise<Blob> {
    const workbook = XLSX.utils.book_new();

    // Main data sheet
    const mainSheet = XLSX.utils.json_to_sheet(reportData.data);
    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Data');

    // Summary sheet if available
    if (reportData.summary) {
      const summaryData = Object.entries(reportData.summary).map(([key, value]) => ({
        Metric: key,
        Value: value
      }));
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }

    // Chart data sheets
    if (options.includeCharts && reportData.charts) {
      reportData.charts.forEach((chart, index) => {
        const chartSheet = XLSX.utils.json_to_sheet(chart.data);
        XLSX.utils.book_append_sheet(workbook, chartSheet, `Chart_${index + 1}`);
      });
    }

    // Metadata sheet
    if (reportData.metadata) {
      const metadataData = [
        { Property: 'Report Title', Value: reportData.title },
        { Property: 'Generated At', Value: new Date().toISOString() },
        { Property: 'Export Format', Value: options.format },
        ...Object.entries(reportData.metadata).map(([key, value]) => ({
          Property: key,
          Value: value
        }))
      ];
      const metadataSheet = XLSX.utils.json_to_sheet(metadataData);
      XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');
    }

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  /**
   * Export to PDF format with charts and formatting
   */
  private async exportToPDF(reportData: ReportData, options: ExportOptions): Promise<Blob> {
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.text(reportData.title, 20, yPosition);
    yPosition += 15;

    // Subtitle
    if (reportData.subtitle) {
      doc.setFontSize(12);
      doc.text(reportData.subtitle, 20, yPosition);
      yPosition += 10;
    }

    // Generation info
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;

    // Summary section
    if (reportData.summary) {
      doc.setFontSize(14);
      doc.text('Summary', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      Object.entries(reportData.summary).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }

    // Data table
    if (reportData.data && reportData.data.length > 0) {
      doc.setFontSize(14);
      doc.text('Data', 20, yPosition);
      yPosition += 10;

      const columns = Object.keys(reportData.data[0]);
      const rows = reportData.data.map(item => columns.map(col => item[col]));

      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: yPosition,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Charts placeholder (in a real implementation, you'd render actual charts)
    if (options.includeCharts && reportData.charts) {
      reportData.charts.forEach((chart, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.text(`Chart ${index + 1}: ${chart.title}`, 20, yPosition);
        yPosition += 10;

        // Chart data table
        if (chart.data && chart.data.length > 0) {
          const chartColumns = Object.keys(chart.data[0]);
          const chartRows = chart.data.map(item => chartColumns.map(col => item[col]));

          autoTable(doc, {
            head: [chartColumns],
            body: chartRows,
            startY: yPosition,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [139, 195, 74] }
          });

          yPosition = (doc as any).lastAutoTable.finalY + 15;
        }
      });
    }

    return new Blob([doc.output('blob')], { type: 'application/pdf' });
  }

  /**
   * Export to CSV format
   */
  private async exportToCSV(reportData: ReportData, options: ExportOptions): Promise<Blob> {
    if (!reportData.data || reportData.data.length === 0) {
      throw new Error('No data available for CSV export');
    }

    const headers = Object.keys(reportData.data[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  }

  /**
   * Generate filename based on report data and options
   */
  generateFilename(reportData: ReportData, options: ExportOptions): string {
    if (options.filename) {
      return options.filename;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedTitle = reportData.title.replace(/[^a-zA-Z0-9]/g, '_');
    const extension = this.getFileExtension(options.format);

    return `${sanitizedTitle}_${timestamp}.${extension}`;
  }

  /**
   * Get file extension for format
   */
  private getFileExtension(format: string): string {
    switch (format) {
      case 'excel':
        return 'xlsx';
      case 'pdf':
        return 'pdf';
      case 'csv':
        return 'csv';
      default:
        return 'txt';
    }
  }

  /**
   * Get MIME type for format
   */
  getMimeType(format: string): string {
    switch (format) {
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'pdf':
        return 'application/pdf';
      case 'csv':
        return 'text/csv';
      default:
        return 'application/octet-stream';
    }
  }
}

export const reportExportService = new ReportExportService();