import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { PartnerComponent } from './partner/partner.component';
import { AddressComponent } from './address/address.component';
import { PartnerAddressComponent } from './partner-address/partner-address.component';
import { SignedOutComponent } from './core/signed-out/signed-out.component';

export const routes: Routes = [
  { path: '',           component: PartnerComponent, canActivate: [authGuard] },
  { path: 'partners',   component: PartnerComponent, canActivate: [authGuard] },
  { path: 'partners/:partnerNumber/addresses', component: PartnerAddressComponent, canActivate: [authGuard] },
  { path: 'addresses',  component: AddressComponent, canActivate: [authGuard] },
  { path: 'signed-out', component: SignedOutComponent },
  { path: '**',         component: NotFoundComponent }
];
