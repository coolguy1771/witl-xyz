import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DataStorageService } from "@/app/lib/data-storage";
import { handleApiError, ValidationError } from "@/app/lib/error-handler";

const timeSeriesSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
      "Invalid domain format"
    ),
  type: z.enum(["certificate", "security", "performance"]),
  metric: z.string(),
  days: z.number().min(1).max(90).default(7),
});

const historySchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
      "Invalid domain format"
    ),
  type: z.enum(["certificate", "security", "performance"]).optional(),
  days: z.number().min(1).max(90).default(30),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "metrics";

    const storage = DataStorageService.getInstance();

    switch (action) {
      case "metrics": {
        // Get dashboard overview metrics
        const metrics = storage.getDashboardMetrics();
        return NextResponse.json({
          success: true,
          data: metrics,
        });
      }

      case "domains": {
        // Get list of all monitored domains
        const domains = storage.getAllDomains();
        return NextResponse.json({
          success: true,
          data: domains,
        });
      }

      case "history": {
        // Get monitoring history for a specific domain
        const domain = searchParams.get("domain");
        const type = searchParams.get("type") as
          | "certificate"
          | "security"
          | "performance"
          | undefined;
        const days = parseInt(searchParams.get("days") || "30");

        if (!domain) {
          throw new ValidationError(
            "Domain parameter is required for history action"
          );
        }

        const validation = historySchema.safeParse({ domain, type, days });
        if (!validation.success) {
          throw new ValidationError(
            `Invalid history request: ${validation.error.issues.map(i => i.message).join(", ")}`
          );
        }

        const history = storage.getMonitoringHistory(
          validation.data.domain,
          validation.data.type,
          validation.data.days
        );

        return NextResponse.json({
          success: true,
          data: {
            domain: validation.data.domain,
            type: validation.data.type,
            days: validation.data.days,
            history,
            total: history.length,
          },
        });
      }

      case "timeseries": {
        // Get time series data for charts
        const domain = searchParams.get("domain");
        const type = searchParams.get("type") as
          | "certificate"
          | "security"
          | "performance";
        const metric = searchParams.get("metric");
        const days = parseInt(searchParams.get("days") || "7");

        if (!domain || !type || !metric) {
          throw new ValidationError(
            "Domain, type, and metric parameters are required for timeseries action"
          );
        }

        const validation = timeSeriesSchema.safeParse({
          domain,
          type,
          metric,
          days,
        });
        if (!validation.success) {
          throw new ValidationError(
            `Invalid timeseries request: ${validation.error.issues.map(i => i.message).join(", ")}`
          );
        }

        const timeSeriesData = storage.getTimeSeriesData(
          validation.data.domain,
          validation.data.type,
          validation.data.metric,
          validation.data.days
        );

        return NextResponse.json({
          success: true,
          data: {
            domain: validation.data.domain,
            type: validation.data.type,
            metric: validation.data.metric,
            days: validation.data.days,
            timeSeries: timeSeriesData,
            total: timeSeriesData.length,
          },
        });
      }

      case "export": {
        // Export monitoring data
        const domain = searchParams.get("domain");
        const exportData = storage.exportData(domain || undefined);

        return NextResponse.json({
          success: true,
          data: exportData,
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
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    const storage = DataStorageService.getInstance();

    switch (action) {
      case "import": {
        // Import monitoring data
        const body = await request.json();
        const success = storage.importData(body);

        return NextResponse.json({
          success,
          message: success
            ? "Data imported successfully"
            : "Failed to import data",
        });
      }

      case "cleanup": {
        // Clean up old data
        const body = await request.json();
        const maxAgeInDays = body.maxAgeInDays || 90;

        storage.cleanupOldData(maxAgeInDays);

        return NextResponse.json({
          success: true,
          message: `Cleaned up data older than ${maxAgeInDays} days`,
        });
      }

      case "save": {
        // Save monitoring data
        const body = await request.json();
        const { domain, type, data, status } = body;

        if (!domain || !type || !data) {
          throw new ValidationError("Domain, type, and data are required");
        }

        storage.saveMonitoringData(domain, type, data, status);

        return NextResponse.json({
          success: true,
          message: "Monitoring data saved successfully",
        });
      }

      default:
        throw new ValidationError(`Unknown action: ${action}`);
    }
  } catch (error) {
    return handleApiError(error, request.url);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      throw new ValidationError("Domain parameter is required");
    }

    const storage = DataStorageService.getInstance();
    const success = storage.deleteMonitoringData(domain);

    return NextResponse.json({
      success,
      message: success
        ? `Monitoring data for ${domain} deleted successfully`
        : `Failed to delete monitoring data for ${domain}`,
    });
  } catch (error) {
    return handleApiError(error, request.url);
  }
}
