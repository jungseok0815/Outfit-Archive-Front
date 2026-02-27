import React, { useState, useEffect } from 'react';
import { AdminJoin, ListAdmin } from '../../../api/admin/auth';
import { ListBrand } from '../../../api/admin/brand';
import './AdminManagement.css';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: '관리자' },
  { value: 'PARTNER', label: '협력 업체' },
];

const ROLE_LABELS = {
  SUPER_ADMIN: '최고 관리자',
  ADMIN: '관리자',
  PARTNER: '협력 업체',
};

const ROLE_COLORS = {
  SUPER_ADMIN: '#6c5ce7',
  ADMIN: '#3498db',
  PARTNER: '#27ae60',
};

const INITIAL_FORM = { memberId: '', memberPwd: '', memberNm: '', adminRole: 'ADMIN', brandId: '' };

const AdminManagement = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminList, setAdminList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const fetchAdminList = () => {
    setListLoading(true);
    ListAdmin()
      .then((res) => setAdminList(res.data || []))
      .catch((err) => console.error('관리자 목록 조회 실패:', err))
      .finally(() => setListLoading(false));
  };

  useEffect(() => {
    fetchAdminList();
    ListBrand('', 0, 100)
      .then((res) => setBrandList(res.data.content || []))
      .catch((err) => console.error('브랜드 목록 조회 실패:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // 권한이 PARTNER 아닌 다른 값으로 바뀌면 brandId 초기화
    if (name === 'adminRole' && value !== 'PARTNER') {
      setForm({ ...form, adminRole: value, brandId: '' });
    } else {
      setForm({ ...form, [name]: value });
    }
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.adminRole === 'PARTNER' && !form.brandId) {
      setError('협력 업체 계정은 브랜드를 선택해야 합니다.');
      return;
    }
    AdminJoin(form)
      .then(() => {
        setSuccess('계정이 성공적으로 등록되었습니다.');
        setForm(INITIAL_FORM);
        fetchAdminList();
      })
      .catch((err) => {
        setError(err.response?.data?.msg || '등록에 실패했습니다.');
      });
  };

  const isPartner = form.adminRole === 'PARTNER';

  return (
    <div className="admin-mgmt-wrap">
      <div className="admin-mgmt-layout">
        {/* 등록 폼 */}
        <div className="admin-mgmt-card">
          <h2 className="admin-mgmt-title">계정 등록</h2>
          <form onSubmit={handleSubmit} className="admin-mgmt-form">
            <div className="admin-mgmt-field">
              <label>아이디</label>
              <input
                type="text"
                name="memberId"
                value={form.memberId}
                onChange={handleChange}
                required
                placeholder="아이디 입력"
              />
            </div>
            <div className="admin-mgmt-field">
              <label>비밀번호</label>
              <input
                type="password"
                name="memberPwd"
                value={form.memberPwd}
                onChange={handleChange}
                required
                placeholder="비밀번호 입력"
              />
            </div>
            <div className="admin-mgmt-field">
              <label>이름</label>
              <input
                type="text"
                name="memberNm"
                value={form.memberNm}
                onChange={handleChange}
                required
                placeholder="이름 입력"
              />
            </div>
            <div className="admin-mgmt-field">
              <label>권한</label>
              <select name="adminRole" value={form.adminRole} onChange={handleChange}>
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {isPartner && (
              <div className="admin-mgmt-field">
                <label>소속 브랜드</label>
                <select name="brandId" value={form.brandId} onChange={handleChange} required>
                  <option value="">브랜드 선택</option>
                  {brandList.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.brandNm}</option>
                  ))}
                </select>
              </div>
            )}
            {error && <p className="admin-mgmt-error">{error}</p>}
            {success && <p className="admin-mgmt-success">{success}</p>}
            <button type="submit" className="admin-mgmt-btn">등록</button>
          </form>
        </div>

        {/* 관리자 목록 */}
        <div className="admin-mgmt-card admin-mgmt-list-card">
          <h2 className="admin-mgmt-title">등록된 관리자 목록</h2>
          {listLoading ? (
            <p className="admin-mgmt-loading">불러오는 중...</p>
          ) : adminList.length === 0 ? (
            <p className="admin-mgmt-empty">등록된 관리자가 없습니다.</p>
          ) : (
            <table className="admin-mgmt-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>아이디</th>
                  <th>권한</th>
                  <th>소속 브랜드</th>
                </tr>
              </thead>
              <tbody>
                {adminList.map((admin) => (
                  <tr key={admin.id}>
                    <td>
                      <div className="admin-mgmt-member">
                        <div
                          className="admin-mgmt-avatar"
                          style={{ background: ROLE_COLORS[admin.adminRole] || '#999' }}
                        >
                          {admin.memberNm?.charAt(0) || 'A'}
                        </div>
                        <span>{admin.memberNm}</span>
                      </div>
                    </td>
                    <td className="admin-mgmt-id">{admin.memberId}</td>
                    <td>
                      <span
                        className="admin-mgmt-role-badge"
                        style={{ '--badge-color': ROLE_COLORS[admin.adminRole] || '#999' }}
                      >
                        {ROLE_LABELS[admin.adminRole] || admin.adminRole}
                      </span>
                    </td>
                    <td className="admin-mgmt-brand">
                      {admin.brandNm || <span className="admin-mgmt-no-brand">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
