import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ApiKeyManager } from "@/app/lib/api-management";
import { handleApiError, ValidationError } from "@/app/lib/error-handler";

const createApiKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  permissions: z
    .array(z.enum(["read", "write", "admin"]))
    .min(1, "At least one permission required"),
  rateLimit: z.number().min(1).max(10000).default(1000),
  expiresAt: z.string().datetime().optional(),
});

const updateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z
    .array(z.enum(["read", "write", "admin"]))
    .min(1)
    .optional(),
  rateLimit: z.number().min(1).max(10000).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
});

// Simple admin authentication (in production, this should be more robust)
function isAdminRequest(request: NextRequest): boolean {
  const adminToken = request.headers.get("X-Admin-Token");
  // In production, this should verify against a secure admin token
  return (
    adminToken === process.env.ADMIN_TOKEN || adminToken === "admin_dev_token"
  );
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "list";
    const keyId = searchParams.get("keyId");

    const apiManager = ApiKeyManager.getInstance();

    switch (action) {
      case "list": {
        const apiKeys = apiManager.getApiKeys();
        // Remove sensitive key values from response
        const safeApiKeys = apiKeys.map(key => ({
          ...key,
          key: `${key.key.substring(0, 12)}...${key.key.substring(key.key.length - 4)}`,
        }));

        return NextResponse.json({
          success: true,
          data: safeApiKeys,
          total: safeApiKeys.length,
        });
      }

      case "usage": {
        if (!keyId) {
          throw new ValidationError("keyId is required for usage action");
        }

        const days = parseInt(searchParams.get("days") || "7");
        const usage = apiManager.getApiUsage(keyId, days);

        return NextResponse.json({
          success: true,
          data: usage,
        });
      }

      case "statistics": {
        const days = parseInt(searchParams.get("days") || "7");
        const stats = apiManager.getAllUsageStatistics(days);

        return NextResponse.json({
          success: true,
          data: stats,
        });
      }

      default:
        throw new ValidationError(`Unknown action: ${action}`);
    }
  } catch (error) {
    return handleApiError(error, request.url);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createApiKeySchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(
        `Invalid API key data: ${validation.error.issues.map(i => i.message).join(", ")}`
      );
    }

    const apiManager = ApiKeyManager.getInstance();
    const apiKey = apiManager.createApiKey(
      validation.data.name,
      validation.data.permissions,
      validation.data.rateLimit,
      validation.data.expiresAt
    );

    return NextResponse.json(
      {
        success: true,
        data: apiKey,
        message: "API key created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, request.url);
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("keyId");

    if (!keyId) {
      throw new ValidationError("keyId is required");
    }

    const body = await request.json();
    const validation = updateApiKeySchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(
        `Invalid update data: ${validation.error.issues.map(i => i.message).join(", ")}`
      );
    }

    const apiManager = ApiKeyManager.getInstance();
    const success = apiManager.updateApiKey(keyId, validation.data);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "API key not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "API key updated successfully",
    });
  } catch (error) {
    return handleApiError(error, request.url);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("keyId");

    if (!keyId) {
      throw new ValidationError("keyId is required");
    }

    const apiManager = ApiKeyManager.getInstance();
    const success = apiManager.deleteApiKey(keyId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "API key not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "API key deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, request.url);
  }
}
