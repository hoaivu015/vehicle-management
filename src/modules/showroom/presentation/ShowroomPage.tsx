import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/src/shared/infrastructure/supabase';
import { Vehicle } from '@/src/shared/domain/types';
import { VehicleStatus } from '@/src/shared/domain/constants';
import './Showroom.css';

export function ShowroomPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Search state
  const [searchModel, setSearchModel] = useState<string>('all');
  const [searchPrice, setSearchPrice] = useState<string>('all');
  const [appliedSearch, setAppliedSearch] = useState<{ model: string; price: string }>({ model: 'all', price: 'all' });

  // Stats Counters
  const [carsCounter, setCarsCounter] = useState<number>(0);
  const [billCounter, setBillCounter] = useState<number>(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(3); // Center
  const [leadName, setLeadName] = useState<string>('');
  const [leadPhone, setLeadPhone] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('NHẬN ƯU ĐÃI NGAY ➜');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Testimonial Slider State
  const [activeDot, setActiveDot] = useState<number>(0);
  const testimonialSliderRef = useRef<HTMLDivElement>(null);

  // Navigation state
  const [isNavVisible] = useState<boolean>(true);
  const [isStickyVisible, setIsStickyVisible] = useState<boolean>(false);

  // FAQ Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  // Background cross-fade state
  const [bgImage, setBgImage] = useState<string>('');
  const [prevBgImage, setPrevBgImage] = useState<string>('');
  const [fadeActive, setFadeActive] = useState<boolean>(false);

  // Dynamic configurations state
  const [config, setConfig] = useState({
    phone: '0888813838',
    address: '8F Đường Trịnh Hoài Đức, Tăng Nhơn Phú, Quận 9, TP. Hồ Chí Minh',
    fanpage_url: 'https://www.facebook.com/otoluotsaigon9/',
    telegram_token: '8354150269:AAF2da1-GZAXNgDVplWot053UDETG7CX5ss',
    telegram_chat_id: '2117317097',
    hotline_number: '0888.81.38.38',
    map_iframe_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.5784249693193!2d106.77618710000002!3d10.843538899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527b0785d11ab%3A0x8437185ef2074ae3!2sAuto28!5e0!3m2!1svi!2sus!4v1778383502219!5m2!1svi!2sus'
  });

  // Fetch dynamic landing page config
  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data, error } = await supabase
          .from('landingpage_config')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        if (error) {
          console.warn('Error fetching landingpage_config in showroom:', error.message);
          return;
        }

        if (data) {
          setConfig({
            phone: data.phone || '0888813838',
            address: data.address || '8F Đường Trịnh Hoài Đức, Tăng Nhơn Phú, Quận 9, TP. Hồ Chí Minh',
            fanpage_url: data.fanpage_url || 'https://www.facebook.com/otoluotsaigon9/',
            telegram_token: data.telegram_token || '8354150269:AAF2da1-GZAXNgDVplWot053UDETG7CX5ss',
            telegram_chat_id: data.telegram_chat_id || '2117317097',
            hotline_number: data.hotline_number || '0888.81.38.38',
            map_iframe_url: data.map_iframe_url || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.5784249693193!2d106.77618710000002!3d10.843538899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527b0785d11ab%3A0x8437185ef2074ae3!2sAuto28!5e0!3m2!1svi!2sus!4v1778383502219!5m2!1svi!2sus'
          });
        }
      } catch (err) {
        console.error('Failed to load dynamic config in showroom:', err);
      }
    }
    fetchConfig();
  }, []);

  // Fetch cars from Supabase
  useEffect(() => {
    async function fetchVehicles() {
      try {
        let { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .neq('status', 'SOLD') // Chỉ hiện xe chưa bán
          .or('show_on_landing.is.null,show_on_landing.eq.true')
          .order('id', { ascending: false });

        // Robust fallback: If the advanced query with show_on_landing filters fails for any reason (e.g. column doesn't exist yet)
        if (error) {
          console.warn('Advanced landing page query failed, executing robust fallback without show_on_landing column:', error.message);
          const fallbackResult = await supabase
            .from('vehicles')
            .select('*')
            .neq('status', 'SOLD')
            .order('id', { ascending: false });
          data = fallbackResult.data;
          error = fallbackResult.error;
        }

        if (error) throw error;
        if (data) {
          setVehicles(data as Vehicle[]);
        }
      } catch (err) {
        console.error('Error fetching vehicles from Supabase:', err);
      }
    }
    fetchVehicles();
  }, []);

  // Handle scroll events for nav and sticky footer
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = document.getElementById('hero')?.offsetHeight || 800;
      
      // Sticky footer visible after scrolling half of hero
      setIsStickyVisible(scrollY > heroHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          // Trigger animations
          entry.target.classList.add('visible');
          
          if (entry.target.id === 'social-proof') {
            // Animate counters
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

  // Filter and search vehicles using modern React derived state
  const filteredVehicles = React.useMemo(() => {
    let result = [...vehicles];

    // Filter by tab (activeFilter)
    if (activeFilter !== 'all') {
      if (activeFilter === 'gas') {
        result = result.filter(v => {
          const nameLower = v.name.toLowerCase();
          const codeLower = v.code.toLowerCase();
          return nameLower.includes('lux') || nameLower.includes('fadil') || nameLower.includes(' xăng') || codeLower.includes('lux') || codeLower.includes('fadil') || 
            !['vf3', 'vf 3', 'vf5', 'vf 5', 'vf6', 'vf 6', 'vf7', 'vf 7', 'vf8', 'vf 8', 'vf9', 'vf 9', 'vfe34', 'vf e34'].some(k => nameLower.includes(k));
        });
      } else {
        result = result.filter(v => {
          const nameLower = v.name.toLowerCase();
          const codeLower = v.code.toLowerCase();
          const filterLower = activeFilter.toLowerCase();
          // Support both space and non-space versions (e.g., 'vf3' matches 'vf 3' and 'vf3')
          const filterSpaced = filterLower.startsWith('vf') && filterLower.length > 2 ? `vf ${filterLower.substring(2)}` : filterLower;
          return nameLower.includes(filterLower) || nameLower.includes(filterSpaced) || codeLower.includes(filterLower) || codeLower.includes(filterSpaced);
        });
      }
    }

    // Filter by search model
    if (appliedSearch.model !== 'all') {
      result = result.filter(v => {
        const nameLower = v.name.toLowerCase();
        const codeLower = v.code.toLowerCase();
        const modelLower = appliedSearch.model.toLowerCase();
        const modelSpaced = modelLower.startsWith('vf') && modelLower.length > 2 ? `vf ${modelLower.substring(2)}` : modelLower;
        return nameLower.includes(modelLower) || nameLower.includes(modelSpaced) || codeLower.includes(modelLower) || codeLower.includes(modelSpaced);
      });
    }

    // Filter by search price
    if (appliedSearch.price !== 'all') {
      result = result.filter(v => {
        const price = v.sale_price || 0;
        if (appliedSearch.price === 'under-400') return price < 400;
        if (appliedSearch.price === '400-600') return price >= 400 && price <= 600;
        if (appliedSearch.price === '600-800') return price >= 600 && price <= 800;
        if (appliedSearch.price === 'over-800') return price > 800;
        return true;
      });
    }

    return result;
  }, [vehicles, activeFilter, appliedSearch]);

  // Unified Search Handler
  const handleSearch = () => {
    setAppliedSearch({ model: searchModel, price: searchPrice });

    // Scroll to product grid
    document.getElementById('product-grid-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Testimonial slider scroll listener
  const handleTestimonialScroll = () => {
    const slider = testimonialSliderRef.current;
    if (slider) {
      const index = Math.round(slider.scrollLeft / slider.offsetWidth);
      setActiveDot(index);
    }
  };

  // Background Swap (with cross-fade prevention of white-flash)
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSearchModel(val);

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

  // Open Detail Modal
  const openCarModal = (car: Vehicle) => {
    setSelectedCar(car);
    setRotationAngle(3); // Reset
    setLeadName('');
    setLeadPhone('');
    setSubmitStatus('NHẬN ƯU ĐÃI NGAY ➜');
    setIsSubmitting(false);
    setIsModalOpen(true);
  };

  // Send Lead to Telegram
  const handleLeadSubmit = async () => {
    if (!leadName) {
      alert('Vui lòng nhập Họ tên của bạn!');
      return;
    }
    if (!leadPhone) {
      alert('Vui lòng nhập Số điện thoại liên hệ!');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('⏳ ĐANG GỬI...');

    const TELEGRAM_TOKEN = config.telegram_token;
    const TELEGRAM_CHAT_ID = config.telegram_chat_id;

    const message = `
<b>🔥 YÊU CẦU MUA XE / NHẬN ƯU ĐÃI (APP)</b>
--------------------------
🚗 <b>Dòng xe quan tâm:</b> ${selectedCar?.name}
👤 <b>Họ tên khách hàng:</b> ${leadName}
📞 <b>Số điện thoại khách:</b> <a href="tel:${leadPhone}">${leadPhone}</a>
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
          setIsModalOpen(false);
        }, 1500);
      } else {
        throw new Error('Telegram API error');
      }
    } catch (err) {
      console.error(err);
      setSubmitStatus('❌ LỖI GỬI!');
      setIsSubmitting(false);
    }
  };

  // simulated 360 rotation helper
  const getRotationStyle = () => {
    const rotationAngles: Record<number, number> = {
      1: -30,
      2: -15,
      3: 0,
      4: 15,
      5: 30
    };
    const angle = rotationAngles[rotationAngle] || 0;
    const scale = 1 + Math.abs(rotationAngle - 3) * 0.03;
    return {
      transform: `perspective(1000px) rotateY(${angle}deg) scale(${scale})`,
      transition: 'transform 0.15s ease-out'
    };
  };

  const getRotationText = () => {
    const rotationTexts: Record<number, string> = {
      1: 'Góc 1: Ba phần tư trước',
      2: 'Góc 2: Mặt trước sườn xe',
      3: 'Góc 3: Chính diện xe',
      4: 'Góc 4: Sườn xe sau',
      5: 'Góc 5: Đuôi xe 360°'
    };
    return rotationTexts[rotationAngle] || 'Kéo xoay xe';
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
      <header className={`floating-nav-capsule ${isNavVisible ? '' : 'hidden-nav'}`} id="nav-capsule">
        <a href="/" className="nav-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          AUTO28
        </a>
        <nav className="nav-links">
          <a href="#product-grid-section" className="nav-link">Danh sách xe</a>
          <a href="#ai-commitments" className="nav-link">Cam kết</a>
          <a href="/dinh-gia" className="nav-link">Định giá bán xe</a>
          <a href="#faq" className="nav-link">Giải đáp</a>
        </nav>
        <a href={`tel:${config.phone}`} className="btn-nav-hotline">
          {config.hotline_number}
        </a>
      </header>

      {/* ⚡ SECTION 1: HERO & UNIFIED SEARCH FILTER */}
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

        <div className="hero__content" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '60rem', margin: '0 auto', gap: '1.5rem', position: 'relative', zIndex: 10 }}>
          <div className="hero__text" style={{ maxWidth: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span className="hero__badge">KHO XE CHÍNH HÃNG · GIAO XE TẬN NHÀ</span>
            <h1 className="hero__headline" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.25rem)', lineHeight: 1.15, textAlign: 'center', letterSpacing: '-0.04em' }}>
              Sở Hữu Xe VinFast Lướt Như Mới – <br />
              <span className="text-gradient">Cam Kết 5 Tiêu Chuẩn Vàng Vừa Bàn Giao.</span>
            </h1>
            <p className="hero__sub" style={{ textAlign: 'center', maxWidth: '46rem', marginBottom: '1rem', fontSize: '15px' }}>
              Nguyên bản 100%. Bảo hành chính hãng. Hỗ trợ trả góp 70% giá trị xe. Đổi trả miễn phí trong 7 ngày nếu phát hiện lỗi đâm đụng, ngập nước.
            </p>
            <div className="hero__trust-badge" style={{ marginBottom: '0.5rem' }}>
              Đã bàn giao 1.245+ xe VinFast trên toàn quốc
            </div>
          </div>

          {/* 🚗 HERO CAR IMAGE FLOATING CONTAINER */}
          <div className="hero-image-container">
            <div className="hero-car-glow"></div>
            <img src="assets/cars/hero-vf7.png" alt="VinFast VF7 Plus Premium lướt" className="hero-car-img" />
            <div className="hero-car-shadow"></div>
          </div>

          {/* BENTO FILTER PILL BOX */}
          <div className="bento-filter-pill" style={{ marginTop: 0 }}>
            <div className="filter-item">
              <label htmlFor="search-model">Dòng xe mong muốn</label>
              <select id="search-model" name="search-model" value={searchModel} onChange={handleModelChange}>
                <option value="all">Tất cả các dòng xe</option>
                <option value="vf3">VinFast VF 3</option>
                <option value="vf5">VinFast VF 5</option>
                <option value="vf6">VinFast VF 6</option>
                <option value="vf7">VinFast VF 7</option>
                <option value="vf8">VinFast VF 8</option>
                <option value="vf9">VinFast VF 9</option>
                <option value="vfe34">VinFast VF e34</option>
                <option value="lux-a">VinFast Lux A 2.0</option>
                <option value="fadil">VinFast Fadil</option>
              </select>
            </div>
            <div className="filter-divider"></div>
            <div className="filter-item">
              <label htmlFor="search-price">Khoảng giá phù hợp</label>
              <select id="search-price" name="search-price" value={searchPrice} onChange={(e) => setSearchPrice(e.target.value)}>
                <option value="all">Tất cả mức giá</option>
                <option value="under-400">Dưới 400 triệu</option>
                <option value="400-600">400 - 600 triệu</option>
                <option value="600-800">600 - 800 triệu</option>
                <option value="over-800">Trên 800 triệu</option>
              </select>
            </div>
            <button id="btn-search-trigger" className="btn-filter-submit" type="button" onClick={handleSearch}>
              Tìm Xe Ưng Ý Ngay ➜
            </button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <a href="/dinh-gia" style={{ color: 'var(--color-accent-indigo)', textDecoration: 'none', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.02em' }}>
              💰 BẠN MUỐN BÁN XE? CLICK ĐỂ ĐỊNH GIÁ AI →
            </a>
          </div>
        </div>
      </section>

      {/* 💎 SECTION 2: BENTO GRID: 4 CAM KẾT VÀNG */}
      <section id="ai-commitments" className="ai-commitments">
        <div className="section-header reveal">
          <h2>4 Cam Kết Vàng Chỉ Có Tại Auto 28</h2>
          <p>Hệ thống lưới Bento trắng tinh khôi, cấu trúc bất đối xứng để tạo cảm giác cao cấp như một cuốn catalogue điện tử.</p>
        </div>
        <div className="asymmetric-bento-grid reveal-stagger">
          <div className="bento-card-white bento-span-2 reveal">
            <span className="card-icon">🔍</span>
            <h3>Minh Bạch Lịch Sử – Check Hãng Toàn Quốc</h3>
            <p>Mỗi chiếc VinFast trước khi lên sàn Auto 28 đều phải trải qua quy trình kiểm tra khắt khe. Chúng tôi cam kết bằng văn bản: Không đâm đụng ảnh hưởng đến kết cấu, không ngập nước/thủy kích, không tua đồng hồ Odo. Khách hàng thoải mái mang xe ra hãng hoặc bất kỳ gara nào để check lại.</p>
          </div>
          <div className="bento-card-white bento-span-1 reveal">
            <span className="card-icon">🔋</span>
            <h3>Pin Hoàn Hảo – Sẵn Sàng Lăn Bánh</h3>
            <p>Đối với xe điện VinFast, Auto 28 cung cấp chứng nhận kiểm tra sức khỏe pin (SOH) trên 85%, cập nhật phần mềm mới nhất và hỗ trợ thủ tục chuyển đổi gói thuê pin chính chủ từ VinFast chỉ trong 30 phút.</p>
          </div>
          <div className="bento-card-white bento-span-1 reveal">
            <span className="card-icon">💸</span>
            <h3>Trả Góp 70% – Thủ Tục Trong Ngày</h3>
            <p>Liên kết chặt chẽ với các ngân hàng lớn. Hỗ trợ vay mua xe VinFast lướt với lãi suất ưu đãi, thủ tục xét duyệt nhanh gọn, nhận xe ngay trong ngày.</p>
          </div>
          <div className="bento-card-white bento-span-2 reveal">
            <span className="card-icon">🛡️</span>
            <h3>7 Ngày Trải Nghiệm – Lỗi Là Đổi Trả</h3>
            <p>Để khẳng định chất lượng đầu vào, Auto 28 áp dụng chính sách độc quyền: Khách hàng có 7 ngày chạy thử nghiệm sản phẩm. Nếu phát hiện xe không đúng cam kết ban đầu, chúng tôi hoàn trả 100% tiền cọc không mất phí.</p>
          </div>
        </div>
      </section>

      {/* 👥 SECTION 3: SOCIAL PROOF */}
      <section id="social-proof" className="social-proof">
        <div className="counter-grid reveal">
          <div className="counter-item">
            <span className="counter-number">{carsCounter.toLocaleString('vi-VN')}+</span>
            <span className="counter-label">Xe VinFast Đã Kiểm Định & Giao Xe</span>
          </div>
          <div className="counter-item">
            <span className="counter-number">{billCounter} Tỷ+</span>
            <span className="counter-label">VNĐ Đã Giải Ngân Giao Giao Dịch</span>
          </div>
        </div>

        {/* Testimonial Slider */}
        <div className="testimonial-slider-container reveal">
          <div 
            className="testimonial-slider" 
            ref={testimonialSliderRef}
            onScroll={handleTestimonialScroll}
          >
            <div className="testimonial-card">
              <p className="testimonial-text">
                &quot;Tôi bán chiếc Lux A 2021, tưởng thủ tục sẽ rất rườm rà vì xe đang trả góp. Ai ngờ anh em Auto28 làm xong tất toán ngân hàng chỉ trong một buổi chiều. Giá tốt hơn showroom kế bên 15 triệu!&quot;
              </p>
              <div>
                <div className="testimonial-author">Anh Hoàng Minh</div>
                <div className="testimonial-role">Chủ xe VinFast Lux A 2.0 · Quận 7, TP.HCM</div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                &quot;Tìm xe cũ rất sợ pin chai, nhưng mua VF8 ở đây được cam kết dung lượng pin trên 94%, đầy đủ giấy tờ check hãng. Xe đi cực kỳ êm ái, như xe mới.&quot;
              </p>
              <div>
                <div className="testimonial-author">Chị Lan Anh</div>
                <div className="testimonial-role">Chủ xe VinFast VF 8 · TP. Thủ Đức</div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                &quot;Bán xe cũ cho showroom ngoài hay bị dìm giá, qua bên này có công cụ định giá bằng AI rất minh bạch. Check xe tại nhà, ký công chứng xong tiền về tài khoản ngay lập tức.&quot;
              </p>
              <div>
                <div className="testimonial-author">Anh Tuấn</div>
                <div className="testimonial-role">Chủ xe VinFast Fadil · Bình Dương</div>
              </div>
            </div>
          </div>
          <div className="slider-dots">
            {[0, 1, 2].map(idx => (
              <span key={idx} className={`dot ${activeDot === idx ? 'active' : ''}`} />
            ))}
          </div>
        </div>
      </section>

      {/* 🚗 SECTION 4: FLUID PRODUCT GRID */}
      <section id="product-grid-section" className="product-grid-section">
        <div className="section-header reveal">
          <h2>Kho Xe Điện VinFast Sẵn Giao Ngay</h2>
          <p>Hồ sơ pháp lý đầy đủ, bảo hành chính hãng, bàn giao và giao xe tận hầm chung cư.</p>
        </div>

        {/* Filter pills */}
        <div className="filter-pills reveal">
          <span className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>Tất cả xe</span>
          <span className={`filter-pill ${activeFilter === 'vf3' ? 'active' : ''}`} onClick={() => setActiveFilter('vf3')}>VF 3</span>
          <span className={`filter-pill ${activeFilter === 'vf5' ? 'active' : ''}`} onClick={() => setActiveFilter('vf5')}>VF 5</span>
          <span className={`filter-pill ${activeFilter === 'vf8' ? 'active' : ''}`} onClick={() => setActiveFilter('vf8')}>VF 8</span>
          <span className={`filter-pill ${activeFilter === 'vf9' ? 'active' : ''}`} onClick={() => setActiveFilter('vf9')}>VF 9</span>
          <span className={`filter-pill ${activeFilter === 'gas' ? 'active' : ''}`} onClick={() => setActiveFilter('gas')}>Xe xăng (Lux/Fadil)</span>
        </div>

        {/* Dynamic Product Grid */}
        <div className="fluid-product-grid reveal-stagger" id="cars-grid">
          {filteredVehicles.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
              Không có xe nào đang mở bán phù hợp với tiêu chí tìm kiếm.
            </div>
          ) : (
            filteredVehicles.map(car => (
              <div 
                key={car.id} 
                className="expressive-car-card reveal" 
                onClick={() => openCarModal(car)}
              >
                <div className="card-top">
                  <div className="card-img-container">
                    <img src={car.image_url || 'assets/cars/default.jpg'} alt={car.name} className="card-img" />
                    <div className={`card-badge ${(car.status === VehicleStatus.DEPOSIT_SALE || car.status === VehicleStatus.BANK_DEPOSIT) ? 'bg-orange' : 'bg-emerald'}`}>
                      <span>{(car.status === VehicleStatus.DEPOSIT_SALE || car.status === VehicleStatus.BANK_DEPOSIT) ? 'Đã Nhận Cọc • Đang Kiểm Tra' : 'Sẵn Giao • Đã Check Hãng'}</span>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="card-meta-line">
                      <span className="meta-tag-blue">{car.is_coinvested ? 'CO-INVEST' : 'DÒNG XE'}</span>
                      <span className="meta-tag-gray">ĐỜI {car.year}</span>
                    </div>
                    <h3 className="card-title">{car.name}</h3>
                    
                    <div className="spec-pills">
                      <span className="spec-pill">⏱️ {car.odo ? car.odo.toLocaleString('vi-VN') : '0'} km</span>
                      <span className="spec-pill">🎨 {car.color || 'Chưa cập nhật'}</span>
                      {car.battery_type && car.battery_type !== 'None' ? (
                        <span className="spec-pill">🔋 {car.battery_type}</span>
                      ) : (
                        ['vf3', 'vf5', 'vf6', 'vf7', 'vf8', 'vf9', 'vfe34'].some(k => car.name.toLowerCase().includes(k)) ? (
                          <span className="spec-pill">🔋 Pin Thuê</span>
                        ) : null
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="card-bottom">
                  <div className="price-box">
                    <span className="price-label">Giá bán</span>
                    <span className="price-value">{car.sale_price ? `${car.sale_price} Triệu` : 'Liên hệ'}</span>
                  </div>
                  <button className="btn-card-action btn-detail-trigger" type="button">
                    Xem Ưu Đãi
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 🔢 SECTION 5: PROCESS */}
      <section id="process" className="process">
        <div className="section-header reveal">
          <h2>3 Bước Minh Bạch Nhận Xe Ngay</h2>
        </div>
        <div className="process-steps" id="process-steps">
          <div className="step reveal">
            <div className="step-icon">1</div>
            <h3>Gửi yêu cầu</h3>
            <p>Điền form lựa chọn xe hoặc định giá nhanh trong 2 phút.</p>
          </div>
          <div className="step reveal">
            <div className="step-icon">2</div>
            <h3>Nhận kiểm định & Báo giá</h3>
            <p>Cập nhật bảng giá xe theo AI sát thực tế, hẹn thời gian kiểm định tận nhà.</p>
          </div>
          <div className="step reveal">
            <div className="step-icon">3</div>
            <h3>Ký hồ sơ & Nhận xe</h3>
            <p>Thực hiện ký văn bản pháp lý tại chỗ, thanh toán 100% qua App ngân hàng.</p>
          </div>
        </div>
      </section>

      {/* ❓ SECTION 6: FAQ ACCORDION */}
      <section id="faq" className="faq">
        <div className="section-header reveal">
          <h2>Giải đáp thắc mắc của bạn</h2>
        </div>
        <div className="faq-container">
          {[
            {
              q: 'Thủ tục chuyển nhượng hợp đồng pin xe điện có phức tạp không?',
              a: 'Hoàn toàn không phức tạp. Auto28 phối hợp chặt chẽ trực tiếp với VinFast hỗ trợ trọn gói thủ tục sang tên hợp đồng thuê pin. Bạn chỉ cần ký giấy ủy quyền mua bán xe cũ theo mẫu, toàn bộ phần còn lại chúng tôi sẽ giải quyết trong 24 giờ.'
            },
            {
              q: 'Xe đang vay ngân hàng / trả góp có giao dịch được không?',
              a: 'Hoàn toàn được! Auto28 hỗ trợ tất toán toàn bộ số tiền vay ngân hàng hoặc các khoản vay tài chính liên quan ngay trong ngày, hỗ trợ giải phóng giấy tờ xe bản gốc để tiến hành mua bán đúng luật pháp Việt Nam.'
            },
            {
              q: 'Quy trình kiểm định 176 hạng mục gồm những gì?',
              a: 'Kỹ thuật viên chuyên nghiệp sẽ kiểm định toàn diện từ thân vỏ (nước sơn, độ biến dạng do va chạm), gầm xe, các mạch sạc, chẩn đoán phần mềm bằng máy quét lỗi chuyên dụng VinFast, và đánh giá chi tiết dung lượng pin thực tế.'
            },
            {
              q: 'Mức định giá AI của Auto28 được cập nhật thế nào?',
              a: 'Thuật toán thông minh của chúng tôi quét dữ liệu giao dịch thực tế từ các hội nhóm, sàn xe cũ uy tín trên toàn quốc theo thời gian thực để đưa ra khoảng giá mua/bán sát nhất với giá trị thực của xe điện Việt Nam.'
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

      {/* 📱 STICKY FOOTER MOBILE */}
      <div className={`sticky-footer ${isStickyVisible ? 'visible' : ''}`} id="sticky-cta">
        <a href={`tel:${config.phone}`} className="btn-sticky btn-call">📞 Gọi ngay</a>
        <a href={`https://zalo.me/${config.phone}`} className="btn-sticky btn-zalo" target="_blank" rel="noopener noreferrer">💬 Chat Zalo</a>
      </div>

      {/* 📍 SECTION 7: MAP & ADDRESS SHOWROOM */}
      <section id="location" className="location reveal" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <h2>Ghé thăm Showroom Auto28</h2>
          <p>Đón tiếp trực tiếp khách hàng lái thử xe và hoàn tất hồ sơ trực tiếp tại showroom.</p>
        </div>
        <div className="map-container" style={{ maxWidth: '1000px', margin: '0 auto', borderRadius: '2rem', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          {config.map_iframe_url && (
            <iframe 
              src={config.map_iframe_url} 
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Auto28 Showroom"
            ></iframe>
          )}
        </div>
      </section>

      {/* 💻 MODAL CHI TIẾT XE VỚI KÉN XOAY 360 ĐỘ */}
      {isModalOpen && selectedCar && (
        <div className="expressive-modal open" id="car-modal-view">
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}></div>
          <div className="modal-wrapper">
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            <div className="modal-content-inner">
              
              {/* Left side: 360 View image gallery */}
              <div className="modal-visual-panel">
                <div className="modal-image-wrapper">
                  <img 
                    src={selectedCar.image_url || 'assets/cars/default.jpg'} 
                    alt={selectedCar.name} 
                    className="modal-active-img" 
                    style={getRotationStyle()}
                  />
                </div>
                
                {/* 360° View Pill Container */}
                <div className="view-360-pill-container">
                  <span className="badge-360">360° VIEW</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={rotationAngle} 
                    className="slider-360"
                    onChange={(e) => setRotationAngle(parseInt(e.target.value))}
                  />
                  <span className="label-360-instruction">{getRotationText()}</span>
                </div>
              </div>

              {/* Right side: Car details & lead action */}
              <div className="modal-info-panel">
                <div className="modal-header">
                  <span className="modal-meta-line">DÒNG XE · ĐỜI {selectedCar.year}</span>
                  <h2 className="modal-car-title">{selectedCar.name}</h2>
                  <div className="modal-price-line">
                    <span className="modal-price-label">Giá ưu đãi:</span>
                    <span className="modal-price-value">{selectedCar.sale_price ? `${selectedCar.sale_price} Triệu` : 'Liên hệ'}</span>
                  </div>
                </div>

                <div className="modal-specs-list">
                  <div className="modal-spec-row">
                    <span>⏱️ Số Odo:</span>
                    <strong>{selectedCar.odo ? selectedCar.odo.toLocaleString('vi-VN') : '0'} km</strong>
                  </div>
                  <div className="modal-spec-row">
                    <span>🎨 Màu sơn:</span>
                    <strong>{selectedCar.color || 'Chưa cập nhật'}</strong>
                  </div>
                  <div className="modal-spec-row">
                    <span>🔋 Trạng thái pin:</span>
                    <strong>{selectedCar.battery_type && selectedCar.battery_type !== 'None' ? selectedCar.battery_type : (['vf3', 'vf5', 'vf6', 'vf7', 'vf8', 'vf9', 'vfe34'].some(k => selectedCar.name.toLowerCase().includes(k)) ? 'Pin Thuê' : 'Không có (Xe xăng)')}</strong>
                  </div>
                  <div className="modal-spec-row">
                    <span>📝 Ghi chú:</span>
                    <strong>{selectedCar.notes || 'Không có ghi chú thêm'}</strong>
                  </div>
                  <div className="modal-spec-row">
                    <span>🛡️ Bảo hành:</span>
                    <strong>Cam kết bảo hành chính hãng từ VinFast</strong>
                  </div>
                </div>

                <div className="modal-action-box">
                  <p className="action-box-title" style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    Đăng ký lái thử &amp; Nhận báo giá lăn bánh
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', width: '100%' }}>
                    <input 
                      type="text" 
                      placeholder="Họ và tên của bạn" 
                      className="modal-pill-input"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                    />
                    <input 
                      type="tel" 
                      placeholder="Số điện thoại liên hệ" 
                      className="modal-tel-input"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                    />
                    <button 
                      className="btn-modal-submit" 
                      onClick={handleLeadSubmit}
                      disabled={isSubmitting}
                      style={{ background: submitStatus.includes('THÀNH CÔNG') ? '#16a34a' : '' }}
                    >
                      {submitStatus}
                    </button>
                  </div>
                  <p className="action-box-note" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    ✓ Auto28 cam kết tư vấn miễn phí, không ép giá.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '3rem 2rem', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-secondary)', fontSize: '0.85rem', borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <a href="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.03em', color: 'var(--color-text-primary)', textShadow: '0 0 12px rgba(79, 70, 229, 0.1)' }}>
            AUTO28
          </a>
        </div>
        <p>© 2024 Auto28. Hệ thống kinh doanh xe VinFast đã qua sử dụng công nghệ chính hãng. <br />
           Địa chỉ Showroom: <a href="#location" style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 600 }}>{config.address}</a><br /> 
           Hotline tư vấn: <a href={`tel:${config.phone}`} style={{ color: 'var(--color-accent-blue)', fontWeight: 700, textDecoration: 'none' }}>{config.hotline_number}</a> | 
           Fanpage: <a href={config.fanpage_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent-indigo)', textDecoration: 'none', fontWeight: 600 }}>Ô Tô Lướt Sài Gòn</a>
        </p>
      </footer>
    </div>
  );
}
