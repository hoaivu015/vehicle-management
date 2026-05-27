import React, { useState, useEffect } from 'react';
import './Showroom.css';

export function SellCarPage() {
  const [formStep, setFormStep] = useState<number>(1);
  const [carModel, setCarModel] = useState<string>('vf8');
  const [year, setYear] = useState<string>('2024');
  const [km, setKm] = useState<string>('Dưới 10.000 km');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('NHẬN BÁO GIÁ MIỄN PHÍ NGAY');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Stats Counters
  const [carsCounter, setCarsCounter] = useState<number>(0);
  const [billCounter, setBillCounter] = useState<number>(0);

  // FAQ Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  // Background cross-fade state
  const [bgImage, setBgImage] = useState<string>('assets/cars/vf8.jpg');
  const [prevBgImage, setPrevBgImage] = useState<string>('');
  const [fadeActive, setFadeActive] = useState<boolean>(false);

  // Background change helper on carModel change
  const handleCarModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCarModel(val);

    const modelImages: Record<string, string> = {
      'vf3': 'assets/cars/vf3.jpg',
      'vf5': 'assets/cars/vf5.jpg',
      'vf6': 'assets/cars/vf6.jpg',
      'vf7': 'assets/cars/vf7.jpg',
      'vf8': 'assets/cars/vf8.jpg',
      'vf9': 'assets/cars/vf9.jpg',
      'vfe34': 'assets/cars/vfe34.jpg',
      'lux-a': 'assets/cars/lux-a.jpg',
      'fadil': 'assets/cars/fadil.jpg'
    };

    const newImg = modelImages[val];
    if (newImg) {
      setPrevBgImage(bgImage);
      setBgImage(newImg);
      setFadeActive(true);
      setTimeout(() => setFadeActive(false), 1200);
    }
  };

  // Helper function to animate counters
  const animateValue = (start: number, end: number, duration: number, setValue: (val: number) => void) => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setValue(Math.floor(easeOutQuart * (end - start) + start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  // Intersection Observer for Counters & Scroll Reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          if (entry.target.id === 'social-proof') {
            animateValue(0, 1245, 2000, setCarsCounter);
            animateValue(0, 50, 2000, setBillCounter);
          }
        }
      });
    }, { threshold: 0.15 });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Send Lead to Telegram
  const handlePricingSubmit = async () => {
    if (!customerPhone) {
      alert('Vui lòng điền Số điện thoại để nhận định giá sơ bộ!');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('⏳ ĐANG ĐỊNH GIÁ AI...');

    const modelNames: Record<string, string> = {
      'vf8': 'VinFast VF 8',
      'vf3': 'VinFast VF 3',
      'vf5': 'VinFast VF 5',
      'vf6': 'VinFast VF 6',
      'vf7': 'VinFast VF 7',
      'vf9': 'VinFast VF 9',
      'vfe34': 'VinFast VF e34',
      'lux-a': 'VinFast Lux A',
      'fadil': 'VinFast Fadil'
    };

    const carName = modelNames[carModel] || carModel;

    const TELEGRAM_TOKEN = '8354150269:AAF2da1-GZAXNgDVplWot053UDETG7CX5ss';
    const TELEGRAM_CHAT_ID = '2117317097';

    const message = `
<b>🚀 YÊU CẦU BÁO GIÁ THU MUA MỚI (AI APP)</b>
--------------------------
🚗 <b>Dòng xe cũ:</b> ${carName}
📅 <b>Năm sản xuất:</b> ${year}
🛣️ <b>Số Odo:</b> ${km}
📞 <b>Số điện thoại:</b> <a href="tel:${customerPhone}">${customerPhone}</a>
--------------------------
⏰ <b>Gửi lúc:</b> ${new Date().toLocaleString('vi-VN')}
    `;

    const params = new URLSearchParams({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: 'true'
    });

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?${params.toString()}`);
      if (response.ok) {
        setSubmitStatus('✅ ĐÃ GỬI THÀNH CÔNG!');
        setTimeout(() => {
          setSubmitStatus('NHẬN BÁO GIÁ MIỄN PHÍ NGAY');
          setCustomerPhone('');
          setFormStep(1); // Reset step
          setIsSubmitting(false);
        }, 2500);
      } else {
        throw new Error('Telegram API error');
      }
    } catch (err) {
      console.error(err);
      setSubmitStatus('❌ LỖI GỬI. HÃY GỌI HOTLINE!');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="showroom-root bg-[#F3F6FC]">
      {/* 🔮 CANVAS NỀN DI CHUYỂN NGẦM */}
      <div className="ambient-canvas-base">
        <div className="ambient-light light-1"></div>
        <div className="ambient-light light-2"></div>
        <div className="ambient-light light-3"></div>
      </div>

      {/* 💊 FLOATING NAV CAPSULE */}
      <header className="floating-nav-capsule" id="nav-capsule">
        <a href="/" className="nav-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          AUTO28
        </a>
        <nav className="nav-links">
          <a href="/" className="nav-link">Mua xe cũ</a>
          <a href="#values" className="nav-link">Lợi ích</a>
          <a href="#process" className="nav-link">Quy trình</a>
          <a href="#faq" className="nav-link">Giải đáp</a>
        </nav>
        <a href="tel:0888813838" className="btn-nav-hotline">
          Hotline
        </a>
      </header>

      {/* ⚡ SECTION 1: HERO & EXCLUSIVE SELLING FORM */}
      <section id="hero" className="hero">
        <div className="hero__bg" style={{ zIndex: -2 }}>
          {bgImage && (
            <img 
              src={bgImage} 
              alt="background" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                inset: 0,
                opacity: fadeActive ? 0.35 : 0.35,
                transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: -1
              }}
            />
          )}
          {prevBgImage && fadeActive && (
            <img 
              src={prevBgImage} 
              alt="background" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                inset: 0,
                opacity: 0,
                transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: -2
              }}
            />
          )}
        </div>
        <div className="hero__overlay"></div>
        <div className="hero__bokeh" id="hero-bokeh"></div>

        <div className="hero__content">
          <div className="hero__text">
            <span className="hero__badge">ĐỊNH GIÁ TRỰC TUYẾN · THU MUA TẬN NHÀ</span>
            <h1 className="hero__headline">
              Định Giá Xe Cũ Trong 10 Phút –<br />
              <span className="text-gradient">Thu Mua Cao Hơn Thị Trường 10-20 Triệu.</span>
            </h1>
            <p className="hero__sub">
              Không ép giá. Không thủ tục rườm rà. Nhận tiền mặt hoặc chuyển khoản ngay sau khi chốt giao dịch.
            </p>
            <div className="hero__trust-badge">
              Đã giải ngân hơn 50 tỷ VNĐ cho 1.245+ chủ xe VinFast
            </div>
          </div>

          {/* EXCLUSIVE TWO-STEP MORPHING FORM */}
          <div className="hero__form-wrapper">
            <div className="hero__form-glass" id="pricing-form">
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--color-text-primary)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)', paddingBottom: '0.875rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                📊 Biết Giá Xe Chỉ Với 3 Thông Tin
              </div>

              {formStep === 1 ? (
                /* STEP 1: CONFIGURE VEHICLE */
                <div className="form-step fade-in" id="sell-step-1">
                  <div className="form-group">
                    <label htmlFor="car-model">Dòng xe của bạn</label>
                    <select id="car-model" name="car-model" value={carModel} onChange={handleCarModelChange}>
                      <option value="vf8">VinFast VF 8</option>
                      <option value="vf3">VinFast VF 3</option>
                      <option value="vf5">VinFast VF 5</option>
                      <option value="vf6">VinFast VF 6</option>
                      <option value="vf7">VinFast VF 7</option>
                      <option value="vf9">VinFast VF 9</option>
                      <option value="vfe34">VinFast VF e34</option>
                      <option value="lux-a">VinFast Lux A</option>
                      <option value="fadil">VinFast Fadil</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="year">Năm sản xuất</label>
                      <select id="year" name="year" value={year} onChange={(e) => setYear(e.target.value)}>
                        <option>2026</option>
                        <option>2025</option>
                        <option>2024</option>
                        <option>2023</option>
                        <option>2022</option>
                        <option>2021</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="km">Số KM đã đi</label>
                      <select id="km" name="km" value={km} onChange={(e) => setKm(e.target.value)}>
                        <option>Dưới 10.000 km</option>
                        <option>10.000 – 30.000 km</option>
                        <option>30.000 – 60.000 km</option>
                        <option>Trên 60.000 km</option>
                      </select>
                    </div>
                  </div>
                  <button id="btn-next-step" className="btn-cta" type="button" onClick={() => setFormStep(2)}>
                    NHẬN BÁO GIÁ NGAY ➜
                  </button>
                </div>
              ) : (
                /* STEP 2: CAPTURE LEAD */
                <div className="form-step fade-in" id="sell-step-2">
                  <button type="button" className="btn-back-step" id="btn-prev-step" onClick={() => setFormStep(1)}>
                    ← Quay lại
                  </button>
                  
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', lineHeight: 1.5, color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textAlign: 'left' }}>
                    Nhận ngay biên độ giá dự kiến trong vòng 2 phút qua Zalo, cam kết bảo mật thông tin khách hàng.
                  </p>
                  
                  <div className="form-group">
                    <label htmlFor="customer-phone">Số điện thoại nhận báo giá</label>
                    <input 
                      type="tel" 
                      id="customer-phone" 
                      name="customer-phone" 
                      placeholder="Ví dụ: 0901234567" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <button 
                    id="cta-primary" 
                    className="btn-cta" 
                    type="button" 
                    style={{ marginTop: '0.5rem', background: submitStatus.includes('THÀNH CÔNG') ? '#16a34a' : '' }}
                    onClick={handlePricingSubmit}
                    disabled={isSubmitting}
                  >
                    {submitStatus}
                  </button>
                </div>
              )}

              <div className="form-disclaimer">
                <span>✓ Định giá nhanh</span>
                <span>✓ Thu mua tận nhà 0đ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💎 SECTION 2: VALUE PROPOSITIONS */}
      <section id="values" className="ai-commitments">
        <div className="section-header reveal">
          <h2>Tại sao nên bán xe cho Auto28?</h2>
          <p style={{ maxWidth: '44rem', margin: '0.5rem auto 0' }}>
            Chúng tôi không chỉ mua một chiếc xe, chúng tôi mua sự hài lòng và xây dựng mối quan hệ tin cậy lâu dài với khách hàng. Đừng vội bán xe khi chưa nhận được đề xuất giá từ Auto28!
          </p>
        </div>
        <div className="commitments-grid reveal-stagger">
          <div className="medium-glass-card reveal">
            <span className="card-icon">📈</span>
            <h3>Định giá chuẩn xác – Thu mua cao hơn từ 10 - 20 triệu</h3>
            <p>Nói không với chiêu trò báo giá ảo khi gọi điện rồi ép giá khi xem xe. Auto28 định giá dựa trên đúng giá trị thực tế của xe, tối ưu lợi nhuận cho bạn bằng cách cắt giảm toàn bộ chi phí trung gian.</p>
          </div>
          <div className="medium-glass-card reveal">
            <span className="card-icon">🏠</span>
            <h3>Thẩm định tại nhà – Bảo mật thông tin tuyệt đối</h3>
            <p>Không cần lái xe đi lòng vòng khảo giá dưới trời nắng. Kỹ thuật viên sẽ đến tận nhà, cơ quan kiểm tra miễn phí. Cam kết bảo mật thông tin cá nhân và tài sản 100%, tránh cuộc gọi rác.</p>
          </div>
          <div className="medium-glass-card reveal">
            <span className="card-icon">💸</span>
            <h3>Giải ngân chuyển khoản ngay lập tức trong 5 phút</h3>
            <p>Hỗ trợ xoay vòng vốn gấp. Ngay sau khi ký hợp đồng mua bán hợp pháp tại văn phòng công chứng, Auto28 sẽ chuyển khoản 100% số tiền trong đúng 5 phút. Tiền nổi tài khoản – bàn giao xe.</p>
          </div>
        </div>
      </section>

      {/* 👥 SECTION 3: SOCIAL PROOF */}
      <section id="social-proof" className="social-proof">
        <div className="counter-grid reveal">
          <div className="counter-item">
            <span className="counter-number">{carsCounter.toLocaleString('vi-VN')}+</span>
            <span className="counter-label">Xe VinFast Đã Thu Mua</span>
          </div>
          <div className="counter-item">
            <span className="counter-number">{billCounter} Tỷ+</span>
            <span className="counter-label">VNĐ Đã Giải Ngân Cho Chủ Xe</span>
          </div>
        </div>

        {/* Testimonial Slider */}
        <div className="testimonial-slider-container reveal">
          <div className="testimonial-slider">
            <div className="testimonial-card">
              <p className="testimonial-text">
                &quot;Tôi bán chiếc Lux A 2021, tưởng thủ tục sẽ rất rườm rà vì xe đang trả góp. Ai ngờ anh em Auto28 làm xong tất toán ngân hàng chỉ trong một buổi chiều. Giá tốt hơn showroom kế bên 15 triệu!&quot;
              </p>
              <div>
                <div className="testimonial-author">Anh Hoàng Minh</div>
                <div className="testimonial-role">Chủ xe VinFast Lux A 2.0 · Quận 7, TP.HCM</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔢 SECTION 4: PROCESS */}
      <section id="process" className="process">
        <div className="section-header reveal">
          <h2>Quy Trình Thu Mua 4 Bước &quot;Không Chờ Đợi&quot; tại Auto 28</h2>
          <p>Tối giản tối đa các công đoạn thủ tục, mang lại trải nghiệm nhanh chóng và thảnh thơi tuyệt đối.</p>
        </div>
        <div className="process-steps" id="process-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', maxWidth: '72rem', margin: '0 auto 3rem' }}>
          <div className="step step-highlight-blue reveal">
            <div className="step-icon">1</div>
            <h3>Gửi Thông Tin Xe</h3>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-blue)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bước 1: 2 Phút</p>
            <p>Điền nhanh 3 thông tin dòng xe, năm sản xuất, số KM và gửi yêu cầu.</p>
          </div>
          <div className="step reveal">
            <div className="step-icon">2</div>
            <h3>Thẩm Định Miễn Phí</h3>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bước 2: Tận Nơi</p>
            <p>Kỹ thuật viên đến tận nhà hoặc cơ quan kiểm định miễn phí theo lịch hẹn của bạn.</p>
          </div>
          <div className="step reveal">
            <div className="step-icon">3</div>
            <h3>Chốt Giá & Ký HĐ</h3>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bước 3: 30 Phút</p>
            <p>Thống nhất giá cả dựa trên thực tế và tiến hành ký hợp đồng mua bán công chứng hợp pháp.</p>
          </div>
          <div className="step step-highlight-pink reveal">
            <div className="step-icon">4</div>
            <h3>Nhận Tiền & Bàn Giao</h3>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#EC4899', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bước 4: 5 Phút</p>
            <p>Chuyển khoản toàn bộ 100% giá trị xe ngay lập tức, hoàn tất thủ tục và bàn giao xe.</p>
          </div>
        </div>
        <div className="reveal" style={{ textAlign: 'center' }}>
          <a href="#hero" className="btn-cta btn-bottom-cta" style={{ display: 'inline-flex', textDecoration: 'none', width: 'auto', minWidth: '320px', padding: '0 2rem', borderRadius: '9999px', height: '48px', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800 }}>
            Đặt lịch thẩm định xe tại nhà ngay
          </a>
        </div>
      </section>

      {/* ❓ SECTION 5: FAQ ACCORDION */}
      <section id="faq" className="faq">
        <div className="section-header reveal">
          <h2>Giải đáp thắc mắc người bán xe cũ</h2>
        </div>
        <div className="faq-container">
          {[
            {
              q: 'Xe đang vay trả góp ngân hàng có bán được không?',
              a: 'Hoàn toàn được! Auto28 hỗ trợ tất toán toàn bộ dư nợ khoản vay ngân hàng hoặc hợp đồng vay tài chính VinFast Finance chỉ trong 1 giờ, rút hồ sơ xe bản gốc nhanh chóng để làm hợp đồng mua bán sang tên hợp pháp.'
            },
            {
              q: 'Tôi có mất chi phí kiểm định nếu không đồng ý bán xe?',
              a: 'Tuyệt đối KHÔNG. Mọi hoạt động tư vấn, định giá và kiểm tra xe tận nơi (kể cả kiểm định tận nhà) đều hoàn toàn MIỄN PHÍ 100%. Bạn chỉ bán xe khi thực sự hài lòng với mức giá thu mua cuối cùng.'
            },
            {
              q: 'Quy trình xử lý hợp đồng thuê pin xe điện thế nào?',
              a: 'Auto28 đã xây dựng quy trình phối hợp trực tiếp với các trung tâm dịch vụ VinFast để xử lý chuyển nhượng hợp đồng thuê pin. Bạn chỉ cần ký ủy quyền mua bán xe cũ, Auto28 sẽ đại diện hoàn tất các thủ tục chuyển đổi pin cho chủ xe mới.'
            },
            {
              q: 'Xe điện VinFast bán lại có bị mất giá nhiều không?',
              a: 'Nhờ có quỹ thu mua chuyên biệt dành riêng cho xe điện và hệ sinh thái khách hàng B2B/B2C rộng lớn, Auto28 luôn tự tin đưa ra mức giá thu mua cao hơn mặt bằng chung thị trường tự do từ 10 - 20 triệu VNĐ cho các dòng xe điện VinFast.'
            }
          ].map((item, idx) => (
            <div key={idx} className={`faq-item reveal ${openFaqIdx === idx ? 'open' : ''}`}>
              <div className="faq-question" onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}>
                {item.q}
                <i className="faq-icon">↓</i>
              </div>
              <div 
                className="faq-answer" 
                style={{ 
                  maxHeight: openFaqIdx === idx ? '500px' : '0px', 
                  transition: 'max-height 0.4s ease',
                  paddingBottom: openFaqIdx === idx ? '1.5rem' : '0'
                }}
              >
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 💻 BOTTOM CALL-TO-ACTION */}
      <section id="bottom-cta" className="reveal" style={{ padding: '4rem 1.5rem 6rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', background: 'var(--color-surface-glass)', border: '1px solid var(--border-card)', borderRadius: '2rem', padding: '3rem 2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '26px', lineHeight: 1.2, letterSpacing: '-0.025em', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
            Đừng bán xe khi chưa nhận báo giá từ chúng tôi.
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: '38rem', marginLeft: 'auto', marginRight: 'auto' }}>
            Tiết kiệm thời gian khảo giá khắp nơi. Nhận ngay đề xuất thu mua tối ưu nhất hoàn toàn miễn phí ngay hôm nay.
          </p>
          <a href="#hero" className="btn-cta btn-bottom-cta" style={{ display: 'inline-flex', textDecoration: 'none', width: 'auto', minWidth: '260px', margin: '0 auto' }}>
            Định giá xe miễn phí ngay
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '3rem 2rem', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-secondary)', fontSize: '0.85rem', borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <a href="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.03em', color: 'var(--color-text-primary)', textShadow: '0 0 12px rgba(79, 70, 229, 0.1)' }}>
            AUTO28
          </a>
        </div>
        <p>© 2024 Auto28. Chuyên định giá AI và thu mua xe điện VinFast cũ uy tín toàn quốc. <br />
           Địa chỉ Showroom: <a href="#location" style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 600 }}>8F Đường Trịnh Hoài Đức, Tăng Nhơn Phú, Quận 9, TP. Hồ Chí Minh</a><br /> 
           Hotline thu mua: <a href="tel:0888813838" style={{ color: 'var(--color-accent-blue)', fontWeight: 700, textDecoration: 'none' }}>0888.81.38.38</a> | 
           Fanpage: <a href="https://www.facebook.com/otoluotsaigon9/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent-indigo)', textDecoration: 'none', fontWeight: 600 }}>Ô Tô Lướt Sài Gòn</a>
        </p>
      </footer>
    </div>
  );
}
