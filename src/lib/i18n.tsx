import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "ro" | "en";

const translations = {
  ro: {
    // Nav
    navGroup: "Curs de Grup",
    navPrivate: "Lecții Private",
    navKids: "Copii",
    langSwitch: "EN",

    // Hero
    heroSubtitle: "Raduga · Cursuri de limbă",
    heroTitle: "Arabă libaneză",
    heroDesc: "Lecții practice, accent pe conversație. Alege: grup · privat · copii.",
    heroBullet1: "Conversație din prima săptămână",
    heroBullet2: "Materiale incluse",
    heroBullet3: "Online sau în București",
    heroCta: "Înscrie-te",
    heroCtaSecondary: "Vezi programul",
    navCta: "Înscriere",

    // Group
    groupTitle: "Curs de Grup — Arabă Libaneză",
    groupDesc: "Prezență fizică sau online. Începem pe 17 martie 2026!",
    groupDetails: "Detalii curs",
    groupStartDate: "Data start",
    groupStartDateVal: "17 Martie 2026",
    groupSchedule: "Program",
    groupScheduleVal: "Marți & Joi, 19:00 – 20:30",
    groupDuration: "Durata",
    groupDurationVal: "~3 luni • 24 lecții în total",
    groupFormatNote: "Poți alege între prezență fizică și online.",
    groupFormTitle: "Formular de înscriere",
    groupFormatLabel: "Format dorit",
    groupPhysical: "Fizic",
    groupOnline: "Online",
    groupSubmit: "Trimite înscrierea",
    groupSubmitting: "Se trimite...",
    groupSuccess: "Înscrierea a fost trimisă cu succes! Vă vom contacta în curând.",

    // Private
    privateBadge: "Lecții individuale",
    privateTitle: "Lecții Private de Arabă",
    privateDesc: "Vrei atenție personalizată? Lasă-ne datele tale și te vom contacta pentru a stabili un program flexibil.",
    privateFormatPhysical: "Față în față (fizic)",
    privateFormatOnline: "Online",
    privateSubmit: "Vreau să fiu contactat(ă)",
    privateSubmitting: "Se trimite...",
    privateSuccess: "Cererea a fost înregistrată! Vă vom contacta în curând.",

    // Kids
    kidsBadge: "Cursuri pentru copii",
    kidsTitle: "Curs de Arabă pentru Copii",
    kidsDesc: "Avem deja 3 copii înscriși! Doar prezență fizică. Completați formularul și vă vom contacta.",
    kidsAlready: "3 copii deja înscriși — locuri limitate!",
    kidsParentName: "Numele părintelui",
    kidsChildAge: "Vârsta copilului",
    kidsChildAgePlaceholder: "ex: 8 ani",
    kidsNotes: "Observații",
    kidsNotesPlaceholder: "Orice informații adiționale...",
    kidsPhysicalOnly: "Cursul pentru copii este disponibil doar cu prezență fizică.",
    kidsSubmit: "Înscrie copilul",
    kidsSubmitting: "Se trimite...",
    kidsSuccess: "Cererea a fost înregistrată! Vă vom contacta pentru detalii.",

    // Common
    labelName: "Nume complet",
    labelPhone: "Telefon",
    labelEmail: "Email",
    labelFormat: "Format dorit",
    placeholderName: "Ion Popescu",
    placeholderPhone: "+40 7XX XXX XXX",
    placeholderEmail: "ion@email.com",

    // Features
    featTitle: "Ce îți oferim",
    feat1Title: "Lecții personalizate",
    feat1Desc: "Lecții video și live, explicate clar pentru începători și avansați.",
    feat2Title: "Exerciții ghidate",
    feat2Desc: "Materiale practice și exerciții pentru a-ți consolida cunoștințele.",
    feat3Title: "Accesibilitate totală",
    feat3Desc: "Acces online de pe computer, tabletă sau telefon mobil.",
    feat4Title: "Certificat de absolvire",
    feat4Desc: "Obține un certificat care atestă cunoștințele dobândite.",

    // Footer
    footer: "© 2026 Raduga — Cursuri de Arabă Libaneză",
  },
  en: {
    navGroup: "Group Course",
    navPrivate: "Private Lessons",
    navKids: "Kids",
    langSwitch: "RO",

    heroSubtitle: "Raduga · Language Courses",
    heroTitle: "Lebanese Arabic",
    heroDesc: "Practical lessons, conversation-focused. Choose: group · private · kids.",
    heroBullet1: "Conversation from week one",
    heroBullet2: "Materials included",
    heroBullet3: "Online or in Bucharest",
    heroCta: "Register",
    heroCtaSecondary: "See schedule",
    navCta: "Register",

    groupTitle: "Group Course — Lebanese Arabic",
    groupDesc: "Physical or online presence. Starting March 17, 2026!",
    groupDetails: "Course Details",
    groupStartDate: "Start Date",
    groupStartDateVal: "March 17, 2026",
    groupSchedule: "Schedule",
    groupScheduleVal: "Tuesday & Thursday, 7:00 PM – 8:30 PM",
    groupDuration: "Duration",
    groupDurationVal: "~3 months • 24 lessons total",
    groupFormatNote: "You can choose between physical presence and online.",
    groupFormTitle: "Registration Form",
    groupFormatLabel: "Preferred format",
    groupPhysical: "Physical",
    groupOnline: "Online",
    groupSubmit: "Submit Registration",
    groupSubmitting: "Submitting...",
    groupSuccess: "Registration submitted successfully! We'll contact you soon.",

    privateBadge: "Individual Lessons",
    privateTitle: "Private Arabic Lessons",
    privateDesc: "Want personalized attention? Leave your details and we'll contact you to set up a flexible schedule.",
    privateFormatPhysical: "Face to face (physical)",
    privateFormatOnline: "Online",
    privateSubmit: "I want to be contacted",
    privateSubmitting: "Submitting...",
    privateSuccess: "Request registered! We'll contact you soon.",

    kidsBadge: "Kids Courses",
    kidsTitle: "Arabic Course for Kids",
    kidsDesc: "We already have 3 kids enrolled! Physical presence only. Fill out the form and we'll contact you.",
    kidsAlready: "3 kids already enrolled — limited spots!",
    kidsParentName: "Parent's Name",
    kidsChildAge: "Child's Age",
    kidsChildAgePlaceholder: "e.g.: 8 years",
    kidsNotes: "Notes",
    kidsNotesPlaceholder: "Any additional information...",
    kidsPhysicalOnly: "The kids course is available only with physical presence.",
    kidsSubmit: "Register Child",
    kidsSubmitting: "Submitting...",
    kidsSuccess: "Request registered! We'll contact you for details.",

    labelName: "Full Name",
    labelPhone: "Phone",
    labelEmail: "Email",
    labelFormat: "Preferred Format",
    placeholderName: "John Smith",
    placeholderPhone: "+40 7XX XXX XXX",
    placeholderEmail: "john@email.com",

    // Features
    featTitle: "What we offer",
    feat1Title: "Personalized lessons",
    feat1Desc: "Video and live lessons, clearly explained for beginners and advanced.",
    feat2Title: "Guided exercises",
    feat2Desc: "Practical materials and exercises to consolidate your knowledge.",
    feat3Title: "Total accessibility",
    feat3Desc: "Access online from computer, tablet, or mobile phone.",
    feat4Title: "Completion certificate",
    feat4Desc: "Get a certificate that validates your acquired skills.",

    footer: "© 2026 Raduga — Lebanese Arabic Courses",
  },
} as const;

type Translations = Record<keyof typeof translations.ro, string>;

interface I18nContextType {
  lang: Lang;
  t: Translations;
  toggle: () => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("ro");
  const toggle = () => setLang((l) => (l === "ro" ? "en" : "ro"));
  return (
    <I18nContext.Provider value={{ lang, t: translations[lang], toggle }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be within I18nProvider");
  return ctx;
};
