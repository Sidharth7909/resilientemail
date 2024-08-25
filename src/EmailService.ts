import * as fs from 'fs';

export interface Email {
  to: string;
  subject: string;
  body: string;
}

export interface EmailProvider {
  sendEmail(email: Email): Promise<void>;
}

export class EmailService {
  private providers: EmailProvider[];
  private logFile: string;

  constructor(providers: EmailProvider[], logFile: string = 'log.txt') {
    this.providers = providers;
    this.logFile = logFile;
  }

  private log(message: string): void {
    fs.appendFileSync(this.logFile, `${new Date().toISOString()}: ${message}\n`);
  }

  public async sendEmail(email: Email): Promise<void> {
    let lastError: Error | null = null;

    for (const provider of this.providers) {
      try {
        await provider.sendEmail(email);
        this.log('Email sent successfully');
        return;
      } catch (err) {
        if (err instanceof Error) {
          lastError = err;
          this.log(`Failed to send email: ${err.message}`);
        } else {
          this.log('Failed to send email: Unknown error');
        }
      }
    }

    if (lastError) {
      throw lastError;
    }
  }
}
