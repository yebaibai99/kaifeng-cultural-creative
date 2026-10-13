package com.kaifeng.wenchuang.security;

import com.kaifeng.wenchuang.domain.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final String issuer;
  private final SecretKey key;
  private final long accessMinutes;

  public JwtService(
      @Value("${app.jwt.issuer}") String issuer,
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.accessTokenMinutes}") long accessMinutes) {
    this.issuer = issuer;
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.accessMinutes = accessMinutes;
  }

  public String issueAccessToken(long userId, Role role) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(accessMinutes * 60);
    return Jwts.builder()
        .issuer(issuer)
        .subject(String.valueOf(userId))
        .claim("role", role.name())
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .signWith(key)
        .compact();
  }

  public JwtUser parse(String token) {
    Claims c =
        Jwts.parser()
            .verifyWith(key)
            .requireIssuer(issuer)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    long userId = Long.parseLong(c.getSubject());
    Role role = Role.valueOf(String.valueOf(c.get("role")));
    return new JwtUser(userId, role);
  }
}

