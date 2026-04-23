import { SttService } from './stt.service';

async function test() {
  const service = new SttService();
  console.log('Service created');
  // wait a bit for init
  setTimeout(() => {
    service
      .transcribe('non-existent.webm')
      .then(console.log)
      .catch(console.error);
  }, 2000);
}
test();
