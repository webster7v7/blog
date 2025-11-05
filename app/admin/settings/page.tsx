import { redirect } from 'next/navigation';

export default function AdminSettingsPage() {
  // 重定向到新的设置页面
  redirect('/settings');
}
