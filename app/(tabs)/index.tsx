// Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { RadioButton, ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { databases } from '../../appwriteConfig';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import UsernameModal from '../../components/UsernameModal';
import { useUser } from '../../context/UserContext';
import { router } from 'expo-router';
import { Platform } from 'react-native';

// Define the structure of a question
interface Question {
  documentId: string;
  data: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
  };
}

// Define navigation param types
type RootStackParamList = {
  HighScores: { testId: string };
};

export default function MCQScreen() {
  // State variables for managing the quiz flow
  const [currentQuestion, setCurrentQuestion] = useState(0);         // Current question index
  const [selectedOption, setSelectedOption] = useState('');          // User's selected answer
  const [testStarted, setTestStarted] = useState(false);             // Whether test has started
  const [testEnded, setTestEnded] = useState(false);                 // Whether test has ended
  const [correctAnswers, setCorrectAnswers] = useState(0);           // Count of correct answers
  const [questions, setQuestions] = useState<Question[]>([]);        // Array of questions
  const [loading, setLoading] = useState(true);                      // Loading state
  const [testId, setTestId] = useState<string | null>(null);         // Current test ID
  const [userAnswers, setUserAnswers] = useState<string[]>([]);      // User's answers for each question
  
  // Get navigation and user context with proper type
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { username, isLoading } = useUser();
  
  // App theme colors
  const COLORS = {
    text: 'black',
    background: '#F2F7D9',
    button: '#F26969',
    card: 'white',
    border: '#ddd'
  };

  // Fetch questions when test ID changes
  useEffect(() => {
    if (!testId) return; // Skip if no test is selected
    
    const fetchQuestions = async () => {
      try {
        // Get questions from Appwrite database
        const response = await databases.listDocuments(
          '67bc7a3300045b341a68',   // Database ID
          '67bc7a60002cea5f0f06'    // Collection ID
        );

        // Transform the response into our Question format
        const allQuestions = response.documents.map(doc => ({
          documentId: doc.$id,
          data: {
            question: doc.question,
            optionA: doc.optionA,
            optionB: doc.optionB,
            optionC: doc.optionC,
            optionD: doc.optionD,
            correctAnswer: doc.correctAnswer,
          },
        }));

        // Select questions based on test ID
        let startIndex, endIndex;
        if (testId === 'test1') {
          startIndex = 0;
          endIndex = 5;
        } else {
          startIndex = 5;
          endIndex = 10;
        }
        
        // Get subset of questions for this test
        const testQuestions = allQuestions.slice(startIndex, endIndex);
        
        // Update state with questions and initialize user answers array
        setQuestions(testQuestions);
        setUserAnswers(Array(testQuestions.length).fill(''));
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [testId]);

  // Start a test with the given ID
  const handleStartTest = (id: string) => {
    setTestId(id);
    setTestStarted(true);
  };

  // Handle when user selects an answer option
  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
    
    // Save answer to user answers array
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = option;
    setUserAnswers(newAnswers);
  };

  // Go to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedOption(userAnswers[currentQuestion - 1]);
    }
  };

  // Go to next question or finish test
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      // Move to next question
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(userAnswers[currentQuestion + 1]);
    } else {
      // Calculate score
      const correctCount = userAnswers.reduce((count, answer, index) => {
        return count + (answer === questions[index].data.correctAnswer ? 1 : 0);
      }, 0);
      
      // End test and save score
      setCorrectAnswers(correctCount);
      setTestEnded(true);
      saveHighScore((correctCount / questions.length) * 100);
    }
  };

  // Save high score to database
  const saveHighScore = async (score: number) => {
    try {
      await databases.createDocument(
        '67bc7a3300045b341a68',     // Database ID
        '67c9cd07000cbea7e5d1',     // High scores collection ID
        'unique()',                 // Generate unique ID
        {
          testId,
          score,
          timestamp: new Date().toISOString(),
          username: username || 'Anonymous',
        }
      );
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  // Reset test state
  const resetTest = () => {
    console.log("resetTest called with values:", {
      currentQuestion,
      testStarted,
      testEnded,
      testId
    });
    
    setCurrentQuestion(0);
    setSelectedOption('');
    setTestStarted(false);
    setTestEnded(false);
    setCorrectAnswers(0);
    setUserAnswers([]);
    setTestId(null);
    
    console.log("resetTest completed - state should be reset");
  };

  // Show username input if needed
  if (!isLoading && !username) {
    return <UsernameModal visible={true} />;
  }

  // Test selection screen
  if (!testId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <Text style={styles.title}>Choose a Test</Text>
        
        <ScrollView style={styles.scrollContainer}>
          {/* Basic test option */}
          <TouchableOpacity 
            style={styles.testCard} 
            onPress={() => handleStartTest('test1')}
          >
            <Ionicons name="document-text" size={28} color={COLORS.button} style={styles.cardIcon} />
            <Text style={styles.testName}>Basic EMT Test</Text>
            <Text style={styles.testInfo}>5 questions on basic EMT knowledge</Text>
          </TouchableOpacity>
          
          {/* Advanced test option */}
          <TouchableOpacity 
            style={styles.testCard} 
            onPress={() => handleStartTest('test2')}
          >
            <Ionicons name="medkit" size={28} color={COLORS.button} style={styles.cardIcon} />
            <Text style={styles.testName}>Advanced EMT Test</Text>
            <Text style={styles.testInfo}>5 questions on advanced procedures</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="reload" size={40} color={COLORS.button} />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Test confirmation screen
  if (!testStarted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        {/* Header with exit button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={resetTest} style={styles.exitButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {testId === 'test1' ? 'Basic EMT Test' : 'Advanced EMT Test'}
          </Text>
          <View style={{width: 24}} />
        </View>
        
        {/* Test info */}
        <Text style={styles.title}>Ready to start?</Text>
        <Text style={styles.info}>
          This test has 5 questions. You can navigate between questions anytime.
        </Text>
        
        {/* Start button */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setTestStarted(true)}
        >
          <Text style={styles.buttonText}>Begin Test</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Test results screen
  if (testEnded) {
    const score = (correctAnswers / questions.length) * 100;
    
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <Text style={styles.title}>Test Complete!</Text>
        <Text style={styles.scoreText}>Your score: {score.toFixed(0)}%</Text>
        <Text style={styles.info}>
          You answered {correctAnswers} out of {questions.length} questions correctly.
        </Text>
        
        {/* Action buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={resetTest}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('HighScores', { testId })}
          >
            <Text style={styles.buttonText}>View High Scores</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Question screen - when test is active
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Header with question counter and exit button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={resetTest} style={styles.exitButton}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Question {currentQuestion + 1} of {questions.length}
        </Text>
        <View style={{width: 24}} />
      </View>
      
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <ProgressBar 
          progress={(currentQuestion + 1) / questions.length} 
          color={COLORS.button} 
          style={styles.progressBar} 
        />
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {/* Question card */}
        <View style={styles.questionCard}>
          {/* Question text */}
          <Text style={styles.questionText}>
            {questions[currentQuestion].data.question}
          </Text>
          
          {/* Answer options */}
          {['A', 'B', 'C', 'D'].map(option => (
            <TouchableOpacity 
              key={option} 
              onPress={() => handleSelectOption(option)} 
              style={[
                styles.optionContainer,
                selectedOption === option && styles.selectedOption
              ]}
            >
              <RadioButton
                value={option}
                status={selectedOption === option ? 'checked' : 'unchecked'}
                onPress={() => handleSelectOption(option)}
                color={COLORS.button}
              />
              <Text style={[
                styles.optionText,
                selectedOption === option && styles.selectedOptionText
              ]}>
                {option === 'A' ? questions[currentQuestion].data.optionA :
                 option === 'B' ? questions[currentQuestion].data.optionB :
                 option === 'C' ? questions[currentQuestion].data.optionC :
                 questions[currentQuestion].data.optionD}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      {/* Navigation buttons */}
      <View style={styles.buttonRow}>
        {/* Previous button - only show if not on first question */}
        {currentQuestion > 0 && (
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handlePreviousQuestion}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Previous</Text>
          </TouchableOpacity>
        )}
        
        {/* Next/Finish button */}
        <TouchableOpacity 
          style={[
            styles.button, 
            !selectedOption && styles.disabledButton,
            currentQuestion === 0 && styles.fullWidthButton
          ]} 
          onPress={handleNextQuestion}
          disabled={!selectedOption}
        >
          <Text style={styles.buttonText}>
            {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Styles for the components
const styles = StyleSheet.create({
  container: {
    flex: 1,                // Take up all available space
    padding: 16,            // Add padding around edges
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',   // Items in a row
    alignItems: 'center',   // Center items vertically
    justifyContent: 'space-between', // Space items evenly
    marginBottom: 16,       // Space below header
  },
  headerTitle: {
    fontSize: 18,           // Text size
    fontWeight: 'bold',     // Make text bold
  },
  exitButton: {
    padding: 8,             // Padding for touch target
  },
  title: {
    fontSize: 24,           // Large title text
    fontWeight: 'bold',     // Bold text
    textAlign: 'center',    // Center text
    marginBottom: 16,       // Space below title
  },
  info: {
    fontSize: 16,           // Info text size
    textAlign: 'center',    // Center text
    marginBottom: 24,       // Space below info
    color: '#666',          // Grey color
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
    color: '#666',
  },
  cardIcon: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  testCard: {
    backgroundColor: 'white', // White background
    borderRadius: 12,        // Rounded corners
    padding: 20,            // Internal padding
    marginBottom: 16,       // Space below card
    width: '100%',          // Full width
    shadowColor: '#000',    // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowOpacity: 0.1,     // Shadow opacity
    shadowRadius: 3,        // Shadow blur radius
    elevation: 3,           // Android elevation
  },
  testName: {
    fontSize: 18,           // Test name size
    fontWeight: 'bold',     // Bold text
    marginBottom: 8,        // Space below name
    textAlign: 'center',
  },
  testInfo: {
    fontSize: 14,           // Info text size
    color: '#666',          // Grey color
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: 'white', // White background
    borderRadius: 12,        // Rounded corners
    padding: 20,            // Internal padding
    marginBottom: 16,       // Space below card
    width: '100%',          // Full width
    shadowColor: '#000',    // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowOpacity: 0.1,     // Shadow opacity
    shadowRadius: 3,        // Shadow blur radius
    elevation: 3,           // Android elevation
  },
  questionText: {
    fontSize: 18,           // Question text size
    marginBottom: 24,       // Space below question
    lineHeight: 26,         // Increased line height for readability
  },
  progressBarContainer: {
    width: '100%',          // Full width
    marginBottom: 16,       // Space below container
  },
  progressBar: {
    height: 8,              // Bar height
    borderRadius: 4,        // Rounded bar ends
  },
  optionContainer: {
    flexDirection: 'row',   // Items in a row
    alignItems: 'center',   // Center items vertically
    marginBottom: 12,       // Space below option
    padding: 12,            // Internal padding
    borderWidth: 1,         // Border width
    borderColor: '#ddd',    // Border color
    borderRadius: 8,        // Rounded corners
  },
  selectedOption: {
    backgroundColor: '#F2F7D9', // Light green background
    borderColor: '#F26969',   // Pink border
  },
  optionText: {
    fontSize: 16,           // Option text size
    marginLeft: 8,          // Space after radio button
    flex: 1,                // Take up remaining space
  },
  selectedOptionText: {
    fontWeight: '500',      // Make selected text slightly bolder
  },
  buttonRow: {
    flexDirection: 'row',   // Buttons in a row
    justifyContent: 'space-between', // Space buttons evenly
    marginTop: 16,          // Space above buttons
    marginBottom: 8,        // Space below buttons
  },
  button: {
    backgroundColor: '#F26969', // Pink background
    paddingVertical: 14,    // Vertical padding
    paddingHorizontal: 24,  // Horizontal padding
    borderRadius: 10,       // Rounded corners
    alignItems: 'center',   // Center text horizontally
    justifyContent: 'center', // Center text vertically
    minWidth: 120,          // Minimum button width
    shadowColor: '#000',    // Shadow color
    shadowOffset: { width: 0, height: 1 }, // Shadow position
    shadowOpacity: 0.2,     // Shadow opacity
    shadowRadius: 1.5,      // Shadow blur radius
    elevation: 2,           // Android elevation
  },
  secondaryButton: {
    backgroundColor: 'white', // White background
    borderWidth: 1,         // Border width
    borderColor: '#F26969', // Pink border
  },
  disabledButton: {
    backgroundColor: '#ccc', // Grey background when disabled
    shadowOpacity: 0,
    elevation: 0,
  },
  fullWidthButton: {
    width: '100%',          // Full width for single button
  },
  buttonText: {
    color: 'white',         // White text
    fontSize: 16,           // Text size
    fontWeight: 'bold',     // Bold text
  },
  secondaryButtonText: {
    color: '#F26969',       // Pink text for secondary button
  },
  scoreText: {
    fontSize: 42,           // Large score text
    fontWeight: 'bold',     // Bold text
    textAlign: 'center',    // Center text
    marginVertical: 20,     // Vertical margin
    color: '#F26969',       // Pink color
  },
});