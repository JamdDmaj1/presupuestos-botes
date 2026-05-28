const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
    console.error('❌ ERROR: Falta OPENROUTER_API_KEY');
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

app.post('/presupuesto', async (req, res) => {
    try {
        const { tipo, marca, tamano, ubicacion, descripcion, nombreCliente } = req.body;

        const prompt = `Eres un experto en tapicería marina en Miami, Florida.
Genera un presupuesto REALISTA en español:

DATOS DEL CLIENTE:
- Tipo de embarcación: ${tipo}
- Marca: ${marca || "No especificada"}
- Tamaño: ${tamano || "No especificado"}
- Ubicación: ${ubicacion || "Miami, FL"}
- Cliente: ${nombreCliente || "Cliente"}
- Descripción del trabajo: ${descripcion}

RESPONDE EXACTAMENTE EN ESTE FORMATO:

🔧 TRABAJO REQUERIDO:
(resumen del trabajo)

💰 COSTO ESTIMADO: $ (número entre 150 y 2500 USD)

📋 INCLUYE:
• Materiales
• Mano de obra

⏱ TIEMPO DE ENTREGA:
(días)

💡 RECOMENDACIÓN:
(un consejo profesional)

⚠️ IMPORTANTE: Este es un estimado. El precio final puede variar.`;

        const completion = await openai.chat.completions.create({
            model: "openai/gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        const texto = completion.choices[0].message.content;
        res.json({ presupuesto: texto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));