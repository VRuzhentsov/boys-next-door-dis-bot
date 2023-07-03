import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ApplicationCommandPermissionType,
  GatewayIntentBits,
  PermissionFlagsBits,
} from 'discord.js';

import { BotModule } from './dis-bot/dis-bot.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        autoLogin: true,
        shutdownOnAppDestroy: true,
        discordClientOptions: {
          intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
        },
        registerCommandOptions: [
          {
            forGuild: configService.get('GUILD_ID_WITH_COMMANDS'),
            removeCommandsBefore: true,
            // allowFactory: (message: Message) =>
            //   !message.author.bot && message.content === '!deploy',
          },
        ],
        failOnLogin: true,
      }),
      inject: [ConfigService],
    }),
    BotModule,
  ],
})
export class AppModule {}
