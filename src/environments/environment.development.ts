declare const process: { env: { [key: string]: string } };

export const environment = {
  production: true,
  tmdbApiKey: process.env['NG_APP_TMDB_API_KEY'],
  tmdbBaseUrl: process.env['NG_APP_TMDB_BASE_URL'],
  tmdbImageUrl: process.env['NG_APP_TMDB_IMAGE_URL']
};
