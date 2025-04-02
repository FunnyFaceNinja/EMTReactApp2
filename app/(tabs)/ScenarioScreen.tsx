import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { databases } from '../../appwriteConfig';
import { ID, Query } from 'appwrite';

// Define types for our scenario data
interface Option {
  optionId: string;
  text: string;
  points: number;
  nextStepId: string | null;
  isAutoFail: boolean;
}

interface Step {
  stepId: string;
  text: string;
  options: Option[];
}

interface Scenario {
  scenarioId: string;
  title: string;
  steps: Step[];
}

export default function ScenarioScreen() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userScore, setUserScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [autoFailed, setAutoFailed] = useState(false);
  
  // Fetch all scenarios when component mounts
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await databases.listDocuments(
          '67bc7a3300045b341a68',  // Database ID
          '67defbef001da3c2962a'   // Collection ID
        );
        
        const loadedScenarios = response.documents.map(doc => {
          return {
            scenarioId: doc.$id,
            title: doc.title,
            steps: JSON.parse(doc.steps || '[]') // Parse the steps string back into an array
          };
        });
        
        setScenarios(loadedScenarios);
      } catch (error) {
        console.error('Error fetching scenarios:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchScenarios();
  }, []);

  // Start a selected scenario
  const startScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    // Find first step
    const firstStep = scenario.steps.find(step => step.stepId === 'step1');
    if (firstStep) {
      setCurrentStep(firstStep);
    }
    setUserScore(0);
    setGameOver(false);
    setAutoFailed(false);
  };

  // Handle when user selects an option
  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  // Handle when user confirms their choice
  const handleContinue = () => {
    if (!currentStep || !selectedOption) return;
    
    // Find the selected option
    const option = currentStep.options.find(opt => opt.optionId === selectedOption);
    if (!option) return;
    
    // Add points to user's score
    setUserScore(prev => prev + option.points);
    
    // Check if this is an auto-fail option
    if (option.isAutoFail) {
      setAutoFailed(true);
      setGameOver(true);
      return;
    }
    
    // Move to next step or end game if no next step
    if (option.nextStepId && selectedScenario) {
      const nextStep = selectedScenario.steps.find(step => step.stepId === option.nextStepId);
      if (nextStep) {
        setCurrentStep(nextStep);
        setSelectedOption(null); // Reset selected option for next step
      } else {
        // End game if nextStepId doesn't exist
        setGameOver(true);
      }
    } else {
      // End game if there's no next step
      setGameOver(true);
    }
  };

  // Reset everything to start over
  const resetGame = () => {
    setSelectedScenario(null);
    setCurrentStep(null);
    setSelectedOption(null);
    setUserScore(0);
    setGameOver(false);
    setAutoFailed(false);
  };
  
  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#F26969" />
        <Text style={styles.loadingText}>Loading scenarios...</Text>
      </SafeAreaView>
    );
  }
  
  // Scenario selection screen
  if (!selectedScenario) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Select a Scenario</Text>
        <ScrollView style={styles.scenarioList}>
          {scenarios.map(scenario => (
            <TouchableOpacity
              key={scenario.scenarioId}
              style={styles.scenarioButton}
              onPress={() => startScenario(scenario)}
            >
              <Text style={styles.scenarioTitle}>{scenario.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // Game over screen
  if (gameOver) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>
          {autoFailed ? 'Scenario Failed' : 'Scenario Complete'}
        </Text>
        
        {autoFailed ? (
          <Text style={styles.resultText}>
            You selected an option that resulted in a critical failure.
          </Text>
        ) : (
          <Text style={styles.resultText}>
            You completed the scenario with {userScore} points!
          </Text>
        )}
        
        <TouchableOpacity style={styles.button} onPress={resetGame}>
          <Text style={styles.buttonText}>Try Another Scenario</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  // Current step display
  if (currentStep) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Score: {userScore} points</Text>
        </View>
        
        <ScrollView style={styles.contentContainer}>
          <Text style={styles.scenarioText}>{currentStep.text}</Text>
          
          <View style={styles.optionsContainer}>
            {currentStep.options.map(option => (
              <TouchableOpacity
                key={option.optionId}
                style={[
                  styles.optionButton,
                  selectedOption === option.optionId && styles.selectedOption
                ]}
                onPress={() => handleOptionSelect(option.optionId)}
              >
                <Text style={[
                  styles.optionText,
                  selectedOption === option.optionId && styles.selectedOptionText
                ]}>
                  {option.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        <TouchableOpacity
          style={[styles.button, !selectedOption && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selectedOption}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  // Fallback (should never reach here)
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F7D9',
    padding: 16,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#333',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  scenarioList: {
    width: '100%',
  },
  scenarioButton: {
    backgroundColor: '#F26969',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  scenarioTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  contentContainer: {
    width: '100%',
    marginBottom: 16,
  },
  scenarioText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: {
    backgroundColor: '#F26969',
    borderColor: '#F26969',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#F26969',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  scoreContainer: {
    alignSelf: 'flex-end',
    marginVertical: 16,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  resultText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 24,
    color: '#333',
    paddingHorizontal: 16,
  }
});