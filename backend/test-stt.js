const { pipeline, env } = require('@xenova/transformers');
const { WaveFile } = require('wavefile');
const fs = require('fs');

env.allowLocalModels = false;
(async () => {
    try {
        console.log('Loading model...');
        let transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', { quantized: true });
        
        let wav = new WaveFile();
        let samples = new Float32Array(16000).fill(0.01);
        wav.fromScratch(1, 16000, '32f', samples);
        
        wav.toBitDepth('32f');
        wav.toSampleRate(16000);
        let audioData = wav.getSamples();
        if (Array.isArray(audioData)) {
            if (audioData.length > 0 && Array.isArray(audioData[0])) {
               audioData = audioData[0]; 
            }
        }
        
        console.log('Array type:', audioData.constructor.name);
        
        console.log('Transcribing...');
        const transcript = await transcriber(audioData, {
            chunk_length_s: 30,
            stride_length_s: 5,
        });
        console.log('SUCCESS:', transcript);
    } catch (e) {
        console.error('ERROR:', e.message);
    }
})();
