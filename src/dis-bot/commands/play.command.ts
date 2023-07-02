import { SlashCommandPipe } from '@discord-nestjs/common';
import {
  Command,
  EventParams,
  Handler,
  InteractionEvent,
} from '@discord-nestjs/core';
import { ClientEvents, PermissionFlagsBits } from 'discord.js';

import { PlayDto } from '../dto/play.dto';
import { PlayService } from '../services/play.service';

@Command({
  name: 'play',
  description: 'Plays a song',
  defaultMemberPermissions: [PermissionFlagsBits.SendMessages],
})
export class PlayCommand {
  constructor(private readonly playService: PlayService) {}
  @Handler()
  onPlayCommand(
    @InteractionEvent(SlashCommandPipe) dto: PlayDto,
    @EventParams() args: ClientEvents['interactionCreate'],
  ): string {
    return this.playService.play(dto.song);
  }
}
