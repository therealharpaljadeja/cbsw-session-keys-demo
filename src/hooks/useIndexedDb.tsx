import { useState, useEffect, useCallback } from "react";

// Define types for the IndexedDB operations
interface IndexedDBContext {
    openDatabase: (dbName: string, version: number) => Promise<IDBDatabase>;
    addData: (dbName: string, data: DataType) => Promise<void>;
    getData: (dbName: string, id: number) => Promise<DataType | undefined>;
    updateData: (dbName: string, data: DataType) => Promise<void>;
    deleteData: (dbName: string, id: number) => Promise<void>;
}

// Define types for the IndexedDB operations
interface DataType {
    id?: number; // Optional, will be auto-incremented if not provided
    context: string;
    credential: string;
}

const useIndexedDB = (): IndexedDBContext => {
    const openDatabase = useCallback((dbName: string, version: number) => {
        return new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open(dbName, version);

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains("sessions")) {
                    db.createObjectStore("sessions", {
                        keyPath: "id",
                        autoIncrement: true,
                    });
                }
            };
        });
    }, []);

    const addData = useCallback(
        async (dbName: string, data: DataType) => {
            const db = await openDatabase(dbName, 1);
            return new Promise<void>((resolve, reject) => {
                const transaction = db.transaction("sessions", "readwrite");
                const store = transaction.objectStore("sessions");
                const request = store.add(data);

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = (event) => {
                    reject((event.target as IDBRequest).error);
                };
            });
        },
        [openDatabase]
    );

    const getData = useCallback(
        async (dbName: string, id: number) => {
            const db = await openDatabase(dbName, 1);
            return new Promise<any>((resolve, reject) => {
                const transaction = db.transaction("sessions", "readonly");
                const store = transaction.objectStore("sessions");
                const request = store.get(id);

                request.onsuccess = (event) => {
                    resolve((event.target as IDBRequest).result);
                };

                request.onerror = (event) => {
                    reject((event.target as IDBRequest).error);
                };
            });
        },
        [openDatabase]
    );

    const updateData = useCallback(
        async (dbName: string, data: DataType) => {
            const db = await openDatabase(dbName, 1);
            return new Promise<void>((resolve, reject) => {
                const transaction = db.transaction("sessions", "readwrite");
                const store = transaction.objectStore("sessions");
                const request = store.put(data);

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = (event) => {
                    reject((event.target as IDBRequest).error);
                };
            });
        },
        [openDatabase]
    );

    const deleteData = useCallback(
        async (dbName: string, id: number) => {
            const db = await openDatabase(dbName, 1);
            return new Promise<void>((resolve, reject) => {
                const transaction = db.transaction("sessions", "readwrite");
                const store = transaction.objectStore("sessions");
                const request = store.delete(id);

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = (event) => {
                    reject((event.target as IDBRequest).error);
                };
            });
        },
        [openDatabase]
    );

    return { openDatabase, addData, getData, updateData, deleteData };
};

export default useIndexedDB;
