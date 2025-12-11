// Mock for emailNotificationService
module.exports = {
  sendAdminNotification: jest.fn().mockResolvedValue(undefined),
  sendUserConfirmation: jest.fn().mockResolvedValue(undefined)
};