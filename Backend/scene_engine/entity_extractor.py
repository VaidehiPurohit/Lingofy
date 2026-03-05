import string

def extract_entities(text, scene):
    # Normalize: lower case and robust punctuation removal
    text_lower = text.lower().strip()
    translator = str.maketrans(string.punctuation + '।', ' ' * (len(string.punctuation) + 1))
    text_clean = text_lower.translate(translator)
    
    extracted = {}

    for slot, values in scene["slot_values"].items():
        # Generic multi-value detection: if the JSON defines a 'both' or 'multiple' canonical value
        # and its variants are found in the text, we assign that.
        found = False
        
        # Check for multiple keywords from the same slot to allow one-sentence goal completion
        if "combination_logic" in scene.get("slot_options", {}).get(slot, {}):
            combo_val = scene["slot_options"][slot]["combination_logic"]["canonical"]
            requirements = scene["slot_options"][slot]["combination_logic"]["requires"] # e.g. ["sugar", "milk"]
            
            matches = []
            for req in requirements:
                if any(kw in f" {text_clean} " for kw in values.get(req, [])):
                    matches.append(req)
            
            if len(matches) >= len(requirements):
                extracted[slot] = combo_val
                continue
        
        # Standard Waterfall Matching
        found = False 
        for canonical, variants in values.items():
            if found:
                break
            for variant in variants:
                variant_lower = variant.lower().strip()
                # Check for either full word match or exact phrase match
                padded_text = f" {text_clean} "
                if f" {variant_lower} " in padded_text:
                    extracted[slot] = canonical
                    found = True
                    break
    
    return extracted
