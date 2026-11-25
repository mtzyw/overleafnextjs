import assert from "node:assert/strict";
import test from "node:test";

import {
  formatInviteExpiry,
  resolveInviteSuccess,
} from "../src/app/[code]/inviteResult.ts";

test("membership extension uses direct renewal success state", () => {
  const state = resolveInviteSuccess({
    success: true,
    result: {
      type: "membership_extension",
      latest_extension: {
        new_expires_at: 1798005293,
      },
    },
    expires_ts: 1798005293,
  });

  assert.deepEqual(state, {
    kind: "membership_extension",
    expiresAt: 1798005293,
  });
});

test("migration response is not treated as a normal invitation", () => {
  const state = resolveInviteSuccess({
    success: true,
    result: {
      type: "account_migration",
      migration: {
        status: "pending_acceptance",
      },
    },
    expires_ts: 1798005293,
  });

  assert.equal(state.kind, "migration_started");
});

test("ordinary invitation keeps the email instruction", () => {
  const state = resolveInviteSuccess({
    success: true,
    result: {
      status: "sent",
    },
  });

  assert.deepEqual(state, { kind: "invitation_sent" });
});

test("expiry is formatted in Asia/Shanghai with minute precision", () => {
  const formatted = formatInviteExpiry(1798005293);
  assert.ok(formatted);
  assert.match(formatted, /2026/);
  assert.match(formatted, /12/);
  assert.match(formatted, /23/);
  assert.match(formatted, /13:54/);
});

test("missing expiry is safely omitted", () => {
  assert.equal(formatInviteExpiry(undefined), null);
});
