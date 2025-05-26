import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientContext } from '../context/ClientContext';
import Layout from '../components/layout/Layout';
import AnnualReportView from '../components/reports/AnnualReportView';

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedClient } = useClientContext();

  React.useEffect(() => {
    if (!selectedClient) {
      navigate('/');
    }
  }, [selectedClient, navigate]);

  if (!selectedClient) {
    return null;
  }

  return (
    <Layout>
      <AnnualReportView client={selectedClient} />
    </Layout>
  );
};

export default ReportsPage;