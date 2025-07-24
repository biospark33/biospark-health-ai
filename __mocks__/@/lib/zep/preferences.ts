
// Mock for zep preferences operations
export const getPreferences = jest.fn();
export const storePreferences = jest.fn();
export const updatePreferences = jest.fn();
export const deletePreferences = jest.fn();
export const setZepClient = jest.fn();

// Default mock implementations
getPreferences.mockResolvedValue({
  success: true,
  data: {
    healthGoals: [],
    focusAreas: [],
    communicationStyle: 'balanced',
    reminderFrequency: 'weekly',
    privacyLevel: 'standard'
  }
});

storePreferences.mockResolvedValue({
  success: true
});

updatePreferences.mockResolvedValue({
  success: true
});

deletePreferences.mockResolvedValue({
  success: true
});
