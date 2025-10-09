/**
 * @jest-environment jsdom
 */

import { $, $$, debounce, syncURL, loadState, saveState, isElementVisible, addEventListenerWithCleanup } from '../dom-utils.js';

describe('DOM Utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('DOM Selectors', () => {
    test('$ should select single element', () => {
      document.body.innerHTML = '<div id="test">Test</div>';
      const element = $('#test');
      expect(element).toBeTruthy();
      expect(element.id).toBe('test');
    });

    test('$$ should select multiple elements', () => {
      document.body.innerHTML = '<div class="item">1</div><div class="item">2</div>';
      const elements = $$('.item');
      expect(elements).toHaveLength(2);
    });

    test('selectors should work with context', () => {
      document.body.innerHTML = '<div id="container"><span class="test">Inside</span></div><span class="test">Outside</span>';
      const container = $('#container');
      const element = $('.test', container);
      expect(element.textContent).toBe('Inside');
    });
  });

  describe('debounce', () => {
    test('should delay function execution', (done) => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(fn).not.toHaveBeenCalled();
      
      setTimeout(() => {
        expect(fn).toHaveBeenCalledTimes(1);
        done();
      }, 150);
    });

    test('should pass arguments correctly', (done) => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 50);
      
      debouncedFn('arg1', 'arg2');
      
      setTimeout(() => {
        expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
        done();
      }, 100);
    });
  });

  describe('URL Synchronization', () => {
    test('should sync URL parameters', () => {
      const originalReplaceState = window.history.replaceState;
      window.history.replaceState = jest.fn();
      
      syncURL({ category: 'tech', search: 'laptop' });
      
      const [[, , url]] = window.history.replaceState.mock.calls;
      const urlParams = new URL(url).searchParams;

      expect(urlParams.get('category')).toBe('tech');
      expect(urlParams.get('search')).toBe('laptop');
      
      window.history.replaceState = originalReplaceState;
    });

    test('should remove empty parameters', () => {
      const originalReplaceState = window.history.replaceState;
      window.history.replaceState = jest.fn();
      
      syncURL({ category: '', search: null, price: undefined });
      
      const [[, , url]] = window.history.replaceState.mock.calls;
      expect(url).not.toContain('category');
      expect(url).not.toContain('search');
      expect(url).not.toContain('price');
      
      window.history.replaceState = originalReplaceState;
    });
  });

  describe('State Management', () => {
    test('should save and load state', () => {
      const testState = { category: 'tech', search: 'laptop' };
      
      const saved = saveState('testKey', testState);
      expect(saved).toBe(true);
      
      const loaded = loadState('testKey');
      expect(loaded).toEqual(testState);
    });

    test('should handle invalid JSON gracefully', () => {
      localStorage.setItem('invalidKey', 'invalid json');
      
      const result = loadState('invalidKey');
      expect(result).toBeNull();
    });

    test('should return null for non-existent keys', () => {
      const result = loadState('nonExistentKey');
      expect(result).toBeNull();
    });

    test('should handle localStorage errors', () => {
      const originalSetItem = Storage.prototype.setItem;
      // Mock setItem on the Storage prototype
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });
      
      const result = saveState('testKey', { test: 'data' });
      expect(result).toBe(false);
      
      // Restore original method
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('Element Visibility', () => {
    test('should return false for null element', () => {
      expect(isElementVisible(null)).toBe(false);
    });

    test('should check element visibility', () => {
      document.body.innerHTML = '<div id="visible" style="width: 100px; height: 100px;">Visible</div>';
      const element = $('#visible');
      
      // Mock getBoundingClientRect
      element.getBoundingClientRect = jest.fn(() => ({
        width: 100,
        height: 100,
        top: 0,
        left: 0,
        bottom: 100,
        right: 100
      }));
      
      expect(isElementVisible(element)).toBe(true);
    });
  });

  describe('Event Listener Management', () => {
    test('should add and remove event listeners', () => {
      document.body.innerHTML = '<button id="testBtn">Test</button>';
      const button = $('#testBtn');
      const handler = jest.fn();
      
      const cleanup = addEventListenerWithCleanup(button, 'click', handler);
      
      button.click();
      expect(handler).toHaveBeenCalledTimes(1);
      
      cleanup();
      button.click();
      expect(handler).toHaveBeenCalledTimes(1); // Should not increase
    });
  });

  describe('Global Window Export', () => {
    test('should export to window.DOMUtils', () => {
      expect(window.DOMUtils).toBeDefined();
      expect(window.DOMUtils.$).toBe($);
      expect(window.DOMUtils.$$).toBe($$);
      expect(window.DOMUtils.debounce).toBe(debounce);
      expect(window.DOMUtils.syncURL).toBe(syncURL);
      expect(window.DOMUtils.loadState).toBe(loadState);
      expect(window.DOMUtils.saveState).toBe(saveState);
    });
  });
});