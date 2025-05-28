# SecurePasswordMobile (FLYPASS)

FLYPASS, kullanıcıların ana parolalarını kullanarak sitelere özel, güçlü ve deterministik parolalar üretmelerini sağlayan güvenli bir mobil parola yöneticisi uygulamasıdır.

## Özellikler

*   **Ana Parola Koruması:** Tek bir ana parola ile tüm şifrelerinizi güvenle yönetin.
*   **Deterministik Parola Üretimi:** Aynı site adı ve ana parola ile her zaman aynı karmaşık ve tahmin edilemez parolayı üretir.
*   **Siteye Özel Profiller:**
    *   Her site için farklı kullanıcı adları ve profil etiketleri tanımlayabilme.
    *   Çeşitli parola tipleri (Maksimum Güvenlik, Sadece Rakam vb.) arasından seçim yapabilme.
    *   Aynı site için birden fazla farklı parola tipinde profil oluşturabilme.
*   **Yerel Depolama:** Tüm verileriniz güvenli bir şekilde sadece cihazınızda saklanır (`AsyncStorage` kullanılır).
*   **Kullanıcı Dostu Arayüz:** Kolay ve hızlı kullanım için basit, anlaşılır ve sekmeli bir arayüz sunar.
*   **(Geliştirme Aşamasındaki ve Gelecekteki Özellikler)**
    *   Pwned Passwords API entegrasyonu ile ana parola sızıntı kontrolü.
    *   Veri yedekleme ve geri yükleme (Export/Import) özelliği.
    *   Çoklu dil desteği (Türkçe başlangıç dilidir).
    *   Biyometrik kimlik doğrulama (Parmak izi / Yüz tanıma) ile oturum açma.
    *   iOS platformu desteği.

## Kurulum ve Çalıştırma (Android)

Bu bir React Native projesidir. Geliştirme ortamınızı kurduktan sonra aşağıdaki adımları izleyebilirsiniz.

### Gereksinimler

*   Node.js (LTS versiyonu önerilir)
*   Yarn veya npm
*   React Native CLI
*   Android Studio ve Android SDK
*   Java Development Kit (JDK)

### Adımlar

1.  **Repoyu Klonlayın:**
    ```bash
    git clone https://github.com/OKANKELES/SecurePasswordMobile.git
    cd SecurePasswordMobile
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    # veya
    yarn install
    ```

3.  **Metro Bundler'ı Başlatın:**
    Ayrı bir terminal penceresinde:
    ```bash
    npm start -- --reset-cache
    # veya
    yarn start --reset-cache
    ```

4.  **Uygulamayı Android Emülatörde veya Cihazda Çalıştırın:**
    ```bash
    npm run android
    # veya
    yarn android
    ```
    (Veya doğrudan Android Studio üzerinden çalıştırın.)

## Kullanılan Teknolojiler

*   React Native
*   JavaScript
*   React Navigation (Navigasyon için)
*   AsyncStorage (Yerel depolama için)
*   `react-native-vector-icons` (İkonlar için)
*   `react-native-quick-crypto` (Kriptografik işlemler için)
*   `@sphereon/isomorphic-argon2` (Anahtar türetme için)
*   `i18next`, `react-i18next`, `react-native-localize` (Dil desteği için - entegrasyon aşamasında)

## Katkıda Bulunma

Katkılarınız her zaman beklerim! Lütfen bir "issue" açarak fikirlerinizi belirtin veya bir "pull request" gönderin.

## Lisans

Bu proje [MIT Lisansı](LICENSE) (Eğer `LICENSE` adında bir dosya eklerseniz) altındadır.

---

_Bu README dosyası projenin mevcut durumuna göre güncellenecektir._