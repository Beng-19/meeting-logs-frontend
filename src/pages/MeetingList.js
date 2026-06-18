import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function MeetingList() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterWeek, setFilterWeek] = useState('');
    const [filterTeam, setFilterTeam] = useState('');
    const [page, setPage] = useState(1);
    const PER_PAGE = 15;

    // State lưu cấu hình ô đang được sửa (Inline Editing)
    const [editingCell, setEditingCell] = useState({ id: null, field: null });
    const [editingValue, setEditingValue] = useState('');

    const teamsList = ['TECH', 'MKT', 'DESIGN', 'HR'];
    const projectsList = ['59.0_SecurityZone', 'Website StarTech', 'Xây dựng hệ thống AI', 'MKT_SZone'];
    const customersList = ['KH-001', 'KH-002', 'KH-003', 'KH-004'];

    useEffect(() => { fetchMeetings(); }, []);

    const fetchMeetings = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterWeek) params.week = filterWeek;
            if (filterTeam) params.team = filterTeam;
            const res = await api.get('/meetings', { params });
            setMeetings(res.data);
            setPage(1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý lưu thay đổi của bất kỳ trường nào xuống cơ sở dữ liệu
    const handleUpdateField = async (id, field, value) => {
        try {
            // Gửi request PUT lên Laravel backend
            await api.put(`/meetings/${id}`, { [field]: value });
            
            // Cập nhật State tức thì trên giao diện
            setMeetings(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
            setEditingCell({ id: null, field: null }); // Tắt chế độ sửa
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            alert("Không thể lưu thay đổi, vui lòng thử lại!");
        }
    };

    const startEditing = (id, field, initialValue) => {
        setEditingCell({ id, field });
        setEditingValue(initialValue || '');
    };

    const totalPages = Math.ceil(meetings.length / PER_PAGE);
    const paginated = meetings.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const formatDate = (dt) => {
        if (!dt) return '—';
        return new Date(dt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>📋 Danh sách cuộc họp</h1>
                <span style={{ color: '#888', fontSize: 14 }}>{meetings.length} cuộc họp</span>
            </div>

            <div className="card">
                <div className="filter-bar">
                    <input
                        placeholder="🔍 Lọc theo tuần (VD: Tuần 24)"
                        value={filterWeek}
                        onChange={e => setFilterWeek(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchMeetings()}
                    />
                    <input
                        placeholder="🔍 Lọc theo team"
                        value={filterTeam}
                        onChange={e => setFilterTeam(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchMeetings()}
                    />
                    <button className="btn btn-primary" onClick={fetchMeetings}>Tìm kiếm</button>
                    <button className="btn" style={{ background: '#eee', color: '#333' }} onClick={() => { setFilterWeek(''); setFilterTeam(''); }}>Xóa lọc</button>
                </div>

                {loading ? (
                    <div className="empty">⏳ Đang tải dữ liệu...</div>
                ) : paginated.length === 0 ? (
                    <div className="empty">Không có cuộc họp nào.</div>
                ) : (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tuần</th>
                                    <th>Ngày họp</th>
                                    <th>Nội dung tóm tắt</th>
                                    <th>Customer ID</th>
                                    <th>Project ID</th>
                                    <th>Team</th>
                                    <th>Leader</th>
                                    <th>Thời lượng</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((m, i) => (
                                    <tr key={m.id}>
                                        <td style={{ color: '#888', fontSize: 13 }}>{(page - 1) * PER_PAGE + i + 1}</td>
                                        
                                        {/* Sửa Tuần */}
                                        <td>
                                            {editingCell.id === m.id && editingCell.field === 'week' ? (
                                                <input 
                                                    value={editingValue}
                                                    style={{ width: '80px', padding: '4px' }}
                                                    onChange={e => setEditingValue(e.target.value)}
                                                    onBlur={() => handleUpdateField(m.id, 'week', editingValue)}
                                                    onKeyDown={e => e.key === 'Enter' && handleUpdateField(m.id, 'week', editingValue)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span 
                                                    className="badge badge-week" 
                                                    style={{ cursor: 'pointer' }} 
                                                    onClick={() => startEditing(m.id, 'week', m.week)}
                                                    title="Bấm để sửa"
                                                >
                                                    {m.week || '—'} ✏️
                                                </span>
                                            )}
                                        </td>

                                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(m.meeting_time)}</td>
                                        <td style={{ maxWidth: 200 }}>
                                            <span style={{ color: '#333', lineHeight: 1.5 }}>
                                                {m.summary ? m.summary.substring(0, 60) + '...' : '—'}
                                            </span>
                                        </td>
                                        
                                        {/* Dropdown Customer ID */}
                                        <td>
                                            <select 
                                                value={m.customer_id || ''} 
                                                onChange={(e) => handleUpdateField(m.id, 'customer_id', e.target.value)}
                                                style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                                            >
                                                <option value="">— Chọn —</option>
                                                {customersList.map(cust => <option key={cust} value={cust}>{cust}</option>)}
                                            </select>
                                        </td>

                                        {/* Dropdown Project ID */}
                                        <td>
                                            <select 
                                                value={m.project_id || ''} 
                                                onChange={(e) => handleUpdateField(m.id, 'project_id', e.target.value)}
                                                style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                                            >
                                                <option value="">— Chọn —</option>
                                                {projectsList.map(proj => <option key={proj} value={proj}>{proj}</option>)}
                                            </select>
                                        </td>

                                        {/* Dropdown Team */}
                                        <td>
                                            <select 
                                                value={m.team || ''} 
                                                onChange={(e) => handleUpdateField(m.id, 'team', e.target.value)}
                                                style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                                            >
                                                <option value="">—</option>
                                                {teamsList.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </td>

                                        {/* Sửa nhanh Leader */}
                                        <td>
                                            {editingCell.id === m.id && editingCell.field === 'leader_names' ? (
                                                <input 
                                                    value={editingValue}
                                                    style={{ width: '100px', padding: '4px' }}
                                                    onChange={e => setEditingValue(e.target.value)}
                                                    onBlur={() => handleUpdateField(m.id, 'leader_names', editingValue)}
                                                    onKeyDown={e => e.key === 'Enter' && handleUpdateField(m.id, 'leader_names', editingValue)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span 
                                                    style={{ cursor: 'pointer', fontSize: 13, color: '#555' }}
                                                    onClick={() => startEditing(m.id, 'leader_names', m.leader_names)}
                                                    title="Bấm để sửa"
                                                >
                                                    {m.leader_names || '—'} ✏️
                                                </span>
                                            )}
                                        </td>

                                        {/* Sửa nhanh Thời lượng */}
                                        <td>
                                            {editingCell.id === m.id && editingCell.field === 'duration' ? (
                                                <input 
                                                    value={editingValue}
                                                    style={{ width: '70px', padding: '4px' }}
                                                    onChange={e => setEditingValue(e.target.value)}
                                                    onBlur={() => handleUpdateField(m.id, 'duration', editingValue)}
                                                    onKeyDown={e => e.key === 'Enter' && handleUpdateField(m.id, 'duration', editingValue)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span 
                                                    className="badge badge-duration"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => startEditing(m.id, 'duration', m.duration)}
                                                    title="Bấm để sửa"
                                                >
                                                    {m.duration || '—'} ✏️
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            <Link to={`/meetings/${m.id}`} className="btn btn-primary btn-sm">Xem</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Phân trang */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
                            <button
                                className="btn btn-sm"
                                style={{ background: '#eee', color: '#333' }}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >← Trước</button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                                .map((p, idx, arr) => (
                                    <React.Fragment key={p}>
                                        {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ color: '#888' }}>...</span>}
                                        <button
                                            className="btn btn-sm"
                                            style={{
                                                background: p === page ? '#8B0000' : '#eee',
                                                color: p === page ? '#fff' : '#333',
                                                minWidth: 36
                                            }}
                                            onClick={() => setPage(p)}
                                        >{p}</button>
                                    </React.Fragment>
                                ))
                            }

                            <button
                                className="btn btn-sm"
                                style={{ background: '#eee', color: '#333' }}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >Sau →</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default MeetingList;