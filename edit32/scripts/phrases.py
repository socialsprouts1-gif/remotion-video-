# WhatsApp automation seekhne ka Day 1. Each phrase: (caption word | Devanagari spoken form).
P = lambda s: [tuple(w.split("|")) for w in s.split()]
LINES = [
  [P("Bhai,|भाई, aaj|आज hai|है WhatsApp|व्हाट्सऐप automation|ऑटोमेशन seekhne|सीखने ka|का Day|डे 1.|वन।")],
  [P("Pehle|पहले samjho,|समझो, WhatsApp|व्हाट्सऐप automation|ऑटोमेशन hota|होता kya|क्या hai?|है?")],
  [P("Customer|कस्टमर message|मैसेज kare,|करे,"),
   P("aur|और bina|बिना aapke|आपके phone|फ़ोन uthaye,|उठाए, system|सिस्टम khud|ख़ुद reply|रिप्लाई kare.|करे।")],
  [P("Aaj|आज ka|का setup|सेटअप simple|सिंपल hai.|है।"),
   P("Customer|कस्टमर likhega|लिखेगा \"Hi\",|हाय, aur|और turant|तुरंत welcome|वेलकम message|मैसेज jaayega.|जाएगा।")],
  [P("Saath|साथ mein,|में, uska|उसका naam|नाम aur|और number|नंबर automatically|ऑटोमैटिकली Google|गूगल Sheet|शीट mein|में save.|सेव।")],
  [P("Bas|बस itna|इतना karne|करने se,|से, raat|रात ki|की enquiry|एन्क्वायरी bhi|भी miss|मिस nahi|नहीं hogi.|होगी।")],
  [P("Kal,|कल, Day|डे 2|टू mein,|में, hum|हम AI|ए_आई se|से smart|स्मार्ट reply|रिप्लाई banayenge.|बनाएँगे।")],
  [P("Day|डे 1|वन ka|का free|फ़्री guide|गाइड chahiye?|चाहिए?"),
   P("Comment|कमेंट karo|करो \"GUIDE\",|गाइड, main|मैं DM|डी_एम mein|में bhej|भेज dunga.|दूंगा।")],
  [P("Video|वीडियो save|सेव karo,|करो, aur|और follow|फ़ॉलो kar|कर lo,|लो, varna|वरना Day|डे 2|टू miss|मिस ho|हो jayega!|जाएगा!")],
]
