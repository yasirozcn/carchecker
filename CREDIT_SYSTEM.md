# CarCheck Kredi Sistemi

## Genel Bakış

CarCheck uygulaması, kullanıcıların araç hasar tespiti için kredi sistemi kullanmaktadır. Her araç analizi 1 kredi kullanır ve kullanıcılar kredi paketleri satın alabilirler.

## Kredi Paketleri

| Paket    | Kredi Sayısı | Fiyat | Kredi Başına Maliyet | İndirim |
| -------- | ------------ | ----- | -------------------- | ------- |
| 5 Kredi  | 5            | $20   | $4.00                | -       |
| 10 Kredi | 10           | $35   | $3.50                | %12.5   |
| 15 Kredi | 15           | $45   | $3.00                | %25     |

## Özellikler

### Yeni Kullanıcılar

- Yeni kayıt olan kullanıcılar otomatik olarak 1 deneme kredisi alır
- Bu kredi ile ilk araç analizini ücretsiz yapabilirler

### Kredi Kullanımı

- Her başarılı araç analizi 1 kredi kullanır
- Analiz başarısız olursa kredi iade edilir
- Yetersiz kredi durumunda analiz başlatılamaz

### Güvenli Ödeme

- Stripe entegrasyonu ile güvenli ödeme
- Kredi kartı bilgileri şifrelenir
- Ödeme işlemleri loglanır

## Teknik Detaylar

### Veritabanı Yapısı

#### Users Collection

```javascript
{
  id: string,
  email: string,
  name: string,
  createdAt: Date,
  credits: number, // Mevcut kredi sayısı
  totalPurchasedCredits: number // Toplam satın alınan kredi
}
```

#### CreditTransactions Collection

```javascript
{
  id: string,
  userId: string,
  type: 'purchase' | 'usage' | 'refund' | 'bonus',
  credits: number,
  amount?: number, // USD cinsinden (sadece satın alma)
  description: string,
  inspectionId?: string, // Kullanım durumunda
  paymentIntentId?: string, // Stripe payment intent ID
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  createdAt: Date,
  completedAt?: Date
}
```

### API Endpoints

#### Kredi Servisleri

- `getUserCredits(userId)` - Kullanıcının kredi sayısını al
- `useCredits(userId, inspectionId)` - Analiz için kredi kullan
- `refundCredits(userId, inspectionId)` - Başarısız analiz için kredi iade et
- `recordPurchase(userId, packageId, credits, amount, paymentIntentId)` - Satın alma kaydet

#### Ödeme Servisleri

- `createPaymentIntent(amount, currency)` - Stripe payment intent oluştur
- `processPayment(clientSecret, cardDetails)` - Ödeme işlemini gerçekleştir

## Kurulum

### Frontend (React Native)

```bash
npm install @stripe/stripe-react-native expo-in-app-purchases
```

### Backend (Node.js)

```bash
cd backend
npm install
```

### Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Kullanım

### Kredi Satın Alma

1. Profil sayfasından "Kredi Satın Al" butonuna tıkla
2. İstediğin kredi paketini seç
3. Güvenli ödeme yöntemiyle ödeme yap
4. Krediler anında hesabına eklenir

### Araç Analizi

1. Ana sayfadan "Yeni İnceleme Başlat" butonuna tıkla
2. Kredi kontrolü otomatik yapılır
3. Yeterli kredi varsa analiz başlar
4. Analiz tamamlandığında 1 kredi düşülür

### İşlem Geçmişi

- Profil sayfasından "İşlem Geçmişi" butonuna tıkla
- Tüm kredi işlemlerini görüntüle
- Satın almalar, kullanımlar, iadeler ve bonuslar listelenir

## Güvenlik

- Tüm ödeme işlemleri Stripe üzerinden yapılır
- Kredi kartı bilgileri uygulamada saklanmaz
- Ödeme işlemleri webhook ile doğrulanır
- Kullanıcı kimlik doğrulaması Firebase Auth ile yapılır

## Hata Yönetimi

- Yetersiz kredi durumunda kullanıcı uyarılır
- Başarısız analizlerde kredi otomatik iade edilir
- Ödeme hatalarında kullanıcı bilgilendirilir
- Tüm hatalar loglanır ve takip edilir
