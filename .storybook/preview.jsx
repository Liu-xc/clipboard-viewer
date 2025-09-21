import React from 'react';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

// Mock electronAPI for Storybook environment
if (typeof window !== 'undefined') {
  // Ensure electronAPI exists and has all required methods
  if (!window.electronAPI) {
    window.electronAPI = {};
  }
  
  // Always ensure openExternal method exists and is a function
  if (!window.electronAPI.openExternal || typeof window.electronAPI.openExternal !== 'function') {
    window.electronAPI.openExternal = async (url) => {
      console.log('Mock electronAPI: opening URL in new tab:', url);
      window.open(url, '_blank');
      return Promise.resolve();
    };
  }
  
  // Add other mock methods as needed
  if (!window.electronAPI.getClipboardHistory) {
    window.electronAPI.getClipboardHistory = async () => Promise.resolve([]);
  }
  if (!window.electronAPI.clearClipboard) {
    window.electronAPI.clearClipboard = async () => Promise.resolve();
  }
  
  console.log('Mock electronAPI initialized for Storybook', {
    electronAPI: !!window.electronAPI,
    openExternal: typeof window.electronAPI.openExternal,
    methods: Object.keys(window.electronAPI)
  });
}

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (Story) => (
    <MantineProvider>
      <Story />
    </MantineProvider>
  ),
];