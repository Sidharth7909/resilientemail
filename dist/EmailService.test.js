"use strict";
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
const EmailService_1 = require("./EmailService");
const globals_1 = require("@jest/globals");
class MockEmailProvider1 {
    sendEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Provider 1 failed');
        });
    }
}
class MockEmailProvider2 {
    sendEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            // Simulate successful email sending
        });
    }
}
describe('EmailService', () => {
    let emailService;
    let mockProvider1;
    let mockProvider2;
    beforeEach(() => {
        mockProvider1 = new MockEmailProvider1();
        mockProvider2 = new MockEmailProvider2();
        emailService = new EmailService_1.EmailService([mockProvider1, mockProvider2]);
    });
    it('should send email successfully using the second provider', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(emailService.sendEmail({
            to: 'test@example.com',
            subject: 'Test',
            body: 'This is a test email.',
        })).resolves.not.toThrow();
    }));
    it('should retry and switch providers on failure', () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.jest.spyOn(mockProvider1, 'sendEmail').mockRejectedValue(new Error('Provider 1 failed'));
        globals_1.jest.spyOn(mockProvider2, 'sendEmail').mockResolvedValue();
        yield expect(emailService.sendEmail({
            to: 'test@example.com',
            subject: 'Test',
            body: 'This is a test email.',
        })).resolves.not.toThrow();
        expect(mockProvider1.sendEmail).toHaveBeenCalled();
        expect(mockProvider2.sendEmail).toHaveBeenCalled();
    }));
    it('should not send duplicate emails', () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.jest.spyOn(mockProvider1, 'sendEmail').mockResolvedValue();
        globals_1.jest.spyOn(mockProvider2, 'sendEmail').mockResolvedValue();
        yield emailService.sendEmail({
            to: 'test@example.com',
            subject: 'Test',
            body: 'This is a test email.',
        });
        expect(mockProvider1.sendEmail).toHaveBeenCalledTimes(1);
        expect(mockProvider2.sendEmail).toHaveBeenCalledTimes(1);
    }));
});
