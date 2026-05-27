// @ts-ignore
import { saveAs } from 'file-saver';

export const exportToExcel = async (data: unknown[] | Record<string, unknown[]>, fileName: string) => {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();

  if (Array.isArray(data)) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  } else {
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
  }

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `${fileName}_${new Date().getTime()}.xlsx`);
};
