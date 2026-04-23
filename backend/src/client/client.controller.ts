import { Controller, Post, Body, Get, Query, Res, Param, Delete } from '@nestjs/common';
import express from 'express';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clientService.create(dto);
  }

  // GET /client/verify-email?token=xxxx
  // → redirige directement vers /signin?verified=true
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: express.Response) {
    try {
      const redirectUrl = await this.clientService.verifyEmail(token);
      return res.redirect(redirectUrl);
    } catch {
      return res.redirect(`${process.env.FRONTEND_URL}/signin?error=invalid_token`);
    }
  }

  @Get()
  findAll() { return this.clientService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.clientService.findOne(+id); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.clientService.remove(+id); }
}