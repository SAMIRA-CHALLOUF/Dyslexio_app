const { pipeline, env } = require('@xenova/transformers');
const { WaveFile } = require('wavefile');

env.allowLocalModels = true;
env.allowRemoteModels = true;
(async () => {
    try {
        console.log('Loading model...');
        let transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', { quantized: true });
        
        let wav = new WaveFile();
        let samples = new Float32Array(16000 * 2).fill(0.01);
        wav.fromScratch(1, 16000, '32f', samples);
        let audioData = wav.getSamples();
        
        console.log('Transcribing english vs en vs undefined...');
        try {
            await transcriber(audioData, { language: 'english' });
            console.log('english works!');
        } catch(e) { console.error('english fails:', e.message); }
        
        try {
            await transcriber(audioData, { language: 'en' });
            console.log('en works!');
        } catch(e) { console.error('en fails:', e.message); }

    } catch (e) {
        console.error('ERROR:', e.message);
    }
})();
