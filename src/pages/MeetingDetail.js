import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

function MeetingDetail() {
    const { id } = useParams();
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/meetings/${id}`)
            .then(res => setMeeting(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="page"><div className="empty">⏳ Đang tải...</div></div>;
    if (!meeting) return <div className="page"><div className="empty">❌ Không tìm thấy cuộc họp!</div></div>;

    return (
        <div className="page">
            <Link to="/" className="back-link">← Quay lại danh sách</Link>

            <div className="page-header">
                <h1>📄 Chi tiết cuộc họp</h1>
                <span className="badge badge-week" style={{ fontSize: 14, padding: '6px 14px' }}>{meeting.week}</span>
            </div>

            {/* Thông tin cơ bản */}
            <div className="card">
                <h2 style={{ fontSize: 16, color: '#8B0000', marginBottom: 16, fontWeight: 700 }}>
                    📌 Thông tin chung
                </h2>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Ngày họp</span>
                        <span className="info-value">
                            {meeting.meeting_time
                                ? new Date(meeting.meeting_time).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
                                : '—'}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Thời lượng</span>
                        <span className="info-value">
                            <span className="badge badge-duration">{meeting.duration || '—'}</span>
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Team</span>
                        <span className="info-value">
                            {meeting.team ? <span className="badge badge-team">{meeting.team}</span> : '—'}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Leader tham gia</span>
                        <span className="info-value">{meeting.leader_names || '—'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Customer ID</span>
                        <span className="info-value">{meeting.customer_id || '—'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Project ID</span>
                        <span className="info-value">{meeting.project_id || '—'}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {meeting.video_link && (
                        <a href={meeting.video_link} target="_blank" rel="noreferrer" className="link-btn">
                            🎥 Xem video họp
                        </a>
                    )}
                    {meeting.link_summary && (
                        <a href={meeting.link_summary} target="_blank" rel="noreferrer" className="link-btn" style={{ background: '#1b5e20' }}>
                            📊 Xem summary gốc (Google Sheet)
                        </a>
                    )}
                </div>
            </div>

            {/* Summary */}
            <div className="card">
                <h2 style={{ fontSize: 16, color: '#8B0000', marginBottom: 16, fontWeight: 700 }}>
                    📝 Tóm tắt nội dung cuộc họp
                </h2>
                <div className="summary-box">
                    {meeting.summary || 'Chưa có nội dung tóm tắt.'}
                </div>
            </div>
        </div>
    );
}

export default MeetingDetail;