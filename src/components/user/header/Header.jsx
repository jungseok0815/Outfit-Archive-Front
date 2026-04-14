import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../../styles/user/Navbar.css";
import { useAuth } from "../../../store/context/UserContext";
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markRead,
  subscribeNotification,
} from "../../../api/user/notification";

function Navbar({ onLoginClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const esRef = useRef(null);

  // 로그인 시 SSE 구독 + 초기 미읽음 수 조회
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      if (esRef.current) { esRef.current.close(); esRef.current = null; }
      return;
    }

    getUnreadCount().then(res => setUnreadCount(res.data.unreadCount)).catch(() => {});

    esRef.current = subscribeNotification((newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      if (esRef.current) { esRef.current.close(); esRef.current = null; }
    };
  }, [user]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    if (!open) {
      getNotifications()
        .then(res => setNotifications(res.data))
        .catch(() => {});
    }
    setOpen(prev => !prev);
  };

  const handleMarkAllRead = () => {
    markAllRead().then(() => {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }).catch(() => {});
  };

  const handleNotifClick = (notif) => {
    if (!notif.read) {
      markRead(notif.id).then(() => {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }).catch(() => {});
    }
    setOpen(false);
    if (notif.postId) navigate("/style");
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Outfit Archive</Link>
      <ul className="nav-links">
        <li><Link to={"/shop"}>Shop</Link></li>
        <li><Link to={"/style"}>Style</Link></li>
        <li><Link to={"/"}>About</Link></li>
        <li><Link to={"/mypage"}>마이페이지</Link></li>
        {user && (
          <li className="notification-wrap" ref={dropdownRef}>
            <button className="bell-btn" onClick={handleBellClick}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <span className="bell-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </button>
            {open && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <span>알림</span>
                  {unreadCount > 0 && (
                    <button className="notif-read-all" onClick={handleMarkAllRead}>
                      모두 읽음
                    </button>
                  )}
                </div>
                <ul className="notif-list">
                  {notifications.length === 0 ? (
                    <li className="notif-empty">알림이 없습니다</li>
                  ) : (
                    notifications.map(n => (
                      <li
                        key={n.id}
                        className={`notif-item${!n.read ? " unread" : ""}`}
                        onClick={() => handleNotifClick(n)}
                      >
                        <div className="notif-avatar">
                          {n.senderProfileImg
                            ? <img src={n.senderProfileImg} alt="" />
                            : <span>{n.senderNm?.[0]}</span>}
                        </div>
                        <div className="notif-body">
                          <p className="notif-message">{n.message}</p>
                          <span className="notif-time">{timeAgo(n.createdAt)}</span>
                        </div>
                        {!n.read && <span className="notif-dot" />}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </li>
        )}
        <li>
          {!user && <span onClick={onLoginClick}>Login</span>}
          {user && <span onClick={logout}>Logout</span>}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
