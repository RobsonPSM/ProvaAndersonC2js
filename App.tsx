import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { fetchCervejaData } from './services';
import { Cerveja } from './CervejaModel';
import SQLite from 'react-native-sqlite-storage';

const App: React.FC = () => {
  const [cervejaData, setCervejaData] = useState<Cerveja | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdditionalFields, setShowAdditionalFields] = useState<boolean>(false);
  const [nomeList, setNomeList] = useState<string[]>([]);
  
  const db = SQLite.openDatabase({ name: 'mydb.db', createFromLocation: 1 });

  useEffect(() => {
    fetchCervejaList();
  }, []);

  const createTable = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS cervejas (id INTEGER PRIMARY KEY AUTOINCREMENT, brand TEXT, name TEXT, style TEXT)',
        [],
        () => console.log('Tabela criada com sucesso.'),
        (_, error) => console.error('Erro ao criar tabela:', error)
      );
    });
  };

  const fetchCervejaList = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT name FROM cervejas',
        [],
        (_, resultSet) => {
          const { rows } = resultSet;
          const names = [];
          for (let i = 0; i < rows.length; i++) {
            names.push(rows.item(i).name);
          }
          setNomeList(names);
        },
        (_, error) => console.error('Erro ao buscar cervejas:', error)
      );
    });
  };

  const handleFetchData = async () => {
    try {
      const data = await fetchCervejaData();
      setCervejaData(data);
      setError(null);
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO beers (brand, name, style) VALUES (?, ?, ?)',
        [data.brand, data.name, data.style],
          () => console.log('Dados inseridos com sucesso.'),
          (_, error) => console.error('Erro ao inserir dados:', error)
        );
      });
    } catch (error) {
      setError('Erro ao buscar dados da API');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Buscar Cerveja" onPress={handleFetchData} />
      {error && <Text>{error}</Text>}
      {cervejaData && (
        <>
          <Text style={styles.text}>Brand: {cervejaData.brand}</Text>
          <Text style={styles.text}>Name: {cervejaData.name}</Text>
          <Text style={styles.text}>Style: {cervejaData.style}</Text>
        </>
      )}
       {nomeList.length > 0 && (
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Cervejas Guardadas:</Text>
        {nomeList.map((name, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setShowAdditionalFields(!showAdditionalFields)}
            style={styles.listItemContainer}
          >
            <Text style={styles.listItem}>{name}</Text>
            {showAdditionalFields && (
              <View style={styles.additionalFieldsContainer}>
                <Text style={styles.additionalField}>
                  Brand: {cervejaData?.brand}
                </Text>
                <Text style={styles.additionalField}>
                  Style: {cervejaData?.style}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginBottom: 10,
  },
  listContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  listItem: {
    fontSize: 16,
    marginRight: 10,
  },
  additionalFieldsContainer: {
    marginLeft: 20,
  },
  additionalField: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default App;