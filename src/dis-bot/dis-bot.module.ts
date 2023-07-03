import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PlayCommand } from './commands/play.command';
import { PlaylistCommand } from './commands/playlist.command';
import { PlayService } from './services/play.service';
import { SpotifyService } from './services/spotify.service';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [
    PlayCommand,
    PlaylistCommand,
    PlayService,
    SpotifyService,
    ConfigService,
  ],
})
export class BotModule {}
