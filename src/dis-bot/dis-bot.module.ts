import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PlayCommand } from './commands/play.command';
import { PlaylistCommand } from './commands/playlist.command';
import { BridgeService } from './services/bridge.service';
import { PlayerService } from './services/player.service';
import { SpotifyService } from './services/spotify.service';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [
    PlayCommand,
    PlaylistCommand,
    BridgeService,
    SpotifyService,
    ConfigService,
    PlayerService,
  ],
})
export class BotModule {}
