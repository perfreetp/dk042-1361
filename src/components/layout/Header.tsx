import { useState } from 'react';
import {
  Hospital,
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  Settings,
  Bell,
  User,
  ChevronDown,
  LogOut,
  UserCircle,
  X,
  CheckCheck,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const navItems = [
  { to: '/', label: '归档总览', icon: LayoutDashboard },
  { to: '/anomaly', label: '异常清单', icon: AlertTriangle },
  { to: '/statistics', label: '科室统计', icon: BarChart3 },
  { to: '/procedure', label: '术式配置', icon: Settings },
];

const notificationTypeStyles = {
  info: 'bg-medical-primary-light text-medical-primary',
  success: 'bg-medical-success-light text-medical-success',
  warning: 'bg-medical-warning-light text-medical-warning',
  error: 'bg-medical-danger-light text-medical-danger',
};

export default function Header() {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, notifications, markNotificationRead, markAllNotificationsRead, logout } = useAppStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (id: string) => {
    markNotificationRead(id);
  };

  return (
    <header className="h-16 bg-white border-b border-border-default flex items-center px-6 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-medical-primary flex items-center justify-center">
          <Hospital className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-text-primary">质控看板</h1>
          <p className="text-xs text-text-tertiary">Quality Control Dashboard</p>
        </div>
      </div>

      <nav className="flex items-center gap-1 ml-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-medical-primary-light text-medical-primary'
                  : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className={cn(
              'relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200',
              showNotifications
                ? 'bg-medical-primary-light text-medical-primary'
                : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
            )}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-medical-danger text-white text-[10px] font-medium flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-card-hover border border-border-default overflow-hidden animate-scale-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
                <h3 className="font-semibold text-text-primary">消息通知</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="flex items-center gap-1 text-xs text-medical-primary hover:text-medical-primary-dark transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    全部已读
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-text-tertiary text-sm">
                    暂无消息通知
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={cn(
                        'px-4 py-3 border-b border-border-light cursor-pointer transition-colors hover:bg-gray-50 last:border-b-0',
                        !notification.read && 'bg-medical-primary-light/30'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                            notificationTypeStyles[notification.type]
                          )}
                        >
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-medical-danger flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-text-tertiary mt-1">
                            {format(new Date(notification.timestamp), 'MM-dd HH:mm', { locale: zhCN })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-gray-50"
          >
            <div className="w-8 h-8 rounded-full bg-medical-primary-light flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-medical-primary" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary">{user?.name || '未登录'}</p>
              <p className="text-xs text-text-tertiary">{user?.roleName || ''}</p>
            </div>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-text-tertiary transition-transform duration-200',
                showUserMenu && 'rotate-180'
              )}
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-card-hover border border-border-default overflow-hidden animate-scale-in">
              <div className="px-4 py-3 border-b border-border-light">
                <p className="text-sm font-semibold text-text-primary">{user?.name}</p>
                <p className="text-xs text-text-secondary mt-0.5">{user?.roleName}</p>
                {user?.department && (
                  <p className="text-xs text-text-tertiary mt-0.5">{user.department}</p>
                )}
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-colors">
                  <UserCircle className="w-4 h-4" />
                  个人中心
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-colors">
                  <Settings className="w-4 h-4" />
                  系统设置
                </button>
              </div>
              <div className="py-1 border-t border-border-light">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-medical-danger hover:bg-medical-danger-light transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>

        {(showNotifications || showUserMenu) && (
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => {
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
          />
        )}
      </div>
    </header>
  );
}
