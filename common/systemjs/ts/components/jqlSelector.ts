import { Component, Input, Output, OnInit } from '@angular/core';
import {advSelector} from "./advSelector";
@Component({
  selector: 'jqlSelector',
  templateUrl: System.composeUrl('systemjs/html/components/jqlSelector.html'),
})
export class jqlSelector extends advSelector {
}