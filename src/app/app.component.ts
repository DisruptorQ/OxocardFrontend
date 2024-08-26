import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PrimeNGConfig } from 'primeng/api';

import { SidebarComponent } from './pages/sidebar/sidebar.component';

import type { OnInit } from '@angular/core';
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
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('300ms ease-in-out', style({ transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    style({ transform: 'translateX(0)' }),
    animate('300ms ease-in-out', style({ transform: 'translateX(-100%)' }))
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
export class AppComponent implements OnInit {

  private primeNgConfig = inject(PrimeNGConfig);

  sidebarOpen = false;

  navItems: Array<NavItemModel> = [];

  ngOnInit(): void {
    this.primeNgConfig.inputStyle.set('outlined');
    this.primeNgConfig.ripple = true;
  }

  toggleSidebarOpen() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
