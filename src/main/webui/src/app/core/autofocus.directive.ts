import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[autofocus]',
})
export class AutofocusDirective implements AfterViewInit {

  constructor(private host: ElementRef) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.host.nativeElement.focus();
    }, 50);
  }
}
