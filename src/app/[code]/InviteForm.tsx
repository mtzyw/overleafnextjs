"use client";

import { useState, FormEvent, useEffect } from "react";
import { formatInviteExpiry, resolveInviteSuccess } from "./inviteResult";
import type {
  InviteResponsePayload,
  InviteSuccessState,
} from "./inviteResult";

interface InviteFormProps {
  code: string;
}

interface ErrorResponse {
  detail?: string;
}

interface CardDetectResponse {
  mode: "new_invite" | "reactivate";
  email?: string;
  remaining_days?: number;
  expires_at?: number;
  can_reactivate?: boolean;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_REVIEW_MESSAGE = "请检查邮箱格式是否正确";

const INVALID_TLD_SUGGESTIONS: Record<string, string> = {
  con: "com",
  cmo: "com",
  ocm: "com",
  coom: "com",
  conm: "com",
  cm: "com",
  xom: "com",
  vom: "com",
  comm: "com",
  nett: "net",
  nete: "net",
  ogr: "org",
  rog: "org",
};

const DOMAIN_SUGGESTIONS: Record<string, string> = {
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cmo": "gmail.com",
  "gmail.ocm": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmailcom.com": "gmail.com",
  "googlemail.con": "googlemail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outlook.con": "outlook.com",
  "qq.con": "qq.com",
  "163.con": "163.com",
  "126.con": "126.com",
  "icloud.con": "icloud.com",
  "foxmail.con": "foxmail.com",
  "yahoo.con": "yahoo.com",
};

function getEmailReviewMessage(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (!EMAIL_REGEX.test(normalized)) {
    return EMAIL_REVIEW_MESSAGE;
  }

  const [, domain = ""] = normalized.split("@");
  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1] ?? "";

  if (!/^[a-z]{2,24}$/.test(tld)) {
    return EMAIL_REVIEW_MESSAGE;
  }

  const suggestedDomain = DOMAIN_SUGGESTIONS[domain];
  if (suggestedDomain) {
    return EMAIL_REVIEW_MESSAGE;
  }

  const suggestedTld = INVALID_TLD_SUGGESTIONS[tld];
  if (suggestedTld) {
    return EMAIL_REVIEW_MESSAGE;
  }

  return null;
}

export default function InviteForm({ code }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successState, setSuccessState] = useState<InviteSuccessState | null>(
    null
  );
  const [cardStatus, setCardStatus] = useState<CardDetectResponse | null>(null);
  const [detecting, setDetecting] = useState(true);
  const emailReviewMessage =
    cardStatus?.mode === "new_invite" ? getEmailReviewMessage(email) : null;

  useEffect(() => {
    console.log("Client Component 收到的 code：", code);
    detectCardStatus();
  }, [code]);

  const detectCardStatus = async () => {
    setDetecting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/v1/invite/detect?card=${encodeURIComponent(
          code
        )}`
      );

      if (!res.ok) {
        const data = (await res
          .json()
          .catch(() => ({} as ErrorResponse))) as ErrorResponse;
        throw new Error(data.detail ?? res.statusText);
      }

      const data = (await res.json()) as CardDetectResponse;
      setCardStatus(data);

      // 如果是重新激活模式，设置默认邮箱
      if (data.mode === "reactivate" && data.email) {
        setEmail(data.email);
      }
    } catch (err: unknown) {
      console.error("检测卡密状态失败:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("检测卡密状态失败，请重试");
      }
    } finally {
      setDetecting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // 新邀请模式需要验证邮箱
    if (cardStatus?.mode === "new_invite") {
      const emailMessage = getEmailReviewMessage(email);
      if (emailMessage) {
        setError(emailMessage);
        return;
      }
    }

    setLoading(true);

    try {
      let res;

      if (cardStatus?.mode === "reactivate") {
        // 重新激活模式（虽然现在前端没有按钮，但逻辑保留）
        res = await fetch(
          "/api/v1/invite/reactivate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ card: code }),
          }
        );
      } else {
        // 新邀请模式
        res = await fetch(
          "/api/v1/invite",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
              card: code,
            }),
          }
        );
      }

      if (!res.ok) {
        const data = (await res
          .json()
          .catch(() => ({} as ErrorResponse))) as ErrorResponse;
        throw new Error(data.detail ?? res.statusText);
      }

      const data = (await res.json()) as InviteResponsePayload;
      setSuccessState(resolveInviteSuccess(data));
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("请求失败，请重试");
      }
    } finally {
      setLoading(false);
    }
  };

  // 检测中状态
  if (detecting) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 ring-1 ring-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在检测卡密状态...</p>
        </div>
      </div>
    );
  }

  // 成功状态
  if (successState) {
    const expiry =
      successState.kind === "invitation_sent"
        ? null
        : formatInviteExpiry(successState.expiresAt);
    const content =
      successState.kind === "membership_extension"
        ? {
            title: "会员已自动续期成功",
            detail: expiry
              ? `新的到期时间：${expiry}。本次续期已直接完成，无需接受新的邀请。`
              : "会员权益已直接延长，本次续期无需接受新的邀请。",
          }
        : successState.kind === "migration_started"
          ? {
              title: "迁移邀请已发送",
              detail: "请检查邮箱并接受新的 Overleaf 邀请，完成账号迁移。",
            }
          : {
              title: "邀请已发送成功",
              detail: "请检查你的邮箱并接受新的 Overleaf 邀请。",
            };

    return (
      <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-2xl p-6 text-green-800">
        <p className="font-semibold">{content.title}</p>
        <p className="mt-3 text-sm leading-6">{content.detail}</p>
      </div>
    );
  }

  // 重新激活模式界面（❌ 已删除更新会员按钮）
  if (cardStatus?.mode === "reactivate") {
    return (
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 ring-1 ring-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          会员信息
        </h2>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <strong>当前升级邮箱：</strong>
            {cardStatus.email}
          </p>

          {cardStatus.remaining_days && (
            <p className="text-sm text-blue-600">
              剩余权益：{cardStatus.remaining_days} 天
            </p>
          )}

          {cardStatus.message && (
            <p className="text-sm text-blue-600 mt-1">
              {cardStatus.message}
            </p>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <p className="mt-4 text-xs text-gray-500 text-center">
          您的卡密：
          <span className="font-mono text-indigo-600 ml-1">{code}</span>
        </p>
      </div>
    );
  }

  // 新邀请模式界面（保持原样）
  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 ring-1 ring-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        输入你自己的 Overleaf 账户邮箱号
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            邮箱地址
          </label>
          <input
            id="email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          {emailReviewMessage && (
            <p className="mt-2 text-sm text-amber-600">
              {emailReviewMessage}
            </p>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          className="w-full px-4 py-2 rounded text-white"
          style={{
            backgroundColor: loading ? "#999" : "#2563eb",
            fontWeight: 600,
            fontSize: "16px",
            border: "none",
          }}
          disabled={loading}
        >
          {loading ? "处理中…" : "点击升级"}
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-500 text-center">
        您的卡密：
        <span className="font-mono text-indigo-600 ml-1">{code}</span>
      </p>
    </div>
  );
}
