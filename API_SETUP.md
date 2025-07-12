# 🔑 Google Cloud Vision API Kurulum Rehberi

Bu rehber, CarCheck uygulaması için Google Cloud Vision API'yi nasıl kuracağınızı adım adım açıklar.

## 📋 Gereksinimler

- Google hesabı
- Kredi kartı (Google Cloud ücretsiz tier için)
- CarCheck projesi

## 🚀 Adım Adım Kurulum

### 1. Google Cloud Console'a Giriş

1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Google hesabınızla giriş yapın
3. Yeni proje oluşturun veya mevcut projeyi seçin

### 2. Billing (Faturalandırma) Ayarlayın

1. Sol menüden "Billing" seçin
2. "Link a billing account" tıklayın
3. Kredi kartı bilgilerinizi girin
4. Ücretsiz tier otomatik olarak aktif olacak

### 3. Vision API'yi Etkinleştirin

1. Sol menüden "APIs & Services" > "Library" seçin
2. Arama kutusuna "Vision API" yazın
3. "Cloud Vision API" seçin
4. "Enable" butonuna tıklayın

### 4. API Key Oluşturun

1. Sol menüden "APIs & Services" > "Credentials" seçin
2. "Create Credentials" > "API Key" tıklayın
3. Oluşturulan API key'i kopyalayın

### 5. API Key'i Güvenli Hale Getirin

1. Oluşturulan API key'e tıklayın
2. "Application restrictions" altında "HTTP referrers" seçin
3. "Website restrictions" altına şunları ekleyin:
   ```
   localhost:*
   127.0.0.1:*
   exp://*
   ```

### 6. Environment Variable Ayarlayın

1. CarCheck projesinde `.env` dosyası oluşturun
2. Aşağıdaki satırı ekleyin:
   ```env
   EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=your_api_key_here
   ```
3. `your_api_key_here` yerine kopyaladığınız API key'i yapıştırın

### 7. Uygulamayı Test Edin

1. Terminal'de `npx expo start` çalıştırın
2. Uygulamayı açın
3. Fotoğraf çekin ve AI analizini test edin

## 💰 Fiyatlandırma

### Ücretsiz Tier (Aylık)

- **1,000 resim analizi** - Ücretsiz
- **Sonraki her 1,000 resim** - $1.50

### Örnek Maliyetler

- 100 analiz/ay: **Ücretsiz**
- 1,000 analiz/ay: **Ücretsiz**
- 2,000 analiz/ay: **$1.50**
- 10,000 analiz/ay: **$13.50**

## 🔒 Güvenlik Önerileri

### API Key Güvenliği

- API key'i asla public repository'de paylaşmayın
- `.env` dosyasını `.gitignore`'a ekleyin
- Production'da environment variable kullanın

### Kullanım Limitleri

- API key'e günlük kullanım limiti koyun
- Anormal kullanımı izleyin
- Gereksiz API çağrılarını önleyin

## 🐛 Sorun Giderme

### "API Key bulunamadı" Hatası

1. `.env` dosyasının doğru konumda olduğunu kontrol edin
2. API key'in doğru formatta olduğunu kontrol edin
3. Uygulamayı yeniden başlatın

### "API Hatası: 403" Hatası

1. Vision API'nin etkin olduğunu kontrol edin
2. Billing account'un bağlı olduğunu kontrol edin
3. API key'in doğru olduğunu kontrol edin

### "API Hatası: 429" Hatası

1. Rate limit'e ulaştınız
2. Birkaç dakika bekleyin
3. Daha az sıklıkta API çağrısı yapın

## 📊 API Kullanım İstatistikleri

### Dashboard'da İzleme

1. Google Cloud Console'da "APIs & Services" > "Dashboard" gidin
2. Vision API kullanımını görüntüleyin
3. Hata oranlarını kontrol edin

### Logs

1. "Logging" > "Logs Explorer" gidin
2. Vision API çağrılarını izleyin
3. Hataları analiz edin

## 🚀 Production Hazırlığı

### Environment Variables

```bash
# Development
EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=dev_api_key

# Production
EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=prod_api_key
```

### Monitoring

- API kullanımını izleyin
- Hata oranlarını takip edin
- Maliyetleri kontrol edin

### Backup Plan

- API key'i yedekleyin
- Alternatif AI servisleri düşünün
- Offline analiz seçenekleri

## 📞 Destek

Sorun yaşarsanız:

1. Google Cloud Console'da "Support" bölümünü kullanın
2. CarCheck GitHub repository'sinde issue açın
3. Dokümantasyonu kontrol edin

---

**Not**: Bu rehber sürekli güncellenmektedir. En güncel bilgiler için Google Cloud dokümantasyonunu kontrol edin.
