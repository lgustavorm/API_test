import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, FlatList, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const API_BASE = 'https://des-looksmart-equality-summit.trycloudflare.com/api/v1';
const Stack = createNativeStackNavigator();

function useApiClient(token) {
  return useMemo(() => {
    const client = axios.create({ baseURL: API_BASE });
    client.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return client;
  }, [token]);
}

function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const client = useApiClient(null);

  const persistAndGo = async (accessToken) => {
    await AsyncStorage.setItem('token', accessToken);
    navigation.reset({ index: 0, routes: [{ name: 'Items' }] });
  };

  const register = async () => {
    try {
      const res = await client.post('/auth/register', { email, password });
      await persistAndGo(res.data.access_token);
    } catch (e) {
      Alert.alert('Erro', e?.response?.data?.detail || 'Falha ao registrar');
    }
  };

  const login = async () => {
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      const res = await client.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      await AsyncStorage.setItem('token', res.data.access_token);
      navigation.reset({ index: 0, routes: [{ name: 'Items' }] });
    } catch (e) {
      Alert.alert('Erro', e?.response?.data?.detail || 'Falha ao autenticar');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Save Mobile</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <View style={styles.row}>
        <Button title="Registrar" onPress={register} />
        <View style={{ width: 8 }} />
        <Button title="Login" onPress={login} />
      </View>
    </SafeAreaView>
  );
}

function ItemsScreen({ navigation }) {
  const [token, setToken] = useState(null);
  const client = useApiClient(token);
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('token');
      if (!t) {
        navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        return;
      }
      setToken(t);
    })();
  }, [navigation]);

  useEffect(() => {
    if (token) fetchItems();
  }, [token]);

  const fetchItems = async () => {
    try {
      const res = await client.get('/items/');
      setItems(res.data);
    } catch (e) {
      Alert.alert('Erro', 'Falha ao buscar itens');
    }
  };

  const createItem = async () => {
    try {
      await client.post('/items/', { title, description });
      setTitle('');
      setDescription('');
      fetchItems();
    } catch (e) {
      Alert.alert('Erro', 'Falha ao criar item');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || '');
  };

  const saveEdit = async () => {
    try {
      await client.put(`/items/${editingId}`, { title, description });
      setEditingId(null);
      setTitle('');
      setDescription('');
      fetchItems();
    } catch (e) {
      Alert.alert('Erro', 'Falha ao atualizar item');
    }
  };

  const deleteItem = async (id) => {
    try {
      await client.delete(`/items/${id}`);
      if (editingId === id) {
        setEditingId(null);
        setTitle('');
        setDescription('');
      }
      fetchItems();
    } catch (e) {
      Alert.alert('Erro', 'Falha ao remover item');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  const isEditing = editingId !== null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowBetween}>
        <Text style={styles.title}>Meus Itens</Text>
        <Button title="Sair" onPress={logout} />
      </View>

      <View style={styles.rowWrap}>
        <TextInput placeholder="Título" value={title} onChangeText={setTitle} style={styles.input} />
        <TextInput placeholder="Descrição" value={description} onChangeText={setDescription} style={styles.input} />
        {isEditing ? (
          <View style={styles.row}>
            <Button title="Salvar" onPress={saveEdit} />
            <View style={{ width: 8 }} />
            <Button title="Cancelar" onPress={() => { setEditingId(null); setTitle(''); setDescription(''); }} />
          </View>
        ) : (
          <Button title="Criar" onPress={createItem} />
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => startEdit(item)}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {item.description ? <Text>{item.description}</Text> : null}
            </TouchableOpacity>
            <Button title="Del" color="#c00" onPress={() => deleteItem(item.id)} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Auth');

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('token');
      setInitialRoute(t ? 'Items' : 'Auth');
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Items" component={ItemsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 8, borderRadius: 6, marginBottom: 8, flex: 1, minWidth: 120 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  item: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemTitle: { fontWeight: '600' },
});
