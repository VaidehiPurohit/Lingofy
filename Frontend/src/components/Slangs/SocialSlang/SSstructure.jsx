import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PhraseDetailCard from "../PhraseDetailCard";

const SSstructure = () => {
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
                <h1 className="text-3xl font-semibold">Social Slang</h1>
                <p className="text-gray-500 text-sm">
                    Common Phrases in social situations
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                <PhraseDetailCard
                    phrase="Chalega"
                    Hindi="चलेगा" literal="It will walk" level="Casual" meaning="It works / That's fine" whenToUse="Used to agree to a plan or accept an option." example="A: Pizza order karein? B: Haan, chalega."
                    gradient="bg-gradient-to-r from-sky-500 to-cyan-500"
                    hoverBorder="hover:border-cyan-400"
                />
            </div>
        </div>

    )
}

export default SSstructure