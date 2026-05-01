declare class CacheService {
    private redis;
    connect(): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    setPermanent(key: string, value: any): Promise<boolean>;
    del(key: string): Promise<void>;
    hashContent(content: string): string;
    disconnect(): Promise<void>;
}
export declare const cacheService: CacheService;
export {};
//# sourceMappingURL=cacheService.d.ts.map