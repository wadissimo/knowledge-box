import google.generativeai as genai
from dotenv import load_dotenv
import os
import json

load_dotenv() 
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

def get_system_context(lang, topic):
    return f"""Please help a user with a question on a specific topic. Please provide a concise short answer.
User's topic below in quotes (""):
"{topic}".
If a user's question is not related to the topic. Politely decline an answer and ask user for a question which is specific to the topic.
User's language is {lang}. Reply in user's language.
"""

def get_system_context_generic(lang):
    return f"""Please help a user with a question. Please provide a concise short answer. 
You can generate new cards for the users. In this case: Do not ask user to give you front and back text of each card, you need to come up with it as an assistant. Just ask about what kind of cards they need, how many. Also if not clear from the context: level and details of the topic. Front and back sides both should be text only.
Always use the tool to suggest flashcards. Do not suggest flashcards in the text directly.
User's language is {lang}. Reply in user's language.


"""

def generate_cards(front_sides:list['str'], back_sides:list['str']):
    """Generates cards for the user

    Args:
      front_sides: a list of front sides of the cards.
      back_sides: a list of back sides of the cards, each item in front_sides list must correspond to an item in back_sides list.

    Returns: Cards that user requested.
    """

    if len(front_sides) != len(back_sides):
        return None
    
    return [{'front':front, 'back':back} for front,back in zip(front_sides, back_sides)]



def chat(prompt, language, history):
    model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=get_system_context_generic(language))
    messages = [{'role':'user' if h['role'] == 1 else 'model', 'parts': h['parts']} for h in history]
    messages.append({'role':'user', 'parts': [prompt]})
    response = model.generate_content(messages, tools=[generate_cards])
    print("server response:", response)
    print("server response.result.candidates[0].content:", response.candidates[0])
    result_text = ""
    #result_json = {}
    
    for part in response.parts:
        print(type(part))
        if fn := part.function_call:
            args = ", ".join(f"{key}={val}" for key, val in fn.args.items())
            print(f"function call: {fn.name}({args})")
            if fn.name == "generate_cards":
                # Extract arguments from the function call
                front_sides = fn.args.get("front_sides", [])
                back_sides = fn.args.get("back_sides", [])

                # Call the generate_cards function with extracted arguments
                cards = generate_cards(front_sides, back_sides)
                result_json['cards'] = cards
        else:

            result_text += part.text

    original_response_parts = json.loads(str(response.parts)) # todo: can't use response.parts directly, replace to improve performance,
    result_json = {"original_response_parts": original_response_parts}
    result_json['message'] = result_text
    
    print("server response text:", result_text)
    print("result_json", result_json)
    return result_json
