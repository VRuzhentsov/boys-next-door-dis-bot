import {
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { Injectable } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Guild,
  MessageActionRowComponentBuilder,
} from 'discord.js';

@Injectable()
export class PlayService {
  connection: VoiceConnection | null = null;
  play(song: string): object {
    const row =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('primary')
          .setLabel('dto.song')
          .setStyle(ButtonStyle.Primary),
      );
    return {
      content: `Start playing ${song}.`,
      components: [row],
    };
  }

  join(channelId: string, guild: Guild): string {
    this.connection = joinVoiceChannel({
      channelId: channelId,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });

    this.connection.on(VoiceConnectionStatus.Ready, () => {
      console.log(
        'The connection has entered the Ready state - ready to play audio!',
      );
    });
    return `Joining voice channel.`;
  }
}
