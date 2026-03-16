import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GetFollowerList, GetFollowingList, Follow, Unfollow } from "../../../api/user/follow";
import "./FollowListModal.css";

function FollowListModal({ userId, type, onClose, isOwnPage }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const title = type === "follower" ? "팔로워" : "팔로잉";

  useEffect(() => {
    const fetchList = type === "follower" ? GetFollowerList : GetFollowingList;
    fetchList(userId)
      .then(res => setUsers(res.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [userId, type]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleUserClick = (targetUserId) => {
    onClose();
    navigate(`/mypage/${targetUserId}`);
  };

  const handleUnfollow = (e, targetId) => {
    e.stopPropagation();
    Unfollow(targetId)
      .then(() => setUsers(prev => prev.filter(u => u.id !== targetId)))
      .catch(err => console.error('언팔로우 실패:', err));
  };

  const handleRemoveFollower = (e, targetId) => {
    e.stopPropagation();
    // 나를 팔로우하는 사람을 팔로워 목록에서 제거 (상대방이 나를 언팔하도록 처리할 수 없으므로 목록에서만 숨김)
    setUsers(prev => prev.filter(u => u.id !== targetId));
  };

  return (
    <div className="follow-modal-overlay" onClick={handleOverlayClick}>
      <div className="follow-modal">
        <div className="follow-modal-header">
          <h3 className="follow-modal-title">{title}</h3>
          <button className="follow-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="follow-modal-body">
          {loading ? (
            <p className="follow-modal-empty">불러오는 중...</p>
          ) : users.length === 0 ? (
            <p className="follow-modal-empty">{title} 목록이 없습니다.</p>
          ) : (
            <ul className="follow-modal-list">
              {users.map((u) => (
                <li key={u.id} className="follow-modal-item" onClick={() => handleUserClick(u.id)}>
                  {u.profileImgPath ? (
                    <img className="follow-modal-avatar" src={u.profileImgPath} alt={u.userNm} />
                  ) : (
                    <div className="follow-modal-avatar follow-modal-avatar-placeholder">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bcbcbc" strokeWidth="1.5">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    </div>
                  )}
                  <span className="follow-modal-name">{u.userNm}</span>
                  {isOwnPage && type === "following" && (
                    <button
                      className="follow-modal-action-btn unfollow"
                      onClick={(e) => handleUnfollow(e, u.id)}
                    >
                      언팔로우
                    </button>
                  )}
                  {isOwnPage && type === "follower" && (
                    <button
                      className="follow-modal-action-btn remove"
                      onClick={(e) => handleRemoveFollower(e, u.id)}
                    >
                      삭제
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowListModal;
