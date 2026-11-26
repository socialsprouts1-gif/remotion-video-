# WhatsApp automation seekhne ka Day 3 — appointment booking. (caption word | Devanagari spoken form)
P = lambda s: [tuple(w.split("|")) for w in s.split()]
LINES = [
  [P("Bhai,|भाई, aaj|आज hai|है WhatsApp|व्हाट्सऐप automation|ऑटोमेशन seekhne|सीखने ka|का Day|डे 3.|थ्री।")],
  [P("Aaj|आज appointment|अपॉइंटमेंट booking|बुकिंग ko|को autopilot|ऑटोपायलट pe|पे daalenge.|डालेंगे।")],
  [P("Abhi|अभी kya|क्या hota|होता hai?|है? Customer|कस्टमर poochta|पूछता hai,|है, \"kal|कल ka|का slot|स्लॉट hai?\"|है?"),
   P("aur|और aap|आप calendar|कैलेंडर check|चेक karke|करके baar-baar|बार_बार reply|रिप्लाई karte|करते ho.|हो।")],
  [P("Ab|अब customer|कस्टमर bolega,|बोलेगा, \"Book|बुक karna|करना hai\",|है,"),
   P("aur|और WhatsApp|व्हाट्सऐप pe|पे free|फ़्री slots|स्लॉट्स khud|ख़ुद dikh|दिख jayenge.|जाएँगे।")],
  [P("Customer|कस्टमर slot|स्लॉट choose|चूज़ karega,|करेगा,"),
   P("aur|और booking|बुकिंग Google|गूगल Calendar|कैलेंडर mein|में automatically|ऑटोमैटिकली add.|ऐड।")],
  [P("Turant|तुरंत confirmation|कन्फ़र्मेशन message,|मैसेज,"),
   P("aur|और appointment|अपॉइंटमेंट se|से ek|एक ghanta|घंटा pehle|पहले reminder.|रिमाइंडर।")],
  [P("Isse|इससे no-shows|नो_शोज़ kam,|कम, aur|और aapka|आपका time|टाइम bachega.|बचेगा।")],
  [P("Kal,|कल, Day|डे 4|फ़ोर mein,|में, hum|हम follow-up|फ़ॉलो_अप messages|मैसेजेस automate|ऑटोमेट karenge.|करेंगे।")],
  [P("Day|डे 3|थ्री ka|का free|फ़्री guide|गाइड chahiye?|चाहिए?"),
   P("Comment|कमेंट karo|करो \"GUIDE\",|गाइड, main|मैं DM|डी_एम mein|में bhej|भेज dunga.|दूंगा।")],
  [P("Video|वीडियो save|सेव karo,|करो, aur|और follow|फ़ॉलो kar|कर lo,|लो, varna|वरना Day|डे 4|फ़ोर miss|मिस ho|हो jayega!|जाएगा!")],
]
