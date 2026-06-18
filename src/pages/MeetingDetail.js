import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

function MeetingDetail() {
    const { id } = useParams();
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    const teamsList = ['TECH', 'MKT', 'DESIGN', 'HR'];
    const projectsList = ['59.0_SecurityZone', 'Website StarTech', 'Xây dựng hệ thống AI', 'MKT_SZone'];
    const customersList = ['KH-001', 'KH-002', 'KH-003', 'KH-004'];

    useEffect(() => {
        setLoading(true);
        api.get(`/meetings/${id}`)
            .then(res => {
                if (res.data) {
                    setMeeting(res.data);
                    setFormData(res.data);
                }
            })
            .catch(err => {
                console.error("Lỗi lấy chi tiết cuộc họp từ API:", err);
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        api.put(`/meetings/${id}`, formData)
            .then(res => {
                setMeeting(formData);
                setIsEditing(false);
                alert("Đã lưu thay đổi thành công!");
            })
            .catch(err => {
                console.error(err);
                alert("Lỗi! Không thể lưu dữ liệu lên hệ thống.");
            });
    };

    if (loading) return <div className="page"><div className="empty">⏳ Đang tải...</div></div>;
    if (!meeting) return <div className="page"><div className="empty">❌ Không tìm thấy cuộc họp hoặc API Backend đang lỗi!</div></div>;

    return (
        <div className="page">
            <Link to="/" className="back-link">← Quay lại danh sách</Link>

            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>📄 Chi tiết cuộc họp #{id}</h1>
                    <div style={{ marginTop: 8 }}>
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={formData.week || ''} 
                                placeholder="Nhập tuần (VD: Tuần 24)"
                                onChange={e => handleInputChange('week', e.target.value)}
                                style={{ padding: '4px 8px', width: '120px', fontSize: '14px' }}
                            />
                        ) : (
                            <span className="badge badge-week" style={{ fontSize: 14, padding: '6px 14px' }}>
                                {meeting.week || 'Chưa phân tuần'}
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    {!isEditing ? (
                        <button className="btn btn-primary" onClick={() => setIsEditing(true)} style={{ padding: '8px 16px', fontWeight: 'bold' }}>
                            ✏️ Chỉnh sửa
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn" onClick={() => { setIsEditing(false); setFormData(meeting); }} style={{ background: '#eee', color: '#333', padding: '8px 16px' }}>
                                Hủy
                            </button>
                            <button className="btn btn-primary" onClick={handleSave} style={{ background: '#28a745', padding: '8px 16px', fontWeight: 'bold' }}>
                                💾 Lưu
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="card">
                <h2 style={{ fontSize: 16, color: '#8B0000', marginBottom: 16, fontWeight: 700 }}>
                    📌 Thông tin chung
                </h2>
                <div className="info-grid" style={{ marginBottom: '20px' }}>
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
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={formData.duration || ''} 
                                    onChange={e => handleInputChange('duration', e.target.value)}
                                    style={{ padding: '4px', width: '90%' }}
                                />
                            ) : (
                                <span className="badge badge-duration">{meeting.duration || '—'}</span>
                            )}
                        </span>
                    </div>

                    <div className="info-item">
                        <span className="info-label">Team</span>
                        <span className="info-value">
                            {isEditing ? (
                                <select 
                                    value={formData.team || ''} 
                                    onChange={e => handleInputChange('team', e.target.value)}
                                    style={{ padding: '4px', width: '90%' }}
                                >
                                    <option value="">— Chọn —</option>
                                    {teamsList.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            ) : (
                                meeting.team ? <span className="badge badge-team">{meeting.team}</span> : '—'
                            )}
                        </span>
                    </div>

                    <div className="info-item">
                        <span className="info-label">Leader tham gia</span>
                        <span className="info-value">
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={formData.leader_names || ''} 
                                    onChange={e => handleInputChange('leader_names', e.target.value)}
                                    style={{ padding: '4px', width: '90%' }}
                                />
                            ) : (
                                meeting.leader_names || '—'
                            )}
                        </span>
                    </div>

                    <div className="info-item">
                        <span className="info-label">Customer ID</span>
                        <span className="info-value">
                            {isEditing ? (
                                <select 
                                    value={formData.customer_id || ''} 
                                    onChange={e => handleInputChange('customer_id', e.target.value)}
                                    style={{ padding: '4px', width: '90%' }}
                                >
                                    <option value="">— Chọn —</option>
                                    {customersList.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            ) : (
                                meeting.customer_id || '—'
                            )}
                        </span>
                    </div>

                    <div className="info-item">
                        <span className="info-label">Project ID</span>
                        <span className="info-value">
                            {isEditing ? (
                                <select 
                                    value={formData.project_id || ''} 
                                    onChange={e => handleInputChange('project_id', e.target.value)}
                                    style={{ padding: '4px', width: '90%' }}
                                >
                                    <option value="">— Chọn —</option>
                                    {projectsList.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            ) : (
                                meeting.project_id || '—'
                            )}
                        </span>
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

            <div className="card">
                <h2 style={{ fontSize: 16, color: '#8B0000', marginBottom: 16, fontWeight: 700 }}>
                    📝 Tóm tắt nội dung cuộc họp
                </h2>
                <div className="summary-box">
                    {isEditing ? (
                        <textarea 
                            rows={6}
                            value={formData.summary || ''} 
                            onChange={e => handleInputChange('summary', e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', lineHeight: '1.5', fontFamily: 'inherit' }}
                        />
                    ) : (
                        meeting.summary || 'Chưa có nội dung tóm tắt.'
                    )}
                </div>
            </div>
        </div>
    );
}

export default MeetingDetail;