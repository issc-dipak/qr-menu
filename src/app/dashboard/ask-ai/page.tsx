'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore, useMenuStore, useAnalyticsStore } from '@/store';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';

export default function AskAiPage() {
  const { owner } = useAuthStore();
  const { items } = useMenuStore();
  const { data: analyticsData } = useAnalyticsStore();
  const { t, lang } = useTranslation('owner');

  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getAiGreeting = (name: string, translationObj: any) => {
    const hello = (translationObj.aiHello || 'Hello {name}! 👋 I am your **QR-Menu AI Assistant**.')
      .replace('{name}', name);
    return `${hello}
- *${translationObj.aiQuery1 || 'How can I get more scans?'}*
- *${translationObj.aiQuery2 || 'Write a description for my menu items.'}*
- *${translationObj.aiQuery3 || 'Suggest a pricing strategy based on my categories.'}*
- *${translationObj.aiQuery4 || 'Give me a summary of my shop performance.'}*`;
  };

  // Update greeting when language or owner name changes
  useEffect(() => {
    const firstName = owner?.name?.split(' ')[0] || 'Partner';
    const greeting = getAiGreeting(firstName, t);
    setMessages(prev => {
      if (prev.length === 0) {
        return [{ role: 'assistant', content: greeting }];
      }
      const newMessages = [...prev];
      newMessages[0] = { role: 'assistant', content: greeting };
      return newMessages;
    });
  }, [lang, owner?.name]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Context analysis for simulated responses tailored exactly to their shop
    setTimeout(() => {
      let response = "";
      const query = userMessage.toLowerCase();
      const shopName = owner?.shop_name || (lang === 'en' ? 'your shop' : lang === 'hi' ? 'आपकी दुकान' : lang === 'mr' ? 'आपले दुकान' : 'તમારી દુકાન');
      const shopCategory = owner?.shop_category || (lang === 'en' ? 'General Shop' : lang === 'hi' ? 'सामान्य दुकान' : lang === 'mr' ? 'सामान्य दुकान' : 'સામાન્ય દુકાન');
      const itemCount = items.length;
      const scansTotal = analyticsData?.totalScans || 0;

      // Check Hindi/Marathi/Gujarati keywords as well
      const isPerformanceQuery = query.includes('performance') || query.includes('report') || query.includes('scans') || query.includes('stats') || query.includes('analytics') ||
                                 query.includes('प्रदर्शन') || query.includes('रिपोर्ट') || query.includes('स्कैन') || query.includes('आँकड़े') ||
                                 query.includes('कामगिरी') || query.includes('अहवाल') || query.includes('स्कॅन') || query.includes('आकडेवारी') ||
                                 query.includes('કામગીરી') || query.includes('અહેવાલ') || query.includes('સ્કૅન') || query.includes('આંકડા');

      const isGrowthQuery = query.includes('get more') || query.includes('increase') || query.includes('growth') || query.includes('marketing') || query.includes('promote') ||
                            query.includes('बढ़ाएं') || query.includes('विकास') || query.includes('मार्केटिंग') || query.includes('प्रमोट') ||
                            query.includes('वाढ') || query.includes('प्रसिद्ध') || query.includes('વિકાસ') || query.includes('વધારો') || query.includes('જાહેરાત');

      const isPricingQuery = query.includes('pricing') || query.includes('price') || query.includes('cost') || query.includes('profit') ||
                             query.includes('मूल्य') || query.includes('कीमत') || query.includes('दाम') || query.includes('मुनाफा') ||
                             query.includes('किंमत') || query.includes('नफा') || query.includes('भाव') || query.includes('કિંમત') || query.includes('નફો');

      const isDescQuery = query.includes('description') || query.includes('write') || query.includes('menu item') || query.includes('name') ||
                          query.includes('विवरण') || query.includes('लिखें') || query.includes('नाम') ||
                          query.includes('वर्णन') || query.includes('लिहा') || query.includes('नाव') ||
                          query.includes('વર્ણન') || query.includes('લખો') || query.includes('નામ');

      if (isPerformanceQuery) {
        if (lang === 'hi') {
          response = `📊 **${shopName} के लिए दुकान प्रदर्शन विश्लेषण**:
- **सेटअप स्वास्थ्य**: आपके पास **${shopCategory}** श्रेणी में **${itemCount} सक्रिय मेनू आइटम** हैं।
- **स्कैन आँकड़े**: आपने कुल **${scansTotal.toLocaleString()} स्कैन** दर्ज किए हैं।
- **मूल्यांकन**: ${
            scansTotal < 50
              ? "आपका स्कैन वॉल्यूम अभी शुरुआती चरण में है! मैं सिफारिश करता हूँ कि आप अपने टेबल क्यूआर कोड टेंट प्रिंट करें या ऑर्डरिंग काउंटर पर एक पोस्टर लगाएं।"
              : "शानदार आंकड़े! आपकी उपयोगकर्ता सहभागिता दर स्थिर है। इसे और बढ़ावा देने के लिए, केवल क्यूआर-डिस्काउंट कॉम्बो ऑफ़र करने का प्रयास करें।"
          }`;
        } else if (lang === 'mr') {
          response = `📊 **${shopName} साठी दुकान कामगिरीचे विश्लेषण**:
- **सेटअप स्थिती**: आपल्याकडे **${shopCategory}** श्रेणीमध्ये **${itemCount} सक्रिय मेनू आयटम** आहेत।
- **स्कॅन आकडेवारी**: आपण एकूण **${scansTotal.toLocaleString()} स्कॅन** नोंदवले आहेत।
- **मूल्यांकन**: ${
            scansTotal < 50
              ? "तुमचे स्कॅन प्रमाण सध्या प्राथमिक टप्प्यात आहे! मी शिफारस करतो की टेबल क्यूआर कोड टेंट प्रिंट करा किंवा काउंटरवर आकर्षक पोस्टर लावा."
              : "उत्कृष्ट कामगिरी! तुमचा ग्राहक सहभाग दर चांगला आहे. याला आणखी वाढवण्यासाठी, विशेष क्यूआर कॉम्बो सूट देऊन पहा."
          }`;
        } else if (lang === 'gu') {
          response = `📊 **${shopName} માટે દુકાન કામગીરીનું વિશ્લેષણ**:
- **સેટઅપ સ્થિતિ**: તમારી પાસે **${shopCategory}** કેટેગરીમાં **${itemCount} સક્રિય મેનૂ આઇટમ્સ** છે.
- **સ્કૅન આંકડા**: તમે કુલ **${scansTotal.toLocaleString()} સ્કૅન** રેકોર્ડ કર્યા છે.
- **મૂલ્યાંકન**: ${
            scansTotal < 50
              ? "તમારું સ્કૅન વોલ્યુમ હજી શરૂઆતના તબક્કામાં છે! હું ભલામણ કરું છું કે તમે તમારા ટેબલ ક્યૂઆર કોડ ટેન્ટ પ્રિન્ટ કરો અથવા કાઉન્ટર પર પોસ્ટર લગાવો."
              : "અદ્ભુત આંકડા! તમારો ગ્રાહક જોડાણ દર સ્થિર છે. આને વધુ આગળ ધપાવવા માટે, સ્પેશિયલ ક્યૂઆર કોમ્બો ડિસ્કાઉન્ટ આપવાનો પ્રયત્ન કરો."
          }`;
        } else {
          response = `📊 **Shop Performance Analysis for ${shopName}**:
- **Setup Health**: You have **${itemCount} active menu items** configured in the **${shopCategory}** category.
- **Scan Stats**: You have recorded **${scansTotal.toLocaleString()} total scans**.
- **Assessment**: ${
            scansTotal < 50
              ? "Your scan volume is in the early stages! I recommend printing your table QR code tents or placing a dynamic poster right at the ordering counter."
              : "Impressive numbers! You have a stable user engagement rate. To push this further, try offering a small QR-only combo discount."
          }`;
        }
      } else if (isGrowthQuery) {
        if (lang === 'hi') {
          response = `🚀 **${shopName} के लिए विकास कार्य योजना (Growth Action Plan)**:
1. **QR प्लेसमेंट**: मुख्य काउंटर पर और प्रत्येक डाइनिंग टेबल पर एक उच्च-गुणवत्ता वाला प्रिंट रखें।
2. **विशेष क्यूआर बैज**: एक छोटी छूट की घोषणा करें (जैसे, "विशेष व्यंजन देखने और 5% छूट पाने के लिए क्यूआर स्कैन करें")।
3. **सोशल मीडिया का उपयोग**: अपने इंस्टाग्राम बायो और व्हाट्सएप बिजनेस कैटलॉग पर अपना अनूठा डिजिटल मेनू लिंक (\`${owner?.shop_slug ? `qr-menu.com/menu/${owner.shop_slug}` : 'your-link'}\`) साझा करें।
4. **विजुअल मेनू**: सुनिश्चित करें कि कम से कम 3-4 शीर्ष वस्तुओं के फोटो अपलोड किए गए हों, क्योंकि विजुअल मेनू में 3 गुना अधिक स्कैन-टू-ऑर्डर कन्वर्शन मिलता है।`;
        } else if (lang === 'mr') {
          response = `🚀 **${shopName} साठी वाढीची कृती योजना (Growth Action Plan)**:
1. **QR प्लेसमेंट**: मुख्य काउंटरवर आणि प्रत्येक जेवणाच्या टेबलवर उच्च-गुणवत्तेची प्रिंट ठेवा.
2. **विशेष क्यूआर बॅज**: लहान सवलत जाहीर करा (उदा. "विशेष पदार्थ पाहण्यासाठी आणि 5% सूट मिळवण्यासाठी क्यूआर स्कॅन करा").
3. **सोशल मीडियाचा वापर**: आपल्या इंस्टाग्राम बायो आणि व्हॉट्सॲप बिझनेस कॅटलॉगवर आपली अद्वितीय डिजिटल मेनू लिंक (\`${owner?.shop_slug ? `qr-menu.com/menu/${owner.shop_slug}` : 'your-link'}\`) शेअर करा.
4. **व्हिज्युअल मेनू**: किमान ३-४ शीर्ष पदार्थांचे फोटो अपलोड केलेले असल्याची खात्री करा, कारण फोटो असलेल्या मेनूला ३ पट अधिक ऑर्डर्स मिळतात.`;
        } else if (lang === 'gu') {
          response = `🚀 **${shopName} માટે ગ્રોથ એક્શન પ્લાન (Growth Action Plan)**:
1. **QR પ્લેસમેન્ટ**: મુખ્ય કાઉન્ટર પર અને દરેક ડાઇનિંગ ટેબલ પર ઉચ્ચ-ગુણવત્તાવાળી પ્રિન્ટ મૂકો.
2. **ખાસ ક્યૂઆર બેજ**: નાની ડિસ્કાઉન્ટની જાહેરાત કરો (દા.ત., "સ્પેશિયલ ડિશ જોવા અને 5% ડિસ્કાઉન્ટ મેળવવા માટે QR સ્કેન કરો").
3. **સોશિયલ મીડિયાનો ઉપયોગ**: તમારી ઇન્સ્ટાગ્રામ બાયો અને વોટ્સએપ બિઝનેસ કેટલોગ પર તમારી અનન્ય ડિજિટલ મેનૂ લિંક (\`${owner?.shop_slug ? `qr-menu.com/menu/${owner.shop_slug}` : 'your-link'}\`) શેર કરો.
4. **વિઝ્યુઅલ મેનૂ**: ખાતરી કરો કે ઓછામાં ઓછી 3-4 ટોચની આઇટમ્સના ફોટા અપલોડ કરેલા હોય, કારણ કે ફોટાવાળા મેનૂમાં 3 ગણો વધુ ઓર્ડર કન્વર્ઝન મળે છે.`;
        } else {
          response = `🚀 **Growth Action Plan for ${shopName}**:
1. **QR Placement**: Place a high-quality print at the main counter and on every dining table.
2. **Special QR Badge**: Announce a small discount (e.g., "Scan QR to view Special Dishes & get 5% Off").
3. **Use Social Media**: Share your unique digital menu link (\`${owner?.shop_slug ? `qr-menu.com/menu/${owner.shop_slug}` : 'your-link'}\`) on your Instagram bio and WhatsApp Business catalog.
4. **Visual Menus**: Ensure at least 3-4 top items have photos uploaded, as visual menus get 3x higher scan-to-order conversions.`;
        }
      } else if (isPricingQuery) {
        if (lang === 'hi') {
          response = `💰 **मूल्य निर्धारण रणनीति सिफारिशें (Pricing Strategy)**:
- चूंकि आप **${shopCategory}** में काम कर रहे हैं, इसलिए उच्च दृश्य अपील से बहुत बड़ा अंतर पड़ता है।
- **डिकॉय प्राइसिंग (Decoy Pricing)**: अपने प्रीमियम बेस्ट-सेलर आइटम को एक मानक आइटम के साथ रखें। यह स्वाभाविक रूप से ग्राहकों को प्रीमियम टियर की ओर खींचता है।
- **स्मार्ट समायोजन**: एक "वैल्यू कॉम्बो" श्रेणी जोड़ने का प्रयास करें। एक लोकप्रिय पेय को स्नैक के साथ बंडल करने से आमतौर पर औसत बिल राशि में 15-20% की वृद्धि होती है!`;
        } else if (lang === 'mr') {
          response = `💰 **किंमत ठरवण्याची धोरणात्मक शिफारस (Pricing Strategy)**:
- आपण **${shopCategory}** मध्ये व्यवसाय करत असल्याने, उत्कृष्ट सादरीकरण मोठा फरक पाडते.
- **डिकॉय प्राइसिंग (Decoy Pricing)**: आपल्या प्रीमियम बेस्ट-सेलर आयटमला एका सामान्य आयटमच्या शेजारी ठेवा. यामुळे ग्राहक प्रीमियम पर्याय निवडण्याकडे आकर्षित होतात.
- **स्मार्ट बदल**: "व्हॅल्यू कॉम्बो" श्रेणी जोडून पहा. लोकप्रिय पेयासोबत स्नॅक एकत्र केल्याने सरासरी बिल किंमत १५-२०% वाढू शकते!`;
        } else if (lang === 'gu') {
          response = `💰 **કિંમત નિર્ધારણ વ્યૂહરચના ભલામણો (Pricing Strategy)**:
- તમે **${shopCategory}** માં કાર્યરત છો, તેથી ઉત્તમ દેખાવ મોટો તફાવત બનાવે છે.
- **ડીકોય પ્રાઇસીંગ (Decoy Pricing)**: તમારી પ્રીમિયમ બેસ્ટ-સેલર આઇટમને સ્ટાન્ડર્ડ આઇટમની સાથે જોડી બનાવો. આ ગ્રાહકોને પ્રીમિયમ તરફ આકર્ષિત કરે છે.
- **સ્માર્ટ ફેરફારો**: "વેલ્યુ કોમ્બો" કેટેગરી ઉમેરવાનો પ્રયાસ કરો. લોકપ્રિય પીણાને નાસ્તા સાથે જોડવાથી સામાન્ય રીતે સરેરાશ બિલ 15-20% વધી જાય છે!`;
        } else {
          response = `💰 **Pricing Strategy Recommendations**:
- Since you are operating in **${shopCategory}**, high visual appeal makes a huge difference.
- **Decoy Pricing**: Pair your premium best-seller item alongside a standard item. This naturally pulls orders towards the premium tier.
- **Smart Adjustments**: Try adding a "Value Combo" category. Bundling a popular beverage with a snack generally increases average ticket size by 15-20%!`;
        }
      } else if (isDescQuery) {
        const sampleItem = items[0]?.name || (lang === 'en' ? 'Special Dish' : lang === 'hi' ? 'विशेष व्यंजन' : lang === 'mr' ? 'विशेष पदार्थ' : 'સ્પેશિયલ ડિશ');
        if (lang === 'hi') {
          response = `✍️ **AI मेनू कॉपीराइटर**:
यहाँ एक प्रीमियम विवरण टेम्प्लेट है जिसका उपयोग आप अपने आइटम (जैसे **${sampleItem}**) के लिए कर सकते हैं:
> *"स्थानीय रूप से प्राप्त प्रीमियम सामग्रियों का उपयोग करके ताज़ा बनाया गया। आपकी लालसा को संतुष्ट करने के लिए तैयार किए गए पूरी तरह से संतुलित स्वाद। इसे गरमागरम लें! 🌟"*
- **टिप**: विवरणों को 120 वर्णों से कम रखें, संवेदी शब्दों (जैसे, *कुरकुरा, सुगंधित, ताज़ा, मीठा*) पर ध्यान केंद्रित करें।`;
        } else if (lang === 'mr') {
          response = `✍️ **AI मेनू लेखक**:
आपल्या आयटमसाठी (जसे की **${sampleItem}**) आपण वापरू शकता असा एक उत्कृष्ट वर्णन नमुना येथे आहे:
> *"स्थानिक पातळीवरील प्रीमियम साहित्य वापरून ताजं तयार केलेलं. तुमच्या आवडीनुसार बनवलेली चवींची उत्तम सांगड. गरमागरम आस्वाद घ्या! 🌟"*
- **टीप**: वर्णन १२० शब्दांपेक्षा कमी ठेवा, आणि चव दर्शवणारे शब्द (उदा. *कुरकुरीत, सुगंधी, थंडगार, गोड*) वापरा.`;
        } else if (lang === 'gu') {
          response = `✍️ **AI મેનૂ કોપીરાઈટર**:
અહીં એક પ્રીમિયમ ડિસ્ક્રિપ્શન ટેમ્પલેટ છે જેનો उपयोग તમે તમારી આઇટમ (જેમ કે **${sampleItem}**) માટે કરી શકો છો:
> *"સ્થાનિક રીતે મેળવેલા પ્રીમિયમ ઘટકોનો ઉપયોગ કરીને તાજું બનાવેલ. તમારી ઇચ્છા તૃપ્ત કરવા માટે કાળજીપૂર્વક તૈયાર કરેલ સંતુલિત સ્વાદ. ગરમ ગરમ માણો! 🌟"*
- **ટિપ**: વર્ણનો 120 અક્ષરોથી ઓછા રાખો, સ્વાદસભર શબ્દો (દા.ત., *કુરકુરીત, સુગંધિત, ઠંડક આપનાર, મીઠું*) પર ધ્યાન કેન્દ્રિત કરો.`;
        } else {
          response = `✍️ **AI Menu Copywriter**:
Here is a premium description template you can use for your items (like **${sampleItem}**):
> *"Freshly made to order using premium locally-sourced ingredients. Perfectly balanced flavors crafted to satisfy your cravings. Enjoy it warm! 🌟"*
- **Tip**: Keep descriptions under 120 characters, focusing on sensory words (e.g., *crispy, aromatic, cooling, sweet*).`;
        }
      } else {
        if (lang === 'hi') {
          response = `💡 **QR-Menu AI सलाहकार**:
यह एक बेहतरीन सवाल है! **${itemCount} आइटम** वाले **${shopName}** जैसे **${shopCategory}** के लिए, मैं निम्नलिखित पर ध्यान केंद्रित करने की सलाह देता हूँ:
1. **सेटिंग्स** के अंदर कीमतों को अपडेट रखना (क्योंकि यह बिना प्रिंट किए तुरंत अपडेट हो जाता है)।
2. उच्च-रिज़ॉल्यूशन छवियों के साथ अपने टॉप-रेटेड आइटम को बढ़ावा देना।
3. पीक स्कैनर घंटों को देखने के लिए साप्ताहिक रूप से अपना **विश्लेषण** पृष्ठ देखना।

क्या कोई विशिष्ट मेनू आइटम विवरण या मार्केटिंग पोस्टर विचार है जो आप चाहते हैं कि मैं आपके लिए तैयार करूँ?`;
        } else if (lang === 'mr') {
          response = `💡 **QR-Menu AI सल्लागार**:
हा एक छान प्रश्न आहे! **${itemCount} आयटम** असलेल्या **${shopName}** सारख्या **${shopCategory}** साठी, मी पुढील गोष्टींवर लक्ष केंद्रित करण्याची शिफारस करतो:
1. **सेटिंग्स** मध्ये किमती अपडेट ठेवणे (कारण प्रिंट न करता हे त्वरित अपडेट होते).
2. चांगल्या दर्जाच्या फोटोंसह तुमच्या सर्वाधिक पसंतीचे आयटम प्रमोट करणे.
3. ग्राहक कधी जास्त येतात हे पाहण्यासाठी दर आठवड्याला **विश्लेषण** पान तपासणे.

तुम्हाला एखाद्या विशिष्ट पदार्थाचे वर्णन किंवा मार्केटिंग पोस्टरची कल्पना हवी असल्यास मला नक्की सांगा!`;
        } else if (lang === 'gu') {
          response = `💡 **QR-Menu AI સલાહકાર**:
આ એક સરસ પ્રશ્ન છે! **${itemCount} આઇટમ્સ** સાથેના **${shopName}** જેવા **${shopCategory}** માટે, હું ભલામણ કરું છું કે તમે આના પર ધ્યાન કેન્દ્રિત કરો:
1. **સેટિંગ્સ** માં કિંમતો અપડેટ રાખવી (કારણ કે પ્રિન્ટ કર્યા વિના તે તરત જ અપડેટ થાય છે).
2. ઉચ્ચ ગુણવત્તાવાળા ચિત્રો સાથે તમારી ટોચની આઇટમ્સને પ્રોત્સાહન આપવું.
3. ક્યારે વધુ સ્કેન થાય છે તે જોવા માટે સાપ્તાહિક ધોરણે તમારું **વિશ્લેષણ** પૃષ્ઠ તપાસવું.

શું કોઈ ચોક્કસ મેનૂ આઇટમનું વર્ણન અથવા માર્કેટિંગ પોસ્ટર વિચાર છે જે તમે ઈચ્છો છો કે હું તમારા માટે બનાવું?`;
        } else {
          response = `💡 **QR-Menu AI Advisor**:
That is a great question! For a **${shopCategory}** like **${shopName}** with **${itemCount} items**, I recommend focusing on:
1. Keeping prices updated inside **Settings** (since it updates instantly without printing).
2. Promoting your top-rated items with high-resolution images.
3. Checking your **Analytics** page weekly to see peak scanner hours.

Is there a specific menu item description or marketing poster idea you would like me to generate for you?`;
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-210px)] md:h-[calc(100vh-190px)]">
      {/* Header */}
      <div className="mb-4">
        <h1 className="font-display font-black text-2xl">{t.askAiTitle || 'Ask AI'}</h1>
        <p className="text-muted text-sm mt-1">{t.askAiSubtitle || 'Get business insights, custom menu copywriting, and growth tips tailored to your shop.'}</p>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-surface border border-border rounded-2xl flex flex-col overflow-hidden relative min-h-[300px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-accent text-bg font-medium rounded-tr-none'
                    : 'bg-surface-2 border border-border text-[#f0f0f5] rounded-tl-none whitespace-pre-line'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface-2 border border-border text-[#f0f0f5] rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 border-t border-border bg-bg/50 flex gap-2">
          <input
            type="text"
            className="flex-1 bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-[#f0f0f5] placeholder:text-muted outline-none focus:border-accent transition-all"
            placeholder={t.askAiPlaceholder || "Type a message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {t.askAiSend || 'Send'} ⚡
          </Button>
        </form>
      </div>
    </div>
  );
}
