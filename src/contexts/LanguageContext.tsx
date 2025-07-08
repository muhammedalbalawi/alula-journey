import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    touristView: "Tourist View",
    guideView: "Guide View",
    language: "العربية",
    
    // Tourist View
    touristLogin: "Tourist Login",
    touristId: "Tourist ID",
    login: "Login",
    welcomeTourist: "Welcome to Your AlUla Journey",
    itinerary: "Your Itinerary",
    contactGuide: "Contact Your Guide",
    downloadPdf: "Download Schedule PDF",
    viewMap: "View Trip Locations",
    suggestedPlaces: "Suggested Places to Visit",
    rateGuide: "Rate Your Guide",
    touristPackage: "Tourist Package",
    packageItems: {
      refreshments: "Refreshments during trips (water, juice, light snacks)",
      sunshade: "Sunshade provided for heat protection",
      medical: "Medical assistance available if needed",
      special: "Special accommodations for health conditions"
    },
    registerJourney: "Register a New Journey",
    
    // Registration Form
    fullName: "Full Name",
    contactInfo: "Phone Number or Email (choose one)",
    nationality: "Nationality",
    specialNeeds: "Any special needs or medical conditions?",
    submit: "Submit",
    registrationSuccess: "✅ Your journey request has been submitted. A tour guide will contact you soon.",
    
    // Guide View
    guideLogin: "Tour Guide Login",
    guideId: "Guide ID",
    password: "Password",
    selectTourist: "Select Tourist",
    editItinerary: "Edit Itinerary",
    viewRatings: "View Ratings",
    journeyRequests: "New Journey Requests",
    assignSchedule: "Assign Schedule",
    
    // About
    about: "About AlUla Journey",
    aboutContent: {
      vision: "AlUla Journey supports Saudi Vision 2030 by promoting cultural heritage and sustainable tourism.",
      youth: "We empower local youth and small businesses to participate in the growing tourism sector.",
      industry: "Our platform enhances the tourism industry in the Kingdom of Saudi Arabia through innovative digital solutions."
    },
    
    // Days
    day: "Day",
    date: "Date",
    activity: "Activity",
    location: "Location",
    time: "Time",
    
    // Messages
    noItinerary: "No itinerary assigned yet. Please wait for your guide to contact you.",
    rating: "Rating",
    comment: "Comment",
    submitRating: "Submit Rating",
    
    // Common
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    error: "Error occurred",
    success: "Success"
  },
  ar: {
    // Navigation
    touristView: "عرض السائح",
    guideView: "عرض المرشد",
    language: "English",
    
    // Tourist View
    touristLogin: "تسجيل دخول السائح",
    touristId: "رقم السائح",
    login: "دخول",
    welcomeTourist: "مرحباً برحلتك في العُلا",
    itinerary: "برنامجك السياحي",
    contactGuide: "تواصل مع مرشدك",
    downloadPdf: "تحميل الجدولة",
    viewMap: "عرض مواقع الرحلة",
    suggestedPlaces: "أماكن مقترحة للزيارة",
    rateGuide: "قيّم مرشدك",
    touristPackage: "حزمة السائح",
    packageItems: {
      refreshments: "المرطبات أثناء الرحلات (ماء، عصير، وجبات خفيفة)",
      sunshade: "توفير الظلال للحماية من الحر",
      medical: "المساعدة الطبية متوفرة عند الحاجة",
      special: "ترتيبات خاصة للحالات الصحية"
    },
    registerJourney: "تسجيل رحلة جديدة",
    
    // Registration Form
    fullName: "الاسم الكامل",
    contactInfo: "رقم الجوال أو البريد الإلكتروني (اختر أحدهما)",
    nationality: "الجنسية",
    specialNeeds: "هل لديك احتياجات أو حالات صحية خاصة؟",
    submit: "إرسال",
    registrationSuccess: "✅ تم إرسال طلب رحلتك بنجاح، وسيتم التواصل معك قريبًا من قِبل المرشد السياحي.",
    
    // Guide View
    guideLogin: "تسجيل دخول المرشد السياحي",
    guideId: "رقم المرشد",
    password: "كلمة المرور",
    selectTourist: "اختر السائح",
    editItinerary: "تعديل البرنامج",
    viewRatings: "عرض التقييمات",
    journeyRequests: "طلبات الرحلات الجديدة",
    assignSchedule: "تعيين الجدولة",
    
    // About
    about: "حول رحلة العُلا",
    aboutContent: {
      vision: "رحلة العُلا تدعم رؤية السعودية 2030 من خلال تعزيز التراث الثقافي والسياحة المستدامة.",
      youth: "نمكّن الشباب المحلي والشركات الصغيرة للمشاركة في القطاع السياحي المتنامي.",
      industry: "منصتنا تعزز صناعة السياحة في المملكة العربية السعودية من خلال الحلول الرقمية المبتكرة."
    },
    
    // Days
    day: "اليوم",
    date: "التاريخ",
    activity: "النشاط",
    location: "الموقع",
    time: "الوقت",
    
    // Messages
    noItinerary: "لم يتم تعيين برنامج بعد. يرجى انتظار تواصل المرشد معك.",
    rating: "التقييم",
    comment: "التعليق",
    submitRating: "إرسال التقييم",
    
    // Common
    close: "إغلاق",
    save: "حفظ",
    cancel: "إلغاء",
    loading: "جاري التحميل...",
    error: "حدث خطأ",
    success: "نجح"
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className={language === 'ar' ? 'rtl' : 'ltr'} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};