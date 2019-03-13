import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as firebase from 'firebase/app';
import { LoginPage } from '../login/login';

/**
 * Generated class for the EntrancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-entrance',
  templateUrl: 'entrance.html',
})
export class EntrancePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    firebase.auth().onAuthStateChanged((userData) => {
      if(userData) {
        this.navCtrl.setRoot('TradePage');
        
      } else {
        this.navCtrl.setRoot(LoginPage);
        
      }
    });

  }

}
