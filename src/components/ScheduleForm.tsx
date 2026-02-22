import React, { useState, useEffect } from 'react';
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
import { format, parseISO } from 'date-fns';

interface ScheduleFormProps {
  scheduleItem?: ScheduleItem | null;
  onSave: (item: ScheduleItem) => void;
  onCancel: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ scheduleItem, onSave, onCancel }) => {
const [title, setTitle] = useState(scheduleItem?.title || '');
  const [description, setDescription] = useState(scheduleItem?.description || '');
  const [startUtc, setStartUtc] = useState(scheduleItem?.startUtc || new Date().toISOString());
  const [endUtc, setEndUtc] = useState(scheduleItem?.endUtc || new Date().toISOString());
  const [allDay, setAllDay] = useState(scheduleItem?.allDay || false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(scheduleItem?.reminder?.enabled || false);
  const [reminderTime, setReminderTime] = useState(scheduleItem?.reminder?.time || '');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const scheduleService = new ScheduleService();

  // Parse date and time from startUtc when component mounts
  useEffect(() => {
    if (scheduleItem?.startUtc) {
      try {
        const startDate = parseISO(scheduleItem.startUtc);
        setDate(format(startDate, 'yyyy-MM-dd'));
        if (!scheduleItem.allDay) {
          setStartTime(format(startDate, 'HH:mm'));
        }
      } catch (error) {
        console.warn('Failed to parse start date for schedule item:', scheduleItem.id, error);
        setDate('');
        setStartTime('');
      }
    }
    if (scheduleItem?.endUtc) {
      try {
        const endDate = parseISO(scheduleItem.endUtc);
        if (!scheduleItem.allDay) {
          setEndTime(format(endDate, 'HH:mm'));
        }
      } catch (error) {
        console.warn('Failed to parse end date for schedule item:', scheduleItem.id, error);
        setEndTime('');
      }
    }
  }, [scheduleItem]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for the schedule item');
      return;
    }

    // Construct start and end times
    let finalStartUtc = startUtc;
    let finalEndUtc = endUtc;
    
    if (!allDay) {
      // For non-all day events, we need to combine date with times
      if (date && startTime) {
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = startTime.split(':').map(Number);
        const newDate = new Date(year, month - 1, day, hour, minute);
        finalStartUtc = newDate.toISOString();
      }
      
      if (date && endTime) {
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = endTime.split(':').map(Number);
        const newDate = new Date(year, month - 1, day, hour, minute);
        finalEndUtc = newDate.toISOString();
      }
    } else {
      // For all-day events, set time to start of day
      if (date) {
        const [year, month, day] = date.split('-').map(Number);
        const newDate = new Date(year, month - 1, day);
        finalStartUtc = newDate.toISOString();
        // Set end date to next day
        newDate.setDate(newDate.getDate() + 1);
        finalEndUtc = newDate.toISOString();
      }
    }

    const itemData = {
      title,
      description,
      startUtc: finalStartUtc,
      endUtc: finalEndUtc,
      allDay,
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
          <Text style={styles.dateButtonText}>{date || 'Select date'}</Text>
        </TouchableOpacity>
      </View>

      {!allDay && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Start Time</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartTimePicker(true)}>
            <Text style={styles.dateButtonText}>{startTime || 'Select start time'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!allDay && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>End Time</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndTimePicker(true)}>
            <Text style={styles.dateButtonText}>{endTime || 'Select end time'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAllDay(!allDay)}
        >
          <Text style={styles.checkboxText}>{allDay ? '✓' : ''}</Text>
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
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowReminderTimePicker(true)}>
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
        date={date ? new Date(date) : new Date()}
        onConfirm={(selectedDate) => {
          setShowDatePicker(false);
          const formattedDate = format(selectedDate, 'yyyy-MM-dd');
          setDate(formattedDate);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      <DateTimePicker
        modal
        mode="time"
        open={showStartTimePicker}
        date={new Date()}
        onConfirm={(selectedTime) => {
          setShowStartTimePicker(false);
          setStartTime(selectedTime.toTimeString().substring(0, 5));
        }}
        onCancel={() => setShowStartTimePicker(false)}
      />

      <DateTimePicker
        modal
        mode="time"
        open={showEndTimePicker}
        date={new Date()}
        onConfirm={(selectedTime) => {
          setShowEndTimePicker(false);
          setEndTime(selectedTime.toTimeString().substring(0, 5));
        }}
        onCancel={() => setShowEndTimePicker(false)}
      />

      <DateTimePicker
        modal
        mode="time"
        open={showReminderTimePicker}
        date={new Date()}
        onConfirm={(selectedTime) => {
          setShowReminderTimePicker(false);
          setReminderTime(selectedTime.toTimeString().substring(0, 5));
        }}
        onCancel={() => setShowReminderTimePicker(false)}
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