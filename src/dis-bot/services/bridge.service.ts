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
import { Provider } from '../models/song.model';
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
  ): Promise<object> {
    // const providerService: IProviderService = this.getProviderService(provider);

    // const songMetadata = await providerService.getSongMetadata(url);
    const songMetadata = {};

    this.logger.log('play', { url });
    // this.player.queue.push(songMetadata);

    // this.player.play(resource);
    const row =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('primary')
          .setLabel('Pause not working')
          .setStyle(ButtonStyle.Primary),
      );

    this.logger.debug('node', { url });

    try {
      await this.playerService.play({ track: encodedTrack });
    } catch (error) {
      this.logger.error('play', error);
      return { content: `Error playing song.` };
    }

    return {
      content: `Start playing: ${''}.`,
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
