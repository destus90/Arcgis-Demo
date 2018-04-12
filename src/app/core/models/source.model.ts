export class Source {
  services = [];
  url: string;
  loadingSource = false;
  loadError = false;
  textError = '';

  constructor(url: string) {
    this.url = url;
  }

}
