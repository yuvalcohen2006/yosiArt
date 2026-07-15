import type { LegalDoc } from './types';

/**
 * תקנון ותנאי שימוש — drafted against חוק הגנת הצרכן, התשמ"א-1981
 * (s.14ג distance transactions — relevant because sales close over
 * email/WhatsApp even without online checkout), חוק זכות יוצרים,
 * התשס"ח-2007 (ss.45-46 moral rights, s.37(ג) written assignment),
 * and חוק החוזים האחידים, התשמ"ג-1982 (venue clause softened per s.4(9)).
 *
 * NOTE for Yosi: whenever a sale actually closes remotely with an Israeli
 * consumer, the law requires giving the buyer IN WRITING, before closing:
 * full name + dealer ID number + address, the work's main characteristics,
 * final price + payment terms, delivery date/method, and cancellation
 * rights. Commission pieces may fall under the cancellation exceptions.
 */
export const termsDoc: LegalDoc = {
  updated: { he: '12 ביולי 2026', en: 'July 12, 2026' },
  he: {
    title: 'תקנון ותנאי שימוש — YosiArt',
    intro:
      'ברוכים הבאים לאתר YosiArt בכתובת yosiart.vercel.app ("האתר"). האתר מופעל על ידי האמן יוסי כהן, אמן עצמאי (עוסק) מישראל ("האמן" או "מפעיל האתר"). אנא קראו תנאים אלה בעיון; הגלישה באתר והשימוש בו מהווים הסכמה להם.',
    sections: [
      {
        heading: '1. כללי וקבלת התנאים',
        body: 'תנאי שימוש אלה מסדירים את הגלישה והשימוש באתר. עצם הכניסה לאתר או השימוש בו מהווים הסכמה מלאה לתנאים; מי שאינו מסכים להם מתבקש להימנע משימוש באתר. התנאים מנוסחים בלשון זכר מטעמי נוחות בלבד ופונים לכל המגדרים. התקנון קיים בעברית ובאנגלית; הנוסח העברי הוא הנוסח המחייב, והתרגום לאנגלית נועד לנוחות בלבד.',
      },
      {
        heading: '2. מהות האתר — תצוגה בלבד',
        body: 'האתר הוא גלריה מקוונת (פורטפוליו) להצגת ציורי אקריליק מקוריים פרי מכחולו של האמן, לצורכי תצוגה והתרשמות בלבד. האתר אינו חנות מקוונת: אין בו הרשמה, טפסים, עגלת קניות, סליקה או תשלום מקוון.\n\nהמחירים המוצגים לצד חלק מהיצירות (בשקלים או בדולר ארה"ב) הם מחירים אינדיקטיביים בלבד; הם מהווים הזמנה לפנות לאמן ולא הצעה מחייבת, וכפופים לשינוי בכל עת ולזמינות היצירה. רכישת יצירה מתבצעת אך ורק בהתקשרות ישירה עם האמן — בדוא"ל, בוואטסאפ או באינסטגרם — ובמסגרתה יסוכמו המחיר הסופי, אופן התשלום, האספקה ויתר תנאי העסקה. עסקה משתכללת רק עם אישורה המפורש על ידי האמן ובכפוף לזמינות היצירה.',
      },
      {
        heading: '3. גילוי נאות ועסקאות מרחוק',
        body: 'פרטי מפעיל האתר: יוסי כהן (מותג "YosiArt"), אמן עצמאי הפועל בישראל. דרכי התקשרות: דוא"ל Yosicohen164@gmail.com, וואטסאפ ‎+972-54-524-1828, אינסטגרם ‎@_cohen_art.\n\nהאתר עצמו אינו מאפשר ביצוע עסקה, ולכן הגלישה בו כשלעצמה אינה יוצרת עסקה. עם זאת, ככל שעסקה לרכישת יצירה תיכרת בהתקשרות מרחוק (בדוא"ל, בוואטסאפ או בטלפון), ללא נוכחות משותפת של הצדדים, היא עשויה להיחשב "עסקת מכר מרחוק" כמשמעותה בסעיף 14ג לחוק הגנת הצרכן, התשמ"א-1981. במקרה כזה ימסור האמן לרוכש, לפני השלמת העסקה ובכתב, את מלוא הפרטים הנדרשים לפי דין, ובכלל זה: שם העוסק, מספר זהותו ומענו; התכונות העיקריות של היצירה; המחיר הסופי ותנאי התשלום; מועד ודרך האספקה; ופרטים בדבר זכות הביטול העומדת לצרכן לפי החוק והתקנות מכוחו. יובהר כי יצירה שתיווצר בהזמנה אישית, במיוחד עבור הרוכש, עשויה להיות כפופה לחריגים לזכות הביטול הקבועים בדין.',
      },
      {
        heading: '4. דיוק המידע באתר',
        body: 'האמן משתדל שהמידע באתר יהיה מדויק ועדכני, אולם ייתכנו אי-דיוקים או טעויות בתום לב. בפרט:\n\n- צבעי היצירות כפי שהם נראים על גבי המסך עשויים להיות שונים מצבעי הציור הפיזי, בהתאם לסוג המסך, כיולו והגדרותיו.\n- מידות היצירות המצוינות באתר הן בקירוב.\n- זמינות יצירה, מחירה ופרטיה כפופים לאימות מול האמן בעת הפנייה.',
      },
      {
        heading: '5. קניין רוחני וזכות מוסרית',
        body: 'כל היצירות, הציורים, התצלומים, הטקסטים, העיצוב וסימני הזיהוי באתר הם קניינו הרוחני הבלעדי של יוסי כהן ומוגנים לפי חוק זכות יוצרים, התשס"ח-2007. אין להעתיק, לשכפל, להפיץ, לפרסם, להציג בפומבי, לעבד, ליצור יצירות נגזרות או לעשות כל שימוש מסחרי בתוכן כלשהו מהאתר, כולו או חלקו, ללא הסכמת האמן מראש ובכתב.\n\nרכישת ציור מקנה בעלות בעותק הפיזי בלבד ואינה מעבירה לרוכש זכויות יוצרים כלשהן ביצירה. לאמן שמורה הזכות המוסרית לפי סעיפים 45–46 לחוק — הזכות כי שמו ייקרא על יצירתו בהיקף ובמידה הראויים בנסיבות העניין, וכי לא יוטל ביצירתו פגם, לא ייעשה בה סילוף או שינוי צורה אחר ולא תיעשה ביחס אליה פעולה פוגענית, אם יש באלה כדי לפגוע בכבודו או בשמו. זכות זו היא אישית ואינה ניתנת להעברה, והיא נשמרת לאמן גם לאחר מכירת היצירה.',
      },
      {
        heading: '6. שימוש מותר ושימושים אסורים',
        body: 'מותר לגלוש באתר ולעשות בו שימוש אישי, פרטי ולא מסחרי בלבד, לרבות שיתוף קישור לעמודי האתר.\n\nחל איסור, בין היתר:\n\n- להעתיק או להוריד תמונות של יצירות לכל שימוש שאינו צפייה אישית;\n- לבצע כריית נתונים, גריפת תכנים (scraping) או איסוף אוטומטי של תכנים, לרבות באמצעות רובוטים ותוכנות אוטומטיות;\n- להציג את האתר או חלקים ממנו במסגרת אתר אחר (framing);\n- להפריע לפעולת האתר, לעקוף אמצעי אבטחה או להעמיס על תשתיותיו;\n- לעשות באתר שימוש בלתי חוקי או שימוש הפוגע בזכויות צד שלישי.',
      },
      {
        heading: '7. קישורים ושירותי צד שלישי',
        body: 'האתר כולל קישורים לערוצי תקשורת חיצוניים — וואטסאפ, אינסטגרם ודוא"ל — ונעזר בשירותי אחסון ותשתית של צדדים שלישיים. שירותים אלה אינם בשליטת האמן, השימוש בהם כפוף לתנאי השימוש ולמדיניות הפרטיות של מפעיליהם, והאמן אינו אחראי לתוכנם, לזמינותם או לאופן פעולתם.',
      },
      {
        heading: '8. זמינות האתר והגבלת אחריות',
        body: 'האתר ותכניו מוצעים כמות שהם (AS IS), ללא כל התחייבות לזמינות רציפה, להיעדר תקלות או להתאמה למטרה מסוימת. האמן רשאי לשנות את האתר, את תכניו או את מבנהו, או להפסיק את פעולתו, בכל עת וללא הודעה מוקדמת.\n\nבכפוף לכל דין, האמן לא יישא באחריות לכל נזק עקיף, תוצאתי או מיוחד שייגרם משימוש באתר או מהסתמכות על תכניו. אין באמור כדי לגרוע מזכויות המוקנות לצרכן לפי דין שאינו ניתן להתניה.',
      },
      {
        heading: '9. פרטיות ונגישות',
        body: 'מדיניות הפרטיות והצהרת הנגישות המפורסמות באתר מהוות חלק בלתי נפרד מתקנון זה.\n\nבתמצית: האתר עצמו אינו אוסף פרטים אישיים — אין בו הרשמה, טפסים או דיוור; העדפות תצוגה נשמרות מקומית בדפדפן בלבד, ונעשה שימוש בכלי מדידה מצרפי שאינו מבוסס עוגיות. פירוט מלא — במדיניות הפרטיות. בתחום הנגישות, האתר חותר לעמידה בתקן הישראלי ת"י 5568 ברמה AA ‏(WCAG 2.1) — ראו הצהרת הנגישות.',
      },
      {
        heading: '10. שינויים בתקנון',
        body: 'האמן רשאי לעדכן תקנון זה מעת לעת, לפי שיקול דעתו. הנוסח המעודכן יפורסם באתר ויחייב ממועד פרסומו. תאריך העדכון האחרון מופיע בתחתית התקנון, ומומלץ לעיין בו מעת לעת.',
      },
      {
        heading: '11. דין חל וסמכות שיפוט',
        body: 'על תקנון זה ועל כל שימוש באתר יחולו דיני מדינת ישראל בלבד. סמכות השיפוט בכל עניין הנוגע לתקנון או לאתר נתונה לבתי המשפט המוסמכים בישראל, ובכפוף לכל דין שאינו ניתן להתניה, מקום השיפוט המוסכם הוא בבתי המשפט המוסמכים במחוז תל אביב–יפו.',
      },
      {
        heading: '12. יצירת קשר',
        body: 'לשאלות בעניין תקנון זה או בכל עניין אחר ניתן לפנות לאמן:\n\n- דוא"ל: Yosicohen164@gmail.com\n- וואטסאפ: ‎+972-54-524-1828\n- אינסטגרם: ‎@_cohen_art\n\nעודכן לאחרונה: 12 ביולי 2026.',
      },
    ],
  },
  en: {
    title: 'Terms of Use — YosiArt',
    intro:
      'Welcome to YosiArt at yosiart.vercel.app (the "Site"). The Site is operated by Yosi Cohen, an independent Israeli artist (the "Artist" or "Site operator"). Please read these terms carefully; browsing or using the Site constitutes acceptance of them.',
    sections: [
      {
        heading: '1. General and Acceptance of Terms',
        body: 'These Terms of Use govern browsing and use of the Site. By accessing or using the Site you fully accept these terms; if you do not agree to them, please refrain from using the Site. These terms are provided in Hebrew and in English; the Hebrew version is the legally binding text, and this English translation is provided for convenience only.',
      },
      {
        heading: '2. Nature of the Site — Display Only',
        body: "The Site is an online gallery (portfolio) presenting original acrylic paintings by the Artist, for display and viewing purposes only. The Site is not an online store: it contains no registration, forms, shopping cart, checkout or online payment.\n\nPrices shown next to some works (in ILS or USD) are indicative only; they constitute an invitation to contact the Artist and not a binding offer, and are subject to change at any time and to the work's availability. A purchase takes place solely through direct contact with the Artist — by email, WhatsApp or Instagram — in which the final price, payment method, delivery and all other terms are agreed. A sale is concluded only upon the Artist's express confirmation and subject to availability of the work.",
      },
      {
        heading: '3. Operator Disclosure and Remote Transactions',
        body: 'Site operator details: Yosi Cohen (brand "YosiArt"), an independent artist operating in Israel. Contact channels: email Yosicohen164@gmail.com, WhatsApp +972-54-524-1828, Instagram @_cohen_art.\n\nThe Site itself does not enable transactions, so browsing it does not create a transaction. However, where a purchase is concluded remotely (by email, WhatsApp or phone) without the parties\' joint presence, it may constitute a "distance transaction" within the meaning of Section 14C of the Israeli Consumer Protection Law, 5741-1981. In such a case the Artist will provide the buyer, before the transaction is completed and in writing, with all details required by law, including: the dealer\'s name, ID number and address; the main characteristics of the work; the final price and payment terms; the delivery date and method; and details of the consumer\'s statutory cancellation rights under the law and its regulations. Note that a work created as a personal commission specifically for the buyer may be subject to the cancellation-right exceptions prescribed by law.',
      },
      {
        heading: '4. Accuracy of Information',
        body: "The Artist endeavors to keep the Site accurate and up to date, but good-faith inaccuracies or errors may occur. In particular:\n\n- Colors as displayed on screen may differ from the colors of the physical painting, depending on the display type, calibration and settings.\n- Dimensions stated on the Site are approximate.\n- A work's availability, price and details are subject to confirmation with the Artist upon inquiry.",
      },
      {
        heading: '5. Intellectual Property and Moral Rights',
        body: "All works, paintings, photographs, texts, design and identifying marks on the Site are the exclusive intellectual property of Yosi Cohen and are protected under the Israeli Copyright Act, 5768-2007. No content from the Site, in whole or in part, may be copied, reproduced, distributed, published, publicly displayed, adapted, used to create derivative works, or used commercially in any way, without the Artist's prior written consent.\n\nPurchasing a painting conveys ownership of the physical copy only and does not transfer any copyright in the work. The Artist retains his moral rights under Sections 45-46 of the Act — the right to have his name identified with his work to the extent and in the manner appropriate in the circumstances, and the right that no distortion, mutilation or other modification be made to the work, and no derogatory act be done in relation to it, where any of these would prejudice his honor or reputation. These rights are personal and non-transferable, and remain with the Artist even after a work is sold.",
      },
      {
        heading: '6. Permitted and Prohibited Uses',
        body: 'You may browse the Site and make personal, private, non-commercial use of it, including sharing links to its pages.\n\nIt is prohibited, among other things, to:\n\n- copy or download images of the works for any use other than personal viewing;\n- perform data mining, scraping or automated collection of content, including via bots or automated software;\n- display the Site or parts of it within another website (framing);\n- interfere with the Site\'s operation, circumvent security measures or overload its infrastructure;\n- use the Site unlawfully or in a manner infringing third-party rights.',
      },
      {
        heading: '7. Third-Party Links and Services',
        body: "The Site includes links to external communication channels — WhatsApp, Instagram and email — and relies on third-party hosting and infrastructure services. These services are not under the Artist's control, their use is governed by their operators' own terms and privacy policies, and the Artist is not responsible for their content, availability or operation.",
      },
      {
        heading: '8. Availability; No Warranty; Limitation of Liability',
        body: 'The Site and its content are provided "AS IS", without any warranty of continuous availability, freedom from faults, or fitness for a particular purpose. The Artist may change the Site, its content or structure, or discontinue it, at any time without prior notice.\n\nSubject to applicable law, the Artist shall not be liable for any indirect, consequential or special damage arising from use of the Site or reliance on its content. Nothing herein derogates from consumer rights granted by mandatory law that cannot be waived.',
      },
      {
        heading: '9. Privacy and Accessibility',
        body: 'The Privacy Policy and the Accessibility Statement published on the Site form an integral, binding part of these terms.\n\nIn brief: the Site itself collects no personal data — there is no registration, no forms and no mailing list; display preferences are stored locally in your browser only, and a cookieless, aggregate analytics tool is used. Full details appear in the Privacy Policy. On accessibility, the Site strives to conform to Israeli Standard 5568 at level AA (WCAG 2.1) — see the Accessibility Statement.',
      },
      {
        heading: '10. Changes to These Terms',
        body: 'The Artist may update these terms from time to time at his discretion. The updated version will be published on the Site and will apply from its publication. The last-updated date appears at the bottom of these terms; please review them periodically.',
      },
      {
        heading: '11. Governing Law and Jurisdiction',
        body: 'These terms and any use of the Site are governed exclusively by the laws of the State of Israel. Jurisdiction over any matter relating to these terms or to the Site is vested in the competent courts in Israel, and, subject to any mandatory law that cannot be contracted out of, the agreed venue is the competent courts of the Tel Aviv-Jaffa district.',
      },
      {
        heading: '12. Contact',
        body: 'For questions about these terms or any other matter, you may contact the Artist:\n\n- Email: Yosicohen164@gmail.com\n- WhatsApp: +972-54-524-1828\n- Instagram: @_cohen_art\n\nLast updated: July 12, 2026.',
      },
    ],
  },
};
