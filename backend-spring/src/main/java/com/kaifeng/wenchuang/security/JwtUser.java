package com.kaifeng.wenchuang.security;

import com.kaifeng.wenchuang.domain.Role;

public record JwtUser(long userId, Role role) {}

