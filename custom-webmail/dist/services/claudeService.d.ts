import { ComposeParams, EmailContent, EmailSummary, EmailClassification, ChatMessage, AiSettings } from '../types';
declare class ClaudeService {
    private anthropicClient;
    private openaiClient;
    private settings;
    constructor();
    private createClients;
    reloadSettings(): Promise<void>;
    getSettings(): AiSettings;
    getMaskedSettings(): Omit<AiSettings, 'apiKey'> & {
        hasApiKey: boolean;
    };
    testConnection(): Promise<{
        success: boolean;
        error?: string;
    }>;
    smartCompose(params: ComposeParams): AsyncGenerator<string>;
    summarizeEmail(email: EmailContent): Promise<EmailSummary>;
    classifyEmail(email: EmailContent): Promise<EmailClassification>;
    chat(messages: ChatMessage[], systemPrompt?: string): AsyncGenerator<string>;
}
export declare const claudeService: ClaudeService;
export {};
//# sourceMappingURL=claudeService.d.ts.map