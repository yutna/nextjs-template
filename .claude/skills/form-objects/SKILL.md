---
name: form-objects
description: This skill should be used when implementing complex form handling patterns (Rails form objects equivalent). Provides patterns for multi-step forms, complex validation, and form-to-entity transformation.
triggers:
  - form object
  - multi-step form
  - complex form
  - form validation
  - wizard form
  - form schema
---

# Form Objects Skill

Form objects are the Next.js equivalent of Rails Form Objects pattern. They handle complex validation, multi-step forms, and transformation of form data to entity data.

## Location

```
modules/<name>/forms/
├── index.ts
├── <name>-form/
│   ├── index.ts
│   ├── types.ts
│   ├── constants.ts            # Form field configs, steps
│   ├── helpers.ts              # Validation helpers (internal)
│   ├── <name>-form.ts          # Form schema + logic
│   ├── <name>-form-action.ts   # Server action for the form
│   └── <name>-form.test.ts
```

## Basic Form Object Pattern

```typescript
// modules/users/forms/user-registration-form/types.ts

export interface AccountStepData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileStepData {
  name: string;
  bio?: string;
  avatarUrl?: string;
}

export interface PreferencesStepData {
  newsletter: boolean;
  notifications: boolean;
  theme: "light" | "dark" | "system";
}

export interface UserRegistrationFormData {
  account: AccountStepData;
  profile: ProfileStepData;
  preferences: PreferencesStepData;
}

export type FormStep = "account" | "profile" | "preferences";
```

```typescript
// modules/users/forms/user-registration-form/constants.ts

import type { FormStep } from "./types";

export const FORM_STEPS: FormStep[] = ["account", "profile", "preferences"];

export const STEP_LABELS: Record<FormStep, string> = {
  account: "Account Information",
  profile: "Profile Details",
  preferences: "Preferences",
};

export const PASSWORD_MIN_LENGTH = 8;
export const NAME_MIN_LENGTH = 2;
export const BIO_MAX_LENGTH = 500;
```

```typescript
// modules/users/forms/user-registration-form/user-registration-form.ts

import { z } from "zod";

import { hashPassword } from "@/shared/lib/auth";
import type { NewUser } from "@/shared/entities/user";

import {
  BIO_MAX_LENGTH,
  FORM_STEPS,
  NAME_MIN_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "./constants";
import type { FormStep, UserRegistrationFormData } from "./types";

// ─────────────────────────────────────────────────────────────
// Step Schemas
// ─────────────────────────────────────────────────────────────

const accountSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const profileSchema = z.object({
  name: z
    .string()
    .min(NAME_MIN_LENGTH, `Name must be at least ${NAME_MIN_LENGTH} characters`),
  bio: z
    .string()
    .max(BIO_MAX_LENGTH, `Bio must be less than ${BIO_MAX_LENGTH} characters`)
    .optional(),
  avatarUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

const preferencesSchema = z.object({
  newsletter: z.boolean().default(false),
  notifications: z.boolean().default(true),
  theme: z.enum(["light", "dark", "system"]).default("system"),
});

// ─────────────────────────────────────────────────────────────
// Complete Form Schema
// ─────────────────────────────────────────────────────────────

export const userRegistrationSchema = z.object({
  account: accountSchema,
  profile: profileSchema,
  preferences: preferencesSchema,
});

// ─────────────────────────────────────────────────────────────
// Form Object
// ─────────────────────────────────────────────────────────────

export const UserRegistrationForm = {
  /** Complete form schema */
  schema: userRegistrationSchema,

  /** Ordered list of form steps */
  steps: FORM_STEPS,

  /** Get schema for a specific step */
  getStepSchema(step: FormStep) {
    const schemas: Record<FormStep, z.ZodSchema> = {
      account: accountSchema,
      profile: profileSchema,
      preferences: preferencesSchema,
    };
    return schemas[step];
  },

  /** Get step index (0-based) */
  getStepIndex(step: FormStep): number {
    return FORM_STEPS.indexOf(step);
  },

  /** Get next step or null if at end */
  getNextStep(currentStep: FormStep): FormStep | null {
    const index = UserRegistrationForm.getStepIndex(currentStep);
    return FORM_STEPS[index + 1] ?? null;
  },

  /** Get previous step or null if at start */
  getPreviousStep(currentStep: FormStep): FormStep | null {
    const index = UserRegistrationForm.getStepIndex(currentStep);
    return index > 0 ? FORM_STEPS[index - 1] : null;
  },

  /** Check if step is the last one */
  isLastStep(step: FormStep): boolean {
    return step === FORM_STEPS[FORM_STEPS.length - 1];
  },

  /** Check if step is the first one */
  isFirstStep(step: FormStep): boolean {
    return step === FORM_STEPS[0];
  },

  /** Validate complete form data */
  async validate(data: unknown) {
    return userRegistrationSchema.safeParseAsync(data);
  },

  /** Validate a specific step */
  async validateStep(step: FormStep, data: unknown) {
    const schema = UserRegistrationForm.getStepSchema(step);
    return schema.safeParseAsync(data);
  },

  /** Transform form data to entity data for creation */
  toCreateData(form: UserRegistrationFormData): NewUser {
    return {
      email: form.account.email.toLowerCase().trim(),
      passwordHash: hashPassword(form.account.password),
      name: form.profile.name.trim(),
      bio: form.profile.bio?.trim() || null,
      avatarUrl: form.profile.avatarUrl || null,
      preferences: {
        newsletter: form.preferences.newsletter,
        notifications: form.preferences.notifications,
        theme: form.preferences.theme,
      },
    };
  },

  /** Get default/initial values */
  getDefaultValues(): UserRegistrationFormData {
    return {
      account: {
        email: "",
        password: "",
        confirmPassword: "",
      },
      profile: {
        name: "",
        bio: "",
        avatarUrl: "",
      },
      preferences: {
        newsletter: false,
        notifications: true,
        theme: "system",
      },
    };
  },
};
```

## Form Action

```typescript
// modules/users/forms/user-registration-form/user-registration-form-action.ts

import { Effect } from "effect";

import { actionClient } from "@/shared/lib/safe-action";
import { UserService } from "@/modules/users/services/user-service";

import { UserRegistrationForm } from "./user-registration-form";

export const registerUserAction = actionClient
  .schema(UserRegistrationForm.schema)
  .action(async ({ parsedInput }) => {
    // Transform form data to entity data
    const createData = UserRegistrationForm.toCreateData(parsedInput);

    // Create user through service
    const result = await Effect.runPromiseExit(UserService.create(createData));

    if (result._tag === "Failure") {
      const error = result.cause;
      // Handle specific errors
      if (error._tag === "DuplicateEmailError") {
        return {
          success: false,
          error: { field: "account.email", message: "Email already in use" },
        };
      }
      return {
        success: false,
        error: { message: "Registration failed. Please try again." },
      };
    }

    return {
      success: true,
      userId: result.value.id,
    };
  });

/** Step validation action (for multi-step forms) */
export const validateStepAction = actionClient
  .schema(
    z.object({
      step: z.enum(["account", "profile", "preferences"]),
      data: z.unknown(),
    })
  )
  .action(async ({ parsedInput }) => {
    const result = await UserRegistrationForm.validateStep(
      parsedInput.step,
      parsedInput.data
    );

    if (!result.success) {
      return {
        valid: false,
        errors: result.error.flatten().fieldErrors,
      };
    }

    return { valid: true };
  });
```

## Index Export

```typescript
// modules/users/forms/user-registration-form/index.ts
export { UserRegistrationForm, userRegistrationSchema } from "./user-registration-form";
export { registerUserAction, validateStepAction } from "./user-registration-form-action";
export type {
  AccountStepData,
  FormStep,
  PreferencesStepData,
  ProfileStepData,
  UserRegistrationFormData,
} from "./types";
export { FORM_STEPS, STEP_LABELS } from "./constants";
```

## Simple Form Object (Single Step)

```typescript
// modules/users/forms/user-profile-form/user-profile-form.ts

import { z } from "zod";

import type { UpdateUser, User } from "@/shared/entities/user";

export const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

export const UserProfileForm = {
  schema: userProfileSchema,

  /** Validate form data */
  validate(data: unknown) {
    return userProfileSchema.safeParse(data);
  },

  /** Transform form data to update payload */
  toUpdateData(form: UserProfileFormData): UpdateUser {
    return {
      name: form.name.trim(),
      bio: form.bio?.trim() || null,
      avatarUrl: form.avatarUrl || null,
      website: form.website || null,
      location: form.location?.trim() || null,
    };
  },

  /** Populate form from existing user */
  fromUser(user: User): UserProfileFormData {
    return {
      name: user.name,
      bio: user.bio ?? "",
      avatarUrl: user.avatarUrl ?? "",
      website: user.website ?? "",
      location: user.location ?? "",
    };
  },
};
```

## Complex Validation Patterns

### Cross-Field Validation

```typescript
const checkoutSchema = z
  .object({
    paymentMethod: z.enum(["card", "bank", "crypto"]),
    cardNumber: z.string().optional(),
    bankAccount: z.string().optional(),
    walletAddress: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "card" && !data.cardNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Card number is required for card payments",
        path: ["cardNumber"],
      });
    }
    if (data.paymentMethod === "bank" && !data.bankAccount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bank account is required for bank transfers",
        path: ["bankAccount"],
      });
    }
    if (data.paymentMethod === "crypto" && !data.walletAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Wallet address is required for crypto payments",
        path: ["walletAddress"],
      });
    }
  });
```

### Async Validation

```typescript
const usernameSchema = z
  .string()
  .min(3)
  .max(20)
  .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores");

export const UserRegistrationForm = {
  // ... other methods

  /** Check if username is available (async) */
  async validateUsername(username: string): Promise<{ valid: boolean; error?: string }> {
    const basicValidation = usernameSchema.safeParse(username);
    if (!basicValidation.success) {
      return {
        valid: false,
        error: basicValidation.error.errors[0].message,
      };
    }

    // Check uniqueness
    const exists = await Effect.runPromise(
      UserRepository.findByUsername(username).pipe(
        Effect.map((user) => user !== null)
      )
    );

    if (exists) {
      return { valid: false, error: "Username is already taken" };
    }

    return { valid: true };
  },
};
```

### Conditional Required Fields

```typescript
const eventSchema = z
  .object({
    type: z.enum(["online", "in-person", "hybrid"]),
    location: z.string().optional(),
    meetingUrl: z.string().url().optional(),
    maxAttendees: z.number().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "in-person" || data.type === "hybrid") {
      if (!data.location) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Location is required for in-person events",
          path: ["location"],
        });
      }
    }
    if (data.type === "online" || data.type === "hybrid") {
      if (!data.meetingUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Meeting URL is required for online events",
          path: ["meetingUrl"],
        });
      }
    }
  });
```

## Multi-Model Forms

```typescript
// modules/orders/forms/checkout-form/checkout-form.ts

import { z } from "zod";

import type { NewOrder } from "@/shared/entities/order";
import type { NewAddress } from "@/shared/entities/address";

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

const paymentSchema = z.object({
  method: z.enum(["card", "bank"]),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  sameAsShipping: z.boolean(),
  payment: paymentSchema,
  notes: z.string().max(500).optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const CheckoutForm = {
  schema: checkoutSchema,

  /** Transform to multiple entity payloads */
  toCreateData(form: CheckoutFormData, userId: string, cartItems: CartItem[]) {
    const shippingAddress: NewAddress = {
      userId,
      type: "shipping",
      ...form.shippingAddress,
    };

    const billingAddress: NewAddress = form.sameAsShipping
      ? { ...shippingAddress, type: "billing" }
      : { userId, type: "billing", ...form.billingAddress };

    const order: NewOrder = {
      userId,
      status: "pending",
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      notes: form.notes,
    };

    return { shippingAddress, billingAddress, order };
  },
};
```

## Testing Form Objects

```typescript
// modules/users/forms/user-registration-form/user-registration-form.test.ts

import { describe, it, expect } from "vitest";

import { UserRegistrationForm } from "./user-registration-form";

describe("UserRegistrationForm", () => {
  describe("validate", () => {
    it("should validate complete form data", async () => {
      const validData = {
        account: {
          email: "test@example.com",
          password: "password123",
          confirmPassword: "password123",
        },
        profile: {
          name: "John Doe",
        },
        preferences: {
          newsletter: false,
          notifications: true,
          theme: "system" as const,
        },
      };

      const result = await UserRegistrationForm.validate(validData);
      expect(result.success).toBe(true);
    });

    it("should fail if passwords don't match", async () => {
      const invalidData = {
        account: {
          email: "test@example.com",
          password: "password123",
          confirmPassword: "different",
        },
        profile: { name: "John" },
        preferences: { newsletter: false, notifications: true, theme: "system" as const },
      };

      const result = await UserRegistrationForm.validate(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("validateStep", () => {
    it("should validate account step", async () => {
      const accountData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      const result = await UserRegistrationForm.validateStep("account", accountData);
      expect(result.success).toBe(true);
    });
  });

  describe("toCreateData", () => {
    it("should transform form data to entity data", () => {
      const formData = UserRegistrationForm.getDefaultValues();
      formData.account.email = "TEST@Example.com";
      formData.account.password = "password123";
      formData.profile.name = "  John Doe  ";

      const createData = UserRegistrationForm.toCreateData(formData);

      expect(createData.email).toBe("test@example.com"); // Normalized
      expect(createData.name).toBe("John Doe"); // Trimmed
      expect(createData.passwordHash).toBeDefined();
    });
  });

  describe("step navigation", () => {
    it("should return correct next step", () => {
      expect(UserRegistrationForm.getNextStep("account")).toBe("profile");
      expect(UserRegistrationForm.getNextStep("profile")).toBe("preferences");
      expect(UserRegistrationForm.getNextStep("preferences")).toBeNull();
    });

    it("should identify first and last steps", () => {
      expect(UserRegistrationForm.isFirstStep("account")).toBe(true);
      expect(UserRegistrationForm.isLastStep("preferences")).toBe(true);
    });
  });
});
```

## Rails Form Object Mapping

| Rails Pattern | Next.js Form Object |
|---------------|---------------------|
| `include ActiveModel::Model` | Zod schema |
| `validates :email, presence: true` | `z.string().min(1)` |
| `validate :custom_validation` | `.refine()` or `.superRefine()` |
| `attr_accessor :field` | TypeScript interface |
| `def save` | `toCreateData()` + action |
| Form inheritance | Schema composition with `.merge()` |
| `form_for @user` | Schema + `fromUser()` method |
