import {
  BrainIcon,
  UsersIcon,
  BookOpenIcon,
  UserIcon,
  MessageSquareIcon,
  DatabaseIcon,
  LayoutGridIcon,
} from 'lucide-react'
import React from 'react'

type ManageNavItem = {
  title: string
  to: string
  icon: React.ReactElement
  disabled?: boolean
}

// 仮パス
export const manageNavItems: ManageNavItem[] = [
  {
    title: 'ダッシュボード',
    to: '/management',
    icon: <LayoutGridIcon />,
  },
  {
    title: 'LLM管理',
    to: '/management/llm',
    icon: <BrainIcon />,
    disabled: true,
  },
  {
    title: 'ユーザー管理',
    to: '/management/users',
    icon: <UsersIcon />,
  },
  {
    title: '教材データ管理',
    to: '/management/teachingMaterial',
    icon: <BookOpenIcon />,
  },
  {
    title: '執筆者情報管理',
    to: '/management/teacher',
    icon: <UserIcon />,
  },
  {
    title: 'プロンプト管理',
    to: '/management/prompts',
    icon: <MessageSquareIcon />,
  },
  {
    title: '出力データ管理',
    to: '/management/outputs',
    icon: <DatabaseIcon />,
  },
]
