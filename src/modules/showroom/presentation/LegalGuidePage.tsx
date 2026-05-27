import { useState } from 'react';
import './ShowroomGuide.css';

export function LegalGuidePage() {
  const [checklist, setChecklist] = useState({
    carPaper: false,
    registrationBook: false,
    idCard: false,
    marriagePaper: false
  });

  const handleCheckboxChange = (key: keyof typeof checklist) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="showroom-root bg-[#f4f7f6]">
      <div className="container" style={{ padding: '80px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ marginBottom: '80px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '24px', color: 'var(--primary)' }}>
            Chuẩn Bị Gì <br />Trước Khi Bán Ô Tô?
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#444' }}>
            Hướng dẫn chuẩn bị hồ sơ pháp lý chuẩn xác, nhanh gọn cho cá nhân.
          </p>
        </header>

        <div className="doc-grid">
          {/* Cột 1: Hồ sơ về Xe */}
          <div className="original-card">
            <div className="card-header">
              <span style={{ fontSize: '2.5rem' }}>🚗</span>
              <h2>Hồ sơ về Xe</h2>
            </div>
            <div className="card-content">
              <ul>
                <li>
                  <span>1.</span> 
                  <span><b>Giấy đăng ký xe (Cà vẹt)</b> bản gốc.
                    <br /><small style={{ color: '#666' }}>Trường hợp xe đang vay ngân hàng: Cần giấy biên nhận còn hiệu lực và bản sao cà vẹt có xác nhận của ngân hàng.</small>
                  </span>
                </li>
                <li>
                  <span>2.</span> 
                  <span><b>Sổ đăng kiểm</b> bản gốc, còn hiệu lực.
                    <br /><small style={{ color: '#666' }}>Kiểm tra kỹ ngày hết hạn tại mục &quot;Có hiệu lực đến hết ngày&quot;. Xe quá hạn sẽ bị phạt nặng khi lưu thông.</small>
                  </span>
                </li>
                <li>
                  <span>3.</span> 
                  <span><b>Bảo hiểm</b> trách nhiệm dân sự.
                    <br /><small style={{ color: '#666' }}>Nên còn hạn trên 1 tháng để thuận tiện cho chủ mới.</small>
                  </span>
                </li>
                <li><span>4.</span> <span><b>Hợp đồng ủy quyền</b> (Nếu bạn không phải chính chủ đứng tên trên cà vẹt).</span></li>
              </ul>
            </div>
          </div>

          {/* Cột 2: Hồ sơ về Chủ Xe */}
          <div className="original-card">
            <div className="card-header">
              <span style={{ fontSize: '2.5rem' }}>👤</span>
              <h2>Hồ sơ về Chủ Xe</h2>
            </div>
            <div className="card-content">
              <ul>
                <li>
                  <span>1.</span> 
                  <span><b>CCCD gắn chip</b> của cả vợ và chồng (nếu đã kết hôn) và của bên mua.
                    <br /><small style={{ color: '#666' }}>Đảm bảo thẻ không bị nứt, vỡ, mờ số hoặc hết hạn sử dụng.</small>
                  </span>
                </li>
                <li>
                  <span>2.</span> 
                  <span><b>Giấy tờ hôn nhân:</b>
                    <br />• Nếu độc thân: Giấy xác nhận tình trạng hôn nhân (cấp trong vòng 6 tháng).
                    <br />• Nếu đã kết hôn: Giấy đăng ký kết hôn.
                    <br />• Nếu đã ly hôn/tử tuất: Bản án ly hôn hoặc giấy chứng tử kèm xác nhận tình trạng hiện tại.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CHI TIẾT TỪNG LOẠI */}
        <div style={{ margin: '60px 0' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '40px' }}>Chi Tiết Cần Lưu Ý</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div style={{ background: '#fff', padding: '30px', border: '2px solid #003366', borderRadius: '12px' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '15px' }}>🔍 Kiểm tra Cà vẹt & Đăng kiểm</h3>
              <p style={{ fontSize: '1rem', color: '#444' }}>
                Thông tin trên giấy tờ phải <b>khớp hoàn toàn</b> với số khung, số máy thực tế của xe. Bất kỳ sự sai lệch nào cũng sẽ khiến phòng công chứng từ chối thực hiện giao dịch.
              </p>
            </div>
            <div style={{ background: '#fff', padding: '30px', border: '2px solid #003366', borderRadius: '12px' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '15px' }}>✍️ Quy định về chữ ký</h3>
              <p style={{ fontSize: '1rem', color: '#444' }}>
                Nếu xe là tài sản hình thành trong thời kỳ hôn nhân, <b>bắt buộc cả hai vợ chồng</b> phải có mặt để ký tên và lăn tay. Nếu một người vắng mặt, phải có giấy ủy quyền được công chứng hợp lệ.
              </p>
            </div>
          </div>
        </div>
        {/* QUY TRÌNH */}
        <div style={{ background: '#e1f0ff', padding: '60px 40px', borderRadius: '20px', border: '2px solid #003366', marginBottom: '60px' }}>
          <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '40px' }}>Quy Trình Tại Phòng Công Chứng</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontWeight: 'bold' }}>1</div>
              <h4 style={{ marginBottom: '10px' }}>Nộp hồ sơ</h4>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>Chuyên viên kiểm tra tính pháp lý của các bản gốc.</p>
            </div>
            <div style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontWeight: 'bold' }}>2</div>
              <h4 style={{ marginBottom: '10px' }}>Soạn thảo</h4>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>In hợp đồng mua bán xe theo mẫu quy định của Nhà nước.</p>
            </div>
            <div style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontWeight: 'bold' }}>3</div>
              <h4 style={{ marginBottom: '10px' }}>Ký tên & Lăn tay</h4>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>Các bên đọc lại nội dung và thực hiện ký, lăn tay trực tiếp.</p>
            </div>
            <div style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontWeight: 'bold' }}>4</div>
              <h4 style={{ marginBottom: '10px' }}>Đóng dấu</h4>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>Công chứng viên ký xác nhận và đóng dấu hoàn tất.</p>
            </div>
          </div>
        </div>
        {/* Thanh Lưu ý màu đỏ */}
        <div className="red-note" style={{ background: '#c62828', color: 'white', padding: '24px 40px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '60px' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>Lưu ý</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.4' }}>
            Công chứng viên sẽ kiểm tra tính hợp pháp của các giấy tờ.<br />
            Vui lòng mang theo <b>BẢN GỐC</b> của tất cả hồ sơ trên để đối chiếu.<br />
            Mọi giấy tờ phải còn nguyên vẹn, không tẩy xóa, rách nát.
          </p>
        </div>

        {/* Clipboard Checklist */}
        <div className="clipboard">
          <h2 className="clip-title">Danh Sách Kiểm Tra Cuối Cùng</h2>
          
          <div className="clip-row" onClick={() => handleCheckboxChange('carPaper')}>
            <input 
              type="checkbox" 
              checked={checklist.carPaper} 
              onChange={() => {}} 
              style={{ width: '24px', height: '24px', cursor: 'pointer' }}
            />
            <span style={{ marginLeft: '12px' }}>Cà vẹt xe (Bản gốc)</span>
          </div>

          <div className="clip-row" onClick={() => handleCheckboxChange('registrationBook')}>
            <input 
              type="checkbox" 
              checked={checklist.registrationBook} 
              onChange={() => {}} 
              style={{ width: '24px', height: '24px', cursor: 'pointer' }}
            />
            <span style={{ marginLeft: '12px' }}>Sổ đăng kiểm (Còn thời hạn)</span>
          </div>

          <div className="clip-row" onClick={() => handleCheckboxChange('idCard')}>
            <input 
              type="checkbox" 
              checked={checklist.idCard} 
              onChange={() => {}} 
              style={{ width: '24px', height: '24px', cursor: 'pointer' }}
            />
            <span style={{ marginLeft: '12px' }}>CCCD/CMND (Còn hiệu lực)</span>
          </div>

          <div className="clip-row" onClick={() => handleCheckboxChange('marriagePaper')}>
            <input 
              type="checkbox" 
              checked={checklist.marriagePaper} 
              onChange={() => {}} 
              style={{ width: '24px', height: '24px', cursor: 'pointer' }}
            />
            <span style={{ marginLeft: '12px' }}>Giấy tờ hôn nhân (Kết hôn / Xác nhận độc thân)</span>
          </div>
          
          <p style={{ textAlign: 'center', marginTop: '40px', fontWeight: 900, color: '#003366', fontSize: '1.1rem', textTransform: 'uppercase' }}>
            Sẵn sàng giao dịch
          </p>
        </div>

        <footer style={{ textAlign: 'center', marginTop: '80px', paddingBottom: '40px', color: '#666' }}>
          <p>© 2024 Auto28. Hotline hỗ trợ: 0888.81.38.38</p>
        </footer>
      </div>
    </div>
  );
}
