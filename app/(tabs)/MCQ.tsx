import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, useColorScheme } from 'react-native';
import { RadioButton, ProgressBar } from 'react-native-paper';
import { databases } from '../../appwriteConfig';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  MCQ: { testId: string };
  HighScores: { testId: string };
};

type MCQScreenRouteProp = RouteProp<RootStackParamList, 'MCQ'>;

interface MCQScreenProps {
  route?: MCQScreenRouteProp; // Make route optional
}

interface Question {
  documentId: string;
  data: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    selectedOption: string;
    isCorrect: boolean;
  };
}

export default function MCQScreen({ route }: MCQScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [testStarted, setTestStarted] = useState(false);
  const [testEnded, setTestEnded] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [testId, setTestId] = useState<string | null>(null); // Track selected test ID
  const colorScheme = useColorScheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Use useRoute to safely access route.params
  const safeRoute = useRoute<MCQScreenRouteProp>();
  const { testId: routeTestId } = safeRoute.params || { testId: null };

  useEffect(() => {
    if (routeTestId) {
      setTestId(routeTestId);
    }
  }, [routeTestId]);

  useEffect(() => {
    if (testId) {
      const fetchQuestions = async () => {
        try {
          const response = await databases.listDocuments(
            '67bc7a3300045b341a68', // Replace with your database ID
            '67bc7a60002cea5f0f06' // Replace with your collection ID
          );

          // Map the Appwrite documents to your Question type
          const allQuestions = response.documents.map((doc) => ({
            documentId: doc.$id, // Use the Appwrite document ID
            data: {
              question: doc.question,
              optionA: doc.optionA,
              optionB: doc.optionB,
              optionC: doc.optionC,
              optionD: doc.optionD,
              correctAnswer: doc.correctAnswer,
              selectedOption: doc.selectedOption || '', // Default to empty string if not present
              isCorrect: doc.isCorrect || false, // Default to false if not present
            },
          })) as Question[];

          const startIndex = testId === 'test1' ? 0 : 5;
          const endIndex = testId === 'test1' ? 5 : 10;
          setQuestions(allQuestions.slice(startIndex, endIndex));
        } catch (error) {
          console.error('Error fetching questions:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchQuestions();
    }
  }, [testId]);

  const handleStartTest = (selectedTestId: string) => {
    setTestId(selectedTestId);
    setTestStarted(true);
  };

  const handleNextQuestion = () => {
    let updatedCorrectAnswers = correctAnswers;
    if (selectedOption === questions[currentQuestion].data.correctAnswer) {
      updatedCorrectAnswers += 1;
      setCorrectAnswers(updatedCorrectAnswers);
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption('');
    } else {
      setTestEnded(true);
      const score = (updatedCorrectAnswers / questions.length) * 100;
      saveHighScore(score, testId!);
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleRestartTest = () => {
    setCurrentQuestion(0);
    setSelectedOption('');
    setTestStarted(false);
    setTestEnded(false);
    setCorrectAnswers(0);
    setTestId(null); // Reset test selection
  };

  const saveHighScore = async (score: number, testId: string) => {
    try {
      await databases.createDocument(
        '67bc7a3300045b341a68', // Replace with your database ID
        '67c9cd07000cbea7e5d1', // Replace with your collection ID
        'unique()', // Unique ID for the document
        {
          testId: testId,
          score: score,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  };

  const textColor = 'black';
  const backgroundColor = '#F2F7D9';
  const buttonColor = '#F26969';
  const progress = (currentQuestion + 1) / questions.length;

  if (!testId) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.text, { color: textColor }]}>Choose a Test</Text>
        <Button title="Test 1" onPress={() => handleStartTest('test1')} color={buttonColor} />
        <Button title="Test 2" onPress={() => handleStartTest('test2')} color={buttonColor} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.text, { color: textColor }]}>Loading questions...</Text>
      </View>
    );
  }

  if (!testStarted) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.text, { color: textColor }]}>Do you want to start the test?</Text>
        <Button title="Start Test" onPress={() => setTestStarted(true)} color={buttonColor} />
      </View>
    );
  }

  if (testEnded) {
    const score = (correctAnswers / questions.length) * 100;
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.text, { color: textColor }]}>You have completed the test!</Text>
        <Text style={[styles.text, { color: textColor }]}>Your score: {score}%</Text>
        <Button title="Restart Test" onPress={handleRestartTest} color={buttonColor} />
        <Button
          title="View High Scores"
          onPress={() => navigation.navigate('HighScores', { testId: testId })}
          color={buttonColor}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.progressBarContainer}>
        <ProgressBar progress={progress} color={buttonColor} style={styles.progressBar} />
      </View>
      <Text style={[styles.text, { color: textColor }]}>{questions[currentQuestion].data.question}</Text>
      {['A', 'B', 'C', 'D'].map((option, index) => (
        <TouchableOpacity key={index} onPress={() => handleOptionSelect(option)} style={styles.optionContainer}>
          <RadioButton
            value={option}
            status={selectedOption === option ? 'checked' : 'unchecked'}
            onPress={() => handleOptionSelect(option)}
            color={buttonColor}
          />
          <Text style={[styles.optionText, { color: textColor }]}>
            {questions[currentQuestion].data[`option${option}` as keyof typeof questions[number]['data']]}
          </Text>
        </TouchableOpacity>
      ))}
      <Button title="Next Question" onPress={handleNextQuestion} disabled={!selectedOption} color={buttonColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  optionText: {
    fontSize: 18,
    marginLeft: 8,
  },
  progressBarContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  progressBar: {
    height: 10,
  },
});