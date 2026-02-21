import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import ScheduleScreen from './src/screens/ScheduleScreen';
import CalendarSyncScreen from './src/screens/CalendarSyncScreen';

const App: React.FC = () => {
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const [showCalendarSync, setShowCalendarSync] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    setShowSchedule(true);
  };

  const handleBack = () => {
    setShowSchedule(false);
  };

  const handleCalendarSyncBack = () => {
    setShowCalendarSync(false);
  };

  if (showSchedule) {
    return (
      <ScheduleScreen date={selectedDate} onBack={handleBack} />
    );
  }

  if (showCalendarSync) {
    return (
      <CalendarSyncScreen onBack={handleCalendarSyncBack} />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Calendar App</Text>
      </View>
      
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => setShowSchedule(true)}
        >
          <Text style={styles.navButtonText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => setShowCalendarSync(true)}
        >
          <Text style={styles.navButtonText}>Calendar Sync</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          style={styles.calendar}
          hideExtraDays={true}
          showWeekNumbers={true}
          onDayPress={handleDayPress}
          onDayLongPress={(day) => {
            console.log('selected day', day);
          }}
          monthFormat={'yyyy MM'}
          onMonthChange={(month) => {
            console.log('month changed', month);
          }}
          disableMonthChange={false}
          enableSwipeMonths={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4a90e2',
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#e0e0e0',
  },
  navButton: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  calendarContainer: {
    flex: 1,
    padding: 10,
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    flex: 1,
  },
});

export default App;