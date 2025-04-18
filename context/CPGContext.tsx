// Import React hooks and context API
import React, { createContext, useState, useContext } from 'react';
// Import the app service and data structure for CPGs
import { appwriteService, CPG_SECTIONS } from '@/services/appwrite';

// Define TypeScript interface for the context values and functions
interface CPGContextType {
  selectedSection: string | null;                           // Currently selected section ID (or null)
  selectedCPG: string | null;                               // Currently selected CPG ID (or null)
  setSelectedSection: (section: string | null) => void;     // Function to update selected section
  setSelectedCPG: (cpg: string | null) => void;             // Function to update selected CPG
  getSections: () => Array<{id: string, name: string}>;     // Function to get all available sections
  getCPGsForSection: (section: string) => string[];         // Function to get CPGs for a section
  getSectionName: (section: string) => string;              // Function to get human-readable section name
  getFileURL: (section: string, cpg: string) => string;     // Function to get PDF file URL
}

// Create a context with default placeholder values
const CPGContext = createContext<CPGContextType>({
  selectedSection: null,                 // No section selected by default
  selectedCPG: null,                     // No CPG selected by default
  setSelectedSection: () => {},          // Empty function placeholder
  setSelectedCPG: () => {},              // Empty function placeholder
  getSections: () => [],                 // Empty array placeholder
  getCPGsForSection: () => [],           // Empty array placeholder
  getSectionName: () => '',              // Empty string placeholder
  getFileURL: () => '',                  // Empty string placeholder
});

// Create a custom hook for easier context consumption
export const useCPG = () => useContext(CPGContext);

// Create the context provider component
export const CPGProvider = ({ children }: {children: React.ReactNode}) => {
  // Set up state for tracking selected items
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedCPG, setSelectedCPG] = useState<string | null>(null);

  // Return the provider with actual implementation of context values
  return (
    <CPGContext.Provider value={{
      // Expose state values and setters
      selectedSection,
      selectedCPG,
      setSelectedSection,
      setSelectedCPG,
      // Function to return all sections as an array of objects with id and name
      getSections: () => Object.keys(CPG_SECTIONS).map(key => ({
        id: key,
        name: CPG_SECTIONS[key].name
      })),
      // Function to get all CPGs for a given section (numbered strings)
      getCPGsForSection: (section) => {
        const count = CPG_SECTIONS[section]?.count || 0;
        return Array.from({ length: count }, (_, i) => (i + 1).toString());
      },
      // Function to get the display name for a section
      getSectionName: (section) => CPG_SECTIONS[section]?.name || `Section ${section}`,
      // Function to get the URL for a specific CPG PDF
      getFileURL: (section, cpg) => appwriteService.getCPGUrl(section, cpg)
    }}>
      {children}
    </CPGContext.Provider>
  );
};