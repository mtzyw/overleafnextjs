# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于Next.js 15的Overleaf邀请管理系统前端，使用React 19和TypeScript构建。系统允许用户通过卡密升级Overleaf账户权限。

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 核心架构

### 路由结构
- `/` - 主页（未完成的默认Next.js页面）
- `/[code]` - 动态路由，接收卡密参数并显示邀请表单

### 组件架构
- `app/layout.tsx` - 全局布局，使用Geist字体
- `app/[code]/page.tsx` - 卡密页面服务端组件，提取URL参数
- `app/[code]/InviteForm.tsx` - 客户端邀请表单组件，处理API调用

### API集成
项目连接到FastAPI后端服务(详见API接口文档.md)：
- 邀请接口：`POST /api/v1/invite`
- 当前硬编码为`http://127.0.0.1:8000`，需要配置环境变量

### 技术栈
- **框架**: Next.js 15 (App Router)
- **UI**: React 19 + TypeScript
- **样式**: Tailwind CSS 4
- **字体**: Geist Sans + Geist Mono

## 开发注意事项

### 环境配置
目前API URL硬编码，应创建`.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 类型安全
- 使用TypeScript严格模式
- API响应类型定义不完整，需要扩展`ErrorResponse`接口

### 样式约定
- 使用Tailwind CSS进行样式设计
- 采用现代圆角和阴影设计风格
- 响应式设计支持移动端

### 表单处理
- 客户端表单验证（邮箱格式）
- 错误状态管理和用户反馈
- 加载状态处理

## 后端API依赖

系统依赖完整的Overleaf邀请管理API，包括：
- 账户管理
- 卡密系统
- 邀请发送
- 成员管理
- 数据同步

详细API文档参见`API接口文档.md`。