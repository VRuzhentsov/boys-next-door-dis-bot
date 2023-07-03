import { SlashCommandPipe } from '@discord-nestjs/common';
import {
  Command,
  EventParams,
  Handler,
  InteractionEvent,
  On,
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ClientEvents,
  GuildMember,
  PermissionFlagsBits,
} from 'discord.js';

import { PlayDto } from '../dto/play.dto';
import { PlayService } from '../services/play.service';
import { SpotifyService } from '../services/spotify.service';

@Command({
  name: 'play',
  description: 'Plays a song: ' + new Date().toLocaleString('en-US'),
  defaultMemberPermissions: [PermissionFlagsBits.SendMessages],
})
export class PlayCommand {
  private readonly logger = new Logger(PlayCommand.name);
  constructor(
    private readonly playService: PlayService,
    private readonly spotifyService: SpotifyService,
  ) {}
  @Handler()
  onPlayCommand(
    @InteractionEvent(SlashCommandPipe) dto: PlayDto,
    @EventParams() args: ClientEvents['interactionCreate'],
  ): object {
    const interaction: ChatInputCommandInteraction =
      args[0] as ChatInputCommandInteraction;
    const member: GuildMember = interaction.member as GuildMember;
    if (!member.voice.channelId) {
      return {
        content: 'You must be in a voice channel to use this command.',
      };
    }

    this.playService.join(member.voice.channelId, member.guild);

    return this.playService.play('dto.song');
  }

  @On('interactionCreate')
  async onAutocomplete(
    @InteractionEvent() interaction: AutocompleteInteraction,
  ) {
    if (!interaction.isAutocomplete()) return;
    const focusedValue = interaction.options.getFocused();
    // const songString = interaction.options.getString('song');
    if (!focusedValue) return;
    const foundItems = await this.spotifyService.search(focusedValue);
    this.logger.debug('onAutocomplete', {
      // songString,
      // foundItems,
      interaction,
      focusedValue,
    });
    const result: ApplicationCommandOptionChoiceData[] =
      foundItems.body.tracks.items.map((item) => {
        const fullName =
          item.artists.map((artist) => artist.name).join(', ') +
          ' - ' +
          item.name;
        return {
          name: fullName.substring(0, 100),
          value: fullName.substring(0, 100), // TODO: replace with some ID or whatever
        };
      });

    await interaction.respond(result);
  }
}
