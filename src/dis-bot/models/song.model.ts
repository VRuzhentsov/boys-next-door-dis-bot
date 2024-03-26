export enum Provider {
  YOUTUBE = 'youtube',
  SPOTIFY = 'spotify',
  SOUNDCLOUD = 'soundcloud',
}
interface Artist {
  name: string;
}

export const PROVIDER_SPLITTER = ';';

export class Song {
  public provider: Provider;

  artists: Artist[];
  author: string;
  url: string;
  href: string;
  name: string;

  constructor({ artists }) {
    this.artists = artists;
  }

  get fullName() {
    return [this.author, this.name].join(' - ').substring(0, 100);
  }
  get value() {
    return `${this.provider}${PROVIDER_SPLITTER}${this.url}`.substring(0, 100);
  }

  static fromLava(item: any) {
    const song = new Song({
      artists: [],
    });
    song.author = item.author;
    song.provider = item.sourceName;
    song.name = item.title;
    return song;
  }

  static fromSpotify(item: any): Song {
    const song = new Song({
      artists: item.artists,
    });
    song.provider = Provider.SPOTIFY;
    song.url = item.external_urls.spotify;
    song.href = item.href;
    song.name = item.name;
    return song;
  }
}
