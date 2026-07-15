import type { LegalDoc } from './types';

/**
 * הצהרת נגישות — drafted against חוק שוויון זכויות לאנשים עם מוגבלות,
 * התשנ"ח-1998 + תקנות שוויון זכויות (התאמות נגישות לשירות), התשע"ג-2013
 * (תקנה 35), targeting ת"י 5568 (Sept-2023 revision → WCAG 2.1) level AA.
 * Wording deliberately claims "striving", never certified conformance,
 * and relies on no exemption. Contact person replaces a רכז נגישות
 * (mandatory only from 25 employees).
 *
 * NOTE: once real assistive-tech testing is done (e.g. NVDA + Chrome,
 * VoiceOver + Safari), add a sentence listing the tested combinations.
 */
export const accessibilityDoc: LegalDoc = {
  updated: { he: '12 ביולי 2026', en: 'July 12, 2026' },
  he: {
    title: 'הצהרת נגישות – YosiArt',
    intro:
      'אתר YosiArt‏ (yosiart.vercel.app) הוא גלריה מקוונת המציגה ציורי אקריליק מקוריים של האמן יוסי כהן. אנו רואים חשיבות רבה במתן חוויית גלישה שוויונית, מכבדת ועצמאית לכל המבקרים, ובהם אנשים עם מוגבלות, ופועלים באופן שוטף לשיפור נגישות האתר.',
    sections: [
      {
        heading: 'הבסיס החוקי ויעד הנגישות',
        body: 'הנגשת האתר מבוצעת בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות, התשנ"ח-1998, ולתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013, ובכללן תקנה 35 העוסקת בנגישות שירותי אינטרנט. התקנות מפנות לתקן הישראלי ת"י 5568 "קווים מנחים לנגישות תכנים באינטרנט", המבוסס על הנחיות WCAG של ארגון W3C ברמה AA — ובגרסתו המעודכנת מספטמבר 2023, על הנחיות WCAG 2.1.\n\nחשוב לנו לדייק: האתר שואף לעמוד בדרישות ת"י 5568 ברמה AA ומיישם בפועל את מרביתן, אך לא נערכה לו בדיקת הסמכה חיצונית ואיננו מציגים תעודת התאמה. ייתכנו רכיבים שטרם הונגשו במלואם, ואנו ממשיכים לשפרם באופן שוטף. העסק אינו מסתמך על פטור או הקלה כלשהם מכוח התקנות.\n\nהאתר מופעל בידי אמן עצמאי יחיד ללא עובדים. חובת מינוי רכז נגישות לפי החוק חלה על מי שמעסיק 25 עובדים ומעלה, ולכן אינה חלה על עסק זה; עם זאת, יוסי כהן משמש איש הקשר לכל פנייה בענייני נגישות, כמפורט בהמשך.',
      },
      {
        heading: 'התאמות הנגישות שבוצעו באתר',
        body: '- מבנה HTML סמנטי עם אזורי ניווט (Landmarks) לתמיכה בקוראי מסך\n- טקסט חלופי (Alt) לתמונות היצירות, המנוהל ומתעדכן במערכת ניהול התוכן\n- קישור "דילוג לתוכן הראשי" בראש כל עמוד\n- תמיכה בניווט באמצעות מקלדת, עם סימון פוקוס גלוי על הרכיבים האינטראקטיביים\n- כיבוד העדפת המערכת להפחתת תנועה (prefers-reduced-motion) בכל האנימציות באתר\n- תוויות ARIA לכפתורים מבוססי אייקון ולרכיבים ללא טקסט גלוי\n- תמיכה דו-לשונית מלאה: עברית (מימין לשמאל) ואנגלית (משמאל לימין)',
      },
      {
        heading: 'רכיב הנגישות באתר',
        body: "בכל עמודי האתר זמין כפתור נגישות צף, המציע:\n- הגדלה והקטנה של גודל הטקסט\n- מצב ניגודיות גבוהה\n- הדגשת קישורים\n- עצירת אנימציות ותנועה\n- גופן קריא\n- איפוס כל ההגדרות\n\nהעדפות הנגישות (וכן העדפות שפה ומטבע) נשמרות בדפדפן שלכם בלבד (localStorage) ואינן נשלחות לשום גורם.",
      },
      {
        heading: 'התאמות בדפדפן ובמערכת ההפעלה',
        body: 'האתר נבנה לעבודה בגרסאות עדכניות של הדפדפנים הנפוצים — Chrome,‏ Edge,‏ Firefox ו-Safari — ומומלץ לגלוש בגרסה מעודכנת של הדפדפן.\n\nבנוסף לכלים המובנים באתר, ניתן להיעזר ביכולות הנגישות של הדפדפן ומערכת ההפעלה: הגדלת התצוגה בדפדפן (מקש Ctrl יחד עם + או −, או Cmd במחשבי Mac); מצבי ניגודיות גבוהה והגדלת טקסט בהגדרות מערכת ההפעלה; קוראי מסך כגון NVDA (חינמי, ל-Windows) ו-VoiceOver (מובנה במכשירי Apple); והפעלת "הפחתת תנועה" בהגדרות המערכת — האתר מזהה הגדרה זו ומכבד אותה אוטומטית.',
      },
      {
        heading: 'מגבלות נגישות ידועות',
        body: 'למרות מאמצינו, ייתכן שתיתקלו ברכיבים שאינם נגישים במלואם: תיאורי טקסט חלופי של יצירות ותיקות עשויים להיות חלקיים עד להשלמת עדכונם; תכנים ושירותים של צדדים שלישיים — כגון עמוד האינסטגרם או פתיחת שיחת וואטסאפ בקישור חיצוני — אינם בשליטתנו; וייתכנו אי-התאמות נקודתיות בדפדפנים או בטכנולוגיות עזר מסוימים. אם נתקלתם בקושי כלשהו, נשמח מאוד לשמוע על כך ונפעל לתיקונו בהקדם.',
      },
      {
        heading: 'פנייה ומשוב בנושאי נגישות',
        body: 'איש הקשר לענייני נגישות: יוסי כהן, בעל האתר.\n- דוא"ל: Yosicohen164@gmail.com\n- וואטסאפ: 054-524-1828 (מחו"ל: ‎+972-54-524-1828)\n\nכדי שנוכל לטפל בפנייה ביעילות, מומלץ לציין את כתובת העמוד שבו נתקלתם בבעיה, תיאור הבעיה, וסוג הדפדפן וטכנולוגיית העזר שבהם השתמשתם. אנו מתחייבים להשיב לכל פנייה בתוך 7 ימי עסקים, ופועלים לתיקון ליקויי נגישות שבשליטתנו בתוך זמן סביר, ולא יאוחר מ-60 ימים מקבלת הפנייה.\n\nהשירות ניתן באופן מקוון בלבד ואין לעסק מקום קבלת קהל, ולכן אין הסדרי נגישות פיזיים לפרסום. רכישת יצירות מתבצעת בפנייה ישירה בערוצים שלעיל, ונשמח להתאים את אופן ההתקשרות לצרכיו של כל פונה.',
      },
      {
        heading: 'עדכון ההצהרה',
        body: 'הצהרה זו נבדקת ומתעדכנת מעת לעת ובכל שינוי מהותי באתר.\n\nההצהרה עודכנה לאחרונה בתאריך: 12 ביולי 2026.',
      },
    ],
  },
  en: {
    title: 'Accessibility Statement – YosiArt',
    intro:
      "YosiArt (yosiart.vercel.app) is an online gallery presenting original acrylic paintings by the Israeli artist Yosi Cohen. We believe every visitor, including people with disabilities, should be able to browse the gallery comfortably, independently and with dignity, and we work continuously to improve the site's accessibility. The Hebrew version of this statement is the legally binding text; this English translation is provided for convenience.",
    sections: [
      {
        heading: 'Legal Basis and Conformance Target',
        body: 'The site is made accessible in accordance with the Israeli Equal Rights for Persons with Disabilities Law, 5758-1998, and the Equal Rights for Persons with Disabilities Regulations (Service Accessibility Adjustments), 5773-2013, including Regulation 35, which governs the accessibility of internet services. The regulations refer to Israeli Standard IS 5568 ("Guidelines for Web Content Accessibility"), which is based on the W3C WCAG guidelines at level AA — and, in its September 2023 revision, on WCAG 2.1.\n\nIn the interest of accuracy: the site strives to meet the requirements of IS 5568 at level AA and implements most of them in practice, but it has not undergone external certification and we do not claim certified full conformance. Some components may not yet be fully accessible, and we keep improving them on an ongoing basis. The business does not rely on any exemption or relief under the regulations.\n\nThe site is operated by a single independent artist with no employees. The statutory duty to appoint an accessibility coordinator applies to service providers with 25 or more employees and therefore does not apply to this business; nevertheless, Yosi Cohen personally serves as the contact for all accessibility matters, as detailed below.',
      },
      {
        heading: 'Accessibility Adjustments Implemented',
        body: '- Semantic HTML structure with navigation landmarks for screen-reader support\n- Alternative text (alt) for artwork images, managed and updated through the content management system\n- A "skip to main content" link at the top of every page\n- Keyboard navigation support, with a visible focus indicator on interactive elements\n- The system-level reduced-motion preference (prefers-reduced-motion) is respected across all animations\n- ARIA labels on icon buttons and on components without visible text\n- Full bilingual support: Hebrew (right-to-left) and English (left-to-right)',
      },
      {
        heading: 'The On-Site Accessibility Widget',
        body: 'A floating accessibility button is available on every page of the site, offering:\n- Larger and smaller text\n- High-contrast mode\n- Link highlighting\n- Stopping animations and motion\n- A readable font\n- Reset of all settings\n\nAccessibility preferences (as well as language and currency preferences) are stored only in your own browser (localStorage) and are never transmitted anywhere.',
      },
      {
        heading: 'Browser and Operating-System Alternatives',
        body: 'The site is built to work with current versions of the common browsers — Chrome, Edge, Firefox and Safari — and we recommend browsing with an up-to-date browser version.\n\nIn addition to the site\'s built-in tools, you can use the accessibility features of your browser and operating system: browser zoom (Ctrl together with + or −, or Cmd on Mac); high-contrast modes and text enlargement in your operating-system settings; screen readers such as NVDA (free, for Windows) and VoiceOver (built into Apple devices); and the system-level "reduce motion" setting, which the site detects and honors automatically.',
      },
      {
        heading: 'Known Accessibility Limitations',
        body: 'Despite our efforts, you may encounter components that are not yet fully accessible: alternative-text descriptions for older artworks may be partial until their update is completed; third-party content and services — such as the Instagram page or a WhatsApp conversation opened via an external link — are outside our control; and isolated incompatibilities may occur with specific browsers or assistive technologies. If you encounter any difficulty, we would sincerely appreciate hearing about it and will work to fix it promptly.',
      },
      {
        heading: 'Accessibility Feedback and Contact',
        body: "Accessibility contact: Yosi Cohen, site owner.\n- Email: Yosicohen164@gmail.com\n- WhatsApp: +972 54-524-1828\n\nTo help us handle your report efficiently, please include the address of the page where you encountered the problem, a description of the issue, and the browser and assistive technology you were using. We commit to replying to every inquiry within 7 business days, and we work to remedy accessibility defects that are within our control within a reasonable time, and no later than 60 days from receiving the report.\n\nThe service is provided online only and the business has no physical premises open to the public, so there are no physical accessibility arrangements to publish. Purchases of artworks are made by direct contact through the channels above, and we will gladly adapt the manner of communication to each person's needs.",
      },
      {
        heading: 'Statement Updates',
        body: 'This statement is reviewed and updated from time to time and whenever a significant change is made to the site.\n\nLast updated: July 12, 2026.',
      },
    ],
  },
};
