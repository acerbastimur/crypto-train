import { DataProvider } from './../../providers/data/data';
import { AngularFireAuth } from 'angularfire2/auth';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Chart } from 'chart.js';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from 'angularfire2/database';
import { TweenLite, TimelineLite } from 'gsap';

/**
 * Generated class for the WalletPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-wallet',
  templateUrl: 'wallet.html',
})
export class WalletPage {

  assetsAsDollar: number = 0;
  assets = [];
  userId;
  chart;
  chartData = []
  chartBackground = []
  chartBackgroundZeroFour = []
  labels = [];
  openWallets = []


  instantPriceOfCoin:number = 0 ;
  totalPrice:number =  0;
  amountToSell:number = 0 ;
  amountExist:number =  0;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private authService: AngularFireAuth,
    private afDB: AngularFireDatabase,
    private dataProvider: DataProvider,
    private alertCtrl : AlertController
  ) {
    this.authService.authState.subscribe((activeUser: firebase.User) => {
      this.userId = activeUser.uid;
      //console.log(this.userId);

      firebase.database().ref().child('assets').child(this.userId).child('coins').once('value', values => {
        //console.log(values.val());
        values.forEach(element => {

          if (parseFloat(element.val()) > 0) {
            dataProvider.getCoin(element.key).subscribe(value => {
              //let priceNow = parseFloat(value['DISPLAY'][element.key]['USD']['PRICE'].replace(/\$/g, '').trim());
              let priceNow = parseFloat(parseFloat(value['DISPLAY'][element.key]['USD']['PRICE'].substring(1).trim('').replace(/\,/g, '').replace(',', '.')).toFixed(4));
              this.assetsAsDollar = element.val() * priceNow + this.assetsAsDollar
              console.log(this.assetsAsDollar);

              this.labels.push(element.key)
              this.chartData.push(element.val() * priceNow)
              let randomColor = this.getRandomColor()
              let randomZeroFour = this.hexToRgbA(randomColor)
              this.chartBackground.push([randomColor])
              this.chartBackgroundZeroFour.push([randomZeroFour])
              this.assets.push({
                name: element.key,
                amount: element.val(),
                price: element.val() * priceNow,
                color: randomColor
              })

            })
          }



        });
      })
    })
    setTimeout(() => {
      this.loadChart();
    }, 3000);
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
  }

  hexToRgbA(hex) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.4)';
    }
    throw new Error('Bad Hex');
  }

  ionViewDidLoad() {

  }
  loadChart() {
    var canvas = <HTMLCanvasElement>document.getElementById("coinPie");
    var ctx = canvas.getContext("2d");
    var data = {
      labels: this.labels,
      datasets: [{
        data: this.chartData,
        backgroundColor: this.chartBackground,
        hoverBackgroundColor: this.chartBackground,
        borderColor: this.chartBackground,
        borderWidth: 1,
        hoverBorderColor: this.chartBackgroundZeroFour,
      }]
    }
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: data,

      options: {
        legend: { display: false },
        cutoutPercentage: 88,
        tooltips: {
          custom: function (tooltip) {
            if (!tooltip) return;
            // disable displaying the color box;
            tooltip.displayColors = false;
          },
          callbacks: {
            label: (tooltipItems, data) => {
              var i, label = [], l = data.datasets.length;
              for (i = 0; i < l; i += 1) {
                label[i] = this.labels[tooltipItems.index] + ' : ' + '$' + data.datasets[i].data[tooltipItems.index];
                console.log(i, label[i]);

              }
              return label;
            }
          }

        }
      }

    });

  }

  openSellPanel(coin) {
    this.openWallets.forEach(element => {
      console.log(element);

      let tl = new TimelineLite();
      tl.to(element[0], 1, {
        height: '0%', opacity: 0, onComplete: () => {
          TweenLite.set(element[0], { display: 'none' })
          TweenLite.to(element[1], 1, {
            x: 0, display: 'block'
          });
        }
      })
    });
firebase.database().ref().child('assets').child(this.userId).child('coins').child(coin).once('value',amountExist => {
  this.amountExist = amountExist.val();
})
    this.dataProvider.getCoin(coin).subscribe( coinData=>{
      console.log(coinData);
      this.instantPriceOfCoin = coinData['RAW'][coin]['USD']['PRICE'] ;
      console.log(this.instantPriceOfCoin);
      
      
    })
    this.openWallets.push(['#sellItem' + coin, '#detailsItem' + coin]);
    // console.log('#detailsItem'+coin);

    TweenLite.to('#detailsItem' + coin, 1, {
      x: -400, display: 'none', onComplete: function () {
        let tl = new TimelineLite();

        tl.set('#sellItem' + coin, { display: 'block',x:0 })
          .from('#sellItem' + coin, 1, { opacity: 0 })
      }
    })
  }

  cancel(coin){
    console.log(coin);
    
    TweenLite.to('#sellItem' + coin,1,{ x:400 , display:'none', onComplete: function(){
      let tl = new TimelineLite();

      tl.set('#detailsItem' + coin, { display: 'block',x:0 })
    }})
    this.openWallets.pop();
    this.instantPriceOfCoin = 0;
  }

  totalPriceCalculator(coin) {
   this.totalPrice = this.instantPriceOfCoin * this.amountToSell ;
   }

   sell(coin) {
     firebase.database().ref().child('assets').child(this.userId).once('value',asset=> {
       if(asset.child('coins').child(coin).val() >= this.amountToSell) {
        let confirm = this.alertCtrl.create({
          title: 'Confirm sale',
          message: 'Do you want to sell '+ this.amountToSell +' pcs ' +  coin + ' for ' + this.totalPrice,
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Sell',
              handler: () => { 
    
                firebase.database().ref().child('assets').child(this.userId).child('coins').update({
                  [coin] : asset.child('coins').child(coin).val() - this.amountToSell
                })

                firebase.database().ref().child('assets').child(this.userId).update({
                  dollar : asset.child('dollar').val() + this.totalPrice
                }).then(()=> {
                  this.cancel(coin);
                  let alert = this.alertCtrl.create({
                    title: 'Done',
                    subTitle: 'You have sold ' + this.amountToSell + ' ' + coin,
                    buttons: ['Back']
                  });
                  alert.present();     
                  this.instantPriceOfCoin = 0 ;
                  this.totalPrice =  0;
                  this.amountToSell = 0 ;
                  this.amountExist =  0;
                })
              }
            }
          ]
        });
        confirm.present();
      } else {
         alert('nope')
       }
     })
   }
}



