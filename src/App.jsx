import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, X, Check, Package, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import './index.css';

function App() {
  const [data, setData] = useState({ categories: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [targetCount, setTargetCount] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [expressService, setExpressService] = useState(false);

  useEffect(() => {
    fetch('/db.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch data", err);
        setLoading(false);
      });
  }, []);

  const handleGoBack = () => {
    setTargetCount(null);
    setShowQR(false);
    setExpressService(false);
  };

  const handleSetSelection = (count) => {
    setTargetCount(count);
    // If they already selected more than the new limit, trim the list
    if (selectedItems.length > count) {
      setSelectedItems(selectedItems.slice(0, count));
    }
  };

  const toggleItem = (item) => {
    if (!targetCount) return;

    const isSelected = selectedItems.some((i) => i.id === item.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      if (selectedItems.length < targetCount) {
        setSelectedItems([...selectedItems, item]);
      }
    }
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== id));
  };

  const filteredItems = useMemo(() => {
    if (!data.items) return [];
    if (activeCategory === 'all') return data.items;
    return data.items.filter((item) => item.categoryId === activeCategory);
  }, [activeCategory, data.items]);

  const eatCount = selectedItems.filter(i => i.type === 'ของกิน').length;
  const useCount = selectedItems.filter(i => i.type === 'ของใช้').length;
  const itemsTotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const baseFee = 100;
  const expressFee = expressService ? 100 : 0;
  const totalPrice = itemsTotal + baseFee + expressFee;

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>กำลังโหลดข้อมูล...</div>;

  return (
    <div className="container">
      <header className="animate-fade-in">
        <h1>✨ จัดชุดสังฆทาน ✨</h1>
        <p>
          เลือกสิ่งของที่เป็นประโยชน์ จัดชุดทำบุญด้วยใจ<br/>
          <span style={{ color: 'var(--secondary)', fontWeight: 500 }}>บริการรับทำสังฆทานด่วน ที่วัดศิริพงษ์ธรรมนิมิต วัชรพล ราคาพิเศษ</span>
        </p>
      </header>

      {!targetCount ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="set-selection glass"
        >
          <div style={{ width: '100%', textAlign: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-light)' }}>กรุณาเลือกจำนวนสิ่งของเพื่อจัดชุด (เลขคี่)</h2>
          </div>
          {[7, 9, 15].map((count) => (
            <div 
              key={count}
              className={`set-card glass`}
              onClick={() => handleSetSelection(count)}
            >
              <h2 className="text-gradient">{count}</h2>
              <p>สิ่งของ</p>
            </div>
          ))}
        </motion.div>
      ) : (
        <div className="main-grid">
          {/* Left Column: Items */}
          <div className="items-section">
            <button className="btn" style={{ marginBottom: '1.5rem' }} onClick={handleGoBack}>
              ← ย้อนกลับไปแก้ไขจำนวน
            </button>
            <div className="categories-nav">
              <button 
                className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                ทั้งหมด
              </button>
              {data.categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <motion.div 
              layout
              className="items-grid"
            >
              <AnimatePresence>
                {filteredItems.map(item => {
                  const isSelected = selectedItems.some(i => i.id === item.id);
                  const isFull = selectedItems.length >= targetCount && !isSelected;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      key={item.id}
                      className={`item-card glass ${isSelected ? 'selected' : ''}`}
                      onClick={() => !isFull && toggleItem(item)}
                      style={{ opacity: isFull ? 0.5 : 1, cursor: isFull ? 'not-allowed' : 'pointer' }}
                    >
                      <span className={`item-badge ${item.type === 'ของกิน' ? 'badge-eat' : 'badge-use'}`}>
                        {item.type}
                      </span>
                      <div className="item-emoji">{item.image}</div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-price">฿{item.price}</div>
                      
                      {isSelected && (
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', color: 'var(--primary)' }}>
                          <Check size={20} />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Column: Cart */}
          <div className="cart-sidebar glass">
            <div className="cart-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                  <Package size={20} />
                  ชุดสังฆทาน {targetCount} อย่าง
                </h2>
              </div>
              
              <div className="cart-progress">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>เลือกแล้ว</span>
                  <span style={{ color: selectedItems.length === targetCount ? 'var(--success)' : 'var(--text-light)' }}>
                    {selectedItems.length} / {targetCount}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${(selectedItems.length / targetCount) * 100}%`,
                      background: selectedItems.length === targetCount ? 'var(--success)' : ''
                    }} 
                  />
                </div>
              </div>
            </div>

            <div className="cart-items">
              <AnimatePresence>
                {selectedItems.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}
                  >
                    <ShoppingBag size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p>ยังไม่มีของในชุด</p>
                  </motion.div>
                )}
                {selectedItems.map((item) => (
                  <motion.div
                    key={`cart-${item.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="cart-item"
                  >
                    <div className="cart-item-info">
                      <span style={{ fontSize: '1.2rem' }}>{item.image}</span>
                      <div>
                        <div style={{ fontSize: '0.9rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>฿{item.price}</div>
                      </div>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
                      <X size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="cart-summary">
              <div className="summary-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem' }}>ของกิน: <span style={{ color: '#81c784' }}>{eatCount}</span> | ของใช้: <span style={{ color: '#64b5f6' }}>{useCount}</span></span>
              </div>
              <div className="summary-row">
                <span>ค่าสินค้าทั้งหมด:</span>
                <span>฿{itemsTotal}</span>
              </div>
              <div className="summary-row">
                <span>ค่าบริการจัดชุด (พื้นฐาน):</span>
                <span>฿{baseFee}</span>
              </div>
              
              <div style={{ margin: '1rem 0', padding: '0.75rem', background: expressService ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', border: expressService ? '1px solid var(--primary)' : '1px solid transparent', transition: 'all 0.3s ease' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={expressService} 
                    onChange={(e) => setExpressService(e.target.checked)}
                    style={{ marginTop: '4px', transform: 'scale(1.2)', accentColor: 'var(--primary)' }}
                  />
                  <div>
                    <div style={{ fontWeight: '500', color: expressService ? 'var(--primary)' : 'var(--text-light)' }}>บริการฝากถวายสังฆทานด่วน</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ให้ทางเราจัดชุดและนำไปถวายพระให้ครบจบ (+฿100)</div>
                  </div>
                </label>
              </div>

              <div className="summary-total">
                <span>ราคารวมทั้งสิ้น</span>
                <span>฿{totalPrice}</span>
              </div>
              
              <button 
                className={`btn ${selectedItems.length === targetCount ? 'active' : ''}`}
                style={{ width: '100%', padding: '1rem' }}
                disabled={selectedItems.length !== targetCount}
                onClick={() => setShowQR(true)}
              >
                {selectedItems.length === targetCount ? 'ยืนยันการจัดชุด' : 'กรุณาเลือกให้ครบจำนวน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="modal-content glass" 
              style={{ textAlign: 'center', padding: '2.5rem' }}
            >
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>ชำระเงิน</h2>
              <p style={{ margin: '1rem 0' }}>กรุณาสแกน QR Code เพื่อชำระเงิน<br/>จำนวน <strong style={{ color: 'var(--secondary)', fontSize: '1.2rem' }}>{totalPrice}</strong> บาท</p>
              <div style={{ background: 'white', padding: '1rem', display: 'inline-block', borderRadius: '12px', margin: '1rem 0' }}>
                {/* 
                  ========== วิธีเปลี่ยน QR Code เป็นของจริง ==========
                  1. นำรูปภาพ QR Code ของคุณ (เช่น qrcode.jpg) ไปใส่ไว้ในโฟลเดอร์ public/
                  2. เปลี่ยนโค้ด <img src="..." /> ด้านล่างให้เป็นแบบนี้:
                     <img src="/qrcode.jpg" alt="QR Code" style={{ display: 'block', width: '200px' }} />
                  ===============================================
                */}
                <img src="/qr.jpg" alt="QR Code" style={{ display: 'block', width: '200px', margin: '0 auto' }} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>(พื้นที่สำหรับแสดง QR Code ของจริง)</p>
              <button className="btn active" style={{ width: '100%' }} onClick={() => setShowQR(false)}>ปิดหน้าต่าง</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
