import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Fish, Scale, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { PERSONELLER, EXCEL_PROVINCE } from '../utils/excelData';
import { toast } from 'react-hot-toast';
import { findPersonnelByEmail, verifyPassword, hashPassword, savePersonnelPassword, generatePassword, sendPasswordResetEmail, isEmailJSConfigured } from '../utils/emailService';

const Login = ({ onLogin, activeUnitName, selectedCity }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Password reset state
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    if (email === 'admin@tarimorman.gov.tr' && password === 'admin') {
      localStorage.removeItem('view_as_personel');
      onLogin({ adSoyad: 'Sistem Yöneticisi', sicil: 'admin', unvan: 'Genel Koordinatör', email: email });
      setIsLoading(false);
      return;
    }

    if (email === 'bahadirtarim57@gmail.com' && password === 'D230131b*/') {
      localStorage.removeItem('view_as_personel');
      onLogin({ adSoyad: 'Bahadır ŞENOĞLU', sicil: 'admin', unvan: 'Genel Koordinatör', email: email });
      setIsLoading(false);
      return;
    }

    try {
      // E-posta ile personel ara
      const personnelInfo = findPersonnelByEmail(email);
      
      if (!personnelInfo) {
        setLoginError('Sisteme kayıtlı böyle bir e-posta adresi bulunamadı (Tanımsız). Sistem yöneticisine başvurun.');
        setFailedAttempts(prev => prev + 1);
        setIsLoading(false);
        return;
      }

      // Kayıtlı personel bulundu -> parola kontrol et
      if (!personnelInfo.passwordHash) {
        if (password !== '123456') {
          setLoginError('Sisteme ilk giriş şifreniz 123456 olarak belirlenmiştir. Lütfen şifre olarak 123456 giriniz.');
          setFailedAttempts(prev => prev + 1);
          setIsLoading(false);
          return;
        }
      } else {
        const isMatch = await verifyPassword(password, personnelInfo.passwordHash);
        if (!isMatch) {
          setLoginError('Hatalı şifre. Lütfen tekrar deneyin.');
          setFailedAttempts(prev => prev + 1);
          setIsLoading(false);
          return;
        }
      }

      // İlk giriş kontrolü (Şifre yenileme ekranına yönlendir)
      if (password === '123456' && !personnelInfo.passwordHash) {
        setIsResetting(true);
        setLoginError('Güvenliğiniz için lütfen ilk giriş şifrenizi (123456) değiştirin.');
        setIsLoading(false);
        return;
      }

      handleSuccessfulLogin(personnelInfo);
      
    } catch (err) {
      console.error("Giriş hatası:", err);
      setLoginError('Giriş işlemi sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessfulLogin = (personnelInfo) => {
    // Personelin rolünü bul (Yetki Kontrolü)
    const userRoles = JSON.parse(localStorage.getItem('user_roles') || '{}');
    let role = userRoles[personnelInfo.sicil] || userRoles[personnelInfo.name];
    
    // Yalnızca personel ve üstü yetkilere sahip olanlar (yani sistemde kayıtlı olanlar) girebilir.
    if (!role) {
       role = 'Personel'; // Default role
    }

    // personInfo.name is adSoyad.
    const pName = personnelInfo.name;

    // Build user object matching mergedPersonnel structure in 1380
    const localPersonnel = JSON.parse(localStorage.getItem('personnel_data') || '[]');
    const editedData = JSON.parse(localStorage.getItem('editedPersonnelData') || '{}');
    
    let p = localPersonnel.find(lp => (lp.adSoyad || lp.name) === pName) || PERSONELLER.find(ep => (ep.adSoyad || ep.name) === pName);
    
    if (!p) {
      p = { adSoyad: pName, birim: personnelInfo.unit || '', sicil: personnelInfo.sicil || '' };
    }

    const edits = editedData[pName] || {};
    if (edits.isDeleted) {
      setLoginError('Hesabınız silinmiş görünmektedir. Sistem yöneticisi ile iletişime geçin.');
      return;
    }

    const personProvince = edits.province || p.province || EXCEL_PROVINCE;
    if (selectedCity && personProvince.toLowerCase() !== selectedCity.toLowerCase()) {
      setLoginError('Seçili ile ait bir personel değilsiniz.');
      return;
    }

    const finalP = {
      ...p,
      adSoyad: pName,
      birim: edits.unit || p.birim || p.unit,
      unvan: edits.title || p.unvan || p.title,
      sicil: edits.contact || p.sicil,
      role: role,
      email: email
    };

    // Disabled Branch (Birim Engelleme) Kontrolü
    let disabledBranches = [];
    try {
      disabledBranches = JSON.parse(localStorage.getItem('disabledBranches')) || [];
    } catch (e) {}

    if (disabledBranches.includes(finalP.birim)) {
      toast.error('Biriminiz Sistem Yöneticisi tarafından geçici olarak devre dışı bırakılmıştır. Şu an sisteme giriş yapamazsınız.', { duration: 5000 });
      setLoginError('Sistem Yöneticisi tarafından yetkiniz alınmıştır / sisteme girişiniz kapatılmıştır.');
      return;
    }

    localStorage.removeItem('view_as_personel');
    onLogin(finalP);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setLoginError('Şifreler eşleşmiyor!');
      return;
    }
    if (newPassword.length < 6) {
      setLoginError('Şifre en az 6 karakter olmalıdır!');
      return;
    }
    if (newPassword === '123456') {
      setLoginError('Yeni şifre 123456 olamaz!');
      return;
    }

    setIsLoading(true);
    try {
      const pInfo = findPersonnelByEmail(email);
      const newHash = await hashPassword(newPassword);
      savePersonnelPassword(pInfo.name, email, newHash);
      
      toast.success('Şifreniz başarıyla değiştirildi! Giriş yapılıyor...');
      setIsResetting(false);
      
      handleSuccessfulLogin(pInfo);
    } catch (err) {
      setLoginError('Şifre güncellenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setLoginError('Lütfen önce e-posta adresinizi girin.');
      return;
    }

    const pInfo = findPersonnelByEmail(email);
    if (!pInfo) {
      setLoginError('Bu e-posta adresi ile kayıtlı personel bulunamadı.');
      return;
    }

    if (!isEmailJSConfigured()) {
      setLoginError('E-posta sistemi henüz yapılandırılmamış. Lütfen sistem yöneticisi ile iletişime geçin.');
      return;
    }

    setForgotStatus('sending');
    setLoginError('');

    try {
      const newTempPassword = generatePassword();
      const newHash = await hashPassword(newTempPassword);
      savePersonnelPassword(pInfo.name, email, newHash);

      const success = await sendPasswordResetEmail(email, pInfo.name, newTempPassword);
      if (success) {
        setForgotStatus('sent');
        toast.success('Yeni şifreniz e-posta adresinize gönderildi.');
      } else {
        setForgotStatus('error');
        setLoginError('E-posta gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (error) {
      console.error(error);
      setForgotStatus('error');
      setLoginError('Bir hata oluştu.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* SOL TARAF: GÖRSEL VE BİLGİ */}
      <div style={{ flex: '1', backgroundColor: '#0f172a', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url("/login-bg.png")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.9 }}></div>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to right, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.9))' }}></div>
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'white', marginBottom: '8px', letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            Tarım ve Orman Bakanlığı
          </h1>
          <p style={{ fontSize: '15px', color: '#e2e8f0', maxWidth: '600px', lineHeight: '1.6', textShadow: '0 2px 10px rgba(0,0,0,0.5)', marginBottom: '10px' }}>
            Balıkçılık ve Su Ürünleri Yönetimi
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'white', opacity: 0.9, textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>
            Bahadır ŞENOĞLU tarafından tasarlanmış ve geliştirilmiştir.<br/>
            <span style={{ fontSize: '11px', fontWeight: 'normal', opacity: 0.8 }}>Su Ürünleri Mühendisi</span>
          </p>
        </div>
      </div>

      {/* SAĞ TARAF: GİRİŞ PANELİ */}
      <div style={{ flex: '0 0 450px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', background: 'white', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', zIndex: 20 }}>
        <div style={{ width: '100%', maxWidth: '340px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', background: '#059669', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.4)' }}>
              <Fish size={28} />
            </div>
            <div style={{ width: '56px', height: '56px', background: '#059669', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.4)' }}>
              <Scale size={28} />
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>Balıkçılık ve Su Ürünleri Yönetim Sistemi</h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Lütfen kurumsal bilgilerinizle giriş yapın.</p>
          </div>

          {loginError && (
            <div style={{ marginBottom: '20px', padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>{loginError}</div>
            </div>
          )}

          {forgotStatus === 'sent' && (
            <div style={{ marginBottom: '20px', padding: '12px', background: '#dcfce7', color: '#15803d', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>Yeni şifreniz e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.</div>
            </div>
          )}

          {!isResetting ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>E-Posta Adresi</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    placeholder="isim.soyisim@tarimorman.gov.tr" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', color: '#111827', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Şifre</label>
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    disabled={forgotStatus === 'sending'}
                    style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {forgotStatus === 'sending' ? 'Gönderiliyor...' : 'Şifremi Unuttum'}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', color: '#111827', outline: 'none', transition: 'border-color 0.2s', letterSpacing: password && !showPassword ? '2px' : 'normal', boxSizing: 'border-box' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                style={{ width: '100%', background: '#0f172a', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontSize: '15px', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px', transition: 'background 0.2s', opacity: isLoading ? 0.7 : 1 }}
                onMouseOver={(e) => { if(!isLoading) e.currentTarget.style.background = '#1e293b'; }}
                onMouseOut={(e) => { if(!isLoading) e.currentTarget.style.background = '#0f172a'; }}
              >
                {isLoading ? 'Giriş Yapılıyor...' : <>Giriş Yap <ChevronRight size={18} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px', fontSize: '13px', color: '#4b5563', marginBottom: '10px' }}>
                İlk girişinizi gerçekleştirdiniz. Hesabınızın güvenliği için lütfen yeni bir şifre belirleyin.
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Yeni Şifre</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="En az 6 karakter" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Yeni Şifre (Tekrar)</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Şifrenizi tekrar girin" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                style={{ width: '100%', background: '#059669', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontSize: '15px', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'background 0.2s', opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? 'Kaydediliyor...' : 'Şifreyi Kaydet ve Gir'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
