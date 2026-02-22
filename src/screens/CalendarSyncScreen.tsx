import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CalendarSyncService } from '../services/calendarSyncService';
import { CalendarEvent } from '../types/calendar';

const CalendarSyncScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [calendars, setCalendars] = useState<any[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  const calendarSyncService = new CalendarSyncService();

  const loadCalendars = async () => {
    try {
      const calendarsList = await calendarSyncService.getCalendars();
      setCalendars(calendarsList);
      if (calendarsList.length > 0) {
        setSelectedCalendar(calendarsList[0].id);
      }
    } catch (error) {
      console.error('Error loading calendars:', error);
      Alert.alert('Error', 'Failed to load calendars');
    }
  };

  useEffect(() => {
    loadCalendars();
  }, []);

  const handleImport = async () => {
    if (!selectedCalendar) {
      Alert.alert('Error', 'Please select a calendar first');
      return;
    }

    setIsImporting(true);
    setImportStatus('Importing events...');
    
    try {
      const importedEvents = await calendarSyncService.importEventsFromCalendar(selectedCalendar);
      setImportStatus(`Imported ${importedEvents.length} events`);
      setEvents(importedEvents);
    } catch (error) {
      console.error('Error importing events:', error);
      setImportStatus('Failed to import events');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus('Exporting events...');
    
    try {
      // For demonstration, we'll export all schedule items
      // In a real app, you'd want to select which items to export
      const scheduleItems = await calendarSyncService.getAllScheduleItems();
      const success = await calendarSyncService.exportScheduleItemsToCalendar(scheduleItems, selectedCalendar || undefined);
      if (success) {
        setExportStatus('Successfully exported events');
      } else {
        setExportStatus('Failed to export events');
      }
    } catch (error) {
      console.error('Error exporting events:', error);
      setExportStatus('Failed to export events');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBackPress = () => {
    console.log('Back button pressed in CalendarSyncScreen');
    onBack();
  };

  const handleRequestPermission = async () => {
    try {
      const granted = await calendarSyncService.requestCalendarPermission();
      if (granted) {
        Alert.alert('Success', 'Calendar permission granted');
        loadCalendars();
      } else {
        Alert.alert('Permission Denied', 'Calendar permission was not granted');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert('Error', 'Failed to request calendar permission');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBackPress} 
          style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Calendar Sync</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ padding: 20 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calendar Permissions</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRequestPermission}
          >
            <Text style={styles.buttonText}>Request Calendar Permission</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Calendars</Text>
          {calendars.length > 0 ? (
            <View style={styles.calendarList}>
              {calendars.map((calendar) => (
                <TouchableOpacity
                  key={calendar.id}
                  style={[
                    styles.calendarItem,
                    selectedCalendar === calendar.id && styles.selectedCalendarItem
                  ]}
                  onPress={() => setSelectedCalendar(calendar.id)}
                >
                  <Text style={styles.calendarName}>{calendar.name}</Text>
                  <Text style={styles.calendarType}>{calendar.type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noCalendarsText}>No calendars found</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Import Events</Text>
          <TouchableOpacity 
            style={[styles.button, isImporting && styles.disabledButton]} 
            onPress={handleImport}
            disabled={isImporting}
          >
            {isImporting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Import Events</Text>
            )}
          </TouchableOpacity>
          {importStatus ? (
            <Text style={styles.statusText}>{importStatus}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Events</Text>
          <TouchableOpacity 
            style={[styles.button, isExporting && styles.disabledButton]} 
            onPress={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Export Events</Text>
            )}
          </TouchableOpacity>
          {exportStatus ? (
            <Text style={styles.statusText}>{exportStatus}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imported Events</Text>
          {events.length > 0 ? (
            <View style={styles.eventsList}>
              {events.map((event) => (
                <View key={event.id} style={styles.eventItem}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>
                    {event.startDate.toLocaleDateString()} - {event.startDate.toLocaleTimeString()}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noEventsText}>No imported events yet</Text>
          )}
        </View>
      </ScrollView>
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 10,
    zIndex: 1000,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarList: {
    marginBottom: 10,
  },
  calendarItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCalendarItem: {
    borderColor: '#4a90e2',
    backgroundColor: '#e6f0ff',
  },
  calendarName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarType: {
    fontSize: 14,
    color: '#666',
  },
  noCalendarsText: {
    color: '#666',
    fontStyle: 'italic',
  },
  statusText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  eventsList: {
    marginTop: 10,
  },
  eventItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  noEventsText: {
    color: '#666',
    fontStyle: 'italic',
  },
});

export default CalendarSyncScreen;