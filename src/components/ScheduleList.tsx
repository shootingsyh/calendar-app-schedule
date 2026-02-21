import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { ScheduleItem } from '../types/schedule';
import { ScheduleService } from '../services/scheduleService';

interface ScheduleItemProps {
  item: ScheduleItem;
  onPress: () => void;
  onDelete: (id: string) => void;
}

const ScheduleItemComponent: React.FC<ScheduleItemProps> = ({ item, onPress, onDelete }) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Schedule Item',
      'Are you sure you want to delete this schedule item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(item.id),
        },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.date}>{item.date}</Text>
        {item.time && (
          <Text style={styles.time}>{item.time}</Text>
        )}
        {item.isAllDay && (
          <Text style={styles.allDay}>All Day</Text>
        )}
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {item.reminder && item.reminder.enabled && (
          <Text style={styles.reminder}>Reminder: {item.reminder.time}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

interface ScheduleListProps {
  items: ScheduleItem[];
  onItemPress: (item: ScheduleItem) => void;
  onItemDelete: (id: string) => void;
}

const ScheduleList: React.FC<ScheduleListProps> = ({ items, onItemPress, onItemDelete }) => {
  const renderItem = ({ item }: { item: ScheduleItem }) => (
    <ScheduleItemComponent
      item={item}
      onPress={() => onItemPress(item)}
      onDelete={onItemDelete}
    />
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={items.length === 0 ? styles.emptyContainer : {}}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No schedule items for this date</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  time: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 2,
  },
  allDay: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 2,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    lineHeight: 20,
  },
  reminder: {
    fontSize: 12,
    color: '#e74c3c',
    fontStyle: 'italic',
  },
  deleteText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export { ScheduleItemComponent, ScheduleList };