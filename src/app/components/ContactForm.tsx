"use client";

import { useCallback, useEffect, useState } from "react";
import Script from "next/script";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Send } from "lucide-react";

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js";

function getTurnstileSiteKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ??
    (process.env.NODE_ENV === "development" ? "1x00000000000000000000AA" : undefined)
  );
}

export function ContactForm() {
  const theme = useTheme();
  const siteKey = getTurnstileSiteKey();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const resetTurnstile = useCallback(() => {
    if (widgetId && window.turnstile) {
      window.turnstile.reset(widgetId);
    }
    setTurnstileToken("");
  }, [widgetId]);

  const mountTurnstile = useCallback(() => {
    if (!siteKey || !window.turnstile || widgetId) {
      return;
    }

    const id = window.turnstile.render("#contact-turnstile", {
      sitekey: siteKey,
      callback: (token: string) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(""),
      "error-callback": () => setTurnstileToken(""),
      theme: theme.palette.mode === "dark" ? "dark" : "light",
    });

    setWidgetId(id);
  }, [siteKey, theme.palette.mode, widgetId]);

  useEffect(() => {
    mountTurnstile();
  }, [mountTurnstile]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    if (!turnstileToken) {
      setFeedback({ type: "error", text: "Complete the verification challenge first." });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-requested-with": "fetch",
        },
        body: JSON.stringify({ name, email, message, turnstileToken }),
      });

      const data = (await response.json()) as { error?: string; ok?: boolean };

      if (!response.ok) {
        setFeedback({
          type: "error",
          text: data.error ?? "Something went wrong. Try again or email directly.",
        });
        resetTurnstile();
        return;
      }

      setFeedback({ type: "success", text: "Message sent. I will get back to you soon." });
      setName("");
      setEmail("");
      setMessage("");
      resetTurnstile();
    } catch {
      setFeedback({ type: "error", text: "Network error. Try again or email directly." });
      resetTurnstile();
    } finally {
      setSubmitting(false);
    }
  };

  if (!siteKey) {
    return (
      <Alert severity="info" sx={{ textAlign: "left" }}>
        Contact form is not configured yet. Email me at twitlin@witl.xyz.
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: "left", mt: 4 }}>
      <Script src={TURNSTILE_SCRIPT} strategy="lazyOnload" onLoad={mountTurnstile} />

      <Box sx={{ display: "grid", gap: 2, mb: 2 }}>
        <TextField
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          fullWidth
          slotProps={{ htmlInput: { maxLength: 100 } }}
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          fullWidth
          slotProps={{ htmlInput: { maxLength: 254 } }}
        />
        <TextField
          label="Message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          fullWidth
          multiline
          minRows={4}
          slotProps={{ htmlInput: { maxLength: 5000 } }}
        />
      </Box>

      <Box id="contact-turnstile" sx={{ display: "flex", justifyContent: "center", mb: 2 }} />

      {feedback && (
        <Alert severity={feedback.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {feedback.text}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={submitting}
        startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.mode === "dark" ? "#0a0e14" : "#ffffff",
          fontFamily: "'Geist Mono', monospace",
        }}
      >
        {submitting ? "Sending..." : "./send-message"}
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
        Protected by Cloudflare Turnstile. Your message is sent by email, not stored on this site.
      </Typography>
    </Box>
  );
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        selector: string,
        options: Record<string, unknown>
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}
