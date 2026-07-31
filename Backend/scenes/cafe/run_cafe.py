import json
from nlp.cafe import check_goal

with open("data/cafe_scene.json", encoding="utf-8") as f:
    scene = json.load(f)

turns = scene["turns"]
retry_limit = 3

print("\n☕ Cafe Scene Started")
print(scene["description"])

for turn in turns:
    retry_count = 0

    print("\n🧑‍🍳 Waiter:", turn["system_hindi"])
    print("   (English:", turn["system_english"] + ")")

    while retry_count < retry_limit:
        user_input = input("You: ")

        matched, score = check_goal(user_input, turn["goal"])
        print("Similarity Score:", round(score, 3))

        if matched:
            print("✅ Correct response.")
            break
        else:
            retry_count += 1
            print(f"❌ Try again. ({retry_count}/{retry_limit})")

    if retry_count == retry_limit:
        print("\n❗ Maximum retries reached. Restarting scene.")
        exit()

print("\n🎉 Scene completed successfully!")
