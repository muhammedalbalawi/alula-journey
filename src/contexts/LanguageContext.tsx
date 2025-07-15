
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
    // Tourist Experiences
    touristExperiences: "Tourist Experiences",
    previousTourists: "What Our Tourists Say",
    experienceGallery: "Experience Gallery",
    readMore: "Read More",
    
    // Registration Form
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
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
    addTouristSchedule: "Add Tourist Schedule",
    tourType: "Tour Type",
    tourName: "Tour Name", 
    tourLocation: "Tour Location",
    tourDuration: "Tour Duration",
    tourDescription: "Tour Description",
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
    capturePhoto: "Capture Your Moment",
    uploadOrTakePhoto: "Upload or Take a Photo",
    photoUploaded: "Photo uploaded successfully!",
    
    // Reschedule
    reschedule: "Reschedule",
    rescheduleNotes: "Reason for rescheduling or additional notes",
    submitReschedule: "Submit Reschedule Request",
    rescheduleSuccess: "Reschedule request submitted successfully!",

    // Admin View
    adminLogin: "Admin Login",
    adminId: "Admin ID",
    adminDashboard: "Admin Dashboard",
    manageGuides: "Manage Guides",
    manageTourists: "Manage Tourists",
    createGuide: "Create New Guide",
    totalGuides: "Total Guides",
    totalTourists: "Total Tourists",
    pendingAssignments: "Pending Assignments",
    activeAssignments: "Active Assignments",
    guideName: "Guide Name",
    guideEmail: "Guide Email",
    guidePhone: "Guide Phone",
    guideSpecializations: "Specializations (comma-separated)",
    guideStatus: "Status",
    available: "Available",
    busy: "Busy",
    offline: "Offline",
    active: "Active",
    pending: "Pending",
    completed: "Completed",
    assigned: "Assigned",
    approve: "Approve",
    reject: "Reject",
    remove: "Remove",
    createNewGuide: "Create New Guide",
    guideRequests: "Guide Requests",
    touristName: "Tourist Name",
    requestMessage: "Request Message",
    adminResponse: "Admin Response",
    assignGuide: "Assign Guide",
    tourAssignments: "Tour Assignments",
    tourNameField: "Tour Name",
    startDate: "Start Date",
    endDate: "End Date",
    
    // Tourist Profile
    touristProfile: "Tourist Profile",
    fullNameLabel: "Full Name",
    genderLabel: "Gender",
    nationalityLabel: "Nationality",
    contactInfoLabel: "Contact Information",
    male: "Male",
    female: "Female",
    notSpecified: "Not specified",
    selectGender: "Select your gender",
    enterFullName: "Enter your full name",
    enterNationality: "Enter your nationality",
    phoneOrContact: "Phone number or additional contact info",
    profileUpdated: "Profile updated successfully!",
    failedToLoad: "Failed to load profile information.",
    failedToUpdate: "Failed to update profile.",
    
    // Login System
    createAccount: "Create Account",
    signIn: "Sign In",
    signUp: "Sign Up",
    createTouristAccount: "Create Tourist Account",
    joinAlUla: "Join AlUla Journey today",
    welcomeBack: "Welcome back to AlUla Journey",
    emailAddressField: "Email Address",
    enterEmail: "your.email@example.com",
    enterPassword: "Enter your password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm your password",
    missingInfo: "Missing Information",
    fillAllFields: "Please fill in all required fields.",
    enterFullNameMsg: "Please enter your full name.",
    invalidEmail: "Invalid Email",
    validEmailMsg: "Please enter a valid email address.",
    invalidPhone: "Invalid Phone Number",
    validPhoneMsg: "Please enter a valid phone number.",
    passwordsNoMatch: "Passwords Do Not Match",
    passwordsMatchMsg: "Please ensure both password fields match.",
    passwordTooShort: "Password Too Short",
    passwordLengthMsg: "Password must be at least 6 characters long.",
    loginSuccessful: "Login Successful",
    loginFailed: "Login Failed",
    signInFailed: "Sign In Failed",
    signUpFailed: "Sign Up Failed",
    invalidCredentials: "Invalid credentials. Please try again.",
    accountCreated: "Account Created Successfully",
    checkEmail: "Check Your Email",
    confirmEmailMsg: "Please check your email to confirm your account before signing in.",
    unableToCreate: "Unable to create account. Please try again.",
    alreadyAccount: "Already have an account? Sign in",
    newToAlUla: "New to AlUla Journey? Create account",
    emailVerifyNote: "You may need to verify your email address after signing up.",
    useEmailPassword: "Use your email and password to access your tourist dashboard.",
    phoneComingSoon: "Phone authentication coming soon!",
    creatingAccount: "Creating Account...",
    signingIn: "Signing In...",
    
    // Tour Guide Dashboard
    tourGuideDashboard: "Tour Guide Dashboard",
    manageTours: "Manage your tours and guest requests",
    assignedTourists: "Assigned Tourists",
    yourAssignedTourists: "Your Assigned Tourists",
    noTouristsAssigned: "No tourists assigned yet",
    rescheduleRequests: "Reschedule Requests",
    noRescheduleRequests: "No reschedule requests",
    touristDetails: "Tourist Details",
    originalSchedule: "Original Schedule",
    requestedSchedule: "Requested Schedule",
    reason: "Reason",
    requestApproved: "Request Approved",
    requestDeclined: "Request Declined",
    rescheduleApproved: "The reschedule request has been approved successfully.",
    rescheduleDeclined: "The reschedule request has been declined successfully.",
    signInToDashboard: "Sign in to access your dashboard",
    signInGuide: "Sign In",
    enterGuideId: "Enter your guide ID",
    useGuidePassword: "Use your Guide ID and password from the admin",
    welcomeBackGuide: "Welcome back",
    loginError: "An error occurred during login.",
    thisMonth: "This Month",
    tours: "Tours",
    call: "Call",
    whatsApp: "WhatsApp",
    whatsAppMsg: "Hello! I'm your assigned tour guide from AlUla Journey. I'm ready to help you explore AlUla!",
    
    // Navigation
    backToMain: "Back to Main",
    backToTourist: "Back to Tourist Platform",
    
    // About Section
    saudiVision2030: "Saudi Vision 2030",
    culturalHeritage: "Cultural Heritage",
    sustainableTourism: "Sustainable Tourism",
    digitalInnovation: "Digital Innovation",
    empoweringCommunities: "Empowering Local Communities",
    localGuides: "Local Guides",
    happyTourists: "Happy Tourists",
    partnerBusinesses: "Partner Businesses",
    tourismGrowth: "Tourism Industry Growth",
    digitalPlatform: "Digital Platform Integration",
    activeStatus: "✓ Active",
    multilingualSupport: "Multilingual Support",
    arabicEnglish: "✓ Arabic & English",
    qualityAssurance: "Quality Assurance",
    ratingScore: "✓ 4.8/5 Rating",
    experienceMagic: "Experience the Magic of AlUla",
    ancientWonders: "Join us in discovering the ancient wonders and modern innovations of Saudi Arabia's crown jewel.",
    unescoHeritage: "UNESCO World Heritage",
    neomPartner: "NEOM Project Partner",
    
    // Profile
    profile: "Profile",
    profileInfo: "Profile Information"
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
    // Tourist Experiences
    touristExperiences: "تجارب السياح",
    previousTourists: "ماذا يقول سياحنا",
    experienceGallery: "معرض التجارب",
    readMore: "اقرأ المزيد",
    
    // Registration Form
    fullName: "الاسم الكامل",
    phoneNumber: "رقم الهاتف",
    emailAddress: "البريد الإلكتروني",
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
    addTouristSchedule: "إضافة جدولة سائح",
    tourType: "نوع الجولة",
    tourName: "اسم الجولة",
    tourLocation: "موقع الجولة", 
    tourDuration: "مدة الجولة",
    tourDescription: "وصف الجولة",
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
    capturePhoto: "التقط لحظتك",
    uploadOrTakePhoto: "ارفع أو التقط صورة",
    photoUploaded: "تم رفع الصورة بنجاح!",
    
    // Reschedule
    reschedule: "إعادة جدولة",
    rescheduleNotes: "سبب إعادة الجدولة أو ملاحظات إضافية",
    submitReschedule: "إرسال طلب إعادة الجدولة",
    rescheduleSuccess: "تم إرسال طلب إعادة الجدولة بنجاح!",

    // Admin View
    adminLogin: "تسجيل دخول المدير",
    adminId: "رقم المدير",
    adminDashboard: "لوحة تحكم المدير",
    manageGuides: "إدارة المرشدين",
    manageTourists: "إدارة السياح",
    createGuide: "إنشاء مرشد جديد",
    totalGuides: "إجمالي المرشدين",
    totalTourists: "إجمالي السياح",
    pendingAssignments: "المهام المعلقة",
    activeAssignments: "المهام النشطة",
    guideName: "اسم المرشد",
    guideEmail: "بريد المرشد الإلكتروني",
    guidePhone: "هاتف المرشد",
    guideSpecializations: "التخصصات (مفصولة بفواصل)",
    guideStatus: "الحالة",
    available: "متاح",
    busy: "مشغول",
    offline: "غير متصل",
    active: "نشط",
    pending: "معلق",
    completed: "مكتمل",
    assigned: "مُكلف",
    approve: "موافقة",
    reject: "رفض",
    remove: "إزالة",
    createNewGuide: "إنشاء مرشد جديد",
    guideRequests: "طلبات المرشدين",
    touristName: "اسم السائح",
    requestMessage: "رسالة الطلب",
    adminResponse: "رد المدير",
    assignGuide: "تعيين مرشد",
    tourAssignments: "تكليفات الجولات",
    tourNameField: "اسم الجولة",
    startDate: "تاريخ البداية",
    endDate: "تاريخ النهاية",
    
    // Tourist Profile
    touristProfile: "ملف السائح",
    fullNameLabel: "الاسم الكامل",
    genderLabel: "الجنس",
    nationalityLabel: "الجنسية",
    contactInfoLabel: "معلومات الاتصال",
    male: "ذكر",
    female: "أنثى",
    notSpecified: "غير محدد",
    selectGender: "اختر الجنس",
    enterFullName: "أدخل اسمك الكامل",
    enterNationality: "أدخل جنسيتك",
    phoneOrContact: "رقم الهاتف أو معلومات الاتصال الإضافية",
    profileUpdated: "تم تحديث الملف الشخصي بنجاح!",
    failedToLoad: "فشل في تحميل معلومات الملف الشخصي.",
    failedToUpdate: "فشل في تحديث الملف الشخصي.",
    
    // Login System
    createAccount: "إنشاء حساب",
    signIn: "تسجيل دخول",
    signUp: "تسجيل",
    createTouristAccount: "إنشاء حساب سائح",
    joinAlUla: "انضم إلى رحلة العُلا اليوم",
    welcomeBack: "مرحباً بعودتك إلى رحلة العُلا",
    emailAddressField: "عنوان البريد الإلكتروني",
    enterEmail: "your.email@example.com",
    enterPassword: "أدخل كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    confirmPasswordPlaceholder: "أكد كلمة المرور",
    missingInfo: "معلومات مفقودة",
    fillAllFields: "يرجى ملء جميع الحقول المطلوبة.",
    enterFullNameMsg: "يرجى إدخال اسمك الكامل.",
    invalidEmail: "بريد إلكتروني غير صالح",
    validEmailMsg: "يرجى إدخال عنوان بريد إلكتروني صالح.",
    invalidPhone: "رقم هاتف غير صالح",
    validPhoneMsg: "يرجى إدخال رقم هاتف صالح.",
    passwordsNoMatch: "كلمات المرور غير متطابقة",
    passwordsMatchMsg: "يرجى التأكد من تطابق حقلي كلمة المرور.",
    passwordTooShort: "كلمة المرور قصيرة جداً",
    passwordLengthMsg: "يجب أن تكون كلمة المرور 6 أحرف على الأقل.",
    loginSuccessful: "تم تسجيل الدخول بنجاح",
    loginFailed: "فشل تسجيل الدخول",
    signInFailed: "فشل تسجيل الدخول",
    signUpFailed: "فشل التسجيل",
    invalidCredentials: "بيانات اعتماد غير صالحة. يرجى المحاولة مرة أخرى.",
    accountCreated: "تم إنشاء الحساب بنجاح",
    checkEmail: "تحقق من بريدك الإلكتروني",
    confirmEmailMsg: "يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك قبل تسجيل الدخول.",
    unableToCreate: "غير قادر على إنشاء الحساب. يرجى المحاولة مرة أخرى.",
    alreadyAccount: "لديك حساب بالفعل؟ سجل دخولك",
    newToAlUla: "جديد في رحلة العُلا؟ أنشئ حساباً",
    emailVerifyNote: "قد تحتاج إلى التحقق من عنوان بريدك الإلكتروني بعد التسجيل.",
    useEmailPassword: "استخدم بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة السائح.",
    phoneComingSoon: "المصادقة عبر الهاتف قريباً!",
    creatingAccount: "إنشاء الحساب...",
    signingIn: "تسجيل الدخول...",
    
    // Tour Guide Dashboard
    tourGuideDashboard: "لوحة تحكم المرشد السياحي",
    manageTours: "إدارة جولاتك وطلبات الضيوف",
    assignedTourists: "السياح المُكلفون",
    yourAssignedTourists: "السياح المُكلفون لك",
    noTouristsAssigned: "لا يوجد سياح مُكلفون بعد",
    rescheduleRequests: "طلبات إعادة الجدولة",
    noRescheduleRequests: "لا توجد طلبات إعادة جدولة",
    touristDetails: "تفاصيل السائح",
    originalSchedule: "الجدولة الأصلية",
    requestedSchedule: "الجدولة المطلوبة",
    reason: "السبب",
    requestApproved: "تمت الموافقة على الطلب",
    requestDeclined: "تم رفض الطلب",
    rescheduleApproved: "تمت الموافقة على طلب إعادة الجدولة بنجاح.",
    rescheduleDeclined: "تم رفض طلب إعادة الجدولة بنجاح.",
    signInToDashboard: "سجل دخولك للوصول إلى لوحة التحكم",
    signInGuide: "تسجيل دخول",
    enterGuideId: "أدخل رقم المرشد",
    useGuidePassword: "استخدم رقم المرشد وكلمة المرور من المدير",
    welcomeBackGuide: "مرحباً بعودتك",
    loginError: "حدث خطأ أثناء تسجيل الدخول.",
    thisMonth: "هذا الشهر",
    tours: "جولات",
    call: "اتصال",
    whatsApp: "واتساب",
    whatsAppMsg: "مرحباً! أنا مرشدك السياحي المُكلف من رحلة العُلا. أنا مستعد لمساعدتك في استكشاف العُلا!",
    
    // Navigation
    backToMain: "العودة للرئيسية",
    backToTourist: "العودة لمنصة السياح",
    
    // About Section
    saudiVision2030: "رؤية السعودية 2030",
    culturalHeritage: "التراث الثقافي",
    sustainableTourism: "السياحة المستدامة",
    digitalInnovation: "الابتكار الرقمي",
    empoweringCommunities: "تمكين المجتمعات المحلية",
    localGuides: "المرشدون المحليون",
    happyTourists: "السياح السعداء",
    partnerBusinesses: "الشركات الشريكة",
    tourismGrowth: "نمو صناعة السياحة",
    digitalPlatform: "تكامل المنصة الرقمية",
    activeStatus: "✓ نشط",
    multilingualSupport: "الدعم متعدد اللغات",
    arabicEnglish: "✓ العربية والإنجليزية",
    qualityAssurance: "ضمان الجودة",
    ratingScore: "✓ تقييم 4.8/5",
    experienceMagic: "اختبر سحر العُلا",
    ancientWonders: "انضم إلينا في اكتشاف العجائب القديمة والابتكارات الحديثة لجوهرة تاج المملكة العربية السعودية.",
    unescoHeritage: "التراث العالمي لليونسكو",
    neomPartner: "شريك مشروع نيوم",
    
    // Profile
    profile: "الملف الشخصي",
    profileInfo: "معلومات الملف الشخصي"
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
