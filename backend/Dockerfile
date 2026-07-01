FROM gradle:jdk21-alpine AS build
WORKDIR /app

# Nur die Build-Dateien kopieren, um Caching zu nutzen
COPY build.gradle settings.gradle gradlew ./
COPY gradle/ ./gradle/

# Abhängigkeiten herunterladen (wird gecacht)
RUN gradle dependencies --no-daemon

# Restlichen Source-Code kopieren und App bauen
COPY . .
RUN gradle clean build --no-daemon -x test

# ---

# ---

# Runtime Stage: Startet die gebaute JAR-Datei
FROM amazoncorretto:21-alpine
WORKDIR /app

# Kopiere nur die gebaute JAR aus dem 'build'-Stage
COPY --from=build /app/build/libs/*.jar app.jar

# Ports freigeben (gute Praxis)
EXPOSE 8080

# Starte die App UND aktiviere Remote Debugging an Port 5005
CMD ["java", "-jar", "app.jar"]