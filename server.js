const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
console.log('🔑 API Key recibida:', OPENROUTER_API_KEY ? '✅ Presente' : '❌ FALTA');

if (!OPENROUTER_API_KEY) {
    console.error('❌ ERROR CRÍTICO: Falta OPENROUTER_API_KEY en variables de entorno');
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

app.post('/presupuesto', async (req, res) => {
    try {
        const { tipo, marca, tamano, ubicacion, descripcion, fotos, nombreCliente } = req.body;
        
        console.log(`📸 Recibidas ${fotos ? fotos.length : 0} fotos`);
        
        if (!fotos || fotos.length === 0) {
            return res.status(400).json({ error: "Debes subir al menos una foto" });
        }

        const contenido = [
            {
                type: "text",
                text: `Analiza estas fotos de tapicería marina. Da un presupuesto realista en español.
Tipo: ${tipo}
Marca: ${marca || "N/E"}
Descripción: ${descripcion}
Responde con:
🔍 LO QUE VEO:
💰 COSTO ESTIMADO: $
📋 INCLUYE:
⏱ TIEMPO:
💡 RECOMENDACIÓN:`
            }
        ];

        for (const foto of fotos) {
            contenido.push({
                type: "image_url",
                image_url: { url: foto }
            });
        }

        console.log('📤 Enviando a OpenRouter...');
        const completion = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [{ role: "user", content: contenido }],
            max_tokens: 1000,
        });

        console.log('✅ Respuesta recibida');
        res.json({ presupuesto: completion.choices[0].message.content });
        
    } catch (error) {
        console.error('❌ Error detallado:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🔑 OPENROUTER_API_KEY: ${OPENROUTER_API_KEY ? '✅ Configurada' : '❌ No configurada'}`);
});
