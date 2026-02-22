import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ScheduleList } from '../components/ScheduleList';
import { ScheduleItem } from '../types/schedule';
import { ScheduleService } from '../services/scheduleService';
import ScheduleForm from '../components/ScheduleForm';

interface ScheduleScreenProps {
  date: string;
  onBack: () => void;
}

const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ date, onBack }) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [showCalendarSync, setShowCalendarSync] = useState(false);
  const scheduleService = new ScheduleService();

  useEffect(() => {
    loadScheduleItems();
  }, [date, loadScheduleItems]);

  const loadScheduleItems = async () => {
    const items = await scheduleService.getScheduleItemsForDate(new Date(date));
    setScheduleItems(items);
  };

  const handleItemPress = (item: ScheduleItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleItemDelete = async (id: string) => {
    await scheduleService.deleteScheduleItem(id);
    loadScheduleItems();
  };

  const handleSave = async (item: ScheduleItem) => {
    setShowForm(false);
    setEditingItem(null);
    await loadScheduleItems();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleCalendarSync = () => {
    setShowCalendarSync(true);
  };

  const handleCalendarSyncBack = () => {
    setShowCalendarSync(false);
  };

  if (showCalendarSync) {
    // Import CalendarSyncScreen component here to avoid circular dependency
    const CalendarSyncScreen = require('../screens/CalendarSyncScreen').default;
    return (
      <CalendarSyncScreen onBack={handleCalendarSyncBack} />
    );
  }

  if (showForm) {
    return (
      <SafeAreaView style={styles.container}>
        <ScheduleForm
          scheduleItem={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Schedule for {date}</Text>
        <TouchableOpacity onPress={handleAddNew} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.menuBar}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={handleCalendarSync}
        >
          <Text style={styles.menuButtonText}>Calendar Sync</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <ScheduleList
          items={scheduleItems}
          onItemPress={handleItemPress}
          onItemDelete={handleItemDelete}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4a90e2',
    padding: 20,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#4a90e2',
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuBar: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    alignItems: 'center',
  },
  menuButton: {
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 8,
  },
  menuButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});

export default ScheduleScreen;