"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TRANSLATIONS } from "@/lib/translations";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [lang, setLangState] = useState("gu");
  const [theme, setThemeState] = useState("dark");
  const [fontSize, setFontSizeState] = useState("normal"); // "normal" | "large"
  const [sound, setSoundState] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Authentication State: "guest" | "citizen" | "admin"
  const [authRole, setAuthRole] = useState("guest");
  const [currentUser, setCurrentUser] = useState(null);

  const applyTheme = (th) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (th === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
      if (document.body) {
        document.body.style.backgroundColor = "#f8fafc";
        document.body.style.color = "#0f172a";
      }
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      if (document.body) {
        document.body.style.backgroundColor = "#070c18";
        document.body.style.color = "#f8fafc";
      }
    }
  };

  const applyFontSize = (size) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (size === "large") {
      root.style.fontSize = "19px"; // 120% scale
    } else {
      root.style.fontSize = "16px";
    }
  };

  // Initialize from localStorage on browser mount
  useEffect(() => {
    setMounted(true);
    try {
      // 1. Language
      const savedLang = localStorage.getItem("nagarsathi_lang");
      if (savedLang === "en" || savedLang === "gu") {
        setLangState(savedLang);
        document.documentElement.lang = savedLang;
      } else {
        document.documentElement.lang = "gu";
      }

      // 2. Theme
      const savedTheme = localStorage.getItem("nagarsathi_theme") || "dark";
      setThemeState(savedTheme);
      applyTheme(savedTheme);

      // 3. Font Size
      const savedFontSize = localStorage.getItem("nagarsathi_font") || "normal";
      setFontSizeState(savedFontSize);
      applyFontSize(savedFontSize);

      // 4. Sound
      const savedSound = localStorage.getItem("nagarsathi_sound");
      if (savedSound !== null) {
        setSoundState(savedSound === "true");
      }

      // 5. Check Auth Role
      const adminToken = localStorage.getItem("ns_admin_token");
      const adminUser = localStorage.getItem("ns_admin_user");
      const citizenToken = localStorage.getItem("ns_citizen_token");
      const citizenUser = localStorage.getItem("ns_citizen_user");

      if (adminToken && adminUser) {
        setAuthRole("admin");
        setCurrentUser(JSON.parse(adminUser));
      } else if (citizenToken && citizenUser) {
        setAuthRole("citizen");
        setCurrentUser(JSON.parse(citizenUser));
      } else {
        setAuthRole("guest");
        setCurrentUser(null);
      }
    } catch (e) {
      console.warn("Could not read from localStorage:", e);
    }
  }, []);

  const loginAsCitizen = (user, token) => {
    try {
      localStorage.setItem("ns_citizen_token", token);
      localStorage.setItem("ns_citizen_user", JSON.stringify(user));
      // Remove admin session if any
      localStorage.removeItem("ns_admin_token");
      localStorage.removeItem("ns_admin_user");
    } catch (e) {}
    setAuthRole("citizen");
    setCurrentUser(user);
  };

  const loginAsAdmin = (admin, token) => {
    try {
      localStorage.setItem("ns_admin_token", token);
      localStorage.setItem("ns_admin_user", JSON.stringify(admin));
      // Remove citizen session if any
      localStorage.removeItem("ns_citizen_token");
      localStorage.removeItem("ns_citizen_user");
    } catch (e) {}
    setAuthRole("admin");
    setCurrentUser(admin);
  };

  const logout = () => {
    try {
      localStorage.removeItem("ns_admin_token");
      localStorage.removeItem("ns_admin_user");
      localStorage.removeItem("ns_citizen_token");
      localStorage.removeItem("ns_citizen_user");
    } catch (e) {}
    setAuthRole("guest");
    setCurrentUser(null);
  };

  const setLang = (newLang) => {
    setLangState(newLang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLang;
    }
    try {
      localStorage.setItem("nagarsathi_lang", newLang);
    } catch (e) {}
  };

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    try {
      localStorage.setItem("nagarsathi_theme", newTheme);
    } catch (e) {}
  };

  const setFontSize = (newSize) => {
    setFontSizeState(newSize);
    applyFontSize(newSize);
    try {
      localStorage.setItem("nagarsathi_font", newSize);
    } catch (e) {}
  };

  const setSound = (val) => {
    setSoundState(val);
    try {
      localStorage.setItem("nagarsathi_sound", String(val));
    } catch (e) {}
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  // Translation helper with hydration safety
  const t = (section, key) => {
    const activeLang = mounted ? lang : "gu";
    const activeDict = TRANSLATIONS[activeLang] || TRANSLATIONS.gu;
    if (section && key) {
      return activeDict[section]?.[key] || key;
    }
    return key;
  };

  return (
    <SettingsContext.Provider
      value={{
        lang,
        setLang,
        theme,
        setTheme,
        fontSize,
        setFontSize,
        sound,
        setSound,
        isSettingsOpen,
        openSettings,
        closeSettings,
        t,
        mounted,
        authRole,
        currentUser,
        loginAsCitizen,
        loginAsAdmin,
        logout
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
