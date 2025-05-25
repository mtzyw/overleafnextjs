// src/app/[code]/page.tsx
import InviteForm from "./InviteForm";

interface Props {
  params: { code: string };
}

export default async function Page({ params }: Props) {
  const { code } = await params;  // Next 最新版要求这么写

  return (
    // 让容器铺满视口，高度 100vh，元素水平和垂直居中
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {/* 用一个额外的 div 保持内容垂直堆叠、水平居中 */}
      <div className="w-full max-w-md text-center">
        {/* logo */}
        <img
          src="/overleaf.svg"
          alt="Overleaf Logo"
          className="mx-auto mb-8 w-40 sm:w-48 md:w-56 h-auto"
        />
        {/* 邀请表单 */}
        <InviteForm code={code} />
      </div>
    </div>
  );
}
