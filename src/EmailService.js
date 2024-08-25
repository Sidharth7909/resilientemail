"use strict";
// src/EmailService.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
// Mock email providers
class MockEmailProvider1 {
    sendEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('MockEmailProvider1: Sending email');
            // Simulate failure
            throw new Error('Provider 1 failed');
        });
    }
}
class MockEmailProvider2 {
    sendEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('MockEmailProvider2: Sending email');
            // Simulate success
            return Promise.resolve();
        });
    }
}
// Retry logic with exponential backoff
function retryOperation(operation, retries, delay) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < retries; i++) {
            try {
                return yield operation();
            }
            catch (err) {
                if (i === retries - 1)
                    throw err;
                yield new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
        throw new Error('Operation failed after retries');
    });
}
// Email service class with idempotency, rate limiting, and status tracking
class EmailService {
    constructor() {
        this.providerIndex = 0;
        this.providers = [new MockEmailProvider1(), new MockEmailProvider2()];
        this.sentEmails = new Set();
        this.rateLimit = 5000; // 5 seconds rate limit
        this.lastSentTime = Date.now();
    }
    sendEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const emailId = this.getEmailId(email);
            if (this.sentEmails.has(emailId)) {
                this.log('Email already sent, skipping.');
                return;
            }
            if (Date.now() - this.lastSentTime < this.rateLimit) {
                this.log('Rate limit exceeded, please wait.');
                return;
            }
            const provider = this.providers[this.providerIndex];
            try {
                yield retryOperation(() => provider.sendEmail(email), 3, 1000);
                this.sentEmails.add(emailId);
                this.lastSentTime = Date.now();
                this.log('Email sent successfully.');
            }
            catch (err) {
                this.log(`Failed to send email: ${err.message}`);
                this.providerIndex = (this.providerIndex + 1) % this.providers.length;
                this.log('Switching to the next provider.');
            }
        });
    }
    getEmailId(email) {
        return `${email.to}-${email.subject}-${email.body}`;
    }
    log(message) {
        fs.appendFileSync('email-service.log', `${new Date().toISOString()}: ${message}\n`);
    }
}
exports.default = EmailService;
