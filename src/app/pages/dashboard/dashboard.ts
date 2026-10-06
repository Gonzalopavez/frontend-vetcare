import {
  Component
} from '@angular/core';

import {
  AuthStateService
} from '../../core/auth/auth-state.service';

@Component({
  selector: 'app-dashboard',

  imports: [],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.scss'
})
export class Dashboard {

  constructor(
    protected readonly authState: AuthStateService
  ) {}
}