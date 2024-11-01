import OpenAI from "openai";
import { useEffect, useState } from "react";

function useOpenAI() {
  const [apiKey, setApiKey] = useState<string>("");
  const [client, setClient] = useState<OpenAI | null>(null);
}
