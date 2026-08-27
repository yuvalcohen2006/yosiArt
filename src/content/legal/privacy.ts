import type { LegalDoc } from './types';

/**
 * מדיניות פרטיות — drafted against חוק הגנת הפרטיות, התשמ"א-1981 incl.
 * תיקון 13 (in force 14 Aug 2025): section 11 notice duties, s.13 access,
 * s.14 correction/deletion. Reviewed for accuracy against the site's real
 * data practices (no forms, cookieless Vercel Analytics, device-only
 * localStorage, Vercel/Sanity/Google Fonts as infrastructure).
 *
 * NOTE for future edits: if a contact form, newsletter or online checkout
 * is ever added, this policy must be revised BEFORE launch (direct-mail
 * rules ss.17C-17F + inline s.11 notices would kick in).
 */
export const privacyDoc: LegalDoc = {
  updated: { he: '12 ביולי 2026', en: 'July 12, 2026' },
  he: {
    title: 'מדיניות פרטיות – YosiArt',
    intro:
      'ברוכים הבאים ל-YosiArt (yosiart.com), גלריה מקוונת להצגת ציורי אקריליק מקוריים של האמן יוסי כהן. הפרטיות שלכם חשובה לי, ומדיניות זו מסבירה בשפה פשוטה וכנה איזה מידע — מעט מאוד, למען האמת — מעובד בעת ביקורכם באתר, בהתאם לחוק הגנת הפרטיות, התשמ"א-1981, לרבות תיקון מס\' 13. בעל האתר והאחראי על המידע: יוסי כהן ("YosiArt"), אמן עצמאי. דרכי התקשרות: דוא"ל Yosicohen164@gmail.com, וואטסאפ ‎+972-54-524-1828, אינסטגרם ‎@_cohen_art. הנוסח העברי של מדיניות זו הוא הנוסח המחייב.',
    sections: [
      {
        heading: 'העיקרון המנחה: האתר אינו אוסף מידע אישי',
        body: 'האתר הוא גלריית תצוגה בלבד. אין בו הרשמה או חשבונות משתמש, אין טפסים, אין ניוזלטר ואין רכישה או תשלום מקוונים. לצד חלק מהיצירות מוצגים מחירים (בש"ח או בדולר), אך רכישה מתבצעת אך ורק בפנייה ישירה אליי. האתר עצמו אינו אוסף, אינו שומר ואינו מעביר מידע אישי על מבקריו, למעט העיבוד הטכני המזערי המתואר במדיניות זו (סטטיסטיקה אנונימית וספקי תשתית). איני מנהל מאגר שיווקי או רשימת תפוצה, איני שולח דיוור ישיר, ואיני מוכר או משתף מידע עם גורמים אחרים.\n\nמסירת מידע כלשהו — אם תבחרו לפנות אליי — היא וולונטרית לחלוטין ואינה חובה על פי דין. המשמעות היחידה של אי-מסירת פרטים היא שלא אוכל להשיב לפנייתכם.',
      },
      {
        heading: 'פניות והתכתבויות',
        body: 'אם תבחרו לפנות אליי בדוא"ל, בוואטסאפ או באינסטגרם, יישמרו אצלי הפרטים שמסרתם מיוזמתכם (שם, פרטי התקשרות ותוכן ההודעה) כהתכתבות רגילה. מטרת השימוש: מענה לפנייתכם, המשך השיחה וטיפול בהתעניינות ביצירות. ההתכתבות נשמרת כל עוד היא רלוונטית, אינה משמשת לדיוור, אינה מועברת לאחרים ואינה נמכרת. תוכלו לבקש בכל עת את מחיקתה.',
      },
      {
        heading: 'סטטיסטיקה אנונימית (Vercel Analytics)',
        body: 'האתר משתמש ב-Vercel Analytics — כלי מדידה ללא קובצי עוגיות (cookieless). הכלי אוסף נתונים סטטיסטיים מצרפיים בלבד — כגון מספר צפיות בעמוד, סוג דפדפן, סוג מכשיר ומדינה — ללא מזהים אישיים וללא מעקב חוצה-אתרים. זיהוי הביקור נעשה באמצעות מזהה טכני זמני הנמחק בתוך 24 שעות, וכתובת ה-IP שלכם אינה נשמרת. לא ניתן לזהות באמצעות הכלי מבקר ספציפי, והנתונים משמשים אותי אך ורק להבנה כללית של השימוש באתר.',
      },
      {
        heading: "העדפות בדפדפן (localStorage) ועוגיות",
        body: "כדי לזכור את ההעדפות שלכם — שפה (עברית/אנגלית), מטבע (₪/$) והגדרות שבחרתם בווידג'ט הנגישות (כגון הגדלת טקסט או ניגודיות גבוהה) — האתר שומר אותן ב-localStorage, אזור אחסון מקומי בדפדפן שלכם. מידע זה נשאר במכשירכם בלבד, אינו נשלח לשום שרת ואינו משמש למעקב. תוכלו למחוק אותו בכל עת באמצעות ניקוי נתוני האתר בהגדרות הדפדפן. האתר עצמו אינו מציב עוגיות מעקב או פרסום.",
      },
      {
        heading: 'ספקי תשתית וקישורים חיצוניים',
        body: 'כמו כל אתר, גם אתר זה נשען על ספקי תשתית: האתר מתארח ב-Vercel (שרתי CDN בארה"ב ובאירופה), תמונות היצירות מוגשות מרשת התוכן של Sanity, וגופני האתר נטענים משירות Google Fonts. במהלך טעינת האתר מגיעה כתובת ה-IP שלכם באופן טכני לספקים אלה — כפי שקורה בכל גלישה באינטרנט — לצורך הצגת התוכן בלבד, ובכפוף למדיניות הפרטיות שלהם.\n\nכפתורי הקשר באתר מפנים לפלטפורמות חיצוניות (WhatsApp, Instagram, דוא"ל). השימוש בהן כפוף לתנאי השימוש ולמדיניות הפרטיות של מפעיליהן, ואינו בשליטתי.',
      },
      {
        heading: 'זכויותיכם על פי חוק',
        body: 'על פי חוק הגנת הפרטיות עומדות לכם, בין היתר, הזכויות הבאות:\n\n- זכות עיון במידע המוחזק עליכם (סעיף 13 לחוק).\n- זכות לבקש תיקון או מחיקה של מידע שאינו נכון, שלם, ברור או מעודכן (סעיף 14 לחוק).\n\nבפועל, המידע היחיד שעשוי להיות בידי הוא התכתבות שאתם יזמתם. לכל בקשת עיון, תיקון או מחיקה, או לכל שאלה בענייני פרטיות, פנו אליי באחד מערוצי הקשר שלמעלה — ואטפל בבקשה בהקדם, ובכל מקרה בתוך המועד הקבוע בדין (לבקשת עיון: 30 ימים). כמו כן, עומדת לכם הזכות לפנות בתלונה לרשות להגנת הפרטיות.',
      },
      {
        heading: 'אבטחת מידע',
        body: 'האתר מוגש בחיבור מוצפן (HTTPS) ומתארח אצל ספקים בינלאומיים המיישמים אמצעי אבטחה מקובלים. מאחר שהאתר אינו אוסף מידע אישי, החשיפה האפשרית במקרה של תקלה היא ממילא מזערית.',
      },
      {
        heading: 'קטינים',
        body: 'האתר מתאים לצפייה בכל גיל. האתר אינו אוסף ביודעין מידע אישי מקטינים — כשם שאינו אוסף מידע אישי משאר מבקריו, כמתואר לעיל.',
      },
      {
        heading: 'שינויים במדיניות ותאריך עדכון',
        body: 'אם האתר ישתנה באופן המשפיע על פרטיותכם (למשל, הוספת טופס יצירת קשר), אעדכן מדיניות זו והנוסח המעודכן יפורסם בעמוד זה עם תאריך עדכון חדש.\n\nעדכון אחרון: 12 ביולי 2026.',
      },
    ],
  },
  en: {
    title: 'Privacy Policy – YosiArt',
    intro:
      "Welcome to YosiArt (yosiart.com), the online gallery of original acrylic paintings by the Israeli artist Yosi Cohen. Your privacy matters, and this policy explains in plain, honest language what little information is processed when you visit the site, in accordance with Israel's Protection of Privacy Law, 5741-1981, including Amendment 13. Site owner and person responsible for the data: Yosi Cohen (\"YosiArt\"), an independent artist. Contact: email Yosicohen164@gmail.com, WhatsApp +972 54-524-1828, Instagram @_cohen_art. The Hebrew version of this policy is the binding version.",
    sections: [
      {
        heading: 'The Guiding Principle: This Site Does Not Collect Personal Data',
        body: 'This site is a display gallery only. There is no registration and there are no user accounts, no forms, no newsletter, and no online checkout or payment. Prices are shown next to some works (ILS/USD), but a purchase happens only through direct contact with me. The site itself does not collect, store, or transfer personal information about its visitors, beyond the minimal technical processing described in this policy (anonymous statistics and infrastructure providers). I keep no marketing database or mailing list, send no direct mailing, and never sell or share data with others.\n\nProviding any information — if you choose to contact me — is entirely voluntary and is not required by law. The only consequence of not providing details is that I will not be able to reply to you.',
      },
      {
        heading: 'Inquiries and Correspondence',
        body: 'If you choose to contact me by email, WhatsApp, or Instagram, the details you volunteer (name, contact details, and the content of your message) are kept as ordinary correspondence. Purpose of use: replying to you, continuing the conversation, and handling your interest in the artworks. Correspondence is kept only as long as it remains relevant, is not used for mailing lists, is not passed to others, and is never sold. You may ask me to delete it at any time.',
      },
      {
        heading: 'Anonymous Statistics (Vercel Analytics)',
        body: 'The site uses Vercel Analytics, a cookieless measurement tool. It collects aggregated statistics only — such as page views, browser type, device type, and country — with no personal identifiers and no cross-site tracking. Visits are identified by a temporary technical hash that is discarded within 24 hours, and your IP address is not stored. The tool cannot identify any individual visitor, and I use this data solely to understand, in general terms, how the site is used.',
      },
      {
        heading: 'Browser Preferences (localStorage) and Cookies',
        body: "To remember your preferences — language (Hebrew/English), currency (₪/$), and the settings you choose in the accessibility widget (such as larger text or high contrast) — the site saves them in localStorage, a local storage area inside your own browser. This information stays on your device only, is never sent to any server, and is not used for tracking. You can delete it at any time by clearing the site's data in your browser settings. The site itself sets no tracking or advertising cookies.",
      },
      {
        heading: 'Infrastructure Providers and External Links',
        body: "Like every website, this site relies on infrastructure providers: it is hosted on Vercel (CDN servers in the USA and Europe), artwork images are served from Sanity's content delivery network, and the site's fonts are loaded from the Google Fonts service. While the site loads, your IP address technically reaches these providers — as happens in all web browsing — solely for delivering the content, and subject to their own privacy policies.\n\nThe contact buttons on the site lead to external platforms (WhatsApp, Instagram, email). Your use of those platforms is governed by their operators' terms and privacy policies, which are outside my control.",
      },
      {
        heading: 'Your Rights Under Israeli Law',
        body: 'Under the Protection of Privacy Law you have, among others, the following rights:\n\n- The right to access information held about you (Section 13 of the Law).\n- The right to request correction or deletion of information that is inaccurate, incomplete, unclear, or outdated (Section 14 of the Law).\n\nIn practice, the only information I may hold about you is correspondence you initiated. For any access, correction, or deletion request, or any privacy question, contact me through any of the channels above — I will handle your request promptly, and in any case within the timeframe set by law (for access requests: 30 days). You may also lodge a complaint with the Israeli Privacy Protection Authority.',
      },
      {
        heading: 'Data Security',
        body: 'The site is served over an encrypted connection (HTTPS) and is hosted by international providers that apply accepted security measures. Since the site does not collect personal data, the possible exposure in the event of a failure is minimal in any case.',
      },
      {
        heading: 'Children',
        body: 'The site is suitable for viewing at any age. It does not knowingly collect personal information from minors — just as it does not collect personal information from any other visitor, as described above.',
      },
      {
        heading: 'Changes to This Policy and Update Date',
        body: 'If the site changes in a way that affects your privacy (for example, adding a contact form), I will update this policy and publish the revised version on this page with a new update date.\n\nLast updated: July 12, 2026.',
      },
    ],
  },
};
