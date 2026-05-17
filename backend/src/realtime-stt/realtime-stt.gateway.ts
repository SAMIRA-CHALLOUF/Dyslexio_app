import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RealtimeSttService } from './realtime-stt.service';

@WebSocketGateway({
  cors: { origin: '*' },
  maxHttpBufferSize: 20 * 1024 * 1024, // 20 MB
  pingTimeout: 120_000,
  pingInterval: 25_000,
})
export class RealtimeSttGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server!: Server;

  private readonly logger = new Logger(RealtimeSttGateway.name);

  constructor(private readonly sttService: RealtimeSttService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.sttService.handleConnection(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.sttService.handleDisconnect(client);
  }

  @SubscribeMessage('audio_chunk')
  handleAudioChunk(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: Buffer,
  ) {
    this.sttService.addAudioChunk(client, data);
  }

  @SubscribeMessage('set_language')
  handleSetLanguage(@MessageBody() lang: string) {
    this.sttService.setLanguage(lang);
    this.logger.log(`Transcription language set to: ${lang}`);
  }
}
