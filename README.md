# CarCheck - Araç Hasar Tespiti Uygulaması

CarCheck, araç kiralarken araç hasarlarını yapay zeka ile tespit eden modern bir mobil uygulamadır. Kullanıcılar araçların farklı açılardan fotoğraflarını çekerek hasar analizi yapabilirler.

## 🚀 Özellikler

- **Kullanıcı Kimlik Doğrulama**: Firebase Authentication ile güvenli giriş
- **Çoklu Fotoğraf Çekimi**: Ön, arka, sol, sağ ve üst açılardan fotoğraf
- **Yapay Zeka Analizi**: Hasar tespiti ve sınıflandırması
- **Detaylı Raporlama**: Hasar türü, şiddeti ve konumu
- **Modern UI/UX**: Gradient tasarım ve kullanıcı dostu arayüz
- **Firebase Entegrasyonu**: Firestore ve Storage desteği

## 📱 Teknolojiler

- **React Native** - Mobil uygulama geliştirme
- **Expo** - Geliştirme platformu
- **Firebase** - Backend servisleri
  - Authentication
  - Firestore Database
  - Storage
- **TypeScript** - Tip güvenliği
- **Expo Camera** - Kamera entegrasyonu
- **Linear Gradient** - Modern tasarım

## 🛠️ Kurulum

### Gereksinimler

- Node.js (v16 veya üzeri)
- npm veya yarn
- Expo CLI
- iOS Simulator veya Android Emulator

### Adımlar

1. **Projeyi klonlayın**

   ```bash
   git clone <repository-url>
   cd carchecker
   ```

2. **Bağımlılıkları yükleyin**

   ```bash
   npm install
   ```

3. **Firebase Konfigürasyonu**

   - Firebase Console'da yeni bir proje oluşturun
   - Authentication, Firestore ve Storage'ı etkinleştirin
   - `config/firebase.ts` dosyasındaki konfigürasyonu güncelleyin

4. **Uygulamayı başlatın**
   ```bash
   npm start
   ```

## 📁 Proje Yapısı

```
carchecker/
├── app/                    # Expo Router sayfaları
│   ├── (tabs)/            # Tab navigasyonu
│   ├── auth/              # Kimlik doğrulama sayfaları
│   ├── inspection/        # İnceleme sayfaları
│   └── _layout.tsx        # Ana layout
├── components/            # Yeniden kullanılabilir bileşenler
│   └── ui/               # UI bileşenleri
├── config/               # Konfigürasyon dosyaları
├── services/             # Firebase servisleri
├── types/                # TypeScript tip tanımlamaları
└── assets/               # Statik dosyalar
```

## 🔧 Firebase Kurulumu

1. **Firebase Console'da proje oluşturun**
2. **Authentication'ı etkinleştirin**
   - Email/Password provider'ı açın
3. **Firestore Database'i oluşturun**
   - Test modunda başlatın
4. **Storage'ı etkinleştirin**
   - Kuralları güncelleyin
5. **Web uygulaması ekleyin**
   - Konfigürasyon bilgilerini kopyalayın

## 📊 Veri Modeli

### Kullanıcı (User)

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
```

### Araç İncelemesi (CarInspection)

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
  damages: Damage[];
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
}
```

### Hasar (Damage)

```typescript
interface Damage {
  id: string;
  type: "scratch" | "dent" | "crack" | "chip" | "other";
  severity: "minor" | "moderate" | "severe";
  location: string;
  description: string;
  confidence: number;
  coordinates?: { x: number; y: number };
}
```

## 🎨 UI Bileşenleri

- **Button**: Gradient butonlar
- **Card**: Modern kart tasarımı
- **Input**: Form giriş alanları
- **LinearGradient**: Arka plan efektleri

## 🔐 Güvenlik

- Firebase Authentication ile güvenli kullanıcı yönetimi
- Firestore güvenlik kuralları
- Storage erişim kontrolü

## 🚀 Gelecek Özellikler

- [ ] Gerçek yapay zeka API entegrasyonu
- [ ] Push bildirimleri
- [ ] Offline mod desteği
- [ ] Çoklu dil desteği
- [ ] Sosyal medya paylaşımı
- [ ] Hasar geçmişi
- [ ] Tahmini onarım maliyeti

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

Proje hakkında sorularınız için issue açabilirsiniz.
