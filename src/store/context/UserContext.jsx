import React, { createContext, useContext, useState, useEffect } from 'react';
import { Logout } from '../../api/user/auth';
import { AdminLogout } from '../../api/admin/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const storedAdminUser = localStorage.getItem('adminUser');
      if (storedAdminUser) {
        setAdminUser(JSON.parse(storedAdminUser));
      }
    } catch (error) {
      console.error('Failed to restore user from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 일반 유저 로그인 함수
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 일반 유저 로그아웃 함수
  const logout = async () => {
    try { await Logout(); } catch (e) { /* 쿠키는 서버가 삭제하므로 실패해도 진행 */ }
    setUser(null);
    localStorage.removeItem('user');
  };

  // 관리자 로그인 함수
  const adminLogin = (userData) => {
    setAdminUser(userData);
    localStorage.setItem('adminUser', JSON.stringify(userData));
  };

  // 관리자 로그아웃 함수
  const adminLogout = async () => {
    try { await AdminLogout(); } catch (e) { /* 쿠키는 서버가 삭제하므로 실패해도 진행 */ }
    setAdminUser(null);
    localStorage.removeItem('adminUser');
  };

    // 로딩 중일 때는 아무것도 렌더링하지 않음
    if (loading) {
      return null; // 또는 로딩 스피너 컴포넌트
    }

  return (
    <AuthContext.Provider value={{ user, login, logout, adminUser, adminLogin, adminLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};