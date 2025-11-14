import { Component } from "@angular/core";
import { BasicExpansionComponent } from "../components/basic-expansion/basic-expansion.component";

@Component({
  selector: "app-faq-page",
  imports: [BasicExpansionComponent],
  templateUrl: "./faq-page.component.html",
  styleUrl: "./faq-page.component.scss",
})
export class FaqPageComponent {}
