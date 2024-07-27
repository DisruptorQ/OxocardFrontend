import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  imports: [RouterModule, RouterLinkActive, NgClass],
})
export class SidebarComponent {

  @Input()
  showProfile = false;
}
