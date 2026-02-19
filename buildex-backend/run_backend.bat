@echo off
echo Starting Buildex Backend on Port 8080...
echo This uses the JAR file to avoid Firewall issues.
echo.
echo If you get "Permission denied: listen" error:
echo   1. Run this as Administrator (Right-click - Run as administrator)
echo   2. Or temporarily disable Windows Firewall
echo   3. Or add Java to Windows Firewall exceptions
echo.
java "-Djava.net.preferIPv4Stack=true" -jar target/buildex-backend-0.0.1-SNAPSHOT.jar
pause
