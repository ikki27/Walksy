import { Body, Controller, HttpCode, HttpException, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';

import { AssistantService } from './assistant.service';
import type { AssistantErrorCode, AssistantStreamEvent, VisitGuide } from './assistant.types';
import { ChatRequestDto } from './dto/chat-request.dto';
import { GuideRequestDto } from './dto/guide-request.dto';

const ERROR_STATUS: Record<AssistantErrorCode, HttpStatus> = {
  not_configured: HttpStatus.SERVICE_UNAVAILABLE,
  rate_limited: HttpStatus.TOO_MANY_REQUESTS,
  unavailable: HttpStatus.BAD_GATEWAY,
};

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('chat')
  async chat(@Body() body: ChatRequestDto, @Res() res: Response): Promise<void> {

    const abort = new AbortController();
    res.on('close', () => abort.abort());

    res.status(200);
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.flushHeaders();

    const send = (event: AssistantStreamEvent) => res.write(`${JSON.stringify(event)}\n`);

    try {
      for await (const text of this.assistantService.streamReply(body, abort.signal)) {
        send({ type: 'text', text });
      }
      send({ type: 'done' });
    } catch (error) {
      if (!abort.signal.aborted) send({ type: 'error', code: this.assistantService.toErrorCode(error) });
    } finally {
      res.end();
    }
  }

  @Post('guide')
  @HttpCode(HttpStatus.OK)
  async guide(@Body() body: GuideRequestDto, @Res({ passthrough: true }) res: Response): Promise<VisitGuide> {
  
    const abort = new AbortController();
    res.on('close', () => abort.abort());

    try {
      return await this.assistantService.createGuide(body, abort.signal);
    } catch (error) {
      const code = this.assistantService.toErrorCode(error);
      throw new HttpException({ code }, ERROR_STATUS[code]);
    }
  }
}
