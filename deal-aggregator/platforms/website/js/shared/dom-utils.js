/**
 * DOM UTILITIES MODULE
 * Consolidated helper functions for website/js scripts
 * Eliminates duplication between script.js and blog.js
 */

// DOM Selectors
export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

// Debounce utility
export function debounce(fn, wait = 250) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

// URL synchronization without page reload
export function syncURL(params) {
  const url = new URL(window.location);
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });
  window.history.replaceState({}, '', url);
}

// State persistence with localStorage
export function loadState(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.warn(`Failed to load state for key: ${key}`, e);
    return null;
  }
}

export function saveState(key, state) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
    return true;
  } catch (e) {
    console.warn(`Failed to save state for key: ${key}`, e);
    return false;
  }
}

// Enhanced element visibility checker
export function isElementVisible(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && 
         rect.top >= 0 && rect.left >= 0 &&
         rect.bottom <= window.innerHeight && 
         rect.right <= window.innerWidth;
}

// Safe event listener with cleanup
export function addEventListenerWithCleanup(element, event, handler, options = {}) {
  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options);
}

// Global fallback for direct HTML usage
if (typeof window !== 'undefined') {
  window.DOMUtils = {
    $, $$, debounce, syncURL, loadState, saveState, 
    isElementVisible, addEventListenerWithCleanup
  };
}