import { Choice, Param, ParamType } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';

enum City {
  'New York1' = 'New York',
  Tokyo = 'Tokyo',
}
export class PlayDto {
  @Transform(({ value }) => value.toUpperCase())
  @Param({
    name: 'song',
    description:
      'Name or URL of song/playlist. Could be from (Youtube, Spotify, SoundCloud)',
    type: ParamType.STRING,
    required: true,
    autocomplete: true,
  })
  song: string;
}
