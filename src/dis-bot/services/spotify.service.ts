import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SpotifyWebApi from 'spotify-web-api-node/src/server';
import { Song } from '../models/song.model';

export interface IProviderService {
  search(query: string): Promise<any>;
  getSongMetadata(url: string): Promise<Song>;
}

@Injectable()
export class SpotifyService implements IProviderService {
  private readonly spotifyApi: SpotifyWebApi;
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

  async getSongMetadata(url: string): Promise<Song> {
    const trackId = url.split('/').pop();
    const track = await this.spotifyApi.getTrack(trackId);
    return Song.fromSpotify(track.body);
  }
}
