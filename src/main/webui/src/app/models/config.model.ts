export interface Config {
  logLevel: string;
  defaultCountry?: string;
}

export interface Country {
  code: string;
  name: string;
}
