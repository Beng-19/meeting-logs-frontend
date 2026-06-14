import React, { useEffect, useState } from 'react';
import api from '../api';

function MemberList() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newTeam, setNewTeam] = useState('');
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editTeam, setEditTeam] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const PER_PAGE = 15;

    useEffect(() => { fetchMembers(); }, []);

    const fetchMembers = async () => {
        try {
            const res = await api.get('/members');
            setMembers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addMember = async () => {
        if (!newName.trim()) return;
        await api.post('/members', { name: newName, team: newTeam });
        setNewName('');
        setNewTeam('');
        fetchMembers();
    };

    const deleteMember = async (id) => {
        if (!window.confirm('Xác nhận xóa thành viên này?')) return;
        await api.delete(`/members/${id}`);
        fetchMembers();
    };

    const startEdit = (m) => { setEditId(m.id); setEditName(m.name); setEditTeam(m.team || ''); };
    const cancelEdit = () => setEditId(null);

    const saveEdit = async () => {
        await api.put(`/members/${editId}`, { name: editName, team: editTeam });
        setEditId(null);
        fetchMembers();
    };

    const filtered = members.filter(m =>
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.team?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    if (loading) return <div className="page"><div className="empty">⏳ Đang tải...</div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <h1>👥 Quản lý thành viên</h1>
                <span style={{ color: '#888', fontSize: 14 }}>{members.length} thành viên</span>
            </div>

            {/* Form thêm mới */}
            <div className="card">
                <h2 style={{ fontSize: 15, color: '#8B0000', marginBottom: 14, fontWeight: 700 }}>➕ Thêm thành viên mới</h2>
                <div className="form-inline">
                    <input
                        placeholder="Họ và tên"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addMember()}
                        style={{ width: 220 }}
                    />
                    <input
                        placeholder="Team (tuỳ chọn)"
                        value={newTeam}
                        onChange={e => setNewTeam(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addMember()}
                        style={{ width: 160 }}
                    />
                    <button className="btn btn-success" onClick={addMember}>Thêm</button>
                </div>
            </div>

            {/* Danh sách */}
            <div className="card">
                <div className="filter-bar">
                    <input
                        placeholder="🔍 Tìm theo tên hoặc team..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        style={{ width: 280 }}
                    />
                    <span style={{ color: '#888', fontSize: 13, marginLeft: 'auto' }}>
                        Hiển thị {filtered.length} / {members.length} thành viên
                    </span>
                </div>

                {paginated.length === 0 ? (
                    <div className="empty">Không tìm thấy thành viên nào.</div>
                ) : (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: 50 }}>#</th>
                                    <th>Họ và tên</th>
                                    <th>Team</th>
                                    <th style={{ width: 160 }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((m, i) => (
                                    <tr key={m.id}>
                                        <td style={{ color: '#888', fontSize: 13 }}>{(page - 1) * PER_PAGE + i + 1}</td>
                                        <td>
                                            {editId === m.id
                                                ? <input value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, width: '100%' }} />
                                                : <span style={{ fontWeight: 500 }}>{m.name}</span>
                                            }
                                        </td>
                                        <td>
                                            {editId === m.id
                                                ? <input value={editTeam} onChange={e => setEditTeam(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, width: '100%' }} />
                                                : m.team ? <span className="badge badge-team">{m.team}</span> : <span style={{ color: '#bbb' }}>—</span>
                                            }
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {editId === m.id ? (
                                                    <>
                                                        <button className="btn btn-primary btn-sm" onClick={saveEdit}>💾 Lưu</button>
                                                        <button className="btn btn-sm" style={{ background: '#eee', color: '#333' }} onClick={cancelEdit}>Hủy</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="btn btn-warning btn-sm" onClick={() => startEdit(m)}>✏️ Sửa</button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => deleteMember(m.id)}>🗑️</button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
                                <button className="btn btn-sm" style={{ background: '#eee', color: '#333' }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Trước</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                                    .map((p, idx, arr) => (
                                        <React.Fragment key={p}>
                                            {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ color: '#888' }}>...</span>}
                                            <button className="btn btn-sm" style={{ background: p === page ? '#8B0000' : '#eee', color: p === page ? '#fff' : '#333', minWidth: 36 }} onClick={() => setPage(p)}>{p}</button>
                                        </React.Fragment>
                                    ))
                                }
                                <button className="btn btn-sm" style={{ background: '#eee', color: '#333' }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Sau →</button>
                                <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>Trang {page}/{totalPages}</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default MemberList;