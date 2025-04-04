import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { databases } from '../../appwriteConfig';
import { Query } from 'appwrite';
import { useUser } from '../../context/UserContext';

interface HighScore {
  testId: string;
  score: number;
  timestamp: string;
  username: string;
}

const HighScoresScreen = () => {
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [selectedTestId, setSelectedTestId] = useState('test1'); // Default to Test 1
  const { username, logout } = useUser();

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
          username: doc.username || 'Anonymous',
        })) as HighScore[];

        setHighScores(scores);
      } catch (error) {
        console.error('Error fetching high scores:', error);
      }
    };

    fetchHighScores();
  }, [selectedTestId]);

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F2F7D9' }]}>
      <Text style={styles.title}>High Scores for {selectedTestId}</Text>
      
      <View style={styles.userContainer}>
        <Text style={styles.currentUser}>Current User: {username || 'Anonymous'}</Text>
        {username && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <Button title="Test 1" onPress={() => setSelectedTestId('test1')} color="#F26969" />
        <Button title="Test 2" onPress={() => setSelectedTestId('test2')} color="#F26969" />
      </View>
      
      {highScores.length > 0 ? (
        highScores.map((score, index) => (
          <View key={index} style={styles.scoreContainer}>
            <Text style={styles.scoreText}>
              {score.username}: {score.score}%
            </Text>
            <Text style={styles.dateText}>Date: {new Date(score.timestamp).toLocaleDateString()}</Text>
            {score.username === username && <Text style={styles.yourScore}>(Your Score)</Text>}
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
    marginBottom: 8,
    color: 'black',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  currentUser: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  logoutButton: {
    backgroundColor: '#F26969',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  scoreContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    color: 'black',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  yourScore: {
    fontSize: 14,
    color: '#F26969',
    fontWeight: 'bold',
  }
});

export default HighScoresScreen;