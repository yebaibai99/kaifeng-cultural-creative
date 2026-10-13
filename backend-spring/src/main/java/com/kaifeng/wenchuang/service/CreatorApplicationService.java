package com.kaifeng.wenchuang.service;

import com.kaifeng.wenchuang.domain.*;
import com.kaifeng.wenchuang.repo.CreatorApplicationRepo;
import com.kaifeng.wenchuang.repo.UserRepo;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CreatorApplicationService {
  private final CreatorApplicationRepo creatorApplicationRepo;
  private final UserRepo userRepo;

  public CreatorApplicationService(CreatorApplicationRepo creatorApplicationRepo, UserRepo userRepo) {
    this.creatorApplicationRepo = creatorApplicationRepo;
    this.userRepo = userRepo;
  }

  public Optional<CreatorApplicationEntity> myLatest(long userId) {
    return creatorApplicationRepo.findTopByUserIdOrderByIdDesc(userId);
  }

  @Transactional
  public CreatorApplicationEntity submit(long userId, String realName, String idNumber, String portfolioUrl, String note) {
    var latest = creatorApplicationRepo.findTopByUserIdOrderByIdDesc(userId);
    if (latest.isPresent() && latest.get().status == CreatorApplicationStatus.PENDING) {
      throw new IllegalArgumentException("ALREADY_PENDING");
    }

    UserEntity u = userRepo.findById(userId).orElseThrow(() -> new IllegalArgumentException("USER_NOT_FOUND"));
    u.creatorStatus = CreatorStatus.PENDING;
    userRepo.save(u);

    CreatorApplicationEntity app = new CreatorApplicationEntity();
    app.userId = userId;
    app.realName = realName;
    app.idNumber = idNumber;
    app.portfolioUrl = portfolioUrl == null ? "" : portfolioUrl;
    app.note = note;
    app.status = CreatorApplicationStatus.PENDING;
    return creatorApplicationRepo.save(app);
  }

  public List<CreatorApplicationEntity> listPending() {
    return creatorApplicationRepo.findByStatusOrderByIdDesc(CreatorApplicationStatus.PENDING);
  }

  public List<CreatorApplicationEntity> listApproved() {
    return creatorApplicationRepo.findByStatusOrderByIdDesc(CreatorApplicationStatus.APPROVED);
  }

  public List<CreatorApplicationEntity> listRejected() {
    return creatorApplicationRepo.findByStatusOrderByIdDesc(CreatorApplicationStatus.REJECTED);
  }

  public List<CreatorApplicationEntity> listAll() {
    return creatorApplicationRepo.findAllByOrderByIdDesc();
  }

  @Transactional
  public CreatorApplicationEntity approve(long appId) {
    CreatorApplicationEntity app =
        creatorApplicationRepo
            .findById(appId)
            .orElseThrow(() -> new IllegalArgumentException("APPLICATION_NOT_FOUND"));
    app.status = CreatorApplicationStatus.APPROVED;
    creatorApplicationRepo.save(app);

    UserEntity u = userRepo.findById(app.userId).orElseThrow(() -> new IllegalArgumentException("USER_NOT_FOUND"));
    u.role = Role.CREATOR;
    u.creatorStatus = CreatorStatus.APPROVED;
    userRepo.save(u);
    return app;
  }

  @Transactional
  public CreatorApplicationEntity reject(long appId, String note) {
    CreatorApplicationEntity app =
        creatorApplicationRepo
            .findById(appId)
            .orElseThrow(() -> new IllegalArgumentException("APPLICATION_NOT_FOUND"));
    app.status = CreatorApplicationStatus.REJECTED;
    if (note != null && !note.isBlank()) app.note = note;
    creatorApplicationRepo.save(app);

    UserEntity u = userRepo.findById(app.userId).orElseThrow(() -> new IllegalArgumentException("USER_NOT_FOUND"));
    u.creatorStatus = CreatorStatus.REJECTED;
    userRepo.save(u);
    return app;
  }
}

