---
name: email-service
description: This skill should be used when working with email, mailers, or transactional email. Provides React Email + Resend patterns (Rails ActionMailer equivalent).
triggers:
  - mailer
  - email
  - send email
  - email template
  - transactional email
  - welcome email
  - notification email
---

# Email Service Skill

The email service is the Next.js equivalent of Rails ActionMailer. It uses React Email for templates and Resend (or other providers) for delivery.

## Required Packages

```bash
npm install -E @react-email/components resend
```

## Location

```
shared/services/email/
├── index.ts                    # Barrel export
├── email-service.ts            # Main service (Effect-based)
├── email-client.ts             # Resend/provider client
├── types.ts                    # Email types
└── templates/                  # React Email templates
    ├── welcome-email.tsx
    ├── password-reset-email.tsx
    ├── notification-email.tsx
    └── base-layout.tsx         # Shared layout
```

## Email Client Setup

```typescript
// shared/services/email/email-client.ts
import { Resend } from "resend";

import { env } from "@/shared/config/env";

export const resend = new Resend(env.RESEND_API_KEY);

export const EMAIL_FROM = env.EMAIL_FROM ?? "noreply@example.com";
```

## Types

```typescript
// shared/services/email/types.ts
export class EmailError {
  readonly _tag = "EmailError";
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailResult {
  id: string;
}
```

## Email Service (Effect-based)

```typescript
// shared/services/email/email-service.ts
import { Effect } from "effect";

import { EMAIL_FROM, resend } from "./email-client";
import { WelcomeEmail } from "./templates/welcome-email";
import { PasswordResetEmail } from "./templates/password-reset-email";
import { NotificationEmail } from "./templates/notification-email";

import type { EmailError, EmailResult, SendEmailOptions } from "./types";

/**
 * Send a raw email with custom template.
 */
export const send = (
  options: SendEmailOptions
): Effect.Effect<EmailResult, EmailError> =>
  Effect.tryPromise({
    try: async () => {
      const { data, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        react: options.react,
        replyTo: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { id: data!.id };
    },
    catch: (error) =>
      new EmailError(
        error instanceof Error ? error.message : "Failed to send email",
        error
      ),
  });

/**
 * Send welcome email to new user.
 */
export const sendWelcome = (
  to: string,
  name: string
): Effect.Effect<EmailResult, EmailError> =>
  send({
    to,
    subject: "Welcome to Our App!",
    react: WelcomeEmail({ name }),
  });

/**
 * Send password reset email.
 */
export const sendPasswordReset = (
  to: string,
  resetToken: string,
  expiresAt: Date
): Effect.Effect<EmailResult, EmailError> =>
  send({
    to,
    subject: "Reset Your Password",
    react: PasswordResetEmail({ resetToken, expiresAt }),
  });

/**
 * Send generic notification email.
 */
export const sendNotification = (
  to: string,
  title: string,
  message: string,
  actionUrl?: string,
  actionText?: string
): Effect.Effect<EmailResult, EmailError> =>
  send({
    to,
    subject: title,
    react: NotificationEmail({ title, message, actionUrl, actionText }),
  });

/**
 * Send email to multiple recipients.
 */
export const sendBulk = (
  recipients: string[],
  options: Omit<SendEmailOptions, "to">
): Effect.Effect<EmailResult[], EmailError> =>
  Effect.all(
    recipients.map((to) => send({ ...options, to })),
    { concurrency: 5 } // Limit concurrent sends
  );

// Export as namespace for convenient usage
export const EmailService = {
  send,
  sendWelcome,
  sendPasswordReset,
  sendNotification,
  sendBulk,
};
```

## Base Layout Template

```tsx
// shared/services/email/templates/base-layout.tsx
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import type { ReactNode } from "react";

interface BaseLayoutProps {
  preview: string;
  children: ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://example.com/logo.png"
              width="120"
              height="40"
              alt="Logo"
            />
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Your Company. All rights reserved.
            </Text>
            <Text style={footerText}>
              123 Street Name, City, Country
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 48px 0",
};

const content = {
  padding: "0 48px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "42px 0 26px",
};

const footer = {
  padding: "0 48px",
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "0",
};
```

## Welcome Email Template

```tsx
// shared/services/email/templates/welcome-email.tsx
import { Button, Heading, Text } from "@react-email/components";

import { BaseLayout } from "./base-layout";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <BaseLayout preview={`Welcome to Our App, ${name}!`}>
      <Heading style={heading}>Welcome, {name}!</Heading>

      <Text style={paragraph}>
        We're excited to have you on board. Your account has been created
        successfully and you're ready to get started.
      </Text>

      <Text style={paragraph}>
        Here are a few things you can do to get started:
      </Text>

      <ul style={list}>
        <li style={listItem}>Complete your profile</li>
        <li style={listItem}>Explore our features</li>
        <li style={listItem}>Connect with other users</li>
      </ul>

      <Button style={button} href="https://example.com/dashboard">
        Go to Dashboard
      </Button>

      <Text style={paragraph}>
        If you have any questions, feel free to reply to this email or visit our
        help center.
      </Text>

      <Text style={signature}>
        Best regards,
        <br />
        The Team
      </Text>
    </BaseLayout>
  );
}

// Styles
const heading = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "32px",
  margin: "16px 0",
};

const paragraph = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const list = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  paddingLeft: "24px",
};

const listItem = {
  marginBottom: "8px",
};

const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
  margin: "24px 0",
};

const signature = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "32px 0 0",
};
```

## Password Reset Email Template

```tsx
// shared/services/email/templates/password-reset-email.tsx
import { Button, Heading, Text } from "@react-email/components";

import { BaseLayout } from "./base-layout";

interface PasswordResetEmailProps {
  resetToken: string;
  expiresAt: Date;
}

export function PasswordResetEmail({
  resetToken,
  expiresAt,
}: PasswordResetEmailProps) {
  const resetUrl = `https://example.com/reset-password?token=${resetToken}`;
  const expiresIn = Math.round(
    (expiresAt.getTime() - Date.now()) / (1000 * 60)
  );

  return (
    <BaseLayout preview="Reset your password">
      <Heading style={heading}>Reset Your Password</Heading>

      <Text style={paragraph}>
        We received a request to reset your password. Click the button below to
        create a new password.
      </Text>

      <Button style={button} href={resetUrl}>
        Reset Password
      </Button>

      <Text style={warningText}>
        This link will expire in {expiresIn} minutes.
      </Text>

      <Text style={paragraph}>
        If you didn't request a password reset, you can safely ignore this
        email. Your password will remain unchanged.
      </Text>

      <Text style={smallText}>
        If the button doesn't work, copy and paste this URL into your browser:
        <br />
        <span style={linkText}>{resetUrl}</span>
      </Text>
    </BaseLayout>
  );
}

// Styles
const heading = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "32px",
  margin: "16px 0",
};

const paragraph = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
  margin: "24px 0",
};

const warningText = {
  color: "#dc2626",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 16px",
};

const smallText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "24px 0 0",
};

const linkText = {
  color: "#4f46e5",
  wordBreak: "break-all" as const,
};
```

## Notification Email Template

```tsx
// shared/services/email/templates/notification-email.tsx
import { Button, Heading, Text } from "@react-email/components";

import { BaseLayout } from "./base-layout";

interface NotificationEmailProps {
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export function NotificationEmail({
  title,
  message,
  actionUrl,
  actionText = "View Details",
}: NotificationEmailProps) {
  return (
    <BaseLayout preview={title}>
      <Heading style={heading}>{title}</Heading>

      <Text style={paragraph}>{message}</Text>

      {actionUrl && (
        <Button style={button} href={actionUrl}>
          {actionText}
        </Button>
      )}
    </BaseLayout>
  );
}

// Styles
const heading = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "32px",
  margin: "16px 0",
};

const paragraph = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
  whiteSpace: "pre-wrap" as const,
};

const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
  margin: "24px 0",
};
```

## Index Export

```typescript
// shared/services/email/index.ts
export { EmailService } from "./email-service";
export { resend, EMAIL_FROM } from "./email-client";
export type { EmailError, EmailResult, SendEmailOptions } from "./types";

// Re-export templates for preview/testing
export { WelcomeEmail } from "./templates/welcome-email";
export { PasswordResetEmail } from "./templates/password-reset-email";
export { NotificationEmail } from "./templates/notification-email";
```

## Usage Examples

### In a Service

```typescript
// modules/users/services/create-user-service/create-user-service.ts
import { Effect, pipe } from "effect";

import { EmailService } from "@/shared/services/email";
import { UserRepository } from "@/modules/users/repositories/user-repository";

export const createUserService = (input: CreateUserInput) =>
  pipe(
    UserRepository.create(input),
    Effect.tap((user) =>
      // Send welcome email (fire and forget)
      Effect.fork(
        EmailService.sendWelcome(user.email, user.name).pipe(
          Effect.catchAll(() => Effect.void) // Don't fail on email error
        )
      )
    )
  );
```

### In a Background Job

```typescript
// modules/notifications/jobs/send-digest-job/send-digest-job.ts
import { task } from "@trigger.dev/sdk/v3";
import { Effect } from "effect";

import { EmailService } from "@/shared/services/email";

export const sendDigestJob = task({
  id: "send-digest",
  run: async (payload: { userId: string; items: DigestItem[] }) => {
    const { userId, items } = payload;

    // Fetch user
    const user = await fetchUser(userId);

    // Send digest email
    await Effect.runPromise(
      EmailService.sendNotification(
        user.email,
        "Your Weekly Digest",
        formatDigestMessage(items),
        "https://example.com/dashboard",
        "View All"
      )
    );

    return { sent: true };
  },
});
```

### Preview Emails in Development

```typescript
// app/api/email-preview/[template]/route.ts (dev only)
import { WelcomeEmail, PasswordResetEmail } from "@/shared/services/email";
import { render } from "@react-email/render";

export async function GET(
  request: Request,
  { params }: { params: { template: string } }
) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const templates: Record<string, React.ReactElement> = {
    welcome: WelcomeEmail({ name: "John Doe" }),
    "password-reset": PasswordResetEmail({
      resetToken: "abc123",
      expiresAt: new Date(Date.now() + 3600000),
    }),
  };

  const template = templates[params.template];
  if (!template) {
    return new Response("Template not found", { status: 404 });
  }

  const html = await render(template);
  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
```

## Testing

```typescript
// shared/services/email/email-service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Effect } from "effect";

import { EmailService } from "./email-service";
import { resend } from "./email-client";

vi.mock("./email-client", () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
  EMAIL_FROM: "test@example.com",
}));

describe("EmailService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendWelcome", () => {
    it("should send welcome email", async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({
        data: { id: "email-123" },
        error: null,
      });

      const result = await Effect.runPromise(
        EmailService.sendWelcome("user@test.com", "John")
      );

      expect(result.id).toBe("email-123");
      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@test.com",
          subject: "Welcome to Our App!",
        })
      );
    });

    it("should handle send errors", async () => {
      vi.mocked(resend.emails.send).mockResolvedValue({
        data: null,
        error: { message: "Rate limit exceeded" },
      });

      const result = await Effect.runPromiseExit(
        EmailService.sendWelcome("user@test.com", "John")
      );

      expect(result._tag).toBe("Failure");
    });
  });
});
```

## Rails ActionMailer Mapping

| Rails ActionMailer | Next.js Email Service |
|--------------------|----------------------|
| `UserMailer.welcome(user).deliver_later` | `EmailService.sendWelcome(email, name)` |
| `mail(to:, subject:)` | `send({ to, subject, react })` |
| ERB templates | React Email components |
| `deliver_now` | `Effect.runPromise(...)` |
| `deliver_later` | Trigger.dev job |
| Previews | `/api/email-preview/[template]` |
| Interceptors | Middleware in email-service |
