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

@Injectable()
export class PlayerService {
  private player: Player;
  private readonly shoukaku;
  private readonly logger = new Logger(PlayerService.name);
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly configService: ConfigService,
  ) {
    const Nodes = [
      {
        name: 'main',
        url: 'localhost:2333',
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

  async play(options: PlayOptions) {
    return this.player.playTrack(options);
  }

  async joinVoiceChannel(
    options: Partial<VoiceChannelOptions>,
  ): Promise<Player> {
    const node = this.getNode();
    if (!node) throw new Error('No available nodes.');
    Object.assign(options, { shardId: 0, deaf: true, mute: true });
    this.player = await node.joinChannel(options);
    this.logger.debug('joinVoiceChannel', {});
    return this.player;
  }

  getNode() {
    return this.shoukaku.getNode();
  }
}
