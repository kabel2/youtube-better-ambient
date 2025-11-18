export const { local: storageLocal } = typeof browser === 'object' ? browser.storage : chrome.storage;
