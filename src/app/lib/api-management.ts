import { ApiKey, ApiUsage } from "@/types/monitoring";

export class ApiKeyManager {
  private static instance: ApiKeyManager;
  private apiKeys: Map<string, ApiKey> = new Map();
  private usage: Map<string, ApiUsage[]> = new Map();
  private storageKey = "api_keys_v1";
  private usageStorageKey = "api_usage_v1";

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  // API Key Management
  public createApiKey(
    name: string,
    permissions: ("read" | "write" | "admin")[],
    rateLimit: number = 1000,
    expiresAt?: string
  ): ApiKey {
    // Validate inputs
    if (!name || name.trim().length === 0) {
      throw new Error("API key name is required");
    }

    if (!permissions || permissions.length === 0) {
      throw new Error("At least one permission is required");
    }

    if (rateLimit <= 0) {
      throw new Error("Rate limit must be positive");
    }

    if (expiresAt && new Date(expiresAt) <= new Date()) {
      throw new Error("Expiration date must be in the future");
    }

    const id = this.generateId();
    const key = this.generateApiKey();

    const apiKey: ApiKey = {
      id,
      name,
      key,
      permissions,
      rateLimit,
      createdAt: new Date().toISOString(),
      expiresAt,
      isActive: true,
    };

    this.apiKeys.set(key, apiKey);
    this.saveToStorage();

    return apiKey;
  }

  public validateApiKey(key: string): {
    valid: boolean;
    apiKey?: ApiKey;
    error?: string;
  } {
    const apiKey = this.apiKeys.get(key);
    let error: string | undefined;
    let valid = true;

    if (!apiKey) {
      error = "Invalid API key";
      valid = false;
    }

    if (apiKey && !apiKey.isActive) {
      error = "API key is disabled";
      valid = false;
    }

    if (apiKey && apiKey.expiresAt && new Date() > new Date(apiKey.expiresAt)) {
      error = "API key has expired";
      valid = false;
    }

    // Update last used timestamp
    if (valid && apiKey) {
      apiKey.lastUsed = new Date().toISOString();
      this.apiKeys.set(key, apiKey);
      this.saveToStorage();
    }

    return { valid, apiKey: valid ? apiKey : undefined, error };
  }

  public checkRateLimit(apiKey: ApiKey): {
    allowed: boolean;
    remainingRequests: number;
    resetTime: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get usage for the last hour
    const keyUsage = this.usage.get(apiKey.key) || [];
    const recentUsage = keyUsage.filter(
      usage => new Date(usage.timestamp) > oneHourAgo
    );

    const remainingRequests = Math.max(
      0,
      apiKey.rateLimit - recentUsage.length
    );
    const allowed = remainingRequests > 0;

    // Reset time is the start of the next hour
    const nextHour = new Date(
      Math.ceil(now.getTime() / (60 * 60 * 1000)) * (60 * 60 * 1000)
    );
    const resetTime = nextHour.getTime();

    return {
      allowed,
      remainingRequests,
      resetTime,
    };
  }

  public logApiUsage(
    apiKey: ApiKey,
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    userAgent?: string,
    ipAddress?: string
  ): void {
    const usage: ApiUsage = {
      keyId: apiKey.id,
      endpoint,
      method,
      timestamp: new Date().toISOString(),
      responseTime,
      statusCode,
      userAgent,
      ipAddress,
    };

    const keyUsage = this.usage.get(apiKey.key) || [];
    keyUsage.push(usage);

    // Keep only last 10000 usage records per key
    if (keyUsage.length > 10000) {
      keyUsage.splice(0, keyUsage.length - 10000);
    }

    this.usage.set(apiKey.key, keyUsage);
    this.saveUsageToStorage();
  }

  public getApiKeys(): ApiKey[] {
    return Array.from(this.apiKeys.values());
  }

  public getApiKey(keyOrId: string): ApiKey | undefined {
    // Try to find by key first
    let apiKey = this.apiKeys.get(keyOrId);

    // If not found, try to find by ID
    if (!apiKey) {
      apiKey = Array.from(this.apiKeys.values()).find(k => k.id === keyOrId);
    }

    return apiKey;
  }

  public updateApiKey(
    keyOrId: string,
    updates: Partial<
      Pick<
        ApiKey,
        "name" | "permissions" | "rateLimit" | "isActive" | "expiresAt"
      >
    >
  ): boolean {
    const apiKey = this.getApiKey(keyOrId);
    if (!apiKey) return false;

    Object.assign(apiKey, updates);
    this.apiKeys.set(apiKey.key, apiKey);
    this.saveToStorage();

    return true;
  }

  public deleteApiKey(keyOrId: string): boolean {
    const apiKey = this.getApiKey(keyOrId);
    if (!apiKey) return false;

    this.apiKeys.delete(apiKey.key);
    this.usage.delete(apiKey.key);
    this.saveToStorage();
    this.saveUsageToStorage();

    return true;
  }

  public getApiUsage(
    keyOrId: string,
    days: number = 7
  ): {
    usage: ApiUsage[];
    statistics: {
      totalRequests: number;
      averageResponseTime: number;
      successRate: number;
      topEndpoints: { endpoint: string; count: number }[];
    };
  } {
    const apiKey = this.getApiKey(keyOrId);
    if (!apiKey) {
      return {
        usage: [],
        statistics: {
          totalRequests: 0,
          averageResponseTime: 0,
          successRate: 0,
          topEndpoints: [],
        },
      };
    }

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const keyUsage = this.usage.get(apiKey.key) || [];
    const recentUsage = keyUsage.filter(
      usage => new Date(usage.timestamp) > cutoffDate
    );

    // Calculate statistics
    const totalRequests = recentUsage.length;
    const averageResponseTime =
      totalRequests > 0
        ? Math.round(
            recentUsage.reduce((sum, usage) => sum + usage.responseTime, 0) /
              totalRequests
          )
        : 0;

    const successfulRequests = recentUsage.filter(
      usage => usage.statusCode >= 200 && usage.statusCode < 400
    ).length;
    const successRate =
      totalRequests > 0
        ? Math.round((successfulRequests / totalRequests) * 100)
        : 0;

    // Top endpoints
    const endpointCounts = new Map<string, number>();
    recentUsage.forEach(usage => {
      endpointCounts.set(
        usage.endpoint,
        (endpointCounts.get(usage.endpoint) || 0) + 1
      );
    });

    const topEndpoints = Array.from(endpointCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));

    return {
      usage: recentUsage.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
      statistics: {
        totalRequests,
        averageResponseTime,
        successRate,
        topEndpoints,
      },
    };
  }

  public getAllUsageStatistics(days: number = 7): {
    totalRequests: number;
    totalKeys: number;
    activeKeys: number;
    averageRequestsPerKey: number;
    topEndpoints: { endpoint: string; count: number }[];
  } {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const allKeys = this.getApiKeys();
    const activeKeys = allKeys.filter(
      key =>
        key.isActive &&
        (!key.expiresAt || new Date() <= new Date(key.expiresAt))
    );

    let totalRequests = 0;
    const endpointCounts = new Map<string, number>();

    this.usage.forEach(keyUsage => {
      const recentUsage = keyUsage.filter(
        usage => new Date(usage.timestamp) > cutoffDate
      );
      totalRequests += recentUsage.length;

      recentUsage.forEach(usage => {
        endpointCounts.set(
          usage.endpoint,
          (endpointCounts.get(usage.endpoint) || 0) + 1
        );
      });
    });

    const topEndpoints = Array.from(endpointCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));

    return {
      totalRequests,
      totalKeys: allKeys.length,
      activeKeys: activeKeys.length,
      averageRequestsPerKey:
        activeKeys.length > 0
          ? Math.round(totalRequests / activeKeys.length)
          : 0,
      topEndpoints,
    };
  }

  // Utility methods
  private generateId(): string {
    return `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateApiKey(): string {
    // Generate a secure API key
    const prefix = "sk_";
    const array = new Uint8Array(48);
    crypto.getRandomValues(array);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = prefix;

    for (let i = 0; i < array.length; i++) {
      result += chars[array[i] % chars.length];
    }

    return result;
  }

  // Storage methods
  private loadFromStorage(): void {
    try {
      if (typeof window !== "undefined") {
        const keysData = localStorage.getItem(this.storageKey);
        const usageData = localStorage.getItem(this.usageStorageKey);

        if (keysData) {
          const keys = JSON.parse(keysData);
          this.apiKeys = new Map(Object.entries(keys));
        }

        if (usageData) {
          const usage = JSON.parse(usageData);
          this.usage = new Map(Object.entries(usage));
        }
      }
    } catch (error) {
      console.error("Failed to load API data from storage:", error);
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== "undefined") {
        const keysObj = Object.fromEntries(this.apiKeys);
        localStorage.setItem(this.storageKey, JSON.stringify(keysObj));
      }
    } catch (error) {
      console.error("Failed to save API keys to storage:", error);
    }
  }

  private saveUsageToStorage(): void {
    try {
      if (typeof window !== "undefined") {
        const usageObj = Object.fromEntries(this.usage);
        localStorage.setItem(this.usageStorageKey, JSON.stringify(usageObj));
      }
    } catch (error) {
      console.error("Failed to save API usage to storage:", error);
    }
  }

  // Cleanup old usage data
  public cleanupOldUsage(maxAgeInDays: number = 30): void {
    try {
      const cutoffDate = new Date(
        Date.now() - maxAgeInDays * 24 * 60 * 60 * 1000
      );

      this.usage.forEach((keyUsage, key) => {
        const filteredUsage = keyUsage.filter(
          usage => new Date(usage.timestamp) >= cutoffDate
        );

        if (filteredUsage.length !== keyUsage.length) {
          this.usage.set(key, filteredUsage);
        }
      });

      this.saveUsageToStorage();
    } catch (error) {
      console.error("Failed to cleanup old usage data:", error);
    }
  }
}

// Middleware function for API authentication
export function authenticateApiRequest(request: Request): {
  authenticated: boolean;
  apiKey?: ApiKey;
  error?: string;
  rateLimited?: boolean;
  remainingRequests?: number;
} {
  try {
    const authHeader = request.headers.get("Authorization");
    const apiKeyFromQuery = new URL(request.url).searchParams.get("api_key");

    const apiKeyValue = authHeader?.replace("Bearer ", "") || apiKeyFromQuery;

    if (!apiKeyValue) {
      return { authenticated: false, error: "API key required" };
    }

    const apiManager = ApiKeyManager.getInstance();
    const validation = apiManager.validateApiKey(apiKeyValue);

    if (!validation.valid) {
      return { authenticated: false, error: validation.error };
    }

    const rateLimit = apiManager.checkRateLimit(validation.apiKey!);

    if (!rateLimit.allowed) {
      return {
        authenticated: false,
        error: "Rate limit exceeded",
        rateLimited: true,
        remainingRequests: rateLimit.remainingRequests,
      };
    }

    return {
      authenticated: true,
      apiKey: validation.apiKey,
      remainingRequests: rateLimit.remainingRequests,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return { authenticated: false, error: "Authentication failed" };
  }
}
