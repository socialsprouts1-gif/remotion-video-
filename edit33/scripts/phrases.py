# WhatsApp automation seekhne ka Day 2 — AI smart replies. (caption word | Devanagari spoken form)
P = lambda s: [tuple(w.split("|")) for w in s.split()]
LINES = [
  [P("Bhai,|भाई, aaj|आज hai|है WhatsApp|व्हाट्सऐप automation|ऑटोमेशन seekhne|सीखने ka|का Day|डे 2.|टू।")],
  [P("Kal|कल humne|हमने simple|सिंपल auto-reply|ऑटो_रिप्लाई banaya.|बनाया।"),
   P("Aaj|आज usko|उसको AI|ए_आई se|से smart|स्मार्ट banayenge.|बनाएँगे।")],
  [P("Problem|प्रॉब्लम kya|क्या hai?|है?"),
   P("Fixed|फ़िक्स्ड reply|रिप्लाई har|हर sawaal|सवाल ka|का ek|एक hi|ही jawab|जवाब deta|देता hai.|है।")],
  [P("Customer|कस्टमर poochega:|पूछेगा: \"Sunday|संडे ko|को open|ओपन ho?|हो?"),
   P("Aur|और facial|फ़ेशियल ka|का rate|रेट kya|क्या hai?\"|है?")],
  [P("AI|ए_आई aapke|आपके business|बिज़नेस ki|की details|डिटेल्स padh|पढ़ ke,|के,"),
   P("dono|दोनों sawaal|सवाल ka|का sahi|सही jawab|जवाब dega.|देगा।")],
  [P("Aur|और jo|जो sawaal|सवाल AI|ए_आई ko|को nahi|नहीं pata,|पता,"),
   P("woh|वो seedha|सीधा aapko|आपको forward.|फ़ॉरवर्ड।")],
  [P("Iske|इसके liye|लिए bas|बस teen|तीन cheezein|चीज़ें chahiye:|चाहिए:"),
   P("aapki|आपकी price|प्राइस list,|लिस्ट, timings,|टाइमिंग्स, aur|और FAQs.|एफ़_ए_क्यूज़।")],
  [P("Kal,|कल, Day|डे 3|थ्री mein,|में, hum|हम appointment|अपॉइंटमेंट booking|बुकिंग automate|ऑटोमेट karenge.|करेंगे।")],
  [P("Day|डे 2|टू ka|का free|फ़्री guide|गाइड chahiye?|चाहिए?"),
   P("Comment|कमेंट karo|करो \"GUIDE\",|गाइड, main|मैं DM|डी_एम mein|में bhej|भेज dunga.|दूंगा।")],
  [P("Video|वीडियो save|सेव karo,|करो, aur|और follow|फ़ॉलो kar|कर lo,|लो, varna|वरना Day|डे 3|थ्री miss|मिस ho|हो jayega!|जाएगा!")],
]
