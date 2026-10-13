package com.kaifeng.wenchuang.security;

import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtil {
  private SecurityUtil() {}

  public static JwtUser requireUser() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !(auth.getPrincipal() instanceof JwtUser u)) {
      throw new IllegalStateException("UNAUTHENTICATED");
    }
    return u;
  }
}

