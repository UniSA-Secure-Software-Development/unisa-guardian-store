import { DomSanitizer } from '@angular/platform-browser';
import { SecurityContext } from '@angular/core';

export class SecurityHelper {

    private static encodeHTML (value: string): string {
        const element = document.createElement('div')
        element.innerText = value
        return element.innerHTML
    }
    
    static sanitizeAndEncodeInputForHTML (sanitizer: DomSanitizer, value: string): string {
        const sanitizedInput = sanitizer.sanitize(SecurityContext.HTML, value) || ''
        return this.encodeHTML(sanitizedInput)
    }
}