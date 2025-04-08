import React, { createContext, useContext, useState, ReactNode } from 'react';


interface ExportContextType {
  dateType: string;
  fromDate: string;
  toDate: string;
  locationFrom: string;
  locationTo: string;
  categoryFrom: string;
  categoryTo: string;
  subCategoryFrom: string;
  subCategoryTo: string;
  itemGroupFrom: string;
  itemGroupTo: string;
  productFrom: string;
  productTo: string;
  poStatus: string;
  orderBy: string;
  setExportOption: (option: string, value: string) => void;
}

const ExportContext = createContext<ExportContextType | undefined>(undefined);

export const ExportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [exportOptions, setExportOptions] = useState({
    dateType: 'PO Date',
    fromDate: '',
    toDate: '',
    locationFrom: '',
    locationTo: '',
    categoryFrom: '',
    categoryTo: '',
    subCategoryFrom: '',
    subCategoryTo: '',
    itemGroupFrom: '',
    itemGroupTo: '',
    productFrom: '',
    productTo: '',
    poStatus: 'All',
    orderBy: 'PO Date, PO No.',
  });

  const setExportOption = (option: string, value: string) => {
    setExportOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <ExportContext.Provider value={{ ...exportOptions, setExportOption }}>
      {children}
    </ExportContext.Provider>
  );
};

export const useExport = () => {
  const context = useContext(ExportContext);
  if (context === undefined) {
    throw new Error('useExport must be used within an ExportProvider');
  }
  return context;
};
