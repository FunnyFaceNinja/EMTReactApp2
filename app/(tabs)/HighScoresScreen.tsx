import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { databases } from '../../appwriteConfig';
import { Query } from 'appwrite';

interface HighScore {
  testId: string;
  score: number;
  timestamp: string;
}

const HighScoresScreen = () => {
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [selectedTestId, setSelectedTestId] = useState('test1'); // Default to Test 1

  useEffect(() => {
    const fetchHighScores = async () => {
      try {
        const response = await databases.listDocuments(
          '67bc7a3300045b341a68', // Replace with your database ID
          '67c9cd07000cbea7e5d1', // Replace with your high_scores collection ID
          [
            Query.equal('testId', [selectedTestId]), // Filter by selected testId
            Query.orderDesc('score') // Sort by score in descending order
          ]
        );

        const scores = response.documents.map((doc) => ({
          testId: doc.testId,
          score: doc.score,
          timestamp: doc.timestamp,
        })) as HighScore[];

        setHighScores(scores);
      } catch (error) {
        console.error('Error fetching high scores:', error);
      }
    };

    fetchHighScores();
  }, [selectedTestId]);

  return (
    <View style={[styles.container, { backgroundColor: '#F2F7D9' }]}>
      <Text style={styles.title}>High Scores for {selectedTestId}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Test 1" onPress={() => setSelectedTestId('test1')} color="#F26969" />
        <Button title="Test 2" onPress={() => setSelectedTestId('test2')} color="#F26969" />
      </View>
      {highScores.length > 0 ? (
        highScores.map((score, index) => (
          <View key={index} style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {score.score}%</Text>
            <Text style={styles.scoreText}>Date: {new Date(score.timestamp).toLocaleDateString()}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.scoreText}>No high scores found for this test.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  scoreContainer: {
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 18,
    color: 'black',
  },
});

export default HighScoresScreen;