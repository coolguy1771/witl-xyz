import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CertificateMonitoringService } from "@/app/lib/certificate-monitoring";
import { handleApiError, ValidationError } from "@/app/lib/error-handler";

// Validation schemas
const createMonitoringRuleSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
      "Invalid domain format"
    ),
  enabled: z.boolean().default(true),
  checkInterval: z.number().min(1).max(168).default(24), // 1 hour to 1 week
  alertThresholds: z.object({
    daysBeforeExpiry: z
      .array(z.number().min(0).max(365))
      .default([30, 14, 7, 1]),
    enableChangeDetection: z.boolean().default(true),
    enableInvalidCertAlerts: z.boolean().default(true),
  }),
  notificationSettings: z.object({
    email: z.string().email().optional(),
    webhookUrl: z.string().url().optional(),
    enableBrowserNotifications: z.boolean().default(true),
  }),
});

const updateMonitoringRuleSchema = createMonitoringRuleSchema.partial();

const alertActionSchema = z.object({
  action: z.enum(["acknowledge", "resolve", "delete"]),
  alertId: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");
    const type = searchParams.get("type") || "rules"; // 'rules' or 'alerts'

    const monitoring = CertificateMonitoringService.getInstance();

    if (type === "alerts") {
      const alerts = monitoring.getAlerts(domain || undefined);
      return NextResponse.json({
        success: true,
        data: alerts,
        total: alerts.length,
      });
    } else {
      const rules = monitoring.getMonitoringRules();
      const filteredRules = domain
        ? rules.filter(rule => rule.domain === domain)
        : rules;

      return NextResponse.json({
        success: true,
        data: filteredRules,
        total: filteredRules.length,
      });
    }
  } catch (error) {
    return handleApiError(error, request.url);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    const monitoring = CertificateMonitoringService.getInstance();

    // Handle alert actions
    if (action === "alert") {
      const validation = alertActionSchema.safeParse(body);
      if (!validation.success) {
        throw new ValidationError(
          `Invalid alert action: ${validation.error.issues.map(i => i.message).join(", ")}`
        );
      }

      const { action: alertAction, alertId } = validation.data;
      let success = false;

      switch (alertAction) {
        case "acknowledge":
          success = monitoring.acknowledgeAlert(alertId);
          break;
        case "resolve":
          success = monitoring.resolveAlert(alertId);
          break;
        case "delete":
          success = monitoring.deleteAlert(alertId);
          break;
      }

      if (!success) {
        return NextResponse.json(
          { success: false, error: "Alert not found or action failed" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Alert ${alertAction}d successfully`,
      });
    }

    // Handle check action
    if (action === "check") {
      const { ruleId, checkAll } = body;

      if (checkAll) {
        const alerts = await monitoring.checkAllCertificates();
        return NextResponse.json({
          success: true,
          data: alerts,
          message: `Checked all certificates, found ${alerts.length} new alerts`,
        });
      } else if (ruleId) {
        const alerts = await monitoring.checkCertificate(ruleId);
        return NextResponse.json({
          success: true,
          data: alerts,
          message: `Certificate checked, found ${alerts.length} new alerts`,
        });
      } else {
        throw new ValidationError("Either ruleId or checkAll must be provided");
      }
    }

    // Create new monitoring rule
    const validation = createMonitoringRuleSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        `Invalid monitoring rule: ${validation.error.issues.map(i => i.message).join(", ")}`
      );
    }

    const ruleId = monitoring.addMonitoringRule(validation.data);

    // Perform initial check
    const initialAlerts = await monitoring.checkCertificate(ruleId);

    return NextResponse.json(
      {
        success: true,
        data: {
          ruleId,
          initialAlerts,
          message: `Monitoring rule created for ${validation.data.domain}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, request.url);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get("ruleId");

    if (!ruleId) {
      throw new ValidationError("ruleId is required");
    }

    const validation = updateMonitoringRuleSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(
        `Invalid update data: ${validation.error.issues.map(i => i.message).join(", ")}`
      );
    }

    const monitoring = CertificateMonitoringService.getInstance();
    const success = monitoring.updateMonitoringRule(ruleId, validation.data);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Monitoring rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Monitoring rule updated successfully",
    });
  } catch (error) {
    return handleApiError(error, request.url);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get("ruleId");

    if (!ruleId) {
      throw new ValidationError("ruleId is required");
    }

    const monitoring = CertificateMonitoringService.getInstance();
    const success = monitoring.removeMonitoringRule(ruleId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Monitoring rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Monitoring rule deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, request.url);
  }
}
