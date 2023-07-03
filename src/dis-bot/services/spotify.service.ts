import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SpotifyWebApi from 'spotify-web-api-node/src/server';

@Injectable()
export class SpotifyService {
  private readonly spotifyApi;
  private readonly logger = new Logger(SpotifyService.name);
  constructor(private readonly configService: ConfigService) {
    this.spotifyApi = new SpotifyWebApi({
      clientId: this.configService.get('SPOTIFY_CLIENT_ID'),
      clientSecret: this.configService.get('SPOTIFY_SECRET'),
    });
    this.spotifyApi.clientCredentialsGrant().then(
      (data) => {
        this.logger.log(
          'The access token expires in ' + data.body['expires_in'],
        );

        // Save the access token so that it's used in future calls
        this.spotifyApi.setAccessToken(data.body['access_token']);
      },
      function (err) {
        console.log(
          'Something went wrong when retrieving an access token',
          err,
        );
      },
    );
  }

  async search(query: string) {
    return this.spotifyApi.searchTracks(query);
  }
}
