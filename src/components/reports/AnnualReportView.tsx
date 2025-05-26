import React, { useState } from 'react';
import { Client, Transaction, AnnualReport } from '../../types';
import { useTransactionContext } from '../../context/TransactionContext';
import { generateAnnualReport, exportToPdf, exportToExcel } from '../../utils/reportGenerator';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Select from '../ui/Select';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';

interface AnnualReportViewProps {
  client: Client;
}

const AnnualReportView: React.FC<AnnualReportViewProps> = ({ client }) => {
  const { getClientTransactions } = useTransactionContext();
  const allTransactions = getClientTransactions(client.id);
  
  // Get unique years from transactions
  const years = Array.from(
    new Set(allTransactions.map((t) => t.year))
  ).sort((a, b) => b - a); // Sort descending
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(
    years.length > 0 ? years[0] : currentYear
  );
  
  // Generate report for selected year
  const report = generateAnnualReport(client, allTransactions, selectedYear);
  
  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
  };
  
  const handleExportPdf = () => {
    exportToPdf(report);
  };
  
  const handleExportExcel = () => {
    exportToExcel(report);
  };
  
  const yearOptions = years.map((year) => ({
    value: year.toString(),
    label: year.toString(),
  }));
  
  // Add current year if not in list
  if (!years.includes(currentYear)) {
    yearOptions.unshift({
      value: currentYear.toString(),
      label: currentYear.toString(),
    });
  }
  
  return (
    <Card 
      title={`Relatório Anual de Atividade Rural - ${selectedYear}`}
      footer={
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-1" />
            Exportar Excel
          </Button>
          <Button onClick={handleExportPdf}>
            <Download className="w-4 h-4 mr-1" />
            Exportar PDF
          </Button>
        </div>
      }
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
            <p className="text-sm text-gray-600">CPF: {client.cpf}</p>
          </div>
          <Select
            name="year"
            label="Ano"
            options={yearOptions}
            value={selectedYear.toString()}
            onChange={handleYearChange}
          />
        </div>
      </div>
      
      {/* Section 1: Monthly Summary */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-emerald-800 border-b border-emerald-200 pb-2 mb-4">
          1. Demonstrativo da Atividade Rural
        </h4>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Mês/Ano
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Receitas (R$)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Despesas (R$)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Resultado (R$)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report.monthlySummaries.map((summary) => (
                <tr key={`${summary.month}-${summary.year}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {summary.month.toString().padStart(2, '0')}/{summary.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                    {formatCurrency(summary.income)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                    {formatCurrency(summary.expenses)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                    summary.result >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(summary.result)}
                  </td>
                </tr>
              ))}
              {report.monthlySummaries.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum lançamento no período selecionado.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Total Anual
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                  {formatCurrency(report.totalIncome)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                  {formatCurrency(report.totalExpenses)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                  report.annualResult >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(report.annualResult)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Section 2: Livestock */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-emerald-800 border-b border-emerald-200 pb-2 mb-4">
          2. Movimentação do Rebanho Bovino
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Saldo de Bovinos em 31/12/{selectedYear - 1}:</span>{' '}
              {report.livestockSummary.initialCount} cabeças
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Total de Bovinos Adquiridos em {selectedYear}:</span>{' '}
              {report.livestockSummary.purchased} cabeças
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Total de Bovinos Vendidos em {selectedYear}:</span>{' '}
              {report.livestockSummary.sold} cabeças
            </p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-emerald-800">
              <span className="font-bold">Saldo Final de Bovinos em 31/12/{selectedYear}:</span>{' '}
              {report.livestockSummary.finalCount} cabeças
            </p>
          </div>
        </div>
      </div>
      
      {/* Section 3: Assets */}
      <div>
        <h4 className="text-lg font-semibold text-emerald-800 border-b border-emerald-200 pb-2 mb-4">
          3. Bens da Atividade Rural
        </h4>
        
        {report.assets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-emerald-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                    Descrição do Bem
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-emerald-800 uppercase tracking-wider">
                    Valor (R$)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                    Ação no IR
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.assets.map((asset, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(asset.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {asset.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                      {formatCurrency(asset.value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {asset.addToTaxDeclaration ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Adicionar ao IR
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Excluir do IR (se listado)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhum bem registrado no período selecionado.
          </p>
        )}
      </div>
    </Card>
  );
};

export default AnnualReportView;