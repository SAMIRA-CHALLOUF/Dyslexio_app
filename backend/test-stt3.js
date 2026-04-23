const { pipeline, env } = require('@xenova/transformers');
const { WaveFile } = require('wavefile');
const fs = require('fs');

env.allowLocalModels = false;
(async () => {
    try {
        console.log('Loading model...');
        let transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
        
        // Let's create proper readable audio, just a sine wave, so whisper hears something.
        let wav = new WaveFile();
        const sampleRate = 16000;
        const duration = 2; // seconds
        let samples = new Float32Array(sampleRate * duration);
        for(let i=0; i<samples.length; i++) {
           samples[i] = Math.sin((i / sampleRate) * Math.PI * 2 * 440) * 0.5; // 440Hz beep
        }
        wav.fromScratch(1, 16000, '32f', samples);
        
        let audioData = wav.getSamples(false, Float32Array);
        
        console.log('Array type:', audioData.constructor.name);
        console.log('Array value ranges min/max:', Math.min(...audioData), Math.max(...audioData));
        
        console.log('Transcribing...');
        const transcript = await transcriber(audioData._data ? audioData._data : audioData, {
            chunk_length_s: 30,
            stride_length_s: 5,
        });
        console.log('SUCCESS:', transcript);
    } catch (e) {
        console.error('ERROR:', e.message);
    }
})();
