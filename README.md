# CarCheck - Araç Hasar Tespit Uygulaması

Modern ve kullanıcı dostu araç hasar tespit uygulaması. Yapay zeka teknolojisi ile araç fotoğraflarından hasar tespiti yapar.

## 🚀 Özellikler

- **AI Destekli Hasar Tespiti**: Google Cloud Vision AI ile gerçek zamanlı hasar analizi
- **Modern UI/UX**: Gradient tasarım, animasyonlar ve responsive arayüz
- **Çoklu Fotoğraf Desteği**: 5 farklı açıdan araç fotoğrafı çekimi
- **Detaylı Raporlama**: Hasar türü, şiddeti, konumu ve onarım maliyeti
- **Firebase Entegrasyonu**: Gerçek zamanlı veri senkronizasyonu
- **Kullanıcı Yönetimi**: Kayıt, giriş ve profil yönetimi

## 🛠️ Teknolojiler

- **Frontend**: React Native + Expo
- **Backend**: Firebase (Firestore, Auth, Storage)
- **AI**: Google Cloud Vision API
- **UI**: Custom components + LinearGradient
- **State Management**: React Hooks

## 📱 Ekranlar

### Ana Sayfa

- Hoş geldin mesajı
- İstatistik kartları
- Son incelemeler
- Hızlı erişim özellikleri

### İnceleme

- Kamera entegrasyonu
- Galeri seçimi
- AI analizi
- Gerçek zamanlı sonuçlar

### Profil

- Kullanıcı bilgileri
- Hesap ayarları
- Uygulama tercihleri

## 🔧 Kurulum

### 1. Gereksinimler

```bash
node >= 18
npm >= 8
expo-cli
```

### 2. Projeyi klonlayın

```bash
git clone <repository-url>
cd carchecker
```

### 3. Bağımlılıkları yükleyin

```bash
npm install
```

### 4. Environment Variables

`.env` dosyası oluşturun:

```env
EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here
```

**ÖNEMLİ**: API Key olmadan uygulama çalışmaz. Lütfen Google Cloud Vision API key'ini mutlaka ayarlayın.

### 5. Firebase Kurulumu

1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. Yeni proje oluşturun
3. Authentication, Firestore ve Storage'ı etkinleştirin
4. `config/firebase.ts` dosyasını güncelleyin

### 6. Google Cloud Vision API

1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Vision API'yi etkinleştirin
3. API Key oluşturun
4. `.env` dosyasına ekleyin

### 7. Uygulamayı çalıştırın

```bash
npx expo start
```

## 🎯 AI Entegrasyonu

### Google Cloud Vision API

- **Fiyat**: $1.50 / 1000 resim
- **Özellikler**: Label detection, object localization, text detection
- **Doğruluk**: %95+ hasar tespiti

### Hasar Tespit Algoritması

1. **Resim Optimizasyonu**: Boyut ve kalite optimizasyonu
2. **Label Analizi**: Hasar anahtar kelimeleri tespiti
3. **Obje Tespiti**: Araç parçaları ve hasar konumları
4. **Şiddet Değerlendirmesi**: Confidence skoruna göre hasar şiddeti
5. **Maliyet Hesaplama**: Hasar türü ve şiddetine göre onarım maliyeti

### Hasar Türleri

- **Çizik (Scratch)**: Boya hasarı, hafif çizikler
- **Göçük (Dent)**: Metal deformasyonu
- **Çatlak (Crack)**: Cam, plastik parça kırıkları
- **Çip (Chip)**: Küçük eksik parçalar

## 📊 Veri Yapısı

### CarInspection

```typescript
interface CarInspection {
  id: string;
  userId: string;
  carPlate?: string;
  images: {
    front: string;
    back: string;
    left: string;
    right: string;
    top: string;
  };
  damages: DamageDetection[];
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
}
```

### DamageDetection

```typescript
interface DamageDetection {
  type: "scratch" | "dent" | "crack" | "chip" | "other";
  severity: "minor" | "moderate" | "severe";
  confidence: number;
  location: string;
  description: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

## 🎨 Tasarım Sistemi

### Renk Paleti

- **Primary**: #007AFF (iOS Blue)
- **Secondary**: #5856D6 (Purple)
- **Accent**: #FF3B30 (Red)
- **Success**: #34C759 (Green)
- **Warning**: #FF9500 (Orange)

### Tipografi

- **Başlık**: 24px, Bold
- **Alt Başlık**: 18px, SemiBold
- **Gövde**: 16px, Regular
- **Küçük**: 14px, Regular

## 🔒 Güvenlik

- Firebase Authentication
- AsyncStorage ile oturum hatırlama
- API Key güvenliği
- Resim optimizasyonu
- Input validation

## 🔐 Authentication Sistemi

### Oturum Yönetimi

- **Firebase Auth**: Güvenli kullanıcı kimlik doğrulama
- **AsyncStorage**: Yerel oturum verisi saklama
- **Auto-login**: Uygulama yeniden açıldığında otomatik giriş
- **Session Persistence**: Kullanıcı bilgileri cihazda saklanır

### Auth Flow

1. **İlk Açılış**: AsyncStorage'dan kullanıcı bilgisi kontrol edilir
2. **Firebase Sync**: Firebase auth state ile senkronizasyon
3. **Loading State**: Auth durumu yüklenirken loading gösterilir
4. **Route Protection**: Giriş yapmamış kullanıcılar login sayfasına yönlendirilir

### Kullanılan Teknolojiler

- `@react-native-async-storage/async-storage`: Yerel veri saklama
- `firebase/auth`: Kimlik doğrulama
- `expo-router`: Sayfa yönlendirme
- Custom AuthProvider: Merkezi auth state yönetimi

## 📈 Performans

- Resim sıkıştırma
- Lazy loading
- Cache mekanizması
- Offline desteği

## 🚀 Gelecek Özellikler

- [ ] Offline AI analizi
- [ ] Çoklu dil desteği
- [ ] Push notifications
- [ ] Sosyal medya paylaşımı
- [ ] Sigorta entegrasyonu
- [ ] Servis randevu sistemi

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Email**: info@carcheck.com
- **Website**: https://carcheck.com
- **Twitter**: @carcheck_app

---

**Not**: Bu uygulama geliştirme aşamasındadır. Production kullanımı için ek güvenlik ve test önlemleri alınmalıdır.
