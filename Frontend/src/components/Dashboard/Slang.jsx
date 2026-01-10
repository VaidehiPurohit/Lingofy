import { useNavigate } from "react-router-dom";
import { Film, MessageCircle, Smile, TrendingUp, Users, Zap } from "lucide-react";
import PhraseCard from "../Slangs/PhraseCard";

const Slang = () => {
   const navigate = useNavigate();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">
          Slangs and Expression
        </h1>
        <p className="text-gray-500 mt-1">
          Learn informal language and popular phrases
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PhraseCard
          title="Casual Greetings"
          count={10}
          description="Informal ways to say hello and goodbye"
          preview={[
            "Kya haal hai?",
            "Namaste boss!",
            "Chal phir",
          ]}
          gradient="bg-gradient-to-r from-emerald-500 to-cyan-500"
          hoverBorder="hover:border-emerald-400"
          icon={MessageCircle}
           onClick={() => navigate("/dashboard/slang/casual-greetings")}
        />

        <PhraseCard
          title="Popular Expressions"
          count={10}
          description="Trending phrases and idioms"
          preview={[
            "Ekdam mast",
            "Jugaad",
            "Bindaas",
          ]}
          gradient="bg-gradient-to-r from-purple-500 to-pink-500"
          hoverBorder="hover:border-purple-400"
          icon={TrendingUp}
           onClick={() => navigate("/dashboard/slang/popular-expressions")}
        />
        <PhraseCard
          title="Youth Slang"
          count={10}
          description="Modern slang used by young people"
          preview={[
            "Cool hai",
            "Chill maar",
            "Swag",
          ]}
          gradient="bg-gradient-to-r from-orange-500 to-pink-500"
          hoverBorder="hover:border-orange-400"
          icon={Zap}
          onClick={() => navigate("/dashboard/slang/youth-slang")}
        />
        <PhraseCard
          title="Social Slang"
          count={10}
          description="Common phrases in social situations"
          preview={[
            "Thik hai",
            "Acha",
            "Theek thaak",
          ]}
          gradient="bg-gradient-to-r from-sky-500 to-cyan-500"
          hoverBorder="hover:border-cyan-400"
          icon={Users}
          onClick={() => navigate("/dashboard/slang/social-slang")}
        />
        <PhraseCard
          title="Bollywood & Pop Culture"
          count={10}
          description="Popular Hindi phrases from movies and pop culture"
          preview={[
            "Apna time aayega",
            "Bindaas",
            "Picture abhi baaki hai",
          ]}
          gradient="bg-gradient-to-r from-fuchsia-500 to-pink-500"
          hoverBorder="hover:border-fuchsia-400"
          icon={Film}
        />
        <PhraseCard
          title="Reactions & Exclamations"
          count={10}
          description="Everyday Hindi reactions to express surprise, excitement, shock, or frustration"
          preview={[
            "Arre waah!",
            "Arey yaar!",
            "Sach mein?",
          ]}
          gradient="bg-gradient-to-r from-rose-400 to-pink-500"
          hoverBorder="hover:border-rose-400"
          icon={Smile}
        />

      </div>
    </div>
  );
};

export default Slang