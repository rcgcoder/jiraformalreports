class HerosComponentController implements ng.IComponentController {

  public heros: IHero[];

  constructor() {}

  public $onInit () {
    this.heros = HEROS;
  }
}

class HerosComponent implements ng.IComponentOptions {

  public controller: ng.Injectable<ng.IControllerConstructor>;
  public controllerAs: string;
  public template: string;

  constructor() {
    this.controller = HerosComponentController;
    this.controllerAs = "$ctrl";
    this.template = 
      ' <ul>'
     +'   <li ng-repeat="hero in $ctrl.heros">{{ hero.name }}</li>'
     +' </ul>'
    ;
  }
}

angular
  .module("mySuperAwesomeApp", [])
  .component("heros", new HerosComponent());

angular.bootstrap(document, ["mySuperAwesomeApp"]);
