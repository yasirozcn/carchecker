import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { authService } from "../../services/firebase";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    Alert.alert("Çıkış Yap", "Çıkış yapmak istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          try {
            await authService.logout();
            router.replace("/auth/login");
          } catch {
            Alert.alert("Hata", "Çıkış yapılamadı");
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert("Bilgi", "Profil düzenleme özelliği yakında eklenecek.");
  };

  const handleChangePassword = () => {
    Alert.alert("Bilgi", "Şifre değiştirme özelliği yakında eklenecek.");
  };

  const handleNotifications = () => {
    Alert.alert("Bilgi", "Bildirim ayarları yakında eklenecek.");
  };

  const handlePrivacy = () => {
    Alert.alert("Bilgi", "Gizlilik ayarları yakında eklenecek.");
  };

  const handleHelp = () => {
    Alert.alert("Bilgi", "Yardım sayfası yakında eklenecek.");
  };

  const handleAbout = () => {
    Alert.alert(
      "CarCheck Hakkında",
      "CarCheck v1.0.0\n\nAraç hasar tespiti için geliştirilmiş mobil uygulama.\n\n© 2024 CarCheck Team"
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Ionicons name="person-outline" size={64} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Profil Yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={48} color="#FFFFFF" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.displayName ||
                    user?.email?.split("@")[0] ||
                    "Kullanıcı"}
                </Text>
                <Text style={styles.profileEmail}>
                  {user?.email || "E-posta bilgisi yok"}
                </Text>
                <Text style={styles.profileStatus}>
                  {user?.emailVerified
                    ? "E-posta Doğrulandı"
                    : "E-posta Doğrulanmadı"}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Profile Actions */}
        <View style={styles.profileActions}>
          <Button
            title="Profili Düzenle"
            onPress={handleEditProfile}
            variant="outline"
            style={styles.editButton}
          />
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hesap Ayarları
          </Text>

          <Card style={{ ...styles.menuCard, backgroundColor: colors.card }}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleChangePassword}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Şifre Değiştir
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>

            <View
              style={[styles.divider, { backgroundColor: colors.cardBorder }]}
            />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleNotifications}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={colors.warning}
                />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Bildirimler
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>

            <View
              style={[styles.divider, { backgroundColor: colors.cardBorder }]}
            />

            <TouchableOpacity style={styles.menuItem} onPress={handlePrivacy}>
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="shield-outline"
                  size={24}
                  color={colors.accent}
                />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Gizlilik
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          </Card>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Uygulama Ayarları
          </Text>

          <Card style={{ ...styles.menuCard, backgroundColor: colors.card }}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="moon-outline"
                  size={24}
                  color={colors.secondary}
                />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Karanlık Mod
                </Text>
              </View>
              <Switch
                value={colorScheme === "dark"}
                onValueChange={() => {
                  // Tema değiştirme işlevi burada olacak
                }}
                trackColor={{
                  false: colors.cardBorder,
                  true: colors.primary + "40",
                }}
                thumbColor={
                  colorScheme === "dark" ? colors.primary : colors.textTertiary
                }
              />
            </View>

            <View
              style={[styles.divider, { backgroundColor: colors.cardBorder }]}
            />

            <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="help-circle-outline"
                  size={24}
                  color={colors.info}
                />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Yardım & Destek
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>

            <View
              style={[styles.divider, { backgroundColor: colors.cardBorder }]}
            />

            <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={colors.textSecondary}
                />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Hakkında
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hesap Bilgileri
          </Text>

          <Card style={{ ...styles.infoCard, backgroundColor: colors.card }}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Kullanıcı ID
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user?.uid?.slice(0, 8) + "..." || "Bilinmiyor"}
              </Text>
            </View>

            <View
              style={[styles.divider, { backgroundColor: colors.cardBorder }]}
            />

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Hesap Oluşturma
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user?.metadata?.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString(
                      "tr-TR"
                    )
                  : "Bilinmiyor"}
              </Text>
            </View>

            <View
              style={[styles.divider, { backgroundColor: colors.cardBorder }]}
            />

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Son Giriş
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user?.metadata?.lastSignInTime
                  ? new Date(user.metadata.lastSignInTime).toLocaleDateString(
                      "tr-TR"
                    )
                  : "Bilinmiyor"}
              </Text>
            </View>
          </Card>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <Button
            title="Çıkış Yap"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
    fontWeight: "500",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    gap: 24,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  profileStatus: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  profileActions: {
    paddingHorizontal: 24,
    marginTop: -16,
    marginBottom: 24,
  },
  editButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 32,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  menuCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "400",
  },
  logoutButton: {
    borderColor: "#EF4444",
    marginBottom: 40,
  },
});
