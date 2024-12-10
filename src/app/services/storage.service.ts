import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  /**
   * Sets an item in sessionStorage.
   * @param key - The storage key.
   * @param value - The value to store.
   */
  setSessionItem<T>(key: string, value: T): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Retrieves an item from sessionStorage.
   * @param key - The storage key.
   * @returns The parsed value or null if not found.
   */
  getSessionItem<T>(key: string): T | null {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  /**
   * Removes an item from sessionStorage.
   * @param key - The storage key.
   */
  removeSessionItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  /**
   * Sets an item in localStorage.
   * @param key - The storage key.
   * @param value - The value to store.
   */
  setLocalItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Retrieves an item from localStorage.
   * @param key - The storage key.
   * @returns The parsed value or null if not found.
   */
  getLocalItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  /**
   * Removes an item from localStorage.
   * @param key - The storage key.
   */
  removeLocalItem(key: string): void {
    localStorage.removeItem(key);
  }
}
