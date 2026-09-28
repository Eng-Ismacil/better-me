"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "so";

interface Translations {
  [key: string]: {
    en: string;
    so: string;
  };
}

export const translations: Translations = {
  // Navigation & Shell
  nav_home: { en: "Home", so: "Hoyga" },
  nav_habits: { en: "Habits", so: "Caadooyinka" },
  nav_routines: { en: "Routines", so: "Nidaamka" },
  nav_calendar: { en: "Calendar", so: "Kalandarka" },
  nav_checkin: { en: "Daily Check-in", so: "Jeeg-gareynta" },
  nav_insights: { en: "Insights", so: "Xog-falanqayn" },
  nav_achievements: { en: "Achievements", so: "Guulaha" },
  nav_reminders: { en: "Reminders", so: "Ogeysiisyada" },
  nav_notifications: { en: "Notifications", so: "Wargelinta" },
  nav_profile: { en: "Profile", so: "Boggaaga" },
  nav_settings: { en: "Settings", so: "Habaynta" },
  nav_more: { en: "More", so: "Dheeraad" },
  menu_title: { en: "Menu", so: "Qeybaha" },
  preferences_title: { en: "Preferences", so: "Dookhyada" },

  // General Actions & Common
  btn_save: { en: "Save Changes", so: "Keydi Isbedelada" },
  btn_saving: { en: "Saving...", so: "Waa la keydinayaa..." },
  btn_cancel: { en: "Cancel", so: "Ka noqo" },
  btn_edit: { en: "Edit", so: "Wax ka bedel" },
  btn_delete: { en: "Delete", so: "Tirtir" },
  btn_new_habit: { en: "New Habit", so: "Caado Cusub" },
  btn_signout: { en: "Sign Out", so: "Ka Bax" },
  btn_signin: { en: "Sign In", so: "Gal" },
  btn_signup: { en: "Create Account", so: "Sameyso Akoon" },
  btn_mark_all_read: { en: "Mark all as read", so: "Dhammaan calaamadee" },
  streak_text: { en: "14-Day Streak", so: "14-Maalmood oo Xiriir ah" },
  streak_sub: { en: "Flourishing Pace", so: "Xawaare Aad u Sarreeya" },
  search_placeholder: { en: "Search habits, routines...", so: "Raadi caadooyinka, nidaamka..." },

  // Home Screen
  today_progress: { en: "Today's Progress", so: "Horumarka Maanta" },
  habits_completed: { en: "Habits Completed", so: "Caadooyinka La Dhamaystiray" },
  consistency_strip: { en: "Weekly Consistency", so: "Joogtaynta Toddobaadka" },
  today_habits: { en: "Today's Routine", so: "Caadooyinka Maanta" },
  all_habits: { en: "All Habits", so: "Dhammaan Caadooyinka" },
  active_habits: { en: "Active Habits", so: "Caadooyinka Shaqeynaya" },

  // Achievements Screen
  achievements_title: { en: "Achievements & Milestones", so: "Guulaha iyo Billadaha" },
  achievements_subtitle: {
    en: "Celebrate your consistency, unlock badges, and level up your discipline.",
    so: "Dabaaldeg joogtayntaada, fur billado cusub oo kor u qaad edbintaada shakhsi ahaaneed.",
  },
  unlocked_badges: { en: "Unlocked Badges", so: "Billadaha La Furtay" },
  total_xp: { en: "Total Mastery Points", so: "Dhibcaha Horumarka" },
  current_level: { en: "Level 4: Ritual Master", so: "Heerka 4: Sayidka Caadooyinka" },

  // Settings Screen
  settings_title: { en: "Settings & Preferences", so: "Habaynta & Dookhyada" },
  settings_subtitle: {
    en: "Customize your language, account preferences, and notification schedule.",
    so: "Habee afka aad doorbideyso, xogta akoonkaaga, iyo ogeysiisyadaada.",
  },
  section_appearance: { en: "Language & Appearance", so: "Luuqadda & Muuqalka" },
  language_label: { en: "App Language", so: "Luuqadda App-ka" },
  language_desc: { en: "Switch between English and Af-Soomaali", so: "Kala dooro Ingiriisi iyo Af-Soomaali" },
  section_account: { en: "Account & Profile", so: "Akoonka & Bogga Shakhsiga" },
  section_security: { en: "Security & Password", so: "Amniga & Furaha Sirta" },
  change_password: { en: "Change Password", so: "Bedel Furaha Sirta" },
  reset_password_btn: { en: "Send Password Reset Link", so: "Dir Link-ga Dib u Dajinta" },
  section_notifications: { en: "Notifications", so: "Ogeysiisyada" },
  push_notifications: { en: "Daily Habit Alerts", so: "Wargelinta Caadooyinka" },
  email_summary: { en: "Weekly Email Progress", so: "Warbixinta Toddobaadlaha ah" },

  // Check-in Screen
  checkin_title: { en: "Daily Check-in & Reflection", so: "Jeeg-gareynta & Fikirka Maalinlaha" },
  checkin_subtitle: {
    en: "Take a moment to record your mood, energy, and mindful reflection.",
    so: "Daqiiqad qaado si aad u diiwaangeliso dareenkaaga, tamartaada, iyo fekerkaaga maanta.",
  },
  how_feeling: { en: "How are you feeling right now?", so: "Sideed dareemaysaa xilligan?" },
  energy_level: { en: "Energy Level", so: "Heerka Tamarta" },
  journal_prompt: {
    en: "What went well today? Any intentions or reflections?",
    so: "Maxaa si wanaagsan kuugu qabsoomay maanta? Maxay tahay qorshahaaga berri?",
  },
  save_checkin: { en: "Log Today's Check-in", so: "Diiwaangeli Jeeg-gareynta Maanta" },
  checkin_saved: { en: "Check-in logged successfully! 🌟", so: "Si guul leh ayaa loo diiwaangeliyay! 🌟" },

  // Profile Screen
  profile_title: { en: "My Profile", so: "Boggeyga Shakhsiga" },
  edit_profile: { en: "Edit Profile", so: "Wax ka bedel Boggaaga" },
  upload_avatar: { en: "Change Photo (Cloudinary)", so: "Bedel Sawirka (Cloudinary)" },
  member_duration: { en: "Member for", so: "Xubin ahaa" },
  total_completions: { en: "Completions", so: "Dhamaystirka" },
  best_streak: { en: "Best Streak", so: "Xiriirkii Ugu Wacnaa" },

  // Notifications
  notifications_title: { en: "Notifications & Alerts", so: "Wargelinta & Ogeysiisyada" },
  no_notifications: { en: "No notifications right now", so: "Wax ogeysiis ah ma jiraan hadda" },

  // Forgot Password
  forgot_pw_title: { en: "Forgot Password?", so: "Ma ilowday Furaha Sirta?" },
  forgot_pw_desc: {
    en: "Enter your registered email. We will send you a reset code via Resend.",
    so: "Geli email-kaaga diiwaangashan. Waxaan kugu soo diri doonnaa koodhka dib u dejinta adoo adeegsanaya Resend.",
  },
  send_reset_code: { en: "Send Reset Code", so: "Dir Koodhka Dib u Dajinta" },
  enter_code: { en: "Verification Code", so: "Koodhka Xaqiijinta" },
  new_password: { en: "New Password", so: "Furaha Sirta Cusub" },
  confirm_password: { en: "Confirm Password", so: "Xaqiiji Furaha Sirta" },
  reset_success: { en: "Password reset successfully! You can now log in.", so: "Furaha sirta waa la bedelay! Hadda waad geli kartaa." },
  back_to_login: { en: "Back to Login", so: "Ku noqo Gelitaanka" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("betterme_lang") as Language;
      if (stored === "en" || stored === "so") {
        setLanguageState(stored);
      }
    } catch {
      // fallback
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("betterme_lang", lang);
      document.cookie = `betterme_lang=${lang}; path=/; max-age=31536000`;
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    // During initial SSR hydration, use "en" to guarantee 100% HTML parity
    const activeLang = mounted ? language : "en";
    if (translations[key] && translations[key][activeLang]) {
      return translations[key][activeLang];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
