"use client";

import { useState, FormEvent, useEffect } from "react";

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

export default function InviteForm({ code }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [cardStatus, setCardStatus] = useState<CardDetectResponse | null>(null);
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    console.log("Client Component 收到的 code：", code);
    detectCardStatus();
  }, [code]);

  const detectCardStatus = async () => {
    setDetecting(true);
    setError(null);
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/invite/detect?card=${encodeURIComponent(code)}`);
      
      if (!res.ok) {
        const data = (await res.json().catch(() => ({} as ErrorResponse))) as ErrorResponse;
        throw new Error(data.detail ?? res.statusText);
      }
      
      const data = await res.json() as CardDetectResponse;
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

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // 新邀请模式需要验证邮箱
    if (cardStatus?.mode === "new_invite" && !EMAIL_REGEX.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    setLoading(true);

    try {
      let res;
      
      if (cardStatus?.mode === "reactivate") {
        // 重新激活模式
        res = await fetch("http://127.0.0.1:8000/api/v1/invite/reactivate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ card: code }),
        });
      } else {
        // 新邀请模式
        res = await fetch("http://127.0.0.1:8000/api/v1/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.toLowerCase(), card: code }),
        });
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => ({} as ErrorResponse))) as ErrorResponse;
        throw new Error(data.detail ?? res.statusText);
      }

      setSuccess(true);
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
  if (success) {
    const message = cardStatus?.mode === "reactivate" 
      ? "🎉 会员已成功更新！" 
      : "🎉 邀请已发送成功！请检查你的邮箱。";
    
    return (
      <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-2xl p-6 text-green-800">
        {message}
      </div>
    );
  }

  // 重新激活模式界面
  if (cardStatus?.mode === "reactivate") {
    return (
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 ring-1 ring-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          更新会员权限
        </h2>
        
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <strong>当前升级邮箱：</strong>{cardStatus.email}
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            className="w-full px-4 py-2 rounded text-white"
            style={{
              backgroundColor: loading ? "#999" : "#059669",
              color: "#fff",
              fontWeight: 600,
              fontSize: "16px",
              border: "none"
            }}
            disabled={loading || !cardStatus.can_reactivate}
          >
            {loading ? "更新中…" : "更新会员"}
          </button>
        </form>
        
        <p className="mt-4 text-xs text-gray-500 text-center">
          您的卡密：<span className="font-mono text-indigo-600">{code}</span>
        </p>
      </div>
    );
  }

  // 新邀请模式界面
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
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          className="w-full px-4 py-2 rounded text-white"
          style={{
            backgroundColor: loading ? "#999" : "#2563eb",
            color: "#fff",
            fontWeight: 600,
            fontSize: "16px",
            border: "none"
          }}
          disabled={loading}
        >
          {loading ? "处理中…" : "点击升级"}
        </button>
      </form>
      <p className="mt-4 text-xs text-gray-500 text-center">
        您的卡密：<span className="font-mono text-indigo-600">{code}</span>
      </p>
    </div>
  );
}
