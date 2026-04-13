import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PersonalityResult {
  title: string;
  catchphrase: string;
  analysis: string;
  traits: string[];
  emoji: string;
}

export interface DrawingTask {
  prompt: string;
  image: string; // base64
}

export async function analyzeDrawings(drawings: DrawingTask[]): Promise<PersonalityResult> {
  const promptText = `
你是一个搞笑、疯狂、不按套路出牌的AI人格分析师。
用户完成了${drawings.length}个沙雕绘画任务：
${drawings.map((d, i) => `任务${i + 1}：${d.prompt}`).join('\n')}

请根据用户提供的这${drawings.length}幅画作（按顺序对应上述任务）的线条、形状、狂野程度、敷衍程度等特征，综合分析出用户的“沙雕网络人格”。
不要使用传统的MBTI或无聊的人格测试结果。
必须使用网络热梗、沙雕动画角色、搞笑的动物或抽象的概念。
例如：“在温泉里冥想的水豚”、“尖叫土拨鼠”、“高吸低抛的Doge”、“一片绝望的面包”、“纯爱战神”、“吗喽”。
请根据画作生成一个全新或经典的人格，并给出搞笑的分析。

返回JSON格式：
- title: 人格名称（例如：尖叫土拨鼠）
- catchphrase: 一句搞笑的口头禅
- analysis: 3-4句搞笑的综合分析，解释为什么这几幅画证明了他们是这个人格。
- traits: 3个搞笑的特征标签（例如：["极度社恐", "每天睡14小时", "喜欢生嚼咖啡豆"]）
- emoji: 一个最能代表这个人格的emoji
`;

  const parts: any[] = [{ text: promptText }];
  
  for (const d of drawings) {
    const base64Data = d.image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: base64Data,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: parts,
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "人格名称" },
          catchphrase: { type: Type.STRING, description: "口头禅" },
          analysis: { type: Type.STRING, description: "分析内容" },
          traits: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3个特征标签",
          },
          emoji: { type: Type.STRING, description: "一个emoji" },
        },
        required: ["title", "catchphrase", "analysis", "traits", "emoji"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(text) as PersonalityResult;
}
