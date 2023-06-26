import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('beerDatabase.db');

const CervejaList = () => {
  const [cervejas, setCervejas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    createTable();
    fetchCervejas();
    fetchSavedCervejas();
  }, []);

  const createTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS cervejas (id INTEGER PRIMARY KEY AUTOINCREMENT, brand TEXT, name TEXT, style TEXT);',
        [],
        () => {
          console.log('Tabela criada com sucesso!');
        },
        error => {
          console.log('Erro ao criar a tabela:', error);
        }
      );
    });
  };

  const fetchCervejas = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        'https://random-data-api.com/api/beer/random_beer'
      );
      const cervejaData = await response.json();
      const { brand, name, style } = cervejaData;

      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO cervejas (brand, name, style) VALUES (?, ?, ?);',
          [brand, name, style],
          () => {
            console.log('Dados salvos com sucesso!');
          },
          error => {
            console.log('Erro ao salvar os dados:', error);
          }
        );
      });

      setCervejas(prevCervejas => [...prevCervejas, cervejaData]);
    } catch (error) {
      console.log('Erro ao buscar as cervejas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedCervejas = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM cervejas;',
        [],
        (_, { rows }) => {
          const savedCervejas = rows._array;
          setCervejas(prevCervejas => [...prevCervejas, ...savedCervejas]);
        },
        error => {
          console.log('Erro ao buscar as cervejas salvas:', error);
        }
      );
    });
  };

  const handleFetchCerveja = () => {
    fetchCervejas();
  };

  return (
    <View>
      <Text>Todas as cervejas:</Text>
      {cervejas.map((cerveja, index) => (
        <View key={index}>
          <Text>Brand: {cerveja.brand}</Text>
          <Text>Name: {cerveja.name}</Text>
          <Text>Style: {cerveja.style}</Text>
        </View>
      ))}

      <Button
        title={isLoading ? 'Carregando...' : 'Buscar Nova Cerveja'}
        onPress={handleFetchCerveja}
        disabled={isLoading}
      />
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