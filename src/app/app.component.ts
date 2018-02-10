import { Component } from '@angular/core';

@Component({
  selector: 'rr-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  showMenu: boolean = false;

  toggleMenu(event: MouseEvent) {
    this.showMenu = !this.showMenu;
    event.stopPropagation();
  }

  hideMenu() {
    this.showMenu = false;
  }
}
