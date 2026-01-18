import { AutofocusDirective } from './autofocus.directive';
import { ElementRef } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';

describe('AutofocusDirective', () => {
  it('should create an instance', () => {
    const mockElementRef = new ElementRef(document.createElement('input'));
    const directive = new AutofocusDirective(mockElementRef);
    expect(directive).toBeTruthy();
  });

  it('should focus element after view init', fakeAsync(() => {
    const inputElement = document.createElement('input');
    const mockElementRef = new ElementRef(inputElement);
    const directive = new AutofocusDirective(mockElementRef);
    
    spyOn(inputElement, 'focus');
    directive.ngAfterViewInit();
    
    // Advance time by 50ms to trigger the setTimeout
    tick(50);
    
    expect(inputElement.focus).toHaveBeenCalled();
  }));
});
