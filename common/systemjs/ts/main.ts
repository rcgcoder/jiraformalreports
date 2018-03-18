//main entry point
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app';
//import {enableProdMode} from "@angular/core";

//enableProdMode();

platformBrowserDynamic().bootstrapModule(AppModule);
if (typeof bootStrapFinish!=="undefined"){
    bootStrapFinish();
}