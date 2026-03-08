import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GetFollowerList, GetFollowingList } from "../../../api/user/follow";
import "./FollowListModal.css";

const IMG_BASE = 'http://localhost:8080/api/img/get?imgNm=';

function FollowListModal({ userId, type, onClose }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const title = type === "follower" ? "팔로워" : "팔로잉";

  useEffect(() => {
    const fetchList = type === "follower" ? GetFollowerList : GetFollowingList;
    fetchList(userId)
      .then(res => {
        console.log(res)
        setUsers(res.data || [])})
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
                  {u.profileImgNm ? (
                    <img className="follow-modal-avatar" src={`${IMG_BASE}${u.profileImgNm}`} alt={u.userNm} />
                  ) : (
                    <div className="follow-modal-avatar follow-modal-avatar-placeholder">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bcbcbc" strokeWidth="1.5">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    </div>
                  )}
                  <span className="follow-modal-name">{u.userNm}</span>
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
