import { EmailService, Email, EmailProvider } from './EmailService';
import { jest } from '@jest/globals';

class MockEmailProvider1 implements EmailProvider {
  async sendEmail(email: Email): Promise<void> {
    throw new Error('Provider 1 failed');
  }
}

class MockEmailProvider2 implements EmailProvider {
  async sendEmail(email: Email): Promise<void> {
    // Simulate successful email sending
  }
}

describe('EmailService', () => {
  let emailService: EmailService;
  let mockProvider1: MockEmailProvider1;
  let mockProvider2: MockEmailProvider2;

  beforeEach(() => {
    mockProvider1 = new MockEmailProvider1();
    mockProvider2 = new MockEmailProvider2();
    emailService = new EmailService([mockProvider1, mockProvider2]);
  });

  it('should send email successfully using the second provider', async () => {
    await expect(emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      body: 'This is a test email.',
    })).resolves.not.toThrow();
  });

  it('should retry and switch providers on failure', async () => {
    jest.spyOn(mockProvider1, 'sendEmail').mockRejectedValue(new Error('Provider 1 failed'));
    jest.spyOn(mockProvider2, 'sendEmail').mockResolvedValue();

    await expect(emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      body: 'This is a test email.',
    })).resolves.not.toThrow();

    expect(mockProvider1.sendEmail).toHaveBeenCalled();
    expect(mockProvider2.sendEmail).toHaveBeenCalled();
  });

  it('should not send duplicate emails', async () => {
    jest.spyOn(mockProvider1, 'sendEmail').mockResolvedValue();
    jest.spyOn(mockProvider2, 'sendEmail').mockResolvedValue();

    await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      body: 'This is a test email.',
    });

    expect(mockProvider1.sendEmail).toHaveBeenCalledTimes(1);
    expect(mockProvider2.sendEmail).toHaveBeenCalledTimes(1);
  });
});
