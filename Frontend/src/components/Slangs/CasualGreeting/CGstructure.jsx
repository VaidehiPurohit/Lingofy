import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PhraseDetailCard from "../PhraseDetailCard";

const CGstructure = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-6 py-5 space-y-10 w-full">
      <button
        onClick={() => navigate("/dashboard/slang")}
        className="flex items-center gap-2 text-m font-medium text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back to Slang
      </button>
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Casual Greetings</h1>
        <p className="text-gray-500 text-sm">
          Informal ways to say hello and goodbye
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

        <PhraseDetailCard
          phrase="Kya haal hai?"
          Hindi="क्या हाल है?"
          literal="What condition is?"
          level="Informal"
          meaning="How are you? / What's up?"
          whenToUse="Used casually among friends"
          example="A: Kya haal hai bhai? B: Sab badhiya!"
          gradient="bg-gradient-to-r from-emerald-500 to-cyan-500"
          hoverBorder="hover:border-emerald-400"
          audioSrc="/src/assets/Audio/PopandCasual/KyahaalhaiDemo.mp3"
        />
        <PhraseDetailCard
          phrase="Aur bhai?"
          Hindi="और भाई?"
          literal="And brother?"
          level="Very Informal"
          meaning="Hey bro, what's new?"
          whenToUse="The universal greeting for close male friends."
          example="A: Aur bhai? B: Bas kat rahi hai zindagi."
          gradient="bg-gradient-to-r from-emerald-500 to-cyan-500"
          hoverBorder="hover:border-emerald-400"
          audioSrc="/src/assets/Audio/PopandCasual/AurBhai.mp3"
        />
        <PhraseDetailCard
          phrase="Sab badhiya?"
          Hindi="सब बढ़िया?"
          literal="Everything excellent?"
          level="Casual"
          meaning="Is everything good?"
          whenToUse="Used to check in on someone's well-being quickly."
          example="A: Aur suna, sab badhiya? B: Haan, sab mast."
          gradient="bg-gradient-to-r from-emerald-500 to-cyan-500"
          hoverBorder="hover:border-emerald-400"
          audioSrc="/src/assets/Audio/PopandCasual/SabBhadiya.mp3"
        />
        <PhraseDetailCard
          phrase="Kya scene hai?"
          Hindi="क्या सीन है?"
          literal="What is the scene?"
          level="Informal"
          meaning="What's the plan? / What are you up to?"
          whenToUse="Popular among youth when making plans for the day/night."
          example="A: Aaj raat ka kya scene hai? B: Movie chalte hain."
          gradient="bg-gradient-to-r from-emerald-500 to-cyan-500"
          hoverBorder="hover:border-emerald-400"
          audioSrc="/src/assets/Audio/PopandCasual/KyaSceneHai.mp3"
        />
        <PhraseDetailCard
          phrase="Aur suna."
          Hindi="और सुना।"
          literal="And tell (me)."
          level="Casual"
          meaning="Tell me more / What's new?"
          whenToUse="Used when the conversation pauses or to start a topic."
          example="A: Aur suna, ghar pe sab kaise hain? B: Sab theek hain."
          gradient="bg-gradient-to-r from-emerald-500 to-cyan-500"
          hoverBorder="hover:border-emerald-400"
          audioSrc="/src/assets/Audio/PopandCasual/AurSunna.mp3"
        />
        <PhraseDetailCard
          phrase="Kaha gayab hai?"
          Hindi="कहाँ गायब है?"
          literal="Where are you vanished?"
          level="Informal"
          meaning="Long time no see / Where have you been hiding?"
          whenToUse="Used when meeting a friend you haven't seen in a long time."
          example="A: Oye! Kahan gayab hai aajkal? B: Arre bas busy tha thoda."
          gradient="bg-gradient-to-r from-emerald-500 to-cyan-500"
          hoverBorder="hover:border-emerald-400"
          audioSrc="/src/assets/Audio/PopandCasual/KahaGaybHai.mp3"
        />
        <PhraseDetailCard
          phrase="Kya chal raha hai?"
          Hindi="क्या चल रहा है?"
          literal="What is walking?"
          level="Informal"
          meaning="What's going on?"
          whenToUse="Very common casual greeting among friends or colleagues."
          example="A: Kya chal raha hai? B: Bas kaam."
          gradient="bg-gradient-to-r from-emerald-500 to-cyan-500"
          hoverBorder="hover:border-emerald-400"
          audioSrc="/src/assets/Audio/PopandCasual/KyaChalRahaHai.mp3"
        />
        <PhraseDetailCard
          phrase="Sab set hai?"
          Hindi="सब सेट है?"
          literal="Is everything set?"
          level="Casual"
          meaning="Is everything sorted/okay?"
          whenToUse="Used to confirm if someone is comfortable or ready."
          example="A: Sab set hai na? B: Haan, koi tension nahi."
          gradient="bg-gradient-to-r from-emerald-500 to-cyan-500"
          hoverBorder="hover:border-emerald-400"
          audioSrc="/src/assets/Audio/PopandCasual/SabSetHai.mp3"
        />
        <PhraseDetailCard
          phrase="Ki haal chaal?"
          Hindi="की हाल चाल?"
          literal="What condition and gait?"
          level="Casual (Punjabi influence)"
          meaning="How are things going?"
          whenToUse="Very common in North India (Delhi/Punjab region)."
          example="A: Aur paaji, ki haal chaal? B: Vadiya ji, vadiya."
          gradient="bg-gradient-to-r from-emerald-500 to-cyan-500"
          hoverBorder="hover:border-emerald-400"
          audioSrc="/src/assets/Audio/PopandCasual/KiHaalChal.mp3"
        />
        <PhraseDetailCard
          phrase="Zinda hai?"
          Hindi="ज़िंदा है?"
          literal="Are you alive?"
          level="Dark Humor/Very Close Friends"
          meaning="You never text me anymore!"
          whenToUse="Used jokingly with a best friend who hasn't replied in a while."
          example="A: Zinda hai tu? B: Haan bhai, saans le raha hoon."
          gradient="bg-gradient-to-r from-emerald-500 to-cyan-500"
          hoverBorder="hover:border-emerald-400"
          audioSrc="/src/assets/Audio/PopandCasual/ZindaHai.mp3"
        />
      </div>


    </div>
  );
};

export default CGstructure;