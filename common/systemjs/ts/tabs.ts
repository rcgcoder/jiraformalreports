import { Component, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { Tab } from './tab';

@Component({
  selector: 'tabs',
  templateUrl:System.composeUrl("systemjs/html/tabs.html")
})
export class Tabs implements AfterContentInit {
  @Input() ComponentName: string = 'Tabs';
  @ContentChildren(Tab) tabs: QueryList<Tab>;
  
  /*
  ngOnInit() {
      var self=this;
      System["Tabs_"+self.ComponentName]=self;
  }
*/
  // contentChildren are set
  ngAfterContentInit() {
    
    // get all active tabs
    let activeTabs = this.tabs.filter((tab)=>tab.active);
    
    // if there is no active tab set, activate the first
    if(activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    }
  }
  
  selectTab(tab: Tab){
    // deactivate all tabs
    this.tabs.toArray().forEach(tab => tab.active = false);
    
    // activate the tab the user has clicked on.
    tab.active = true;
  }

}
