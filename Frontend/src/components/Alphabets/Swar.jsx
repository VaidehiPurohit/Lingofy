import React from 'react'
import AlphabetCard from "./AlphabetCard";


const Swar = () => {
    return (
    <div className="flex gap-6 flex-wrap">
      <AlphabetCard letter="अ" english="A" />
      <AlphabetCard letter="आ" english="AA" />
      <AlphabetCard letter="इ" english="I" />
      <AlphabetCard letter="ई" english="EE"  />
      <AlphabetCard letter="उ" english="U"  />
      <AlphabetCard letter="ऊ" english="OO"  />
      <AlphabetCard letter="ऋ" english="Ri" />
      <AlphabetCard letter="ए" english="E" />
      <AlphabetCard letter="ऐ" english="AI/AE" />
      <AlphabetCard letter="ओ" english="O"  />
      <AlphabetCard letter="औ" english="AU" />
      <AlphabetCard letter="अं" english="AN"  />
      <AlphabetCard letter="अः" english="AH"  />
    </div>
  );
}

export default Swar