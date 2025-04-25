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

// Create context with default values
const CPGContext = createContext<CPGContextType>({
  selectedSection: null,
  selectedCPG: null,
  setSelectedSection: () => {},
  setSelectedCPG: () => {},
  getSections: () => [],
  getCPGsForSection: () => [],
  getSectionName: () => '',
  getFileURL: () => '',
});

// Hook for consuming the CPG context in components
export const useCPG = () => useContext(CPGContext);

export const CPGProvider = ({ children }: {children: React.ReactNode}) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedCPG, setSelectedCPG] = useState<string | null>(null);

  return (
    <CPGContext.Provider value={{
      selectedSection,
      selectedCPG,
      setSelectedSection,
      setSelectedCPG,
      // Map section keys to objects with id and name properties
      getSections: () => Object.keys(CPG_SECTIONS).map(key => ({
        id: key,
        name: CPG_SECTIONS[key].name
      })),
      // Generate numbered CPG array based on section's defined count
      getCPGsForSection: (section) => {
        const count = CPG_SECTIONS[section]?.count || 0;
        return Array.from({ length: count }, (_, i) => (i + 1).toString());
      },
      // Get readable section name with fallback to generic label
      getSectionName: (section) => CPG_SECTIONS[section]?.name || `Section ${section}`,
      // Generate file URL using appwrite service
      getFileURL: (section, cpg) => appwriteService.getCPGUrl(section, cpg)
    }}>
      {children}
    </CPGContext.Provider>
  );
};