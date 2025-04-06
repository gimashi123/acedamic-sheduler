import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

interface Column {
  header: string;
  dataKey: string;
}

interface ExportToPdfOptions {
  title: string;
  filename: string;
  columns: Column[];
  data: any[];
  orientation?: 'portrait' | 'landscape';
  pageSize?: string;
  includeTimestamp?: boolean;
}

/**
 * Exports data to a PDF file
 * @param options Export options
 */
export const exportToPdf = (options: ExportToPdfOptions) => {
  const {
    title,
    filename,
    columns,
    data,
    orientation = 'portrait',
    pageSize = 'a4',
    includeTimestamp = true,
  } = options;

  // Create a new PDF document
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
  });

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Add timestamp if required
  if (includeTimestamp) {
    doc.setFontSize(10);
    const timestamp = new Date().toLocaleString();
    doc.text(`Generated on: ${timestamp}`, 14, 30);
  }

  // Format data for autotable
  const tableColumns = columns.map(col => ({
    header: col.header,
    dataKey: col.dataKey
  }));

  const tableData = data.map(item => {
    const row: Record<string, any> = {};
    columns.forEach(col => {
      // Handle nested properties (e.g., 'user.name')
      if (col.dataKey.includes('.')) {
        const props = col.dataKey.split('.');
        let value = item;
        for (const prop of props) {
          value = value?.[prop];
          if (value === undefined) break;
        }
        row[col.dataKey] = value !== undefined ? value : '';
      } else {
        row[col.dataKey] = item[col.dataKey] !== undefined ? item[col.dataKey] : '';
      }
    });
    return row;
  });

  // Generate the table
  autoTable(doc, {
    startY: includeTimestamp ? 35 : 30,
    head: [tableColumns.map(col => col.header)],
    body: tableData.map(row => tableColumns.map(col => row[col.dataKey])),
    theme: 'grid',
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      overflow: 'linebreak',
      cellWidth: 'auto',
      fontSize: 10,
    },
    margin: { top: 35 },
  });

  // Save the PDF
  doc.save(`${filename}.pdf`);
};
