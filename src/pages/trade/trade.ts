import { AngularFireAuth } from 'angularfire2/auth';
import { Component } from '@angular/core';
import { NavController, LoadingController, IonicPage, AlertController } from 'ionic-angular';
import { Chart } from 'chart.js';

import { DataProvider } from '../../providers/data/data';
import { TweenLite, TimelineLite } from 'gsap';
import * as firebase from 'firebase/app';




/**
 * Generated class for the TradePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-trade',
  templateUrl: 'trade.html',
})
export class TradePage {
  details: Object;
  detailToggle: boolean[] = [];
  objectKeys = Object.keys;
  coinList: string[] = ['BTC', 'ETH', 'XRP',
    'BCH', 'EOS', 'LTC', 'ADA', 'XLM', 'TRX', 'MIOTA',
    'NEO', 'DASH', 'XMR', 'XEM', 'VEN', 'ETC', 'BNB', 'QTUM', 'OMG'];
  coins: Object;
  chart = [];
  userId: string;
  

youHaveCoinAmount;
youHaveDollar;
amountToBuy:number;
totalPrice:number = 0.0000;

  constructor(
    public navCtrl: NavController,
    public loading: LoadingController,
    private authService: AngularFireAuth,
    private data: DataProvider,
    private alertCtrl : AlertController
  ) {
    this.authService.authState.subscribe((activeUser: firebase.User) => {
      this.userId = activeUser.uid;
      console.log(this.userId);
      this.refreshCoins();

    })
  }

  ionViewDidLoad() {

  }
  ionViewWillEnter() {
  }

  refreshCoins() {
    const loader = this.loading.create({
      content: 'Refreshing...',
      spinner: 'bubbles'
    });

    loader.present().then(() => {



      this.data.getCoins(this.coinList).subscribe(res => {
        this.coins = res;
        loader.dismiss();
      });

    });

  }

  coinDetails(coin, index) {


    if (this.detailToggle[index]) this.detailToggle[index] = false;
    else {
      this.detailToggle.fill(false);
      this.data.getCoin(coin).subscribe(res => {
        this.details = res['DISPLAY'][coin]['USD'];
        this.detailToggle[index] = true;
        this.data.getChart(coin).subscribe(res => {
          const coinHistory = res['Data'].map(a => a.close);
          console.log(coinHistory);
          
          setTimeout(() => {
            this.chart[index] = new Chart(`canvas${index}`, {
              type: 'line',
              data: {
                labels: coinHistory,
                datasets: [
                  {
                    data: coinHistory,
                    borderColor: '#395b9f',
                    fill: true,
                    backgroundColor: '#d1cbcb'
                  }
                ]
              },
              options: {
                tooltips: {
                  mode: 'nearest',
                  intersect: false,
                  callbacks: {
                    label: (tooltipItems, data) => `$${tooltipItems.yLabel}`
                  }
                },
                responsive: true,
                legend: { display: false },
                scales: {
                  xAxes: [{ display: false }],
                  yAxes: [{ display: false }]
                }
              }
            });
          }, 250);
        });
      });
    }
  }


  totalPriceCalculator(coin) {
    console.log(this.coins[coin].USD)
    this.totalPrice =parseFloat(this.coins[coin].USD) * this.amountToBuy;
    console.log(this.totalPrice);
    
  }

  openBuyPanel(coin) {
    console.log(coin);
    firebase.database().ref().child('assets').child(this.userId).on('value', assets => {
      this.youHaveCoinAmount = assets.child('coins').child(coin).val();
      this.youHaveDollar = assets.child('dollar').val();      
    })
    TweenLite.to('#detailsItem', 1, {
      x: -400, display: 'none', onComplete: function () {
        let tl = new TimelineLite();

        tl.set('#buyItem', { display: 'block' })
          .from('#buyItem', 1, { opacity: 0 })
      }
    })
  }

  buy(coin) {
    console.log(this.amountToBuy, this.totalPrice,this.youHaveCoinAmount,this.youHaveDollar);

    
    firebase.database().ref().child('assets').child(this.userId).once('value', assets => {
      let userDollar = assets.child('dollar').val();
      let currentCoinAmount = assets.child('coins').child(coin).val();
      if(userDollar >= this.totalPrice) {

        let confirm = this.alertCtrl.create({
      title: 'Confirm purchase',
      message: 'Do you want to buy '+ this.amountToBuy +' pcs ' +  coin + ' for ' + this.totalPrice,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Buy',
          handler: () => { 
            firebase.database().ref().child('assets').child(this.userId).update({
              dollar :   parseFloat(userDollar) - this.totalPrice
            })

            let valueAsFloat = parseFloat((parseFloat(currentCoinAmount) + this.amountToBuy).toFixed(4));
            console.log(valueAsFloat,typeof(valueAsFloat));
             
            firebase.database().ref().child('assets').child(this.userId).child('coins').update({
              [coin] :   valueAsFloat
            }).then(()=> {

                  let alert = this.alertCtrl.create({
                    title: 'Done',
                    subTitle: 'You have bought ' + this.amountToBuy + ' ' + coin,
                    buttons: ['Back']
                  });
                  alert.present();                  
                  this.amountToBuy = 0;

            })


          }
        }
      ]
    });
    confirm.present();
      } else {
        let alert = this.alertCtrl.create({
          title: 'Sorry',
          subTitle: 'Your Money is not enough to buy this amount of ' + coin,
          buttons: ['Back']
        });
        alert.present();
      }
      

    })
    

  }
  cancel(coin, index) {
    let tl = new TimelineLite();
    tl.to('.details', 1, {
      height: '0%', opacity: 0, onComplete: () => {
        this.detailToggle.fill(false);
      }
    })
   this.youHaveCoinAmount = 0
    this.youHaveDollar = 0;
    this.amountToBuy= 0;
    this.totalPrice = 0.0000;
  }

  searchToggle() {
    var width = document.getElementById('searchInput').offsetWidth;

    console.log(width);
    if (width == 0) {
      TweenLite.to('#searchInput', 1, { width: '60%', opacity: 1 })
    } else {
      TweenLite.to('#searchInput', 1, { width: '0', opacity: 0 })
    }
  }

  filterItems(ev: any) {
    console.log(this.coinList);
    let coinRefresher = this.refreshCoins();
    let val = ev.target.value;
    console.log(ev, val);
    let isThere;
    if (val && val.trim() !== '') {
      let isThere = this.coinList.filter(function (item) {
        return item.toLowerCase().includes(val.toLowerCase());
      });
      if (isThere.length > 0) {
        this.coinList = this.coinList.filter(function (item) {
          return item.toLowerCase().includes(val.toLowerCase());
        });
      } else {
        this.coinList = ['BTC', 'ETH', 'XRP',
          'BCH', 'EOS', 'LTC', 'ADA', 'XLM', 'TRX', 'MIOTA',
          'NEO', 'DASH', 'XMR', 'XEM', 'VEN', 'ETC', 'BNB', 'QTUM', 'OMG'];
      }

    } else {
      this.coinList = ['BTC', 'ETH', 'XRP',
        'BCH', 'EOS', 'LTC', 'ADA', 'XLM', 'TRX', 'MIOTA',
        'NEO', 'DASH', 'XMR', 'XEM', 'VEN', 'ETC', 'BNB', 'QTUM', 'OMG'];
    }

  }


}

