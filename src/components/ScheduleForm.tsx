import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import DateTimePicker from 'react-native-date-picker';
import { ScheduleItem } from '../types/schedule';
import { ScheduleService } from '../services/scheduleService';

interface ScheduleFormProps {
  scheduleItem?: ScheduleItem | null;
  onSave: (item: ScheduleItem) => void;
  onCancel: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ scheduleItem, onSave, onCancel }) => {
  const [title, setTitle] = useState(scheduleItem?.title || '');
  const [description, setDescription] = useState(scheduleItem?.description || '');
  const [date, setDate] = useState(scheduleItem?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(scheduleItem?.time || '');
  const [isAllDay, setIsAllDay] = useState(scheduleItem?.isAllDay || false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(scheduleItem?.reminder?.enabled || false);
  const [reminderTime, setReminderTime] = useState(scheduleItem?.reminder?.time || '');

  const scheduleService = new ScheduleService();

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for the schedule item');
      return;
    }

    const itemData = {
      title,
      description,
      date,
      time,
      isAllDay,
      reminder: reminderEnabled ? { time: reminderTime, enabled: true } : undefined,
    };

    if (scheduleItem) {
      // Update existing item
      await scheduleService.updateScheduleItem(scheduleItem.id, itemData);
      onSave({ ...scheduleItem, ...itemData });
    } else {
      // Create new item
      const newItem = await scheduleService.createScheduleItem(itemData);
      onSave(newItem);
    }
  };

  const handleDelete = () => {
    if (scheduleItem) {
      Alert.alert(
        'Delete Schedule Item',
        'Are you sure you want to delete this schedule item?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              scheduleService.deleteScheduleItem(scheduleItem.id);
              onCancel();
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{scheduleItem ? 'Edit Schedule Item' : 'Add Schedule Item'}</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateButtonText}>{date}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Time</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.dateButtonText}>{time || 'Select time'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setIsAllDay(!isAllDay)}
        >
          <Text style={styles.checkboxText}>{isAllDay ? '✓' : ''}</Text>
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>All day event</Text>
      </View>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setReminderEnabled(!reminderEnabled)}
        >
          <Text style={styles.checkboxText}>{reminderEnabled ? '✓' : ''}</Text>
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>Enable reminder</Text>
      </View>

      {reminderEnabled && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Reminder Time</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.dateButtonText}>{reminderTime || 'Select reminder time'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {scheduleItem && (
          <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <DateTimePicker
        modal
        mode="date"
        open={showDatePicker}
        date={new Date(date)}
        onConfirm={(selectedDate) => {
          setShowDatePicker(false);
          setDate(selectedDate.toISOString().split('T')[0]);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      <DateTimePicker
        modal
        mode="time"
        open={showTimePicker}
        date={new Date()}
        onConfirm={(selectedTime) => {
          setShowTimePicker(false);
          setTime(selectedTime.toTimeString().substring(0, 5));
        }}
        onCancel={() => setShowTimePicker(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4a90e2',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ScheduleForm;