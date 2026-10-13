import { defineStore } from "pinia";
import { apiFetch } from "../lib/api";

type AuthResp = { access_token: string; user_id: number; role: string; nickname: string };

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: "" as string,
    userId: 0 as number,
    role: "" as string,
    nickname: "" as string,
    restored: false as boolean
  }),
  getters: {
    isAuthed: (s) => !!s.token,
    isAdmin: (s) => s.role === "ADMIN"
  },
  actions: {
    restore() {
      if (this.restored) return;
      this.restored = true;
      const raw = localStorage.getItem("auth");
      if (!raw) return;
      try {
        const v = JSON.parse(raw) as { token: string; userId: number; role: string; nickname: string };
        this.token = v.token || "";
        this.userId = v.userId || 0;
        this.role = v.role || "";
        this.nickname = v.nickname || "";
      } catch {
        localStorage.removeItem("auth");
      }
    },
    persist() {
      localStorage.setItem(
        "auth",
        JSON.stringify({ token: this.token, userId: this.userId, role: this.role, nickname: this.nickname })
      );
    },
    async loginByEmail(email: string, password: string) {
      const resp = await apiFetch<AuthResp>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      this.token = resp.access_token;
      this.userId = resp.user_id;
      this.role = resp.role;
      this.nickname = resp.nickname;
      this.persist();
    },
    logout() {
      this.token = "";
      this.userId = 0;
      this.role = "";
      this.nickname = "";
      localStorage.removeItem("auth");
    }
  }
});

