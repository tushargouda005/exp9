declare module 'react-native-sqlite-storage' {
  export interface SQLiteDatabase {
    transaction(callback: (tx: Transaction) => void): void;
  }

  export interface Transaction {
    executeSql(
      sqlStatement: string,
      params?: any[],
      callback?: (tx: Transaction, results: ResultSet) => void,
      errorCallback?: (error: any) => void
    ): void;
  }

  export interface ResultSet {
    rows: {
      length: number;
      item(index: number): any;
    };
  }

  const SQLite: {
    enablePromise(enable: boolean): void;
    openDatabase(
      config: { name: string; location: string },
      success?: () => void,
      error?: (err: any) => void
    ): Promise<SQLiteDatabase>;
  };

  export default SQLite;
}