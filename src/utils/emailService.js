/**
 * emailService.js
 * E-posta gönderimi için yardımcı fonksiyonlar.
 * EmailJS entegrasyonu: https://www.emailjs.com
 *
 * KURULUM:
 * 1. https://www.emailjs.com üzerinden ücretsiz hesap açın
 * 2. Email Services → Gmail/Outlook bağlayın
 * 3. Email Templates → Şablon oluşturun (değişkenler: {{to_name}}, {{password}})
 * 4. Aşağıdaki sabitleri kendi bilgilerinizle doldurun
 */

// =====================================================
// EmailJS Yapılandırması — Buraya kendi bilgilerinizi girin
// =====================================================
export const EMAILJS_SERVICE_ID = 'service_zpz10yi';
export const EMAILJS_TEMPLATE_ID = 'template_7k225m8';
export const EMAILJS_PUBLIC_KEY = 'HTw9--Yv3fk9YiFXo'; // Account → General sekmesinde

export const EMAILJS_RESET_TEMPLATE_ID = 'template_7k225m8'; // Şifre sıfırlama şablonu
// =====================================================

export const isEmailJSConfigured = () => {
  return (
    EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' &&
    EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
    EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY'
  );
};

/**
 * Rastgele güçlü parola üretir
 */
export const generatePassword = (length = 10) => {
  const charset = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

/**
 * Basit hash fonksiyonu (SHA-256 gibi gelişmiş yerine)
 */
export const hashPassword = (password) => {
  let hash = 0;
  const str = password + 'arac_gorev_takip_salt_2025';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + str.length.toString(36);
};

/**
 * Parolayı doğrular
 */
export const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash;
};

/**
 * Personele parola gönderme e-postası
 * @returns {Promise<{success: boolean, message: string}>}
 */
/**
 * EmailJS SDK'yı CDN'den yükler (tek seferlik)
 */
const loadEmailJS = () => {
  return new Promise((resolve, reject) => {
    if (window.emailjs) { resolve(window.emailjs); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => resolve(window.emailjs);
    script.onerror = () => reject(new Error('EmailJS SDK yüklenemedi'));
    document.head.appendChild(script);
  });
};

export const sendPasswordEmail = async (toEmail, toName, password) => {
  if (!isEmailJSConfigured()) {
    return {
      success: false,
      message: 'EmailJS henüz yapılandırılmamış. Lütfen emailService.js dosyasındaki bilgileri doldurun.'
    };
  }

  try {
    const emailjs = await loadEmailJS();
    
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      password: password,
      login_url: window.location.origin,
      app_name: 'Personel Görev Takip Sistemi'
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    return { success: true, message: `Parola ${toEmail} adresine başarıyla gönderildi.` };
  } catch (error) {
    console.error('E-posta gönderimi hatası:', error);
    return {
      success: false,
      message: `E-posta gönderilemedi: ${error?.text || error?.message || 'Bilinmeyen hata'}`
    };
  }
};

/**
 * Parola sıfırlama e-postası
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendPasswordResetEmail = async (toEmail, toName, newPassword) => {
  if (!isEmailJSConfigured()) {
    return {
      success: false,
      message: 'EmailJS henüz yapılandırılmamış.'
    };
  }

  try {
    const emailjs = await loadEmailJS();
    
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      password: newPassword,
      login_url: window.location.origin,
      app_name: 'Personel Görev Takip Sistemi'
    };

    const templateId = EMAILJS_RESET_TEMPLATE_ID !== 'YOUR_RESET_TEMPLATE_ID'
      ? EMAILJS_RESET_TEMPLATE_ID
      : EMAILJS_TEMPLATE_ID;

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    return { success: true, message: `Yeni parola ${toEmail} adresine gönderildi.` };
  } catch (error) {
    console.error('Parola sıfırlama e-postası hatası:', error);
    return {
      success: false,
      message: `E-posta gönderilemedi: ${error?.text || error?.message || 'Bilinmeyen hata'}`
    };
  }
};

/**
 * Hata bildirim e-postası
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendErrorReportEmail = async (fromUser, fromUnit, subject, messageText, toEmail = 'sistem.yoneticisi@example.com', toName = 'Sistem Yöneticisi') => {
  if (!isEmailJSConfigured()) {
    return {
      success: false,
      message: 'EmailJS henüz yapılandırılmamış.'
    };
  }

  try {
    const emailjs = await loadEmailJS();
    
    // Yöneticinin e-posta adresi ve adı (Sabit veya sistemden alınabilir)
    const adminEmail = 'sistem.yoneticisi@example.com'; // Burası EmailJS template içinde 'to_email' olarak gidebilir veya EmailJS ayarlarından sabitlenebilir
    
    const templateParams = {
      from_name: fromUser,
      from_unit: fromUnit,
      subject: subject,
      message: messageText,
      app_name: 'Personel Görev Takip Sistemi',
      to_email: toEmail,
      to_name: toName
    };

    // Eğer ayrı bir şablon yoksa mevcut şablonu kullanmayı dener (Ancak EmailJS'de özel bir 'Report Error' şablonu açılması önerilir)
    const templateId = EMAILJS_RESET_TEMPLATE_ID !== 'YOUR_RESET_TEMPLATE_ID'
      ? EMAILJS_RESET_TEMPLATE_ID
      : EMAILJS_TEMPLATE_ID;

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    return { success: true, message: `Hata bildiriminiz yöneticiye iletilmiştir.` };
  } catch (error) {
    console.error('Hata bildirim e-postası gönderilemedi:', error);
    return {
      success: false,
      message: `Bildirim gönderilemedi: ${error?.text || error?.message || 'Bilinmeyen hata'}`
    };
  }
};

/**
 * Hata bildirimine cevap (Genel Koordinatörden veya Yöneticiden)
 */
export const answerErrorReportEmail = async (toEmail, toName, originalSubject, coordinatorMessage) => {
  if (!isEmailJSConfigured()) {
    return {
      success: false,
      message: 'EmailJS henüz yapılandırılmamış.'
    };
  }

  try {
    const emailjs = await loadEmailJS();
    
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      subject: `RE: ${originalSubject}`,
      message: coordinatorMessage,
      app_name: 'Personel Görev Takip Sistemi',
      from_name: 'Sistem Yöneticisi',
      from_unit: 'Merkez'
    };

    const templateId = EMAILJS_RESET_TEMPLATE_ID !== 'YOUR_RESET_TEMPLATE_ID'
      ? EMAILJS_RESET_TEMPLATE_ID
      : EMAILJS_TEMPLATE_ID;

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    return { success: true, message: `Cevabınız e-posta ile iletildi.` };
  } catch (error) {
    console.error('Cevap e-postası gönderilemedi:', error);
    return {
      success: false,
      message: `Cevap gönderilemedi: ${error?.text || error?.message || 'Bilinmeyen hata'}`
    };
  }
};

/**
 * E-posta kayıtlı mı kontrol eder
 */
export const isEmailTaken = (email, excludeName = null) => {
  try {
    const emailData = JSON.parse(localStorage.getItem('personnelEmailData') || '{}');
    for (const [name, data] of Object.entries(emailData)) {
      if (name === excludeName) continue;
      if (data.email && data.email.toLowerCase() === email.toLowerCase()) {
        return name; // Hangi personele ait olduğunu döner
      }
    }
  } catch (e) {}
  return null;
};

/**
 * Personelin e-posta bilgisini kaydeder
 */
export const savePersonnelEmail = (personnelName, email) => {
  try {
    const emailData = JSON.parse(localStorage.getItem('personnelEmailData') || '{}');
    if (!emailData[personnelName]) emailData[personnelName] = {};
    emailData[personnelName].email = email;
    localStorage.setItem('personnelEmailData', JSON.stringify(emailData));
  } catch (e) {}
};

/**
 * Personelin parolasını (hash'lenmiş) kaydeder
 */
export const savePersonnelPassword = (personnelName, passwordHash) => {
  try {
    const emailData = JSON.parse(localStorage.getItem('personnelEmailData') || '{}');
    if (!emailData[personnelName]) emailData[personnelName] = {};
    emailData[personnelName].passwordHash = passwordHash;
    localStorage.setItem('personnelEmailData', JSON.stringify(emailData));
  } catch (e) {}
};

/**
 * E-posta adresine göre personel bilgisini bulur
 */
export const findPersonnelByEmail = (email) => {
  try {
    const emailData = JSON.parse(localStorage.getItem('personnelEmailData') || '{}');
    for (const [name, data] of Object.entries(emailData)) {
      if (data.email && data.email.toLowerCase() === email.toLowerCase()) {
        return { name, ...data };
      }
    }
  } catch (e) {}
  return null;
};
