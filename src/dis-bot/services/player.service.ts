import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'discord.js';
import {
  Connectors,
  Player,
  PlayOptions,
  Shoukaku,
  VoiceChannelOptions,
} from 'shoukaku';
import { Song } from '../models/song.model';

@Injectable()
export class PlayerService {
  private player: Player;
  private readonly shoukaku;
  private readonly logger = new Logger(PlayerService.name);
  public currentSong: Song;
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly configService: ConfigService,
  ) {
    const Nodes = [
      {
        name: 'main',
        url: 'lavalink:2333',
        auth: this.configService.get('LAVALINK_SERVER_PASSWORD'),
      },
    ];
    this.shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);

    this.shoukaku.on('error', (_, error) => this.logger.error(error));
    this.client.login();

    client.once('ready', async () => {
      this.logger.log('Discord Client ready');
    });
    this.logger.log('PlayerService initialized');
  }

  async play(options: PlayOptions, song: Song) {
    this.currentSong = song;
    return this.player.playTrack(options);
  }

  async pause(): Promise<Player> {
    if (!this.player) {
      throw new Error('No player is currently active.');
    }
    return this.player.setPaused(true);
  }

  async resume(): Promise<Player> {
    if (!this.player) {
      throw new Error('No player is currently active.');
    }
    return this.player.setPaused(false);
  }

  async joinVoiceChannel(
    options: Partial<VoiceChannelOptions>,
  ): Promise<Player> {
    const node = this.getNode();
    if (!node) throw new Error('No available nodes.');
    Object.assign(options, { shardId: 0, deaf: true, mute: true });
    try {
      this.player = await node.joinChannel(options);
    } catch (error) {
      this.logger.error('Error joining voice channel:', error);
      throw error;
    }
    return this.player;
  }

  getNode() {
    return this.shoukaku.getNode();
  }
}
