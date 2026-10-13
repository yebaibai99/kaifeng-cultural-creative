/*
 * Copyright 2007-present the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.util.Properties;

public class MavenWrapperDownloader {

  private static final String WRAPPER_VERSION = "3.3.2";
  private static final String DEFAULT_DOWNLOAD_URL =
      "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/" + WRAPPER_VERSION
          + "/maven-wrapper-" + WRAPPER_VERSION + ".jar";

  private static final String MAVEN_WRAPPER_PROPERTIES_PATH =
      ".mvn/wrapper/maven-wrapper.properties";

  public static void main(String[] args) {
    System.out.println("- Downloader started");
    File baseDirectory = new File(args.length > 0 ? args[0] : ".");
    System.out.println("- Using base directory: " + baseDirectory.getAbsolutePath());

    File mavenWrapperPropertyFile = new File(baseDirectory, MAVEN_WRAPPER_PROPERTIES_PATH);
    if (!mavenWrapperPropertyFile.exists()) {
      System.out.println("- ERROR " + MAVEN_WRAPPER_PROPERTIES_PATH + " not found");
      System.exit(1);
    }

    Properties mavenWrapperProperties = new Properties();
    try (InputStream inputStream = java.nio.file.Files.newInputStream(mavenWrapperPropertyFile.toPath())) {
      mavenWrapperProperties.load(inputStream);
    } catch (IOException e) {
      System.out.println("- ERROR loading " + MAVEN_WRAPPER_PROPERTIES_PATH);
      e.printStackTrace();
      System.exit(1);
    }

    String url = mavenWrapperProperties.getProperty("wrapperUrl", DEFAULT_DOWNLOAD_URL);
    System.out.println("- Downloading from: " + url);

    File outputFile = new File(baseDirectory, ".mvn/wrapper/maven-wrapper.jar");
    if (outputFile.getParentFile() != null) {
      outputFile.getParentFile().mkdirs();
    }

    try {
      downloadFileFromURL(url, outputFile);
      System.out.println("- Downloaded to: " + outputFile.getAbsolutePath());
      System.out.println("Done");
    } catch (Throwable e) {
      System.out.println("- Error downloading");
      e.printStackTrace();
      System.exit(1);
    }
  }

  private static void downloadFileFromURL(String urlString, File destination) throws Exception {
    URL url = new URL(urlString);
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setInstanceFollowRedirects(true);
    connection.connect();
    int code = connection.getResponseCode();
    if (code >= 400) {
      throw new RuntimeException("HTTP " + code + " when downloading " + urlString);
    }
    try (InputStream is = connection.getInputStream();
         ReadableByteChannel rbc = Channels.newChannel(is);
         FileOutputStream fos = new FileOutputStream(destination)) {
      fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
    }
  }
}

