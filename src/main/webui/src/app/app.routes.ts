import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { PartnerComponent } from './partner/partner.component';
import { AddressComponent } from './address/address.component';
import { PartnerAddressComponent } from './partner-address/partner-address.component';
import { PartnerContactComponent } from './partner-contact/partner-contact.component';
import { PartnerTagComponent } from './partner-tag/partner-tag.component';
import { SignedOutComponent } from './core/signed-out/signed-out.component';

export const routes: Routes = [
  { path: '',           component: PartnerComponent, canActivate: [authGuard] },
  { path: 'partners',   component: PartnerComponent, canActivate: [authGuard] },
  { path: 'partners/:partnerId/addresses', component: PartnerAddressComponent, canActivate: [authGuard] },
  { path: 'partners/:partnerId/contacts', component: PartnerContactComponent, canActivate: [authGuard] },
  { path: 'partners/:partnerId/tags', component: PartnerTagComponent, canActivate: [authGuard] },
  { path: 'addresses',  component: AddressComponent, canActivate: [authGuard] },
  { path: 'signed-out', component: SignedOutComponent },
  { path: '**',         component: NotFoundComponent }
];
