#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// ================== WIFI ==================
#define WIFI_SSID "TrungKien"
#define WIFI_PASSWORD "TrungKien99"

// ================== FIREBASE ==================
#define DATABASE_URL "bytradevices-default-rtdb.firebaseio.com"
#define DATABASE_SECRET "rHwrSkS6OqYfLq199l1280Dg55oHNHvdzdsU3Fhw"

// ================== HARDWARE ==================
#define LED_PIN 12

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setup() {
  Serial.begin(115200);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW); // tắt mặc định

  // ---- WIFI ----
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  // ---- FIREBASE ----
  config.database_url = DATABASE_URL;
  config.signer.tokens.legacy_token = DATABASE_SECRET;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("Firebase ready");
}

void loop() {
  if (Firebase.RTDB.getInt(&fbdo, "/light/status")) {
    int ledState = fbdo.intData();

    if (ledState == 1) {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED ON");
    } else {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED OFF");
    }
  } else {
    Serial.print("Firebase error: ");
    Serial.println(fbdo.errorReason());
  }

  delay(10);
}
