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

    // Auth
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
    missingFields: "Please fill in all fields.",

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
    add: "Add",
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
    chooseGenderPrompt: "Are you visiting a man or a woman?",
    man: "Man",
    woman: "Woman",
    male: "Male",
    female: "Female",

    // Suspects
    suspect: "Suspect",
    suspectName: "Suspect Name",
    suspectsFound: "suspects found",
    noSuspects: "No suspects found",
    searchSuspect: "Search suspect by name...",
    selectSuspectToVisit: "Select a suspect to visit",
    browseSuspects: "Browse and select a suspect",
    notes: "Notes",
    addSuspectPrompt: "Register a new suspect",
    suspectAdded: "Suspect added successfully.",
    suspectUpdated: "Suspect updated.",
    addError: "Could not add suspect.",
    all: "All",
    filterByGender: "Filter by Gender",
    filterByStatus: "Filter by Status",
    visitCount: "Visits",

    // Status
    status: "Status",
    notHere: "Not Here",
    atCourt: "At Court",
    released: "Released",
    transferred: "Transferred",

    // Visit / ticket
    visits: "Visits",
    visitHistoryTitle: "Visit History",
    scanQr: "Scan QR Code",
    scanning: "Scanning...",
    scanSuccess: "Scan successful!",
    pointCamera: "Point your camera at the QR code",
    cameraPermission: "Please allow camera access to scan QR codes",
    noCamera: "Camera not available on this device",
    startScanning: "Start Scanning",
    stopScanning: "Stop",
    scanningFor: "Scanning for",
    visitCreated: "Visit recorded successfully",
    qrCode: "QR Code",
    timestamp: "Time",
    visitorName: "Visitor Name",
    ticket: "Ticket",
    ticketNumber: "Ticket Number",
    createdTime: "Created",
    expiryTime: "Expiry",
    valid: "Valid",
    expired: "Expired",
    timeRemaining: "Time Remaining",
    expiredMessage: "This ticket has expired",
    validTicket: "Valid for 30 minutes",
    viewTicket: "View Ticket",
    noRecords: "No records found",

    // Dashboard stats
    totalSuspects: "Total Suspects",
    totalVisits: "Total Visits",
    activeTickets: "Active Tickets",
    recentVisits: "Recent Visits",

    // Misc
    loading: "Loading...",
    unknown: "Unknown",
    minutes: "min",
    seconds: "sec",
    selectSuspect: "Select Suspect",
    confirmVisit: "Confirm Visit",
    qrDataStored: "QR data stored to this suspect's visitor list",
  },
  am: {
    // Branding
    police: "የኢትዮጵያ ፌዴራል ፖሊስ",
    bureau: "የወንጀል ምርመራ ቢሮ",
    systemName: "የጥቆለ ጎብኚዎች አስተዳደር ስርዓት",
    officialNotice: "ለኦፊሴል አጠቃቀም ብቻ። ሳንካራዊ መዳረሻ የተከለከለ ነው።",
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
    missingFields: "እባክዎ ሁሉንም ማስፈሪያዎችን ይሙሉ።",

    // Navigation
    dashboard: "ዳሽቦርድ",
    suspects: "ጥቆሎች",
    addSuspect: "ጥቆለ ያክሉ",
    visitHistory: "የጎበኝታ ታሪክ",
    home: "መነሻ",
    back: "ተመለስ",
    next: "ቀጣይ",
    continue: "ቀጥል",
    cancel: "ይቅር",
    update: "አዘመን",
    add: "አክል",
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
    chooseGenderPrompt: "ወንድ ወይስ ሴት ጥቆለ ይጎበኛሉ?",
    man: "ወንድ",
    woman: "ሴት",
    male: "ወንድ",
    female: "ሴት",

    // Suspects
    suspect: "ጥቆለ",
    suspectName: "የጥቆለ ስም",
    suspectsFound: "ጥቆሎች ተገኝተዋል",
    noSuspects: "ጥቆለ አልተገኘም",
    searchSuspect: "በስም ጥቆለ ይፈልጉ...",
    selectSuspectToVisit: "ለመጎበዝ ጥቆለ ይምረጡ",
    browseSuspects: "ጥቆሉን ይፈልጉ እና ይምረጡ",
    notes: "ማስታወሻዎች",
    addSuspectPrompt: "አዲስ ጥቆለ ያስመዝግቡ",
    suspectAdded: "ጥቆለ በተሳካ ሁኔታ ታክሏል።",
    suspectUpdated: "ጥቆለ ተዘምኗል።",
    addError: "ጥቆሉን ማከል አልተቻለም።",
    all: "ሁሉም",
    filterByGender: "በጾታ አጣራ",
    filterByStatus: "በሁኔታ አጣራ",
    visitCount: "ጎበኝታዎች",

    // Status
    status: "ሁኔታ",
    notHere: "እዚህ የሉም",
    atCourt: "በፍርድ ቤት",
    released: "ነፃ የተፈቀዱ",
    transferred: "የተዛወሩ",

    // Visit / ticket
    visits: "ጎበኝታዎች",
    visitHistoryTitle: "የጎበኝታ ታሪክ",
    scanQr: "QR ኮድ ይቃኙ",
    scanning: "በማቃኘት ላይ...",
    scanSuccess: "ቃኘቱ ተሳክቷል!",
    pointCamera: "ካሜራዎን በQR ኮድ ላይ ያቅክሩ",
    cameraPermission: "QR ኮድ ለመቃኘት ካሜራ መዳረሻን ይፍቀዱ",
    noCamera: "በዚህ መሣሪያ ላይ ካሜራ አይገኝም",
    startScanning: "ቃኘት ይጀምሩ",
    stopScanning: "አቁም",
    scanningFor: "ለ... በማቃኘት ላይ",
    visitCreated: "ጎበኝታ በተሳካ ሁኔታ ተመዝግቧል",
    qrCode: "QR ኮድ",
    timestamp: "ሰዓት",
    visitorName: "የጎብኚ ስም",
    ticket: "ቲኬት",
    ticketNumber: "የቲኬት ቁጥር",
    createdTime: "የተፈጠረበት",
    expiryTime: "የሚያበቃበት",
    valid: "ትክክል",
    expired: "የዋለ",
    timeRemaining: "የቀረው ጊዜ",
    expiredMessage: "ይህ ቲኬት ጊዜው አልፎታል",
    validTicket: "ለ30 ደቂቃ ትክክል ነው",
    viewTicket: "ቲኬት ይዩ",
    noRecords: "መዝገብ አልተገኘም",

    // Dashboard stats
    totalSuspects: "ጠቅላላ ጥቆሎች",
    totalVisits: "ጠቅላላ ጎበኝታዎች",
    activeTickets: "ንቁ ቲኬቶች",
    recentVisits: "የቅርብ ጎበኝታዎች",

    // Misc
    loading: "በመጫን ላይ...",
    unknown: "ያልታወቀ",
    minutes: "ደቂቃ",
    seconds: "ሰከንድ",
    selectSuspect: "ጥቆለ ይምረጡ",
    confirmVisit: "ጎበኝታን ያረጋግጡ",
    qrDataStored: "የQR መረጃ በዚህ ጥቆለ የጎብኚዎች ዝርዝር ተቀምጧል",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

export function getLocaleLabel(locale: Locale): string {
  return locale === "en" ? "English" : "አማርኛ";
}
