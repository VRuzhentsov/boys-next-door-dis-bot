import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ApplicationCommandPermissionType,
  GatewayIntentBits,
  Message,
} from 'discord.js';

import { BotModule } from './dis-bot/dis-bot.module';
import { PlayDto } from './dis-bot/dto/play.dto';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        discordClientOptions: {
          intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
        },
        registerCommandOptions: [
          {
            forGuild: configService.get('GUILD_ID_WITH_COMMANDS'),
            removeCommandsBefore: true,
          },
        ],
        slashCommandsPermissions: [
          {
            commandClassType: PlayDto,
            permissions: [
              {
                id: configService.get('ROLE_WITHOUT_PLAYLIST_PERMISSION'),
                type: ApplicationCommandPermissionType.User,
                permission: true,
              },
            ],
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
