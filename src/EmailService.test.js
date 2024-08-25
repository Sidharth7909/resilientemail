"use strict";
// src/EmailService.test.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EmailService_1 = __importDefault(require("./EmailService"));
describe('EmailService', () => {
    let emailService;
    beforeEach(() => {
        emailService = new EmailService_1.default();
    });
    it('should send email successfully using the second provider', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = { to: 'test@example.com', subject: 'Test', body: 'This is a test email.' };
        yield expect(emailService.sendEmail(email)).resolves.not.toThrow();
    }));
    it('should retry and switch providers on failure', () => __awaiter(void 0, void 0, void 0, function* () {
        // Override provider for testing
        emailService['providers'][0] = {
            sendEmail: jest.fn(() => Promise.reject(new Error('Provider 1 failed'))),
        };
        emailService['providers'][1] = {
            sendEmail: jest.fn(() => Promise.resolve()),
        };
        const email = { to: 'test@example.com', subject: 'Test', body: 'This is a test email.' };
        yield expect(emailService.sendEmail(email)).resolves.not.toThrow();
        expect(emailService['providers'][0]['sendEmail']).toHaveBeenCalled();
        expect(emailService['providers'][1]['sendEmail']).toHaveBeenCalled();
    }));
    it('should not send duplicate emails', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = { to: 'test@example.com', subject: 'Test', body: 'This is a test email.' };
        yield emailService.sendEmail(email);
        yield expect(emailService.sendEmail(email)).resolves.not.toThrow();
    }));
});
