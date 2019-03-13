import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, AlertController } from 'ionic-angular';
declare var particlesJS: any;

import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';

/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {
  user = {
    username: null,
    email: null,
    password: null,
    confirmPassword: null,
    policies: false
  }
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public menuCtrl: MenuController,
    private authService: AngularFireAuth,
    public alertCtrl: AlertController) {
    this.menuCtrl.enable(true, 'menu');


  }

  ionViewDidLoad() {
    particlesJS("particle-container", {
      "particles": {
        "number": {
          "value": 120,
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": {
          "value": "random"
        },
        "shape": {
          "type": "circle",
          "stroke": {
            "width": 0,
            "color": "#000000"
          },
          "polygon": {
            "nb_sides": 5
          },
          "image": {
            "src": "img/github.svg",
            "width": 100,
            "height": 100
          }
        },
        "opacity": {
          "value": 1,
          "random": false,
          "anim": {
            "enable": false,
            "speed": 1,
            "opacity_min": 0.1,
            "sync": false
          }
        },
        "size": {
          "value": 4,
          "random": true,
          "anim": {
            "enable": false,
            "speed": 40,
            "size_min": 0.1,
            "sync": false
          }
        },
        "line_linked": {
          "enable": true,
          "distance": 150,
          "color": "#ffffff",
          "opacity": 0.4,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 1,
          "direction": "none",
          "random": false,
          "straight": false,
          "out_mode": "out",
          "bounce": false,
          "attract": {
            "enable": false,
            "rotateX": 600,
            "rotateY": 1200
          }
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": {
            "enable": false,
            "mode": "repulse"
          },
          "onclick": {
            "enable": true,
            "mode": "push"
          },
          "resize": true
        },
        "modes": {
          "grab": {
            "distance": 400,
            "line_linked": {
              "opacity": 1
            }
          },
          "bubble": {
            "distance": 400,
            "size": 40,
            "duration": 2,
            "opacity": 8,
            "speed": 3
          },
          "repulse": {
            "distance": 200,
            "duration": 0.4
          },
          "push": {
            "particles_nb": 4
          },
          "remove": {
            "particles_nb": 2
          }
        }
      },
      "retina_detect": true
    });

  }

  async register(user) {
    console.log(user);

    if (user.email === null ||
      user.confirmPassword === null ||
      user.password === null ||
      user.username === null) {
      alert('boş orospu evladı')
      return;
    } else if (user.password !== user.confirmPassword) {
      alert('şifreler aynı değil orospunun sıçtığı')
    } else if (user.policies == false) {
      alert('kabul etsene amınakodumun')

    } else {
      try {
        await this.authService.auth.createUserWithEmailAndPassword(user.email, user.password).then(() => {
          firebase.auth().onAuthStateChanged((userData) => {
            if (userData) {
              this.authService.authState.subscribe((activeUser: firebase.User) => {
                firebase.database().ref().child('users').child(activeUser.uid).update({
                  username: user.username,
                  email: user.email,
                  registerDate: Date.now()
                }).then(() => {
                  firebase.database().ref().child('assets').child(activeUser.uid).child('coins').update({
                    'BTC': 0,
                    'ETH': 0,
                    'XRP': 0,
                    'BCH': 0, 
                    'EOS': 0, 
                    'LTC': 0, 
                    'ADA': 0, 
                    'XLM': 0, 
                    'TRX': 0, 
                    'MIOTA': 0,
                    'NEO': 0, 
                    'DASH': 0, 
                    'XMR': 0, 
                    'XEM': 0, 
                    'VEN': 0, 
                    'ETC': 0, 
                    'BNB': 0, 
                    'QTUM': 0, 
                    'OMG': 0
                  })

                  firebase.database().ref().child('assets').child(activeUser.uid).update({
                    dollar: 2000
                  })

                }).then(() => {
                  this.navCtrl.setRoot('TradePage')
                })

              })
            }
          });


        }).catch(error => {
          let alert = this.alertCtrl.create({
            title: ' Sorry !',
            subTitle: error.message,
            buttons: ['Back']
          });
          alert.present();
        })
      }
      catch (error) {
        console.log(error);

      }
    }
  }
  navigateToLogin() {
    this.navCtrl.pop().catch(error => {
      this.navCtrl.push('LoginPage')

    })

  }
}
