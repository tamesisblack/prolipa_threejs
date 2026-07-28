/**
 * Proveedor Gemini directo (Google AI Studio).
 */

import { GoogleGenerativeAI, SchemaType, type Content } from '@google/generative-ai'
import type { ChatMessage } from '@/types'
import {
  buildSystemPrompt,
  getAiApiKey,
  parseAiReply,
} from '@/services/aiContext'

function toGeminiHistory(messages: ChatMessage[]): Content[] {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(0, -1)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
}

export async function chatWithGemini(messages: ChatMessage[]) {
  const apiKey = getAiApiKey()
  if (!apiKey) throw new Error('AI_API_KEY no configurada')

  const last = messages[messages.length - 1]
  if (!last || last.role !== 'user') {
    throw new Error('Se requiere un mensaje de usuario')
  }

  const modelName =
    (import.meta.env.AI_MODEL as string | undefined)?.trim() || 'gemini-2.0-flash'

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: buildSystemPrompt(),
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          message: { type: SchemaType.STRING },
          navigate: { type: SchemaType.STRING, nullable: true },
          action: { type: SchemaType.STRING, nullable: true },
        },
        required: ['message'],
      },
    },
  })

  const history = toGeminiHistory(messages)
  const chat = model.startChat({ history })
  const result = await chat.sendMessage(last.content)
  return parseAiReply(result.response.text())
}
