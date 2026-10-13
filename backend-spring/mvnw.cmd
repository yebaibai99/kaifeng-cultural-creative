@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup script, Windows batch
@REM ----------------------------------------------------------------------------

@echo off
setlocal

set MVNW_VERBOSE=false
set WRAPPER_DIR=%~dp0.mvn\wrapper
set WRAPPER_JAR=%WRAPPER_DIR%\maven-wrapper.jar
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

if exist "%WRAPPER_JAR%" goto run

echo Downloading Maven Wrapper...
if not exist "%WRAPPER_DIR%" mkdir "%WRAPPER_DIR%"

set JAVA_EXE=java
if defined JAVA_HOME set JAVA_EXE=%JAVA_HOME%\bin\java

%JAVA_EXE% "%WRAPPER_DIR%\MavenWrapperDownloader.java" %~dp0
if errorlevel 1 (
  echo Failed to download Maven Wrapper
  exit /b 1
)

:run
set MAVEN_PROJECTBASEDIR=%~dp0

set JAVA_EXE=java
if defined JAVA_HOME set JAVA_EXE=%JAVA_HOME%\bin\java

%JAVA_EXE% -Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR% -classpath "%WRAPPER_JAR%" %WRAPPER_LAUNCHER% %*
endlocal

