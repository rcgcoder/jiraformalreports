//main entry point
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app';
//import {enableProdMode} from "@angular/core";

//enableProdMode();

log("BootStrapping");
platformBrowserDynamic().bootstrapModule(AppModule);
log("End of bootstrap");
