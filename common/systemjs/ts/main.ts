//main entry point
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app';
//import {enableProdMode} from "@angular/core";

//enableProdMode();
log("Boot Strapping");
platformBrowserDynamic().bootstrapModule(AppModule);
