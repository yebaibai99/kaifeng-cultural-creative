package com.kaifeng.wenchuang.repo;

import com.kaifeng.wenchuang.domain.Role;
import com.kaifeng.wenchuang.domain.UserEntity;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<UserEntity, Long> {
  Optional<UserEntity> findByEmail(String email);
  Optional<UserEntity> findByPhone(String phone);
  Page<UserEntity> findByRole(Role role, Pageable pageable);
  Page<UserEntity> findByNicknameContainingOrEmailContaining(String nickname, String email, Pageable pageable);
}