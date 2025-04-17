import React, { createContext, useState, useContext } from 'react';
import { appwriteService, CPG_SECTIONS } from '@/services/appwrite';

interface CPGContextType {
  selectedSection: string | null;
  selectedCPG: string | null;
  setSelectedSection: (section: string | null) => void;
  setSelectedCPG: (cpg: string | null) => void;
  getSections: () => Array<{id: string, name: string}>;
  getCPGsForSection: (section: string) => string[];
  getSectionName: (section: string) => string;
  getFileURL: (section: string, cpg: string) => string;
}

const defaultContext: CPGContextType = {
  selectedSection: null,
  selectedCPG: null,
  setSelectedSection: () => {},
  setSelectedCPG: () => {},
  getSections: () => [],
  getCPGsForSection: () => [],
  getSectionName: () => '',
  getFileURL: () => '',
};

const CPGContext = createContext<CPGContextType>(defaultContext);

export const useCPG = () => useContext(CPGContext);

export const CPGProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedCPG, setSelectedCPG] = useState<string | null>(null);

  // Helper functions
  const contextValue: CPGContextType = {
    selectedSection,
    selectedCPG,
    setSelectedSection,
    setSelectedCPG,
    
    // Get all available sections
    getSections: () => Object.keys(CPG_SECTIONS).map(key => ({
      id: key,
      name: CPG_SECTIONS[key].name
    })),
    
    // Get all CPGs for a section
    getCPGsForSection: (section) => {
      const count = CPG_SECTIONS[section]?.count || 0;
      return Array.from({ length: count }, (_, i) => (i + 1).toString());
    },
    
    // Get section name
    getSectionName: (section) => CPG_SECTIONS[section]?.name || `Section ${section}`,
    
    // Get file URL
    getFileURL: (section, cpg) => appwriteService.getCPGUrl(section, cpg)
  };

  return (
    <CPGContext.Provider value={contextValue}>
      {children}
    </CPGContext.Provider>
  );
};
