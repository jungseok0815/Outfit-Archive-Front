import React, { useState } from "react";
import { UpdateUser } from "../../../api/user/auth";
import { useAuth } from "../../../store/context/UserContext";
import "./ProfileEditModal.css";

function ProfileEditModal({ onClose, onSuccess }) {
    const { user, login } = useAuth();

    const [form, setForm] = useState({
        userNm: user?.userNm || "",
        userAge: user?.userAge || "",
        userPwd: "",
        userPwdConfirm: "",
        bio: user?.bio || "",
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const errs = {};
        if (form.userNm.trim().length < 2 || form.userNm.trim().length > 20)
            errs.userNm = "이름은 2~20자 사이여야 합니다.";
        if (!form.userAge || isNaN(form.userAge) || Number(form.userAge) < 1)
            errs.userAge = "올바른 나이를 입력하세요.";
        if (form.userPwd.length < 8 || form.userPwd.length > 16)
            errs.userPwd = "비밀번호는 8~16자 사이여야 합니다.";
        if (form.userPwd !== form.userPwdConfirm)
            errs.userPwdConfirm = "비밀번호가 일치하지 않습니다.";
        return errs;
    };

    const handleSubmit = () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setSubmitting(true);
        UpdateUser({
            id: user.id,
            userNm: form.userNm.trim(),
            userAge: Number(form.userAge),
            userPwd: form.userPwd,
            bio: form.bio.trim(),
        })
            .then(() => {
                login({ ...user, userNm: form.userNm.trim(), userAge: Number(form.userAge), bio: form.bio.trim() });
                if (onSuccess) onSuccess();
                onClose();
            })
            .catch((err) => {
                const msg = err.response?.data?.msg || "프로필 수정에 실패했습니다.";
                alert(msg);
            })
            .finally(() => setSubmitting(false));
    };

    return (
        <div className="profile-edit-overlay" onClick={handleOverlayClick}>
            <div className="profile-edit-modal">
                <button className="profile-edit-close" onClick={onClose}>✕</button>
                <h2>프로필 편집</h2>

                <div className="profile-edit-field">
                    <label>이름</label>
                    <input
                        type="text"
                        name="userNm"
                        value={form.userNm}
                        onChange={handleChange}
                        placeholder="이름 (2~20자)"
                    />
                    {errors.userNm && <span className="profile-edit-error">{errors.userNm}</span>}
                </div>

                <div className="profile-edit-field">
                    <label>나이</label>
                    <input
                        type="number"
                        name="userAge"
                        value={form.userAge}
                        onChange={handleChange}
                        placeholder="나이"
                        min="1"
                    />
                    {errors.userAge && <span className="profile-edit-error">{errors.userAge}</span>}
                </div>

                <div className="profile-edit-field">
                    <label>소개글</label>
                    <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        placeholder="자신을 소개해보세요 (최대 200자)"
                        maxLength={200}
                    />
                </div>

                <div className="profile-edit-field">
                    <label>새 비밀번호</label>
                    <input
                        type="password"
                        name="userPwd"
                        value={form.userPwd}
                        onChange={handleChange}
                        placeholder="비밀번호 (8~16자)"
                    />
                    {errors.userPwd && <span className="profile-edit-error">{errors.userPwd}</span>}
                </div>

                <div className="profile-edit-field">
                    <label>비밀번호 확인</label>
                    <input
                        type="password"
                        name="userPwdConfirm"
                        value={form.userPwdConfirm}
                        onChange={handleChange}
                        placeholder="비밀번호 재입력"
                    />
                    {errors.userPwdConfirm && <span className="profile-edit-error">{errors.userPwdConfirm}</span>}
                </div>

                <button
                    className="profile-edit-submit"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? "저장 중..." : "저장하기"}
                </button>
            </div>
        </div>
    );
}

export default ProfileEditModal;
