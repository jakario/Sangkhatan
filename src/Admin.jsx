import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Home } from 'lucide-react';
import './index.css';

export default function Admin() {
  const [data, setData] = useState({ categories: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  useEffect(() => {
    fetch('/db.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load data:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (newData) => {
    setSaving(true);
    try {
      const res = await fetch('/db.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (!res.ok) throw new Error('Cannot save');
      setData(newData);
      setEditingItem(null);
    } catch (err) {
      alert("ไม่สามารถบันทึกข้อมูลได้ (หากใช้งานบน Vercel จะไม่สามารถบันทึกได้)");
    }
    setSaving(false);
  };

  const handleUpdateItem = (e) => {
    e.preventDefault();
    const updatedItems = data.items.map(i => i.id === editingItem.id ? editingItem : i);
    handleSave({ ...data, items: updatedItems });
  };

  const handleAddItem = () => {
    const newItem = {
      id: 'n' + Date.now(),
      categoryId: data.categories[0].id,
      name: 'สินค้าใหม่',
      price: 0,
      type: 'ของใช้',
      image: '📦'
    };
    setEditingItem(newItem);
    handleSave({ ...data, items: [...data.items, newItem] });
  };

  const handleDeleteItem = (id) => {
    if (window.confirm("ยืนยันการลบสินค้านี้?")) {
      const updatedItems = data.items.filter(i => i.id !== id);
      handleSave({ ...data, items: updatedItems });
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>กำลังโหลดข้อมูล...</div>;

  return (
    <div className="container">
      <header className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>⚙️ ระบบหลังบ้าน (Admin)</h1>
          <p>จัดการหมวดหมู่และราคาสินค้า</p>
        </div>
        <button className="btn" onClick={() => window.location.hash = ''}>
          <Home size={18} /> กลับไปหน้าร้าน
        </button>
      </header>

      <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass" style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2>รายการสินค้าทั้งหมด</h2>
            <button className="btn active" style={{ padding: '0.5rem 1rem' }} onClick={handleAddItem}>
              <Plus size={16} /> เพิ่มสินค้าใหม่
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.items.map(item => (
              <div 
                key={item.id} 
                className={`item-row ${editingItem?.id === item.id ? 'active-row' : ''}`}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px',
                  border: editingItem?.id === item.id ? '1px solid var(--primary)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
                onClick={() => setEditingItem(item)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{item.image}</span>
                  <div>
                    <div style={{ fontWeight: '500' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      ราคา: <span style={{ color: 'var(--secondary)' }}>฿{item.price}</span> | {item.type}
                    </div>
                  </div>
                </div>
                <button 
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem' }}
                  onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        <div className="glass" style={{ padding: '1.5rem', alignSelf: 'start' }}>
          <h2>แก้ไขสินค้า</h2>
          {editingItem ? (
            <form onSubmit={handleUpdateItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>ชื่อสินค้า</label>
                <input 
                  type="text" 
                  value={editingItem.name} 
                  onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>ราคา (บาท)</label>
                  <input 
                    type="number" 
                    value={editingItem.price} 
                    onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>อีโมจิรูปภาพ</label>
                  <input 
                    type="text" 
                    value={editingItem.image} 
                    onChange={e => setEditingItem({...editingItem, image: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>หมวดหมู่</label>
                  <select 
                    value={editingItem.categoryId} 
                    onChange={e => setEditingItem({...editingItem, categoryId: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#333', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                  >
                    {data.categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>ประเภท</label>
                  <select 
                    value={editingItem.type} 
                    onChange={e => setEditingItem({...editingItem, type: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: '#333', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                  >
                    <option value="ของกิน">ของกิน</option>
                    <option value="ของใช้">ของใช้</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn active" style={{ marginTop: '1rem', width: '100%' }} disabled={saving}>
                {saving ? 'กำลังบันทึก...' : <><Save size={18} style={{ marginRight: '0.5rem' }} /> บันทึกข้อมูล</>}
              </button>
            </form>
          ) : (
            <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              คลิกที่รายการสินค้าเพื่อแก้ไขข้อมูล
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
