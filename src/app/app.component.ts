import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { SidebarComponent } from './pages/sidebar/sidebar.component';

import type { NavItemModel } from './common/nav-item.model';

export const opacityAnimation = trigger('opacityAnimation', [
  state('open', style({
    opacity: 1
  })),
  state('closed', style({
    opacity: 0
  })),
  transition('open <=> closed', animate('300ms linear'))
]);

export const opacityEaseInOutAnimation = trigger('opacityEaseInOutAnimation', [
  state('closed', style({
    opacity: 0
  })),
  state('open', style({
    opacity: 1
  })),
  transition('closed <=> open', animate('300ms ease-in-out'))
]);

export const slideAnimation = trigger('slideAnimation', [
  transition(':enter', [   // Alias for void => *
    style({ transform: 'translateX(-100%)' }), // Starting style, off-screen to the left
    animate('300ms ease-in-out', style({ transform: 'translateX(0)' })) // Ending at center
  ]),
  transition(':leave', [   // Alias for * => void
    style({ transform: 'translateX(0)' }), // Starting from center
    animate('300ms ease-in-out', style({ transform: 'translateX(-100%)' })) // Exiting to the left
  ])
]);

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, SidebarComponent],
  animations: [opacityAnimation, opacityEaseInOutAnimation, slideAnimation]
})
export class AppComponent {

  sidebarOpen = false;

  navItems: Array<NavItemModel> = [];

  toggleSidebarOpen() {
    console.log('Toggling sidebar...');
    this.sidebarOpen = !this.sidebarOpen;

    console.log('SidebarOpen is: ', this.sidebarOpen);
  }
}
