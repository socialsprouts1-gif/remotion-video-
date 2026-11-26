P = lambda s: [tuple(w.split("|")) for w in s.split()]
LINES = [
  [P("Bhai,|भाई, aaj|आज hai|है WhatsApp|व्हाट्सऐप automation|ऑटोमेशन seekhne|सीखने ka|का Day|डे 4.|फ़ोर।")],
  [P("Aaj|आज follow-up|फ़ॉलो_अप messages|मैसेजेस ko|को automate|ऑटोमेट karenge.|करेंगे।")],
  [P("Sach|सच baat?|बात? Zyadatar|ज़्यादातर customer|कस्टमर pehli|पहली baar|बार mein|में nahi|नहीं kharidte.|ख़रीदते।"),
   P("Woh|वो price|प्राइस poochte|पूछते hain,|हैं, aur|और gayab.|ग़ायब।")],
  [P("Aur|और aap|आप busy|बिज़ी ho,|हो, toh|तो follow-up|फ़ॉलो_अप bhool|भूल jaate|जाते ho.|हो।")],
  [P("Ab|अब system|सिस्टम khud|ख़ुद follow-up|फ़ॉलो_अप karega.|करेगा।"),
   P("Ek|एक din|दिन baad,|बाद, ek|एक friendly|फ़्रेंडली reminder.|रिमाइंडर।")],
  [P("Teen|तीन din|दिन baad,|बाद, customer|कस्टमर reviews|रिव्यूज़ aur|और photos.|फ़ोटोज़।"),
   P("Saat|सात din|दिन baad,|बाद, ek|एक chhota|छोटा sa|सा offer.|ऑफ़र।")],
  [P("Aur|और jaise|जैसे hi|ही customer|कस्टमर reply|रिप्लाई kare,|करे, follow-up|फ़ॉलो_अप ruk|रुक jaata|जाता hai.|है।")],
  [P("Matlab|मतलब koi|कोई lead|लीड thandi|ठंडी nahi|नहीं padegi.|पड़ेगी।")],
  [P("Kal,|कल, Day|डे 5|फ़ाइव mein,|में, hum|हम broadcast|ब्रॉडकास्ट offers|ऑफ़र्स bhejna|भेजना seekhenge.|सीखेंगे।")],
  [P("Day|डे 4|फ़ोर ka|का free|फ़्री guide|गाइड chahiye?|चाहिए?"),
   P("Comment|कमेंट karo|करो \"GUIDE\",|गाइड, main|मैं DM|डी_एम mein|में bhej|भेज dunga.|दूंगा।")],
  [P("Video|वीडियो save|सेव karo,|करो, aur|और follow|फ़ॉलो kar|कर lo,|लो, varna|वरना Day|डे 5|फ़ाइव miss|मिस ho|हो jayega!|जाएगा!")],
]
