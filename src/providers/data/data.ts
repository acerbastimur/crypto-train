import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

const API = 'https://min-api.cryptocompare.com';

/*
  Generated class for the DataProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DataProvider {
  result: Object;

  constructor(public http: HttpClient) {}

  getCoins(coins) {
    const coinlist: string = coins.join();

    return this.http
      .get(`${API}/data/pricemulti?fsyms=${coinlist}&tsyms=USD`)
      .map(res => (this.result = res));
  }

  getCoin(coin) {
    return this.http
      .get(`${API}/data/pricemultifull?fsyms=${coin}&tsyms=USD`)
      .map(res => (this.result = res));
  }

  getChart(coin) {
    return this.http
      .get(`${API}/data/histoday?fsym=${coin}&tsym=USD&limit=30&aggregate=1`)
      .map(res => (this.result = res));
  }

  allCoins() {
    return this.http
      .get(`${API}/data/all/coinlist`)
      .map(res => (this.result = res));
  }
}
