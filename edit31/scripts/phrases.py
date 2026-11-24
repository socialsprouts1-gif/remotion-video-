# NeuraChat explainer. Each phrase: (caption word | Devanagari spoken form).
P = lambda s: [tuple(w.split("|")) for w in s.split()]
LINES = [
  [P("Bhai,|भाई, aaj|आज milo|मिलो NeuraChat|न्यूराचैट se.|से।"),
   P("Aapka|आपका 24/7|ट्वेंटी_फ़ोर_सेवन AI|ए_आई sales|सेल्स assistant,|असिस्टेंट, WhatsApp|व्हाट्सऐप aur|और Instagram|इंस्टाग्राम pe.|पे।")],
  [P("Socho,|सोचो, raat|रात 2|दो baje|बजे customer|कस्टमर message|मैसेज kare,|करे,"),
   P("aur|और reply|रिप्लाई turant|तुरंत chala|चला jaaye.|जाए।")],
  [P("Customer|कस्टमर bolega:|बोलेगा: \"Mujhe|मुझे price|प्राइस chahiye.\"|चाहिए।")],
  [P("NeuraChat|न्यूराचैट automatically|ऑटोमैटिकली reply|रिप्लाई karega,|करेगा,"),
   P("aur|और 3|तीन quick|क्विक sawaal|सवाल poochega.|पूछेगा।")],
  [P("Customer|कस्टमर details|डिटेल्स dega,|देगा,"),
   P("aur|और system|सिस्टम uska|उसका name,|नेम, number|नंबर aur|और requirement|रिक्वायरमेंट automatically|ऑटोमैटिकली save|सेव karega.|करेगा।")],
  [P("Hot|हॉट lead?|लीड? Aapko|आपको turant|तुरंत notification,|नोटिफ़िकेशन, aur|और call|कॉल bhi|भी book.|बुक।")],
  [P("Matlab|मतलब ek|एक bhi|भी lead|लीड miss|मिस nahi|नहीं hogi.|होगी।")],
  [P("NeuraChat|न्यूराचैट ka|का demo|डेमो chahiye?|चाहिए?"),
   P("Comment|कमेंट karo|करो \"DEMO\",|डेमो, main|मैं DM|डी_एम mein|में bhej|भेज dunga.|दूंगा।")],
  [P("Video|वीडियो save|सेव aur|और share|शेयर karo,|करो, aur|और follow|फ़ॉलो karo|करो Neuraxine.|न्यूरैक्सिन।")],
]
