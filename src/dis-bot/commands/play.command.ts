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
import { Track as STrack } from 'shoukaku';

import { PlayDto } from '../dto/play.dto';
import { Provider, Song } from '../models/song.model';
import { BridgeService } from '../services/bridge.service';
import { PlayerService } from '../services/player.service';
import { SpotifyService } from '../services/spotify.service';

interface Track extends STrack {
  encoded: string;
}
@Command({
  name: 'play',
  description: 'Plays a song: ' + new Date().toLocaleString('en-US'),
  defaultMemberPermissions: [PermissionFlagsBits.SendMessages],
})
export class PlayCommand {
  private readonly logger = new Logger(PlayCommand.name);
  constructor(
    private readonly bridgeService: BridgeService,
    private readonly playerService: PlayerService,
    private readonly spotifyService: SpotifyService,
  ) {}
  @Handler()
  async onPlayCommand(
    @InteractionEvent(SlashCommandPipe) dto: PlayDto,
    @EventParams() args: ClientEvents['interactionCreate'],
  ): Promise<object> {
    const interaction: ChatInputCommandInteraction =
      args[0] as ChatInputCommandInteraction;
    const member: GuildMember = interaction.member as GuildMember;

    const { song } = dto;

    const [provider, url] = song.split(';') as [Provider, string];
    if (!member.voice.channelId) {
      return {
        content: 'You must be in a voice channel to use this command.',
      };
    }

    const node = this.playerService.getNode();
    const result = await node.rest.resolve('scsearch:' + song);

    const encodedTrack = result.tracks[0].encoded;
    this.logger.log('onPlayCommand', {
      song,
      encodedTrack,
    });

    try {
      await this.bridgeService.join(
        member.voice.channelId,
        interaction.channelId,
        member.guild,
      );
    } catch (error) {
      this.logger.error('onPlayCommand', error, error.stack);
      return {
        content: 'I could not join your voice channel.',
      };
    }

    return this.bridgeService.play(provider, url, encodedTrack);
  }

  @On('interactionCreate')
  async onAutocomplete(
    @InteractionEvent() interaction: AutocompleteInteraction,
  ) {
    if (!interaction.isAutocomplete()) return;
    const focusedValue = interaction.options.getFocused();
    // const songString = interaction.options.getString('song');
    if (!focusedValue) return;
    const node = this.playerService.getNode();
    let searchResult;
    try {
      // searchResult = await node.rest.resolve('spsearch:' + focusedValue);
      searchResult = await node.rest.resolve('scsearch:' + focusedValue);
    } catch (error) {
      this.logger.error(error);
      return [];
    }
    const foundItems: Track[] = searchResult.tracks;
    this.logger.debug('onAutocomplete', {
      // songString,
      // foundItems,
      // interaction,
      focusedValue,
    });
    const result = foundItems.map((item) => {
      const song = Song.fromLava(item.info);
      // this.logger.debug('foundItems', { item });
      const name = song.author + ' - ' + song.name;
      return {
        name: name.substring(0, 100),
        value: name.substring(0, 100), // TODO: replace with some ID or whatever
      };
    });

    try {
      await interaction.respond(result);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
