
import { GoogleGenAI } from "@google/genai";
import { OrderItem, Customer } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async summarizeOrder(orderItems: OrderItem[], customer: Customer): Promise<string> {
    const itemsDescription = orderItems.map(item => 
      `- ${item.productName} (${item.totalDays} วัน, ${item.timesPerDay} ครั้ง/วัน)`
    ).join('\n');

    const prompt = `
      As a marketing assistant for MCOT Phitsanulok FM 106.25 MHz, 
      write a very professional, polite, and persuasive summary email draft to the following customer 
      to accompany their advertisement quotation. 
      
      Customer: ${customer.company} (${customer.name})
      Package Summary:
      ${itemsDescription}
      Total Amount: ${orderItems.reduce((sum, item) => sum + item.netTotal, 0).toLocaleString()} THB (inc. VAT)
      
      Write the response in Thai, focusing on the radio station's coverage (Phitsanulok and surrounding areas) 
      and the value they will receive. Keep it concise.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "ขออภัย ไม่สามารถสร้างบทสรุปได้ในขณะนี้";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI";
    }
  }
};
