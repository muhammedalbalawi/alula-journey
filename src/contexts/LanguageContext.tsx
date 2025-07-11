
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateLocation: (location: string) => string;
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
    registerJourney: "Register a New Journey",
    
    // Tourist Experiences
    touristExperiences: "Tourist Experiences",
    previousTourists: "What Our Tourists Say",
    experienceGallery: "Experience Gallery",
    readMore: "Read More",
    
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
    packageManagement: "Package Management",
    managePackages: "Manage Tourist Packages",
    guideNotes: "Guide Notes",
    addNotes: "Add Notes",
    setLocation: "Set Location",
    
    // Package Management (moved to guide view)
    touristPackage: "Tourist Package",
    packageItems: {
      refreshments: "Refreshments during trips (water, juice, light snacks)",
      sunshade: "Sunshade provided for heat protection",
      medical: "Medical assistance available if needed",
      special: "Special accommodations for health conditions"
    },
    enablePackage: "Enable Package",
    disablePackage: "Disable Package",
    packageEnabled: "Package Enabled",
    packageDisabled: "Package Disabled",
    customizePackage: "Customize Package",
    
    // Destination Categories
    heritageSites: "Heritage Sites",
    attractionPlaces: "Attraction Places",
    adventurousExperiences: "Adventurous Experiences",
    
    // Categories examples
    categories: {
      heritage: {
        name: "Heritage Sites",
        examples: ["Hegra Archaeological Site", "Dadan Archaeological Site", "AlUla Old Town"]
      },
      attraction: {
        name: "Attraction Places",
        examples: ["Elephant Rock", "Mirror's Edge", "AlUla Arts District"]
      },
      adventure: {
        name: "Adventurous Experiences", 
        examples: ["Desert Safari", "Rock Climbing", "Hot Air Balloon"]
      }
    },
    
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
    notes: "Notes",
    viewNotes: "View Notes",
    
    // Messages
    noItinerary: "No itinerary assigned yet. Please wait for your guide to contact you.",
    rating: "Rating",
    comment: "Comment",
    submitRating: "Submit Rating",
    welcomeGuide: "Welcome, Tour Guide",
    statistics: "Statistics",
    activeTourists: "Active Tourists",
    pendingRequests: "Pending Requests",
    driverBookings: "Driver Bookings",
    averageRating: "Average Rating",
    addNewDay: "Add New Day",
    assignDriver: "Assign Driver",
    
    // Driver Booking
    bookDriver: "Book a Driver",
    pickupLocation: "Pickup Location (Optional)",
    specialRequest: "Special request or notes (Optional)",
    confirmBooking: "Confirm Booking",
    driverBookingSuccess: "✅ Driver booked successfully. You will be contacted shortly.",
    driverBookingRequests: "Driver Booking Requests",
    
    // Date/Time
    selectDate: "Select Date",
    selectTime: "Select Time",
    
    // Common
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    error: "Error occurred",
    success: "Success",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    back: "Back",
    
    // Capture Your Moment
    captureYourMoment: "Capture Your Moment",
    captureDescription: "Keep your memories alive – upload or snap a photo from your trip!",
    uploadOrTakePhoto: "Upload or Take a Photo",
    photoUploaded: "Photo uploaded successfully!",
    
    // Reschedule
    reschedule: "Reschedule",
    rescheduleNotes: "Reason for rescheduling or additional notes",
    submitReschedule: "Submit Reschedule Request",
    rescheduleSuccess: "Reschedule request submitted successfully!"
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
    registerJourney: "تسجيل رحلة جديدة",
    
    // Tourist Experiences
    touristExperiences: "تجارب السياح",
    previousTourists: "ماذا يقول سياحنا",
    experienceGallery: "معرض التجارب",
    readMore: "اقرأ المزيد",
    
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
    packageManagement: "إدارة الحزم",
    managePackages: "إدارة حزم السياح",
    guideNotes: "ملاحظات المرشد",
    addNotes: "إضافة ملاحظات",
    setLocation: "تحديد الموقع",
    
    // Package Management (moved to guide view)
    touristPackage: "حزمة السائح",
    packageItems: {
      refreshments: "المرطبات أثناء الرحلات (ماء، عصير، وجبات خفيفة)",
      sunshade: "توفير الظلال للحماية من الحر",
      medical: "المساعدة الطبية متوفرة عند الحاجة",
      special: "ترتيبات خاصة للحالات الصحية"
    },
    enablePackage: "تفعيل الحزمة",
    disablePackage: "إيقاف الحزمة",
    packageEnabled: "تم تفعيل الحزمة",
    packageDisabled: "تم إيقاف الحزمة",
    customizePackage: "تخصيص الحزمة",
    
    // Destination Categories
    heritageSites: "المواقع التراثية",
    attractionPlaces: "أماكن الجذب",
    adventurousExperiences: "التجارب المغامرة",
    
    // Categories examples
    categories: {
      heritage: {
        name: "المواقع التراثية",
        examples: ["موقع الحجر الأثري", "موقع دادان الأثري", "البلدة القديمة"]
      },
      attraction: {
        name: "أماكن الجذب",
        examples: ["جبل الفيل", "حافة المرآة", "حي الفنون في العلا"]
      },
      adventure: {
        name: "التجارب المغامرة",
        examples: ["رحلة صحراوية", "تسلق الصخور", "منطاد الهواء الساخن"]
      }
    },
    
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
    notes: "الملاحظات",
    viewNotes: "عرض الملاحظات",
    
    // Messages
    noItinerary: "لم يتم تعيين برنامج بعد. يرجى انتظار تواصل المرشد معك.",
    rating: "التقييم",
    comment: "التعليق",
    submitRating: "إرسال التقييم",
    welcomeGuide: "مرحباً، أيها المرشد السياحي",
    statistics: "الإحصائيات",
    activeTourists: "السياح النشطون",
    pendingRequests: "الطلبات المعلقة",
    driverBookings: "حجوزات السائق",
    averageRating: "متوسط التقييم",
    addNewDay: "إضافة يوم جديد",
    assignDriver: "تعيين سائق",
    
    // Driver Booking
    bookDriver: "حجز سائق",
    pickupLocation: "موقع الاستلام (اختياري)",
    specialRequest: "طلب خاص أو ملاحظات (اختياري)",
    confirmBooking: "تأكيد الحجز",
    driverBookingSuccess: "✅ تم حجز السائق بنجاح، سيتم التواصل معك قريبًا.",
    driverBookingRequests: "طلبات حجز السائق",
    
    // Date/Time
    selectDate: "اختر التاريخ",
    selectTime: "اختر الوقت",
    
    // Common
    close: "إغلاق",
    save: "حفظ",
    cancel: "إلغاء",
    loading: "جاري التحميل...",
    error: "حدث خطأ",
    success: "نجح",
    edit: "تعديل",
    delete: "حذف",
    confirm: "تأكيد",
    back: "رجوع",
    
    // Capture Your Moment
    captureYourMoment: "اِلْتَقِط لَحْظَتَك",
    captureDescription: "أبق ذكرياتك حية – ارفع أو التقط صورة من رحلتك!",
    uploadOrTakePhoto: "ارفع أو التقط صورة",
    photoUploaded: "تم رفع الصورة بنجاح!",
    
    // Reschedule
    reschedule: "إعادة جدولة",
    rescheduleNotes: "سبب إعادة الجدولة أو ملاحظات إضافية",
    submitReschedule: "إرسال طلب إعادة الجدولة",
    rescheduleSuccess: "تم إرسال طلب إعادة الجدولة بنجاح!"
  }
};

const locationTranslations = {
  'Jabal AlFil': 'جبل الفيل',
  'Elephant Rock': 'جبل الفيل',
  'Madain Saleh': 'الحجر',
  'Hegra': 'الحجر',
  'Hegra Archaeological Site': 'موقع الحجر الأثري',
  'AlUla Old Town': 'البلدة القديمة',
  'Old Town': 'البلدة القديمة',
  'Historical District': 'المنطقة التاريخية',
  'Dadan Archaeological Site': 'موقع دادان الأثري',
  'Dadan': 'دادان',
  'Mirror\'s Edge': 'حافة المرآة',
  'Sharaan Nature Reserve': 'محمية شرعان الطبيعية',
  'Sharaan': 'شرعان',
  'AlUla Arts District': 'حي الفنون في العلا',
  'AlUla Art District': 'حي الفنون في العلا'
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

  const translateLocation = (location: string): string => {
    if (language === 'ar' && locationTranslations[location as keyof typeof locationTranslations]) {
      return locationTranslations[location as keyof typeof locationTranslations];
    }
    return location;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateLocation }}>
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
