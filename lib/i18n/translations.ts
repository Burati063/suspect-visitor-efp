// Bilingual UI dictionary: English (en) and Amharic (am)

export type Locale = "en" | "am";

export const translations = {
  en: {
    // Branding
    police: "Ethiopia Federal Police",
    bureau: "Crime Investigation Bureau",
    systemName: "Suspect Visitor Management System",
    officialNotice: "Official use only. Unauthorized access is prohibited.",
    poweredBy: "Ethiopia Federal Police - Crime Investigation Bureau",

    // Auth (kept for compatibility, not shown in UI)
    login: "Login",
    logout: "Logout",
    signup: "Sign Up",
    fullName: "Full Name",
    name: "Name",
    phone: "Phone",
    password: "Password",
    email: "Email",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    loginPrompt: "Sign in to access the system",
    visitorLogin: "Visitor Login",
    adminLogin: "Admin Login",
    loginError: "Login failed. Check your credentials.",
    signupSuccess: "Account created. Please login.",
    signupError: "Sign up failed. Try again.",
    signingIn: "Signing in...",
    missingFields: "Please fill in all required fields.",

    // Navigation
    dashboard: "Dashboard",
    suspects: "Suspects",
    addSuspect: "Add Suspect",
    visitHistory: "Visit History",
    home: "Home",
    back: "Back",
    next: "Next",
    continue: "Continue",
    cancel: "Cancel",
    update: "Update",
    add: "Add Suspect",
    save: "Save",

    // Roles
    admin: "Admin",
    visitor: "Visitor",
    role: "Role",

    // Language
    language: "Language",
    selectLanguage: "Language",
    english: "English",
    amharic: "Amharic",

    // Gender
    gender: "Gender",
    selectGender: "Select Gender",
    chooseGenderPrompt: "Are you visiting a male or female suspect?",
    man: "Male Suspect",
    woman: "Female Suspect",
    male: "Male",
    female: "Female",

    // Suspects
    suspect: "Suspect",
    suspectName: "Suspect Name",
    suspectsFound: "suspects found",
    noSuspects: "No suspects found",
    searchSuspect: "Search by name...",
    selectSuspectToVisit: "Select a suspect to visit",
    browseSuspects: "Browse and select a suspect",
    notes: "Notes",
    addSuspectPrompt: "Register a new suspect in the system",
    suspectAdded: "Suspect added successfully.",
    suspectUpdated: "Status updated.",
    addError: "Could not add suspect.",
    all: "All",
    filterByGender: "Gender",
    filterByStatus: "Status",
    visitCount: "Visits",

    // Status
    status: "Status",
    available: "Available",
    notHere: "Not Here",
    atCourt: "At Court",
    released: "Released",
    transferred: "Transferred",
    notAvailableMessage: "This suspect is currently not available for visits.",

    // Visit / ticket
    visits: "Visits",
    visitHistoryTitle: "Visit History",
    scanQr: "Scan QR Code",
    scanning: "Scanning...",
    scanSuccess: "Scan successful!",
    pointCamera: "Point your camera at the QR code",
    cameraPermission: "Allow camera access when prompted",
    noCamera: "Camera not available on this device",
    startScanning: "Start Scanning",
    stopScanning: "Stop",
    scanningFor: "Visiting",
    visitCreated: "Visit recorded successfully",
    qrCode: "QR Code",
    timestamp: "Time",
    visitorName: "Visitor ID (QR)",
    ticket: "VISIT PASS",
    ticketNumber: "Ticket No.",
    createdTime: "Issued",
    expiryTime: "Expires",
    valid: "Valid",
    expired: "Expired",
    timeRemaining: "Time Remaining",
    expiredMessage: "This pass has expired",
    validTicket: "Valid for 30 minutes",
    viewTicket: "View Ticket",
    noRecords: "No records found",

    // Dashboard stats
    totalSuspects: "Total Suspects",
    totalVisits: "Total Visits",
    activeTickets: "Active Passes",
    recentVisits: "Recent Visits",

    // Misc
    loading: "Loading...",
    unknown: "Unknown",
    minutes: "min",
    seconds: "sec",
    selectSuspect: "Select Suspect",
    confirmVisit: "Confirm Visit",
    qrDataStored: "Visit recorded. QR code stored as visitor identity.",
  },

  am: {
    // Branding
    police: "የኢትዮጵያ ፌዴራል ፖሊስ",
    bureau: "የወንጀል ምርመራ ቢሮ",
    systemName: "የተጠርጣሪ ጎብኚ አስተዳደር ስርዓት",
    officialNotice: "ለኦፊሴል አገልግሎት ብቻ። ያልተፈቀደ መዳረሻ የተከለከለ ነው።",
    poweredBy: "የኢትዮጵያ ፌዴራል ፖሊስ - የወንጀል ምርመራ ቢሮ",

    // Auth
    login: "ግባ",
    logout: "ውጣ",
    signup: "ተመዝገብ",
    fullName: "ሙሉ ስም",
    name: "ስም",
    phone: "ስልክ",
    password: "የይለፍ ቃል",
    email: "ኢሜይል",
    createAccount: "መለያ ፍጠር",
    alreadyHaveAccount: "መለያ አለዎት?",
    noAccount: "መለያ የለዎትም?",
    loginPrompt: "ለመግባት መረጃዎን ያስገቡ",
    visitorLogin: "የጎብኚ መግቢያ",
    adminLogin: "የአስተዳዳሪ መግቢያ",
    loginError: "መግባት አልተሳካም። መረጃዎን ያረጋግጡ።",
    signupSuccess: "መለያ ተፈጥሯል። እባክዎ ይግቡ።",
    signupError: "መመዝገብ አልተሳካም። እንደገና ይሞክሩ።",
    signingIn: "በማስገባት ላይ...",
    missingFields: "እባክዎ ሁሉንም አስፈላጊ መረጃዎችን ይሙሉ።",

    // Navigation
    dashboard: "ዳሽቦርድ",
    suspects: "ተጠርጣሪዎች",
    addSuspect: "ተጠርጣሪ ጨምር",
    visitHistory: "የጎብኚ ታሪክ",
    home: "መነሻ",
    back: "ተመለስ",
    next: "ቀጣይ",
    continue: "ቀጥል",
    cancel: "ሰርዝ",
    update: "አዘምን",
    add: "ተጠርጣሪ ጨምር",
    save: "አስቀምጥ",

    // Roles
    admin: "አስተዳዳሪ",
    visitor: "ጎብኚ",
    role: "ሚና",

    // Language
    language: "ቋንቋ",
    selectLanguage: "ቋንቋ",
    english: "English",
    amharic: "አማርኛ",

    // Gender
    gender: "ጾታ",
    selectGender: "ጾታ ይምረጡ",
    chooseGenderPrompt: "የወንድ ወይስ የሴት ተጠርጣሪ ሊጎበኙ ነው?",
    man: "የወንድ ተጠርጣሪ",
    woman: "የሴት ተጠርጣሪ",
    male: "ወንድ",
    female: "ሴት",

    // Suspects
    suspect: "ተጠርጣሪ",
    suspectName: "የተጠርጣሪ ስም",
    suspectsFound: "ተጠርጣሪዎች ተገኝተዋል",
    noSuspects: "ተጠርጣሪ አልተገኘም",
    searchSuspect: "በስም ፈልግ...",
    selectSuspectToVisit: "ሊጎበኙ የሚፈልጉትን ተጠርጣሪ ይምረጡ",
    browseSuspects: "ተጠርጣሪዎችን ይፈልጉ እና ይምረጡ",
    notes: "ማስታወሻ",
    addSuspectPrompt: "አዲስ ተጠርጣሪ በስርዓቱ ውስጥ ይመዝግቡ",
    suspectAdded: "ተጠርጣሪ በተሳካ ሁኔታ ተጨምሯል።",
    suspectUpdated: "ሁኔታ ተዘምኗል።",
    addError: "ተጠርጣሪ ማከል አልተቻለም።",
    all: "ሁሉም",
    filterByGender: "ጾታ",
    filterByStatus: "ሁኔታ",
    visitCount: "ጎብኚዎች",

    // Status
    status: "ሁኔታ",
    available: "ይገኛሉ",
    notHere: "እዚህ የሉም",
    atCourt: "በፍርድ ቤት",
    released: "ተፈቷል",
    transferred: "ተዛውሯል",
    notAvailableMessage: "ይህ ተጠርጣሪ በአሁኑ ጊዜ ለጎብኚዎች አይገኝም።",

    // Visit / ticket
    visits: "ጎብኚዎች",
    visitHistoryTitle: "የጎብኚ ታሪክ",
    scanQr: "QR ኮድ ቃኝ",
    scanning: "በማቃኘት ላይ...",
    scanSuccess: "ቃኘቱ ተሳክቷል!",
    pointCamera: "ካሜራውን ወደ QR ኮዱ ያቅኑ",
    cameraPermission: "ካሜራ ሲጠየቅ ፍቃድ ይስጡ",
    noCamera: "ካሜራ በዚህ መሣሪያ አይገኝም",
    startScanning: "ቃኘት ጀምር",
    stopScanning: "አቁም",
    scanningFor: "የሚጎበኙት",
    visitCreated: "ጎብኝታ በተሳካ ሁኔታ ተመዝግቧል",
    qrCode: "QR ኮድ",
    timestamp: "ሰዓት",
    visitorName: "የጎብኚ መታወቂያ (QR)",
    ticket: "የጎብኚ ፈቃድ",
    ticketNumber: "የቲኬት ቁጥር",
    createdTime: "የተሰጠበት ሰዓት",
    expiryTime: "ጊዜ ይጠናቀቃል",
    valid: "ትክክለኛ",
    expired: "ጊዜው ያለፈ",
    timeRemaining: "የቀረ ጊዜ",
    expiredMessage: "የጎብኚ ፈቃዱ ጊዜው አልፏል",
    validTicket: "ለ30 ደቂቃ ትክክለኛ ነው",
    viewTicket: "ቲኬት ይመልከቱ",
    noRecords: "ምንም መዝገብ አልተገኘም",

    // Dashboard stats
    totalSuspects: "ጠቅላላ ተጠርጣሪዎች",
    totalVisits: "ጠቅላላ ጎብኚዎች",
    activeTickets: "ንቁ ፈቃዶች",
    recentVisits: "የቅርብ ጎብኚዎች",

    // Misc
    loading: "በመጫን ላይ...",
    unknown: "ያልታወቀ",
    minutes: "ደቂቃ",
    seconds: "ሰከንድ",
    selectSuspect: "ተጠርጣሪ ይምረጡ",
    confirmVisit: "ጎብኝታ ያረጋግጡ",
    qrDataStored: "ጎብኝታ ተመዝግቧል። QR ኮድ እንደ ጎብኚ መታወቂያ ተቀምጧል።",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

export function getLocaleLabel(locale: Locale): string {
  return locale === "en" ? "English" : "አማርኛ";
}
