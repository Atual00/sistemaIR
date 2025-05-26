import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { utils, writeFile } from 'xlsx';
import { Client, Transaction, AnnualReport, MonthlyTransactionSummary, LivestockSummary, AssetReport } from '../types';
import { formatCurrency } from './formatters';

// Helper to get month name in Portuguese
const getMonthName = (month: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month - 1];
};

// Generate annual report object from transactions
export const generateAnnualReport = (client: Client, transactions: Transaction[], year: number): AnnualReport => {
  // Initialize monthly summaries
  const monthlySummaries: MonthlyTransactionSummary[] = [];
  
  // Initialize livestock counters
  const livestockSummary: LivestockSummary = {
    initialCount: 0, // This should be set from previous year's data
    purchased: 0,
    sold: 0,
    finalCount: 0
  };
  
  // Filter transactions for the specified year
  const yearTransactions = transactions.filter(t => t.year === year);
  
  // Group transactions by month
  const monthlyTransactions = new Map<number, Transaction[]>();
  
  for (const transaction of yearTransactions) {
    const month = transaction.month;
    if (!monthlyTransactions.has(month)) {
      monthlyTransactions.set(month, []);
    }
    monthlyTransactions.get(month)?.push(transaction);
  }
  
  // Calculate monthly summaries
  for (let month = 1; month <= 12; month++) {
    const monthTransactions = monthlyTransactions.get(month) || [];
    
    const income = monthTransactions
      .filter(t => t.type === 'INCOME' || t.type === 'LIVESTOCK_SALE' || t.type === 'ASSET_SALE')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'EXPENSE' || t.type === 'LIVESTOCK_PURCHASE' || t.type === 'ASSET_PURCHASE')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Only add months with transactions
    if (monthTransactions.length > 0) {
      monthlySummaries.push({
        month,
        year,
        income,
        expenses,
        result: income - expenses
      });
    }
  }
  
  // Calculate livestock movements
  for (const transaction of yearTransactions) {
    if (transaction.type === 'LIVESTOCK_PURCHASE' && transaction.quantity) {
      livestockSummary.purchased += transaction.quantity;
    } else if (transaction.type === 'LIVESTOCK_SALE' && transaction.quantity) {
      livestockSummary.sold += transaction.quantity;
    }
  }
  
  // Calculate final livestock count
  livestockSummary.finalCount = livestockSummary.initialCount + livestockSummary.purchased - livestockSummary.sold;
  
  // Collect asset transactions
  const assetReports: AssetReport[] = yearTransactions
    .filter(t => t.type === 'ASSET_PURCHASE' || t.type === 'ASSET_SALE')
    .filter(t => t.assetDetails)
    .map(t => ({
      date: new Date(t.date),
      description: t.description,
      value: t.amount,
      addToTaxDeclaration: t.assetDetails?.addToTaxDeclaration || false
    }));
  
  // Calculate annual totals
  const totalIncome = monthlySummaries.reduce((sum, month) => sum + month.income, 0);
  const totalExpenses = monthlySummaries.reduce((sum, month) => sum + month.expenses, 0);
  
  return {
    clientId: client.id,
    clientName: client.name,
    clientCpf: client.cpf,
    year,
    monthlySummaries,
    totalIncome,
    totalExpenses,
    annualResult: totalIncome - totalExpenses,
    livestockSummary,
    assets: assetReports
  };
};

// Generate PDF report
export const generatePdfReport = (report: AnnualReport): jsPDF => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(18);
  doc.text(`Relatório Anual de Atividade Rural - ${report.year}`, doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
  // Add client information
  doc.setFontSize(12);
  doc.text(`Contribuinte: ${report.clientName}`, 20, 35);
  doc.text(`CPF: ${report.clientCpf}`, 20, 45);
  
  // Section 1: Monthly transactions
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Demonstrativo da Atividade Rural', 20, 60);
  
  // Monthly table
  const monthlyData = report.monthlySummaries.map(summary => [
    `${summary.month.toString().padStart(2, '0')}/${summary.year}`,
    formatCurrency(summary.income),
    formatCurrency(summary.expenses),
    formatCurrency(summary.result)
  ]);
  
  autoTable(doc, {
    head: [['Mês/Ano', 'Receitas (R$)', 'Despesas (R$)', 'Resultado (R$)']],
    body: monthlyData,
    startY: 65,
    theme: 'grid',
    headStyles: { fillColor: [23, 162, 135] },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Annual totals
  const tableEndY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`Total de Receitas no Ano: ${formatCurrency(report.totalIncome)}`, 20, tableEndY);
  doc.text(`Total de Despesas no Ano: ${formatCurrency(report.totalExpenses)}`, 20, tableEndY + 10);
  
  // Annual result (red if negative)
  doc.setTextColor(report.annualResult < 0 ? 255 : 0, 0, 0);
  doc.text(`Resultado Anual: ${formatCurrency(report.annualResult)}`, 20, tableEndY + 20);
  doc.setTextColor(0, 0, 0);
  
  // Section 2: Livestock
  doc.setFontSize(14);
  doc.text('2. Movimentação do Rebanho Bovino', 20, tableEndY + 35);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Saldo de Bovinos em 31/12/${report.year - 1}: ${report.livestockSummary.initialCount} cabeças`, 20, tableEndY + 45);
  doc.text(`Total de Bovinos Adquiridos em ${report.year}: ${report.livestockSummary.purchased} cabeças`, 20, tableEndY + 55);
  doc.text(`Total de Bovinos Vendidos em ${report.year}: ${report.livestockSummary.sold} cabeças`, 20, tableEndY + 65);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Saldo Final de Bovinos em 31/12/${report.year}: ${report.livestockSummary.finalCount} cabeças`, 20, tableEndY + 75);
  
  // Section 3: Assets
  doc.setFontSize(14);
  doc.text('3. Bens da Atividade Rural', 20, tableEndY + 90);
  
  // Assets table
  if (report.assets.length > 0) {
    const assetData = report.assets.map(asset => [
      new Date(asset.date).toLocaleDateString('pt-BR'),
      asset.description,
      formatCurrency(asset.value),
      asset.addToTaxDeclaration ? 'Adicionar ao IR' : 'Excluir do IR (se listado)'
    ]);
    
    autoTable(doc, {
      head: [['Data', 'Descrição do Bem', 'Valor (R$)', 'Ação no IR']],
      body: assetData,
      startY: tableEndY + 95,
      theme: 'grid',
      headStyles: { fillColor: [23, 162, 135] }
    });
  } else {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Nenhum bem registrado no período.', 20, tableEndY + 100);
  }
  
  return doc;
};

// Generate Excel report
export const generateExcelReport = (report: AnnualReport) => {
  const wb = utils.book_new();
  
  // Monthly transactions worksheet
  const monthlyData = [
    ['Mês/Ano', 'Receitas (R$)', 'Despesas (R$)', 'Resultado (R$)'],
    ...report.monthlySummaries.map(summary => [
      `${summary.month.toString().padStart(2, '0')}/${summary.year}`,
      summary.income,
      summary.expenses,
      summary.result
    ]),
    [],
    ['Total Anual', report.totalIncome, report.totalExpenses, report.annualResult]
  ];
  
  const monthlyWs = utils.aoa_to_sheet(monthlyData);
  utils.book_append_sheet(wb, monthlyWs, 'Demonstrativo Mensal');
  
  // Livestock worksheet
  const livestockData = [
    ['Movimentação do Rebanho Bovino', ''],
    [`Saldo Inicial (31/12/${report.year - 1})`, report.livestockSummary.initialCount],
    ['Bovinos Adquiridos', report.livestockSummary.purchased],
    ['Bovinos Vendidos', report.livestockSummary.sold],
    [`Saldo Final (31/12/${report.year})`, report.livestockSummary.finalCount]
  ];
  
  const livestockWs = utils.aoa_to_sheet(livestockData);
  utils.book_append_sheet(wb, livestockWs, 'Rebanho Bovino');
  
  // Assets worksheet
  const assetsData = [
    ['Data', 'Descrição do Bem', 'Valor (R$)', 'Ação no IR'],
    ...report.assets.map(asset => [
      new Date(asset.date).toLocaleDateString('pt-BR'),
      asset.description,
      asset.value,
      asset.addToTaxDeclaration ? 'Adicionar ao IR' : 'Excluir do IR (se listado)'
    ])
  ];
  
  const assetsWs = utils.aoa_to_sheet(assetsData);
  utils.book_append_sheet(wb, assetsWs, 'Bens Rurais');
  
  return wb;
};

// Export to Excel file
export const exportToExcel = (report: AnnualReport) => {
  const wb = generateExcelReport(report);
  writeFile(wb, `Relatorio_Rural_${report.clientName}_${report.year}.xlsx`);
};

// Export to PDF file
export const exportToPdf = (report: AnnualReport) => {
  const doc = generatePdfReport(report);
  doc.save(`Relatorio_Rural_${report.clientName}_${report.year}.pdf`);
};