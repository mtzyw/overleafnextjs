export interface InviteResultPayload {
  type?: string;
  latest_extension?: {
    new_expires_at?: number;
  };
  migration?: {
    status?: string;
  };
}

export interface InviteResponsePayload {
  success: boolean;
  result?: InviteResultPayload;
  sent_ts?: number;
  expires_ts?: number;
}

export type InviteSuccessState =
  | {
      kind: "membership_extension";
      expiresAt?: number;
    }
  | {
      kind: "migration_started";
      expiresAt?: number;
    }
  | {
      kind: "invitation_sent";
    };

function validTimestamp(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }
  return Math.trunc(value);
}

export function resolveInviteSuccess(
  data: InviteResponsePayload
): InviteSuccessState {
  const result = data.result ?? {};
  const expiresAt = validTimestamp(
    data.expires_ts ?? result.latest_extension?.new_expires_at
  );

  if (result.type === "membership_extension") {
    return { kind: "membership_extension", expiresAt };
  }

  if (result.type === "account_migration" || result.migration) {
    return { kind: "migration_started", expiresAt };
  }

  return { kind: "invitation_sent" };
}

export function formatInviteExpiry(expiresAt?: number): string | null {
  if (!expiresAt) {
    return null;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(expiresAt * 1000));
}
