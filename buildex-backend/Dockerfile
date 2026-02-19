# Use Maven image to build the application
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy project files
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/buildex-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
CMD ["java", "-jar", "app.jar"]

# Expose port
EXPOSE 8081

# Run the jar file
CMD ["java", "-jar", "target/buildex-0.0.1-SNAPSHOT.jar"]
