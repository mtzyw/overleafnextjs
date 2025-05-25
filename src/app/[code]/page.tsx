// src/app/[code]/page.tsx
import Image from "next/image";
import InviteForm from "./InviteForm";

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        {/* 使用 next/image 自动优化 */}
        <Image
          src="/overleaf.svg"
          alt="Overleaf Logo"
          width={240}   // 你可以根据需要调整尺寸
          height={64}
          className="mx-auto mb-8"
        />
        <InviteForm code={code} />
      </div>
    </div>
  );
}
