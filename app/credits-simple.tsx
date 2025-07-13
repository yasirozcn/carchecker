import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../components/AuthProvider";
import { creditService, CREDIT_PACKAGES } from "../services/creditService";
import { paymentService, useStripePayment } from "../services/paymentService";
import { CreditPackage } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { useStripe } from "@stripe/stripe-react-native";

export default function CreditsSimpleScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { processPayment } = useStripePayment();
  const { confirmPayment } = useStripe();
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(
    null
  );
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");

  useEffect(() => {
    if (user) {
      loadUserCredits();
    }
  }, [user]);

  const loadUserCredits = async () => {
    try {
      const credits = await creditService.getUserCredits(user!.uid);
      setUserCredits(credits);
    } catch (error) {
      console.error("Kredi yüklenirken hata:", error);
    }
  };

  const handlePurchase = async (creditPackage: CreditPackage) => {
    if (!user) {
      Alert.alert("Hata", "Lütfen giriş yapın");
      return;
    }

    setSelectedPackage(creditPackage);
    setShowCardForm(true);
  };

  const handlePayment = async () => {
    if (!selectedPackage) {
      Alert.alert("Hata", "Lütfen bir kredi paketi seçin");
      return;
    }

    setLoading(true);

    try {
      // Payment intent oluştur
      const paymentIntent = await paymentService.createPaymentIntent(
        selectedPackage.price,
        "usd"
      );

      console.log("Payment Intent:", paymentIntent);

      // Backend'de otomatik onaylandı, sadece sonucu kontrol et
      if (paymentIntent.status === "succeeded") {
        // Satın alma işlemini kaydet
        await creditService.recordPurchase(
          user!.uid,
          selectedPackage.id,
          selectedPackage.credits,
          selectedPackage.price,
          paymentIntent.id
        );

        // Kredi sayısını güncelle
        await loadUserCredits();

        Alert.alert(
          "Başarılı!",
          `${selectedPackage.credits} kredi başarıyla satın alındı!`,
          [{ text: "Tamam" }]
        );

        setShowCardForm(false);
        setSelectedPackage(null);
      } else {
        throw new Error(`Ödeme başarısız oldu. Durum: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error("Satın alma hatası:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Bilinmeyen hata";
      Alert.alert("Hata", `Satın alma işlemi başarısız oldu: ${errorMessage}`, [
        { text: "Tamam" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderCreditPackage = (creditPackage: CreditPackage) => {
    const isSelected = selectedPackage?.id === creditPackage.id;
    const isPopular = creditPackage.isPopular;

    return (
      <TouchableOpacity
        key={creditPackage.id}
        style={[
          styles.packageCard,
          isSelected && styles.selectedPackage,
          isPopular && styles.popularPackage,
        ]}
        onPress={() => handlePurchase(creditPackage)}
        disabled={loading}
      >
        {isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>En Popüler</Text>
          </View>
        )}

        <View style={styles.packageHeader}>
          <Text style={styles.creditAmount}>{creditPackage.credits} Kredi</Text>
          {creditPackage.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                %{creditPackage.discount} İndirim
              </Text>
            </View>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${creditPackage.price}</Text>
          {creditPackage.originalPrice && (
            <Text style={styles.originalPrice}>
              ${creditPackage.originalPrice}
            </Text>
          )}
        </View>

        <Text style={styles.description}>{creditPackage.description}</Text>

        {loading && isSelected && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Kredi Satın Al</Text>
      </View>

      <View style={styles.creditInfo}>
        <Text style={styles.creditLabel}>Mevcut Kredileriniz</Text>
        <Text style={styles.creditCount}>{userCredits}</Text>
      </View>

      <View style={styles.packagesContainer}>
        <Text style={styles.sectionTitle}>Kredi Paketleri</Text>
        {CREDIT_PACKAGES.map(renderCreditPackage)}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Kredi Sistemi Hakkında</Text>
        <Text style={styles.infoText}>
          • Her araç analizi 1 kredi kullanır{"\n"}• Başarısız analizlerde kredi
          iade edilir{"\n"}• Daha fazla kredi alarak daha uygun fiyatlar elde
          edin{"\n"}• Güvenli ödeme sistemi ile korunuyorsunuz
        </Text>
      </View>

      {/* Basit Kart Formu Modal */}
      {showCardForm && selectedPackage && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedPackage.credits} Kredi Satın Al
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCardForm(false);
                  setSelectedPackage(null);
                  setCardNumber("");
                  setExpiryDate("");
                  setCvc("");
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.cardForm}>
              <Text style={styles.cardLabel}>
                ${selectedPackage.price} tutarında ödeme yapılacak
              </Text>

              <Text style={styles.cardDescription}>
                Öde butonuna tıkladığınızda Stripe&apos;ın güvenli ödeme formu
                açılacak.
              </Text>

              <TouchableOpacity
                style={styles.payButton}
                onPress={handlePayment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.payButtonText}>
                    ${selectedPackage.price} Öde
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  creditInfo: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  creditLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  creditCount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
  },
  packagesContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  packageCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  selectedPackage: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  popularPackage: {
    borderColor: "#FF9500",
    borderWidth: 2,
  },
  popularBadge: {
    position: "absolute",
    top: -8,
    right: 16,
    backgroundColor: "#FF9500",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  creditAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  discountBadge: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  infoSection: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  closeButton: {
    padding: 4,
  },
  cardForm: {
    gap: 16,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e5e9",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  payButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  payButtonDisabled: {
    backgroundColor: "#ccc",
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
