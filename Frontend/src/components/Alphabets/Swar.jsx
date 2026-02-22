import React from 'react'
import AlphabetCard from "./AlphabetCard";


const Swar = () => {
    return (
    <div className="flex gap-6 flex-wrap">
      <AlphabetCard letter="अ" english="A" sound="/src/assets/Audio/Swar/A.mp3" />
      <AlphabetCard letter="आ" english="AA" sound="/src/assets/Audio/Swar/AA.mp3" />
      <AlphabetCard letter="इ" english="I" sound="/src/assets/Audio/Swar/I.mp3" />
      <AlphabetCard letter="ई" english="EE" sound="/src/assets/Audio/Swar/EE.mp3" />
      <AlphabetCard letter="उ" english="U" sound="/src/assets/Audio/Swar/U.mp3" />
      <AlphabetCard letter="ऊ" english="OO" sound="/src/assets/Audio/Swar/OO.mp3" />
      <AlphabetCard letter="ऋ" english="Ri" sound="/src/assets/Audio/Swar/Ri.mp3" />
      <AlphabetCard letter="ए" english="E" sound="/src/assets/Audio/Swar/E.mp3" />
      <AlphabetCard letter="ऐ" english="AI/AE" sound="/src/assets/Audio/Swar/AI.mp3" />
      <AlphabetCard letter="ओ" english="O" sound="/src/assets/Audio/Swar/O.mp3" />
      <AlphabetCard letter="औ" english="AU" sound="/src/assets/Audio/Swar/AU.mp3" />
      <AlphabetCard letter="अं" english="AN" sound="/src/assets/Audio/Swar/AN.mp3" />
      <AlphabetCard letter="अः" english="AH" sound="/src/assets/Audio/Swar/AH.mp3" />
    </div>
  );
}

export default Swar