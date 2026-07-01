# Wir nutzen direkt das Gradle Image als Basis (kein Multi-Stage für Dev!)
FROM gradle:jdk21-alpine

WORKDIR /app

# 1. Gradle-Konfiguration kopieren (für Caching der Dependencies)
COPY build.gradle settings.gradle gradlew ./
COPY gradle/ ./gradle/

# 2. Abhängigkeiten laden
RUN gradle dependencies --no-daemon

# 3. Source Code kopieren
# (Wird zur Laufzeit durch dein Docker-Compose Volume überschrieben,
# aber gut als Fallback)
COPY . .

# Ports: 8080 (App) und 5005 (Debugger)
EXPOSE 8080 5005

# WICHTIG: Statt ein fertiges JAR zu starten, lassen wir Gradle die App starten.
# Das sorgt dafür, dass Änderungen im Code (via Volume) beim Neustart erkannt werden.
# Wir übergeben hier auch die Debugger-Argumente direkt an die JVM von Gradle.
CMD ["gradle", "bootRun", "--no-daemon", "-PjvmArgs=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"]