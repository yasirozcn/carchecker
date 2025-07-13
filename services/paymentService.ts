import { StripeProvider } from "@stripe/stripe-react-native";
import { PaymentIntent } from "../types";

// Stripe public key - production'da gerçek key kullanılmalı
const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51RkVQ2Gf2wvyP4TG6rLY9KJfzWKjwv45BxDOkacpsRhxomYAyLEbkDZdW6kOV3hktw9RhdVePI1B63HtaGNhlaSS002tSrk2HS";

export const paymentService = {
  // Stripe provider'ı döndür
  getStripeProvider() {
    return StripeProvider;
  },

  // Payment intent oluştur (backend'den alınacak)

  async createPaymentIntent(
    amount: number,
    currency: string = "usd"
  ): Promise<PaymentIntent> {
    try {
      const response = await fetch(
        "http://192.168.1.104:3001/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amount, // Backend'de zaten 100 ile çarpılıyor
            currency: currency,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ödeme başlatılamadı");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Payment intent oluşturma hatası:", error);
      throw error;
    }
  },
};

// Custom hook for Stripe operations
export const useStripePayment = () => {
  const { useStripe } = require("@stripe/stripe-react-native");
  const { confirmPayment } = useStripe();

  const processPayment = async (clientSecret: string, cardDetails: any) => {
    try {
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
        paymentMethodData: {
          billingDetails: {
            email: "user@example.com", // Kullanıcı email'i
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return paymentIntent;
    } catch (error) {
      console.error("Ödeme işlemi hatası:", error);
      throw error;
    }
  };

  return { processPayment };
};
