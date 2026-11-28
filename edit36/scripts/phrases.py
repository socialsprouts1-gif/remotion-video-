P = lambda s: [tuple(w.split("|")) for w in s.split()]
LINES = [
  [P("Bhai,|भाई, aaj|आज hai|है WhatsApp|व्हाट्सऐप automation|ऑटोमेशन seekhne|सीखने ka|का Day|डे 5.|फ़ाइव।")],
  [P("Aaj|आज seekhenge|सीखेंगे WhatsApp|व्हाट्सऐप pe|पे broadcast|ब्रॉडकास्ट offers|ऑफ़र्स bhejna.|भेजना।")],
  [P("Abhi|अभी log|लोग kya|क्या karte|करते hain?|हैं? Ek-ek|एक_एक customer|कस्टमर ko|को manually|मैनुअली forward.|फ़ॉरवर्ड।"),
   P("Ghante|घंटे lagte|लगते hain,|हैं, aur|और number|नंबर ban|बैन hone|होने ka|का risk.|रिस्क।")],
  [P("Ab|अब aapki|आपकी Google|गूगल Sheet|शीट mein|में saare|सारे customers|कस्टमर्स already|ऑलरेडी saved|सेव्ड hain.|हैं।")],
  [P("Ek|एक click,|क्लिक, aur|और offer|ऑफ़र sabko|सबको ek|एक saath|साथ chala|चला jaata|जाता hai.|है।")],
  [P("Har|हर message|मैसेज mein|में customer|कस्टमर ka|का naam,|नाम, toh|तो personal|पर्सनल lagta|लगता hai.|है।")],
  [P("Aur|और sirf|सिर्फ़ unhe|उन्हें bhejo|भेजो jinhone|जिन्होंने opt-in|ऑप्ट_इन kiya|किया hai.|है।"),
   P("Spam|स्पैम nahi,|नहीं, sahi|सही logon|लोगों ko,|को, sahi|सही time|टाइम pe.|पे।")],
  [P("Kal,|कल, Day|डे 6|सिक्स mein,|में, hum|हम WhatsApp|व्हाट्सऐप pe|पे payment|पेमेंट lena|लेना seekhenge.|सीखेंगे।")],
  [P("Day|डे 5|फ़ाइव ka|का free|फ़्री guide|गाइड chahiye?|चाहिए?"),
   P("Comment|कमेंट karo|करो \"GUIDE\",|गाइड, main|मैं DM|डी_एम mein|में bhej|भेज dunga.|दूंगा।")],
  [P("Video|वीडियो save|सेव karo,|करो, aur|और follow|फ़ॉलो kar|कर lo,|लो, varna|वरना Day|डे 6|सिक्स miss|मिस ho|हो jayega!|जाएगा!")],
]
