import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { databases } from '../../appwriteConfig';
import { Query } from 'appwrite';
import { useUser } from '../../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';

// Type definitions
interface HighScore {
  testId: string;
  score: number;
  timestamp: string;
  username: string;
}

interface ScenarioScore {
  scenarioId: string;
  score: number;
  timestamp: string;
  username: string;
}

interface UserProgress {
  date: string;
  score: number;
}

// App theme colors (moved outside component)
const COLORS = {
  text: 'black',
  background: '#F2F7D9',
  button: '#F26969',
  card: 'white',
  border: '#ddd',
  secondaryText: '#666',
  chart: {
    backgroundGradientFrom: '#F2F7D9',
    backgroundGradientTo: '#F2F7D9',
    color: (opacity = 1) => `rgba(242, 105, 105, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  }
};

const screenWidth = Dimensions.get('window').width - 32; // accounting for padding

const HighScoresScreen = () => {
  // State management - keeping arrays separate
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [scenarioScores, setScenarioScores] = useState<ScenarioScore[]>([]);
  const [selectedTestId, setSelectedTestId] = useState('test1'); 
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [scoreType, setScoreType] = useState<'test' | 'scenario'>('test');
  const [viewType, setViewType] = useState<'list' | 'chart'>('list');
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [allUserScores, setAllUserScores] = useState<{[username: string]: number}>({});
  const { username, logout } = useUser();

  // Fetch MCQ test scores
  useEffect(() => {
    const fetchHighScores = async () => {
      setLoading(true);
      try {
        const response = await databases.listDocuments(
          '67bc7a3300045b341a68',
          '67c9cd07000cbea7e5d1',
          [
            Query.equal('testId', [selectedTestId]),
            Query.orderDesc('score')
          ]
        );

        const scores = response.documents.map((doc) => ({
          testId: doc.testId,
          score: doc.score,
          timestamp: doc.timestamp,
          username: doc.username || 'Anonymous',
        })) as HighScore[];

        setHighScores(scores);
        
        // Extract user's progress data for charts
        const userScores = scores
          .filter(score => score.username === username)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .map(score => ({
            date: new Date(score.timestamp).toLocaleDateString('en-IE', { month: 'short', day: 'numeric' }),
            score: score.score
          }));
        
        setUserProgress(userScores);
        
        // Prepare data for comparison chart
        const userAverages: {[username: string]: {total: number, count: number}} = {};
        scores.forEach(score => {
          if (!userAverages[score.username]) {
            userAverages[score.username] = { total: 0, count: 0 };
          }
          userAverages[score.username].total += score.score;
          userAverages[score.username].count += 1;
        });
        
        const userAverageScores: {[username: string]: number} = {};
        Object.keys(userAverages).forEach(user => {
          userAverageScores[user] = userAverages[user].total / userAverages[user].count;
        });
        
        setAllUserScores(userAverageScores);
      } catch (error) {
        console.error('Error fetching high scores:', error);
      } finally {
        setLoading(false);
      }
    };

    if (scoreType === 'test') {
      fetchHighScores();
    }
  }, [selectedTestId, scoreType, username]);

  // Fetch all available scenario IDs on mount
  useEffect(() => {
    const fetchScenarioIds = async () => {
      try {
        const response = await databases.listDocuments(
          '67bc7a3300045b341a68',
          '680292d4003b75d41995',
          []
        );

        if (response.documents.length > 0) {
          const uniqueIds = [...new Set(response.documents.map(doc => doc.scenarioId))];
          if (uniqueIds.length > 0 && !selectedScenarioId) {
            setSelectedScenarioId(uniqueIds[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching scenario IDs:', error);
      }
    };

    fetchScenarioIds();
  }, []);

  // Fetch scenario scores
  useEffect(() => {
    const fetchScenarioScores = async () => {
      if (!selectedScenarioId) return;
      
      setLoading(true);
      try {
        const response = await databases.listDocuments(
          '67bc7a3300045b341a68',
          '680292d4003b75d41995',
          [
            Query.equal('scenarioId', [selectedScenarioId]),
            Query.orderDesc('score')
          ]
        );

        const scores = response.documents.map((doc) => ({
          scenarioId: doc.scenarioId,
          score: doc.score,
          timestamp: doc.timestamp,
          username: doc.username || 'Anonymous',
        })) as ScenarioScore[];

        setScenarioScores(scores);
        
        // Extract user's progress data for charts
        const userScores = scores
          .filter(score => score.username === username)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .map(score => ({
            date: new Date(score.timestamp).toLocaleDateString('en-IE', { month: 'short', day: 'numeric' }),
            score: score.score
          }));
        
        setUserProgress(userScores);
        
        // Prepare data for comparison chart
        const userAverages: {[username: string]: {total: number, count: number}} = {};
        scores.forEach(score => {
          if (!userAverages[score.username]) {
            userAverages[score.username] = { total: 0, count: 0 };
          }
          userAverages[score.username].total += score.score;
          userAverages[score.username].count += 1;
        });
        
        const userAverageScores: {[username: string]: number} = {};
        Object.keys(userAverages).forEach(user => {
          userAverageScores[user] = userAverages[user].total / userAverages[user].count;
        });
        
        setAllUserScores(userAverageScores);
      } catch (error) {
        console.error('Error fetching scenario scores:', error);
      } finally {
        setLoading(false);
      }
    };

    if (scoreType === 'scenario' && selectedScenarioId) {
      fetchScenarioScores();
    }
  }, [selectedScenarioId, scoreType, username]);

  // Helper functions
  const getAvailableScenarioIds = () => {
    const uniqueIds = [...new Set(scenarioScores.map(score => score.scenarioId))];
    return uniqueIds.length > 0 ? uniqueIds : [selectedScenarioId].filter(Boolean);
  };

  const getTestName = (id: string) => {
    return id === 'test1' ? 'Basic EMT Test' : 'Advanced EMT Test';
  };

  const getScenarioName = (id: string) => {
    return `Scenario ${id}`;
  };

  // Render common score card component
  const renderScoreCard = (
    score: { username: string; score: number; timestamp: string }, 
    isTest: boolean
  ) => (
    <View style={styles.scoreCard}>
      <View style={styles.scoreHeader}>
        <View style={styles.usernameContainer}>
          <Ionicons name="person" size={16} color={COLORS.secondaryText} />
          <Text style={styles.username}>{score.username}</Text>
          {score.username === username && (
            <View style={styles.yourScoreBadge}>
              <Text style={styles.yourScoreText}>You</Text>
            </View>
          )}
        </View>
        <Text style={styles.scoreValue}>
          {isTest ? `${score.score.toFixed(0)}%` : `${score.score} pts`}
        </Text>
      </View>
      <View style={styles.scoreFooter}>
        <Ionicons name="calendar-outline" size={14} color={COLORS.secondaryText} />
        <Text style={styles.dateText}>
          {new Date(score.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  // Render user progress chart
  const renderProgressChart = () => {
    if (userProgress.length < 2) {
      return (
        <View style={styles.emptyChartContainer}>
          <Ionicons name="analytics" size={50} color="#ccc" />
          <Text style={styles.emptyChartText}>
            Not enough data to show progress.
            Complete more tests to see your progress chart.
          </Text>
        </View>
      );
    }

    const chartData = {
      labels: userProgress.map(item => item.date),
      datasets: [
        {
          data: userProgress.map(item => item.score),
          color: (opacity = 1) => `rgba(242, 105, 105, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ["Your Progress"]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Your Progress Over Time</Text>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={COLORS.chart}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  // Render comparison chart
  const renderComparisonChart = () => {
    const usernames = Object.keys(allUserScores);
    
    if (usernames.length < 2) {
      return (
        <View style={styles.emptyChartContainer}>
          <Ionicons name="people" size={50} color="#ccc" />
          <Text style={styles.emptyChartText}>
            Not enough users to compare scores.
          </Text>
        </View>
      );
    }

    // Sort usernames to put current user first
    usernames.sort((a, b) => {
      if (a === username) return -1;
      if (b === username) return 1;
      return 0;
    });

    // Limit to top 5 users including current user if present
    const displayUsers = usernames.slice(0, 5);
    
    const chartData = {
      labels: displayUsers.map(name => name === username ? "You" : name.substring(0, 6) + "..."),
      datasets: [
        {
          data: displayUsers.map(name => allUserScores[name]),
          colors: displayUsers.map(name => 
            name === username 
              ? () => `rgba(67, 160, 71, 1)` 
              : () => `rgba(242, 105, 105, 0.8)`
          )
        }
      ]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Score Comparison</Text>
        <BarChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={{
            ...COLORS.chart,
            formatYLabel: (value) => Math.round(Number(value)).toString()
          }}
          style={styles.chart}
          fromZero
          showValuesOnTopOfBars
          yAxisLabel=""
          yAxisSuffix={scoreType === 'test' ? "%" : "pts"}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Header with title and logout option */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>High Scores</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      {/* User info */}
      <View style={styles.userInfoContainer}>
        <Ionicons name="person-circle-outline" size={24} color={COLORS.secondaryText} />
        <Text style={styles.currentUser}>{username || 'Anonymous'}</Text>
      </View>
      
      {/* Toggle between test scores and scenario scores */}
      <View style={styles.toggleContainer}>
        {/* Test toggle button */}
        <TouchableOpacity 
          style={[styles.toggleButton, scoreType === 'test' && styles.activeToggle]}
          onPress={() => setScoreType('test')}
        >
          <Ionicons 
            name="document-text-outline" 
            size={20} 
            color={scoreType === 'test' ? 'white' : COLORS.button} 
          />
          <Text style={[styles.toggleText, scoreType === 'test' && styles.activeToggleText]}>
            MCQ Tests
          </Text>
        </TouchableOpacity>
        
        {/* Scenario toggle button */}
        <TouchableOpacity 
          style={[styles.toggleButton, scoreType === 'scenario' && styles.activeToggle]}
          onPress={() => setScoreType('scenario')}
        >
          <Ionicons 
            name="medkit-outline" 
            size={20} 
            color={scoreType === 'scenario' ? 'white' : COLORS.button} 
          />
          <Text style={[styles.toggleText, scoreType === 'scenario' && styles.activeToggleText]}>
            Scenarios
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* View mode toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, viewType === 'list' && styles.activeToggle]}
          onPress={() => setViewType('list')}
        >
          <Ionicons 
            name="list-outline" 
            size={20} 
            color={viewType === 'list' ? 'white' : COLORS.button} 
          />
          <Text style={[styles.toggleText, viewType === 'list' && styles.activeToggleText]}>
            List View
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toggleButton, viewType === 'chart' && styles.activeToggle]}
          onPress={() => setViewType('chart')}
        >
          <Ionicons 
            name="analytics-outline" 
            size={20} 
            color={viewType === 'chart' ? 'white' : COLORS.button} 
          />
          <Text style={[styles.toggleText, viewType === 'chart' && styles.activeToggleText]}>
            Charts
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Test selection container */}
      {scoreType === 'test' && (
        <View style={styles.selectionContainer}>
          <Text style={styles.selectionTitle}>Select Test:</Text>
          <View style={styles.buttonContainer}>
            {/* Basic Test Button */}
            <TouchableOpacity 
              style={[styles.selectionButton, selectedTestId === 'test1' && styles.selectedButton]} 
              onPress={() => setSelectedTestId('test1')}
            >
              <Text style={[
                styles.selectionButtonText,
                selectedTestId === 'test1' && styles.selectedButtonText
              ]}>Basic Test</Text>
            </TouchableOpacity>
            
            {/* Advanced Test Button */}
            <TouchableOpacity 
              style={[styles.selectionButton, selectedTestId === 'test2' && styles.selectedButton]} 
              onPress={() => setSelectedTestId('test2')}
            >
              <Text style={[
                styles.selectionButtonText,
                selectedTestId === 'test2' && styles.selectedButtonText
              ]}>Advanced Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Scenario selection container */}
      {scoreType === 'scenario' && (
        <View style={styles.selectionContainer}>
          <Text style={styles.selectionTitle}>Select Scenario:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scenarioScrollView}>
            {getAvailableScenarioIds().map((id) => (
              <TouchableOpacity 
                key={id} 
                style={[
                  styles.selectionButton, 
                  selectedScenarioId === id && styles.selectedButton,
                  { marginHorizontal: 5 }
                ]} 
                onPress={() => setSelectedScenarioId(id)}
              >
                <Text style={[
                  styles.selectionButtonText,
                  selectedScenarioId === id && styles.selectedButtonText
                ]}>{getScenarioName(id)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Current scores section title */}
      <View style={styles.scoresHeaderContainer}>
        <Text style={styles.scoresHeaderText}>
          {scoreType === 'test' ? 
            getTestName(selectedTestId) : 
            getScenarioName(selectedScenarioId)} Scores
        </Text>
      </View>
      
      {/* Loading indicator */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.button} />
          <Text style={styles.loadingText}>Loading scores...</Text>
        </View>
      ) : (
        <>
          {/* Chart View */}
          {viewType === 'chart' ? (
            <ScrollView style={styles.scrollContainer}>
              {renderProgressChart()}
              {renderComparisonChart()}
            </ScrollView>
          ) : (
            /* List View */
            <ScrollView style={styles.scrollContainer}>
              {/* Show test scores */}
              {scoreType === 'test' && highScores.length > 0 ? (
                highScores.map((score, index) => (
                  <React.Fragment key={index}>
                    {renderScoreCard(score, true)}
                  </React.Fragment>
                ))
              ) : scoreType === 'test' ? (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="document-text" size={60} color="#ccc" />
                  <Text style={styles.emptyStateText}>No scores for this test yet.</Text>
                </View>
              ) : null}
              
              {/* Show scenario scores */}
              {scoreType === 'scenario' && scenarioScores.length > 0 ? (
                scenarioScores.map((score, index) => (
                  <React.Fragment key={index}>
                    {renderScoreCard(score, false)}
                  </React.Fragment>
                ))
              ) : scoreType === 'scenario' ? (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="medkit" size={60} color="#ccc" />
                  <Text style={styles.emptyStateText}>No scores for this scenario yet.</Text>
                </View>
              ) : null}
            </ScrollView>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: COLORS.button,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentUser: {
    fontSize: 16,
    color: COLORS.secondaryText,
    marginLeft: 8,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.button,
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeToggle: {
    backgroundColor: COLORS.button,
  },
  toggleText: {
    textAlign: 'center',
    color: COLORS.button,
    fontWeight: '500',
    marginLeft: 8,
  },
  activeToggleText: {
    color: 'white',
  },
  selectionContainer: {
    marginBottom: 20,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: COLORS.secondaryText,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  scenarioScrollView: {
    marginBottom: 10,
  },
  selectionButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.button,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedButton: {
    backgroundColor: COLORS.button,
  },
  selectionButtonText: {
    color: COLORS.button,
    fontWeight: '500',
  },
  selectedButtonText: {
    color: 'white',
  },
  scoresHeaderContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.button,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scoresHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.button,
  },
  scoreFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginLeft: 6,
  },
  yourScoreBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  yourScoreText: {
    color: '#43A047',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.secondaryText,
    marginTop: 12,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.secondaryText,
    marginTop: 16,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  chart: {
    borderRadius: 10,
    padding: 10,
  },
  emptyChartContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
  },
  emptyChartText: {
    fontSize: 16,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginTop: 15,
    maxWidth: '80%',
  },
});

export default HighScoresScreen;