interface IHero {
  id: number;
  name: string;
}


class HerosComponentController implements ng.IComponentController {

  public heros: IHero[];

  constructor() {
    this.heros=[
    { id: 11, name: "Mr. Nice" },
  { id: 12, name: "Narco" },
  { id: 13, name: "Bombasto" },
  { id: 14, name: "Celeritas" },
  { id: 15, name: "Magneta" },
  { id: 16, name: "RubberMan" },
  { id: 17, name: "Dynama" },
  { id: 18, name: "Dr IQ" },
  { id: 19, name: "Magma" },
  { id: 20, name: "Tornado" }
];

  }

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
