import { Component } from '@angular/core';
import { UnderConstructionComponent } from "../../components/under-construction/under-construction.component";

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [UnderConstructionComponent],
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss'
})
export class SupportComponent {

}
