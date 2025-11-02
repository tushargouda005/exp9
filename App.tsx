import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(false); // Use callback-based API

interface Task {
  id: number;
  text: string;
}

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [db, setDb] = useState<any>(null); // SQLiteDatabase type not available by default

  useEffect(() => {
    const database = SQLite.openDatabase(
      { name: 'todo.db', location: 'default' },
      () => {
        console.log('Database opened');
        setDb(database);
        createTable(database);
        fetchTasks(database);
      },
      error => {
        console.log('Error opening database:', error);
      }
    );
  }, []);

  const createTable = (database: any) => {
    database.transaction((tx: any) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT);',
        [],
        () => console.log('Table created'),
        (tx: any, error: any) => console.log('Table creation error:', error)
      );
    });
  };

  const fetchTasks = (database: any) => {
    database.transaction((tx: any) => {
      
      tx.executeSql(
        'SELECT * FROM tasks',
        [],
        (_tx: any, results: any) => {
          const rows = results.rows;
          const items: Task[] = [];
          for (let i = 0; i < rows.length; i++) {
            items.push(rows.item(i));
          }
          setTasks(items);
        },
        (_tx: any, error: any) => console.log('Fetch error:', error)
      );

    });
  };

  const addTask = () => {
    if (task.trim() === '' || !db) return;
    db.transaction((tx: any) => {
      tx.executeSql(
        'INSERT INTO tasks (text) VALUES (?)',
        [task],
        () => {
          setTask('');
          fetchTasks(db);
        },
        (_tx: any, error: any) => console.log('Insert error:', error)
      );
    });
  };

  const deleteTask = (id: number) => {
    if (!db) return;
    db.transaction((tx: any) => {
      tx.executeSql(
        'DELETE FROM tasks WHERE id=?',
        [id],
        () => fetchTasks(db),
        (_tx: any, error: any) => console.log('Delete error:', error)
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SQLite To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter task"
          value={task}
          onChangeText={setTask}
          style={styles.input}
        />
        <Button title="Add" onPress={addTask} />
      </View>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text>{item.text}</Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.delete}>❌</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: 
  { flex: 1, 
    padding: 20,
    backgroundColor:'#ffffffff',
     marginTop: 40 },
  title: 
  { fontSize: 24, 
    color:'#36156bff',
    fontWeight: 'bold',
     textAlign: 'center', 
     marginBottom: 15 
    },
  inputContainer: { flexDirection: 'row', marginBottom: 15 },
  input: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: '#f7f7f7ff',
  },
 
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#d6d6d6ff',
    marginBottom: 10,
    borderRadius: 5,
  },
  delete: { color: 'red', fontSize: 18 },
});