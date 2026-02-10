import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display tags link when signed in', () => {
    component.isSignedIn = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const tagsLink = compiled.querySelector('#tags-link');
    
    expect(tagsLink).toBeTruthy();
    expect(tagsLink?.textContent).toContain('tags');
  });

  it('should not display tags link when not signed in', () => {
    component.isSignedIn = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const tagsLink = compiled.querySelector('#tags-link');
    
    expect(tagsLink).toBeFalsy();
  });

  it('should display all navigation links when signed in', () => {
    component.isSignedIn = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    
    expect(compiled.querySelector('#home-link')).toBeTruthy();
    expect(compiled.querySelector('#partners-link')).toBeTruthy();
    expect(compiled.querySelector('#addresses-link')).toBeTruthy();
    expect(compiled.querySelector('#tags-link')).toBeTruthy();
    expect(compiled.querySelector('#signout-link')).toBeTruthy();
  });
});
