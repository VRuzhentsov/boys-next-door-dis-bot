import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';

import { PlayCommand } from './commands/play.command';
import { PlaylistCommand } from './commands/playlist.command';
import { PlayService } from './services/play.service';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [PlayCommand, PlaylistCommand, PlayService],
})
export class BotModule {}
