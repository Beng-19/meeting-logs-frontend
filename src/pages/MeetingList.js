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
                                        <td style={{ maxWidth: 320 }}>
                                            <span style={{ color: '#333', lineHeight: 1.5 }}>
                                                {m.summary ? m.summary.substring(0, 100) + '...' : '—'}
                                            </span>
                                        </td>
                                        <td>{m.team ? <span className="badge badge-team">{m.team}</span> : '—'}</td>
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