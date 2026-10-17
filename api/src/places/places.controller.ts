import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';

import type { PlaceResult, PlacesErrorCode } from './place.types';
import { PlacesService } from './places.service';
import { SearchPlacesDto } from './dto/search-places.dto';

const ERROR_STATUS: Record<PlacesErrorCode, HttpStatus> = {
  not_configured: HttpStatus.SERVICE_UNAVAILABLE,
  rate_limited: HttpStatus.TOO_MANY_REQUESTS,
  unavailable: HttpStatus.BAD_GATEWAY,
};

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get('search')
  async search(@Query() query: SearchPlacesDto): Promise<PlaceResult[]> {
    try {
      return await this.placesService.search(query.q, query.lang);
    } catch (error) {
      const code = this.placesService.toErrorCode(error);
      throw new HttpException({ code }, ERROR_STATUS[code]);
    }
  }
}
