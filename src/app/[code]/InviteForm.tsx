// src/app/[code]/InviteForm.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";

interface InviteFormProps {
  code: string;
}

export default function InviteForm({ code }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    console.log("Client Component 收到的 code：", code);
  }, [code]);

  // 简单邮箱正则
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. 本地校验邮箱格式
    if (!EMAIL_REGEX.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://overapi.shayudata.com/api/v1/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, card: code })
      });

      if (!res.ok) {
        // 尝试解析并显示后端返回的 detail
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || res.statusText);
      }

      // 成功
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "请求失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 如果已成功发送
  if (success) {
    return (
      <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-2xl p-6 text-green-800">
        🎉 邀请已发送成功！请检查你的邮箱。
      </div>
    );
  }

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
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "处理中…" : "升级会员"}
        </button>
      </form>
      <p className="mt-4 text-xs text-gray-500 text-center">
        您的卡密：<span className="font-mono text-indigo-600">{code}</span>
      </p>
    </div>
  );
}
