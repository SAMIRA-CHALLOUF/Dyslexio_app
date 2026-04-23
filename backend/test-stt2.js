const { pipeline, env } = require('@xenova/transformers');
const { WaveFile } = require('wavefile');
const fs = require('fs');

env.allowLocalModels = false;
(async () => {
    try {
        console.log('Loading model...');
        let transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
        
        let wav = new WaveFile();
        let samples = new Float32Array(16000).fill(0.01);
        wav.fromScratch(1, 16000, '32f', samples);
        
        wav.toBitDepth('32f');
        wav.toSampleRate(16000);
        let audioData = wav.getSamples();
        if (audioData instanceof Float64Array) {
            audioData = new Float32Array(audioData);
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
