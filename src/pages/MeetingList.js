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

    // Danh sách mẫu cho các ô dropdown (Mày có thể sửa lại value theo đúng thực tế công ty)
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

    // Hàm cập nhật nhanh dữ liệu (Project, Customer, Team...) trực tiếp tại trang chính
    const handleUpdateField = async (id, field, value) => {
        try {
            // Gửi request PUT/PATCH lên Laravel để cập nhật DB
            await api.put(`/meetings/${id}`, { [field]: value });
            
            // Cập nhật lại State local ngay lập tức để giao diện mượt mà không cần load lại trang
            setMeetings(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
        } catch (err) {
            console.error("Lỗi cập nhật trường dữ liệu:", err);
            alert("Không thể cập nhật dữ liệu, vui lòng kiểm tra lại!");
        }
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
                                    <th>Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((m, i) => (
                                    <tr key={m.id}>
                                        <td style={{ color: '#888', fontSize: 13 }}>{(page - 1) * PER_PAGE + i + 1}</td>
                                        <td><span className="badge badge-week">{m.week}</span></td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(m.meeting_time)}</td>
                                        <td style={{ maxWidth: 220 }}>
                                            <span style={{ color: '#333', lineHeight: 1.5 }}>
                                                {m.summary ? m.summary.substring(0, 70) + '...' : '—'}
                                            </span>
                                        </td>
                                        
                                        {/* Dropdown Customer ID chọn trực tiếp */}
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

                                        {/* Dropdown Project ID chọn trực tiếp */}
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

                                        {/* Dropdown Team chọn trực tiếp */}
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

                                        <td style={{ fontSize: 13, color: '#555' }}>{m.leader_names || '—'}</td>
                                        <td><span className="badge badge-duration">{m.duration || '—'}</span></td>
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

                            <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>
                                Trang {page}/{totalPages}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default MeetingList;