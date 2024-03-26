import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  Guild,
  MessageActionRowComponentBuilder,
} from 'discord.js';
import { Provider, Song } from '../models/song.model';
import { PlayerService } from './player.service';
import { IProviderService, SpotifyService } from './spotify.service';

@Injectable()
export class BridgeService {
  private connection;
  private readonly logger = new Logger(BridgeService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly spotifyService: SpotifyService,
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly playerService: PlayerService,
  ) {}
  async play(
    provider: Provider,
    url: string,
    encodedTrack: string,
    song: Song,
  ): Promise<object> {
    this.logger.log('play', { url, song });

    const pauseButton = new ButtonBuilder()
      .setCustomId('pause')
      .setLabel('Pause')
      .setStyle(ButtonStyle.Secondary);

    const row =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        pauseButton,
      );

    this.logger.debug('node', { url });

    try {
      await this.playerService.play({ track: encodedTrack }, song);
    } catch (error) {
      this.logger.error('play', error);
      return { content: `Error playing song.` };
    }

    return {
      content: `Start playing: ${song.fullName}.`,
      components: [row],
    };
  }

  async join(
    voiceChannelId: string,
    textChannelId: string,
    guild: Guild,
  ): Promise<{ content: string }> {
    try {
      await this.playerService.joinVoiceChannel({
        channelId: voiceChannelId,
        guildId: guild.id,
      });
      return { content: `Joining voice channel.` };
    } catch (error) {
      this.logger.error('join', error, error.stack);
      return { content: `Error joining voice channel.` };
    }
  }

  getProviderService(provider: Provider): IProviderService {
    switch (provider) {
      case 'spotify':
        return this.spotifyService;
      default:
        throw new Error('Invalid provider.');
    }
  }
}
